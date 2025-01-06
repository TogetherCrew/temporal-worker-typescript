import {
  determineAction,
  TelegramStatus,
  TelegramAction,
} from './determineAction';

describe('determineAction', () => {
  const testCases: Array<{
    oldStatus: TelegramStatus;
    newStatus: TelegramStatus;
    expected: TelegramAction | null;
  }> = [
    { oldStatus: 'member', newStatus: 'left', expected: 'LEFT' },
    { oldStatus: 'left', newStatus: 'member', expected: 'JOINED' },
    { oldStatus: 'member', newStatus: 'administrator', expected: 'PROMOTED' },
    { oldStatus: 'administrator', newStatus: 'member', expected: 'DEMOTED' },
    { oldStatus: 'member', newStatus: 'kicked', expected: 'BANNED' },
    { oldStatus: 'member', newStatus: 'restricted', expected: 'RESTRICTED' },
    { oldStatus: 'kicked', newStatus: 'member', expected: 'UNBANNED' },
    { oldStatus: 'restricted', newStatus: 'member', expected: 'UNRESTRICTED' },
    { oldStatus: 'member', newStatus: 'left', expected: 'LEFT' },
    { oldStatus: 'left', newStatus: 'kicked', expected: 'BANNED' },
    {
      oldStatus: 'restricted',
      newStatus: 'restricted',
      expected: 'RESTRICTED',
    },
    { oldStatus: 'administrator', newStatus: 'kicked', expected: 'BANNED' },
  ];

  testCases.forEach(({ oldStatus, newStatus, expected }) => {
    it(`returns ${expected} for oldStatus: ${oldStatus}, newStatus: ${newStatus}`, () => {
      const action = determineAction(oldStatus, newStatus);
      expect(action).toBe(expected);
    });
  });

  it('returns null for unknown transitions', () => {
    expect(determineAction('creator', 'administrator')).toBeNull();
    expect(determineAction('creator', 'creator')).toBeNull();
  });
});
