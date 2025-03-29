import { executeChild } from '@temporalio/workflow';
import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../../activities';
import { ChatInputCommandInteraction } from 'src/shared/types/discord';

const { getPlatform, publish } = proxyActivities<
  typeof activities
>({
  startToCloseTimeout: '1h',
  retry: {
    maximumAttempts: 3,
  },
});

type IDiscordQuestionWorkflow = {
  interaction: ChatInputCommandInteraction
};

export async function DiscordQuestionWorkflow({
  interaction,
}: IDiscordQuestionWorkflow) {

  const platform = await getPlatform({
    name: 'discord',
    'metadata.id': interaction.guildId,
  });

  const community_id = platform.community.toString()

  const payload = {
    query: interaction.options._hoistedOptions[0].value,
    community_id,
    enable_answer_skipping: false
  }

  const reply = await executeChild('AgenticHivemindTemporalWorkflow', {
    taskQueue: 'HIVEMIND_AGENT_QUEUE',
    workflowId: `discord:hivemind:${interaction.id}`,
    args: [payload],
  })


  if (!reply || reply.length === 0) {
    console.log('No reply from hivemind.');
    await publish('DISCORD_BOT', 'INTERACTION_RESPONSE_EDIT', {
      interaction,
      data: {
        content: `**${payload.query}**\nNo reply from hivemind.`,
      }
    });
    return;
  }

  const response = {
    interaction,
    data: {
      content: `**${payload.query}**\n${reply}`,
    }
  }

  // Getting errors when using the Queue and Event enums from the tc-messagebroker package
  await publish('DISCORD_BOT', 'INTERACTION_RESPONSE_EDIT', response);

}
