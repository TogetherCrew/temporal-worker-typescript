import { Snowflake } from 'discord.js';

import { PlatformNames, platformRepository } from '@togethercrew.dev/db';

import parentLogger from '../../../config/logger.config';

const logger = parentLogger.child({
  activity: 'discord:event:channel-selection',
});

export async function isChannelSelected(
  guildId: string,
  channelId: Snowflake,
): Promise<boolean> {
  try {
    const platform = await platformRepository.findOne({
      name: PlatformNames.Discord,
      'metadata.id': guildId,
    });

    const selected: Snowflake[] | undefined =
      platform?.metadata?.selectedChannels;
    const isSelected = !selected?.length || selected.includes(channelId);

    logger.debug(
      { guildId, channelId, selected },
      isSelected ? 'channel accepted' : 'channel skipped',
    );
    return isSelected;
  } catch (err) {
    logger.error(
      { err, guildId, channelId },
      'channel-filter error, defaulting to true',
    );
    return true;
  }
}
