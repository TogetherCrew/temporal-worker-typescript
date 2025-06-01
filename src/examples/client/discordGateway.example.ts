import {
  GatewayDispatchEvents,
  GatewayDispatchPayload,
} from 'discord-api-types/v10';
import { IntentsBitField } from 'discord.js';

import { REST } from '@discordjs/rest';
import { WebSocketManager, WebSocketShardEvents } from '@discordjs/ws';
import {
  Client as TemporalClient,
  Connection as TemporalConnection,
} from '@temporalio/client';

import { DiscordGatewayEventWorkflow } from '../../workflows/discord/gateway';

const ALLOWED_EVENTS = [
  GatewayDispatchEvents.ChannelCreate,
  GatewayDispatchEvents.ChannelUpdate,
  GatewayDispatchEvents.ChannelDelete,

  GatewayDispatchEvents.GuildMemberAdd,
  GatewayDispatchEvents.GuildMemberUpdate,
  GatewayDispatchEvents.GuildMemberRemove,

  GatewayDispatchEvents.GuildRoleCreate,
  GatewayDispatchEvents.GuildRoleUpdate,
  GatewayDispatchEvents.GuildRoleDelete,

  GatewayDispatchEvents.MessageCreate,
  GatewayDispatchEvents.MessageUpdate,
  GatewayDispatchEvents.MessageDelete,
  GatewayDispatchEvents.MessageDeleteBulk,

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
  });
}

function getGuildIdFromPayload(payload: GatewayDispatchPayload): string {
  try {
    const data = payload.d as any;

    if (data.guild_id) {
      return data.guild_id;
    }

    if (data.guildId) {
      return data.guildId;
    }

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
  const temporalConn = await TemporalConnection.connect({
    address: 'localhost:7233',
  });
  const temporalClient = new TemporalClient({
    connection: temporalConn,
  });

  function ingestEvent(payload: GatewayDispatchPayload) {
    const guildId = getGuildIdFromPayload(payload);
    const wfId = `discord-event-${payload.t}-${guildId}-${Date.now()}`;

    temporalClient.workflow
      .start(DiscordGatewayEventWorkflow, {
        taskQueue: 'TEMPORAL_QUEUE_HEAVY',
        workflowId: wfId,
        args: [payload],
      })
      .then(() => console.log(`✅ Started workflow ${wfId}`))
      .catch((err) =>
        console.error(`❌ Failed to start workflow: ${err.message}`),
      );
  }

  const DISCORD_TOKEN = 'xx';
  const manager = createGatewayManager(DISCORD_TOKEN);

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

  manager
    .on(WebSocketShardEvents.Ready, (shardId) =>
      console.info(`✅ Shard #${shardId} ready`),
    )
    .on(WebSocketShardEvents.Closed, (shardId) =>
      console.warn(`⚠️ Shard #${shardId} closed`),
    );

  await manager.connect();
  console.log('✅ Connected to Discord Gateway');

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
