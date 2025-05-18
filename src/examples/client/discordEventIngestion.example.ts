import {
  Client,
  Events,
  GatewayIntentBits,
  GuildChannel,
  GuildMember,
  Partials,
  Role,
} from 'discord.js';

import {
  Client as TemporalClient,
  Connection as TemporalConnection,
} from '@temporalio/client';

import { toIChannel } from '../../domain/transformers/discord/channel';
import { toIGuildMember } from '../../domain/transformers/discord/member';
import { toIRole } from '../../domain/transformers/discord/role';
import { EventIngestInput } from '../../shared/types/discord/EventIngestion.discord';
import { eventIngest } from '../../workflows/discord/EventIngestionWorkflow';

async function main() {
  const temporalConn = await TemporalConnection.connect({
    address: 'localhost:7233',
  });
  const temporalClient = new TemporalClient({
    connection: temporalConn,
  });

  const discord = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.GuildPresences,
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.DirectMessageReactions,
      GatewayIntentBits.MessageContent,
    ],
    partials: [
      Partials.Channel,
      Partials.Message,
      Partials.GuildMember,
      Partials.Reaction,
    ],
  });
  await discord.login('xx');

  function ingest<T extends EventIngestInput['type']>(
    type: T,
    guildId: string,
    payload: any,
  ) {
    const wfId = `ev-ch-${guildId}-${type}-${Date.now()}`;
    temporalClient.workflow
      .start(eventIngest, {
        taskQueue: 'TEMPORAL_QUEUE_HEAVY',
        workflowId: wfId,
        args: [{ type, guildId, payload }] as any,
      })
      .catch((err) => console.error(`❌ ${type} →`, err));
  }

  // ─── Channel Create ───────────────────────────────────────────
  discord.on(Events.ChannelCreate, (channel: GuildChannel) => {
    if (!channel.guild) return;
    console.log(channel);
    toIChannel;
    ingest(Events.ChannelCreate, channel.guild.id, toIChannel(channel));
  });
  discord.on(Events.ChannelUpdate, (oChannel: any, nChannel: any) => {
    if (!nChannel.guild) return;
    console.log(nChannel.name);
    ingest(Events.ChannelUpdate, nChannel.guild.id, toIChannel(nChannel));
  });

  discord.on(Events.ChannelDelete, (channel: any) => {
    if (!channel.guild) return;
    console.log(channel.name);
    ingest(Events.ChannelDelete, channel.guild.id, toIChannel(channel));
  });

  discord.on(Events.GuildRoleCreate, (role: Role) => {
    // if (!channel.guild) return;
    console.log(role);
    ingest(Events.GuildRoleCreate, role.guild.id, toIRole(role));
  });

  discord.on(Events.GuildRoleUpdate, (oRole: Role, nRole: Role) => {
    // if (!channel.guild) return;
    console.log(nRole);
    ingest(Events.GuildRoleUpdate, nRole.guild.id, toIRole(nRole));
  });

  discord.on(Events.GuildRoleDelete, (role: Role) => {
    ingest(Events.GuildRoleDelete, role.guild.id, toIRole(role));
  });

  discord.on(Events.GuildMemberAdd, (member: GuildMember) => {
    // if (!channel.guild) return;
    console.log(member);
    ingest(Events.GuildMemberAdd, member.guild.id, toIGuildMember(member));
  });

  discord.on(Events.GuildMemberUpdate, (omember, nmember) => {
    // if (!channel.guild) return;
    console.log(nmember);
    toIGuildMember;
    ingest(Events.GuildMemberUpdate, nmember.guild.id, toIGuildMember(nmember));
  });

  discord.on(Events.GuildMemberRemove, (member) => {
    console.log(member);
    ingest(
      Events.GuildMemberRemove,
      member.guild!.id,
      toIGuildMember(member as any),
    );
  });
  // ─── Channel Update ───────────────────────────────────────────
  // discord.on(
  //   Events.ChannelUpdate,
  //   (oldChannel: GuildChannel, newChannel: GuildChannel) => {
  //     // if (!newChannel.guild) return;
  //     // we send the **new** channel object as payload
  //     ingest(Events.ChannelUpdate, newChannel.guild.id, newChannel);
  //   },
  // );

  // // ─── Channel Delete ───────────────────────────────────────────
  // discord.on(Events.ChannelDelete, (channel: GuildChannel) => {
  //   if (!channel.guild) return;
  //   ingest(Events.ChannelDelete, channel.guild.id, channel);
  // });

  /* 1. Message create */
  discord.on(Events.MessageCreate, (msg) => {
    if (!msg.guildId) return;
    console.log(msg.reactions);
    // ingest(Events.MessageCreate, msg.guildId, toIRawInfo(msg));
  });

  /* 2. Message update */
  discord.on(Events.MessageUpdate, (_old, New) => {
    if (!New.guildId) return;
    const reactions = New.reactions.cache;

    console.log(New.reactions);
    console.log(reactions);
    console.log(...reactions.values());
  });

  // /* 3. Message delete (single) */
  // discord.on(Events.MessageDelete, (msg) => {
  //   if (!msg.guildId) return;
  //   ingest(Events.MessageDelete, msg.guildId, {
  //     messageId: msg.id,
  //     channelId: msg.channelId,
  //   });
  // });

  // /* 4. Message bulk delete */
  // discord.on(Events.MessageBulkDelete, (coll) => {
  //   const first = coll.first();
  //   if (!first?.guildId) return;
  //   ingest(Events.MessageBulkDelete, first.guildId, {
  //     messageIds: coll.map((m) => m.id),
  //     channelId: first.channelId,
  //   });
  // });

  /* 4. Message bulk delete */
  // discord.on(Events.MessageDelete, (msg) => {
  //   if (!msg.guildId) return;
  //   ingest(Events.MessageDelete, msg.guildId, {
  //     messageId: msg.id,
  //     channelId: msg.channelId,
  //   });
  // });
  console.log('✅ Listening for channel events…');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
