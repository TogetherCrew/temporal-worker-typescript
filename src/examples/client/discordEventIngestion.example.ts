import { GatewayDispatchEvents, GatewayDispatchPayload } from 'discord-api-types/v10';
import { IntentsBitField } from 'discord.js';

import { REST } from '@discordjs/rest';
import { WebSocketManager, WebSocketShardEvents } from '@discordjs/ws';
import { Client as TemporalClient, Connection as TemporalConnection } from '@temporalio/client';

import { gatewayEventWorkflow } from '../../workflows/discord/gateway';

// Allowed Discord gateway events to process
const ALLOWED_EVENTS = [
  // Channel events
  GatewayDispatchEvents.ChannelCreate,
  GatewayDispatchEvents.ChannelUpdate,
  GatewayDispatchEvents.ChannelDelete,

  // Member events
  GatewayDispatchEvents.GuildMemberAdd,
  GatewayDispatchEvents.GuildMemberUpdate,
  GatewayDispatchEvents.GuildMemberRemove,

  // Role events
  GatewayDispatchEvents.GuildRoleCreate,
  GatewayDispatchEvents.GuildRoleUpdate,
  GatewayDispatchEvents.GuildRoleDelete,

  // Message events
  GatewayDispatchEvents.MessageCreate,
  GatewayDispatchEvents.MessageUpdate,
  GatewayDispatchEvents.MessageDelete,
  GatewayDispatchEvents.MessageDeleteBulk,

  // Reaction events
  GatewayDispatchEvents.MessageReactionAdd,
  GatewayDispatchEvents.MessageReactionRemove,
  GatewayDispatchEvents.MessageReactionRemoveAll,
  GatewayDispatchEvents.MessageReactionRemoveEmoji,
];

function isAllowedEvent(eventType: string): boolean {
  return ALLOWED_EVENTS.includes(eventType as GatewayDispatchEvents);
}

function createGatewayManager(token: string): WebSocketManager {
  const rest = new REST().setToken(token);
  return new WebSocketManager({
    token,
    intents:
      IntentsBitField.Flags.Guilds |
      IntentsBitField.Flags.GuildMembers |
      IntentsBitField.Flags.GuildMessages |
      IntentsBitField.Flags.MessageContent |
      IntentsBitField.Flags.GuildMessageReactions,
    rest,
    // compression: CompressionMethod.ZlibSync,
  });
}

// Get guild ID from payload based on event type, or return a fallback
function getGuildIdFromPayload(payload: GatewayDispatchPayload): string {
  try {
    // Guild ID is in different locations depending on the event type
    const data = payload.d as any;

    // Try common locations for guild_id
    if (data.guild_id) {
      return data.guild_id;
    }

    // For events where guild_id might be in different locations
    if (data.guildId) {
      return data.guildId;
    }

    // For events where the guild object might be present
    if (data.guild && data.guild.id) {
      return data.guild.id;
    }

    return 'unknown-guild';
  } catch (err) {
    console.warn('Could not extract guild ID from payload', err);
    return 'unknown-guild';
  }
}

async function main() {
  // Connect to Temporal
  const temporalConn = await TemporalConnection.connect({
    address: 'localhost:7233',
  });
  const temporalClient = new TemporalClient({
    connection: temporalConn,
  });

  // Create function to start workflow for event ingestion
  function ingestEvent(payload: GatewayDispatchPayload) {
    const guildId = getGuildIdFromPayload(payload);
    const wfId = `discord-event-${payload.t}-${guildId}-${Date.now()}`;

    temporalClient.workflow
      .start(gatewayEventWorkflow, {
        taskQueue: 'TEMPORAL_QUEUE_HEAVY',
        workflowId: wfId,
        args: [payload],
      })
      .then(() => console.log(`✅ Started workflow ${wfId}`))
      .catch((err) =>
        console.error(`❌ Failed to start workflow: ${err.message}`),
      );
  }

  // Create and connect Discord gateway
  const DISCORD_TOKEN = 'xx';
  const manager = createGatewayManager(DISCORD_TOKEN);

  // Handle gateway events
  manager.on(
    WebSocketShardEvents.Dispatch,
    (payload: GatewayDispatchPayload, shardId) => {
      console.log(payload.t);
      // if (isAllowedEvent(payload.t)) {
      //   console.log(`Received event ${payload.t} from shard ${shardId}`);
      //   ingestEvent(payload);
      // }
      ingestEvent(payload);
    },
  );

  // Set up lifecycle event handlers
  manager
    .on(WebSocketShardEvents.Ready, (shardId) =>
      console.info(`✅ Shard #${shardId} ready`),
    )
    .on(WebSocketShardEvents.Closed, (shardId) =>
      console.warn(`⚠️ Shard #${shardId} closed`),
    );

  // Connect to Discord gateway
  await manager.connect();
  console.log('✅ Connected to Discord Gateway');

  // Handle process termination
  process.once('SIGINT', async () => {
    console.info('SIGINT → closing shards …');
    await manager.destroy();
    await temporalConn.close();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
