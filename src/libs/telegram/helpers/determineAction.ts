type TelegramStatus =
  | 'member'
  | 'left'
  | 'kicked'
  | 'restricted'
  | 'administrator'
  | 'creator';
type TelegramAction =
  | 'LEFT'
  | 'BANNED'
  | 'JOINED'
  | 'UNBANNED'
  | 'RESTRICTED'
  | 'UNRESTRICTED'
  | 'PROMOTED'
  | 'DEMOTED';

export function determineAction(
  oldStatus: TelegramStatus,
  newStatus: TelegramStatus,
): TelegramAction | null {
  if (oldStatus === 'member' && newStatus === 'left') {
    return 'LEFT';
  } else if (oldStatus === 'left' && newStatus === 'member') {
    return 'JOINED';
  } else if (oldStatus === 'member' && newStatus === 'administrator') {
    return 'PROMOTED';
  } else if (oldStatus === 'administrator' && newStatus === 'member') {
    return 'DEMOTED';
  } else if (newStatus === 'kicked') {
    return 'BANNED';
  } else if (newStatus === 'restricted') {
    return 'RESTRICTED';
  } else if (oldStatus === 'kicked') {
    return 'UNBANNED';
  } else if (oldStatus === 'restricted') {
    return 'UNRESTRICTED';
  } else if (newStatus === 'left') {
    return 'LEFT';
  }
  return null;
}
