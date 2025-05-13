// src/dev/use.ts
import { Events } from 'discord.js';

import { Client, Connection } from '@temporalio/client';

import { EventIngestInput } from '../../shared/types/discord/EventIngestion.discord';
import { eventIngest } from '../../workflows/discord/EventIngestionWorkflow';

async function main() {
  const connection = await Connection.connect({ address: 'localhost:7233' });
  const client = new Client({ connection });

  const guildId = '980858613587382322';

  const testEvents: EventIngestInput[] = [
    // Channel events
    {
      type: Events.ChannelCreate,
      guildId,
      payload: { channelId: '111', name: 'new-channel', type: 0 },
    },
    {
      type: Events.ChannelUpdate,
      guildId,
      payload: { channelId: '111', name: 'renamed-channel', type: 0 },
    },
    {
      type: Events.ChannelDelete,
      guildId,
      payload: { channelId: '111' } as any,
    },
    // Member events
    {
      type: Events.GuildMemberAdd,
      guildId,
      payload: {
        discordId: '222',
        username: 'newbie',
        discriminator: '1234',
        joinedAt: new Date(),
        roles: [],
      },
    },
    {
      type: Events.GuildMemberUpdate,
      guildId,
      payload: {
        discordId: '222',
        username: 'newbie-updated',
        discriminator: '1234',
        joinedAt: new Date(),
        roles: ['333'],
      },
    },
    {
      type: Events.GuildMemberRemove,
      guildId,
      payload: { discordId: '222' } as any,
    },
    // Role events
    {
      type: Events.GuildRoleCreate,
      guildId,
      payload: { roleId: '333', name: 'tester', color: 0x00ff00 },
    },
    {
      type: Events.GuildRoleUpdate,
      guildId,
      payload: { roleId: '333', name: 'super-tester', color: 0xff0000 },
    },
    {
      type: Events.GuildRoleDelete, // ← if you have the correct constant; otherwise use your delete variant
      guildId,
      payload: { roleId: '333' } as any,
    },
  ];

  for (const input of testEvents) {
    const wfId = `demo:${input.type}:${Date.now()}`;
    console.log(`▶ Starting ${input.type} → workflowId=${wfId}`);
    const handle = await client.workflow.start(eventIngest, {
      taskQueue: 'TEMPORAL_QUEUE_HEAVY',
      workflowId: wfId,
      args: [input],
    });
    await handle.result();
    console.log(`✅ Completed ${input.type}`);
  }

  console.log('All test events processed.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
