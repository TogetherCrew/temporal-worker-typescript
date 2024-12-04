import { Platform, PlatformNames } from '@togethercrew.dev/db';
import { verifyTelegram } from './verifyTelegram';

jest.mock('@togethercrew.dev/db', () => ({
  Platform: {
    findOneAndUpdate: jest.fn(),
  },
  PlatformNames: {
    Telegram: 'telegram',
  },
}));

const token = 'test-token';
const chat = { id: 123, title: 'Test Chat' };
const from = { id: 456, username: 'testuser' };

describe('verifyTelegram', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockPlatform = {
    set: jest.fn(),
    save: jest.fn(),
  };

  it('should verify successfully when one match platform is found', async () => {
    (Platform.findOneAndUpdate as jest.Mock).mockResolvedValue(mockPlatform);

    const result = await verifyTelegram(token, chat, from);

    expect(Platform.findOneAndUpdate).toHaveBeenCalledWith(
      {
        name: 'telegram',
        'metadata.token.value': token,
        'metadata.token.verifiedAt': { $exists: false },
      },
      {
        $set: {
          'metadata.token.verifiedAt': expect.any(Date),
          'metadata.chat': chat,
          'metadata.from': from,
        },
      },
      { new: true, upsert: false },
    );
    expect(result).toBe('Success! Platform verified.');
  });

  it('should return a failure message when no matching platform is found', async () => {
    (Platform.findOneAndUpdate as jest.Mock).mockResolvedValue(null); // Simulate no matching platforms

    // Act
    const result = await verifyTelegram(token, chat, from);

    // Assert
    expect(Platform.findOneAndUpdate).toHaveBeenCalledWith(
      {
        name: 'telegram',
        'metadata.token.value': token,
        'metadata.token.verifiedAt': { $exists: false },
      },
      {
        $set: {
          'metadata.token.verifiedAt': expect.any(Date),
          'metadata.chat': chat,
          'metadata.from': from,
        },
      },
      { new: true, upsert: false },
    );
    expect(result).toBe('Failed. Platform not found.');
  });
});
