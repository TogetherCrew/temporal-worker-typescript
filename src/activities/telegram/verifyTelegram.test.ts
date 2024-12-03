import { Platform, PlatformNames } from '@togethercrew.dev/db';
import { verifyTelegram } from './verifyTelegram';

jest.mock('@togethercrew.dev/db', () => ({
  Platform: {
    find: jest.fn(),
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
    (Platform.find as jest.Mock).mockResolvedValue([mockPlatform]);

    const result = await verifyTelegram(token, chat, from);

    expect(Platform.find).toHaveBeenCalledWith({
      name: 'telegram',
      'metadata.token.value': token,
      'metadata.token.verifiedAt': { $exists: false },
    });
    expect(mockPlatform.set).toHaveBeenCalledWith(
      'metadata.token.verifiedAt',
      expect.any(Date),
    );
    expect(mockPlatform.set).toHaveBeenCalledWith('metadata.chat', chat);
    expect(mockPlatform.set).toHaveBeenCalledWith('metadata.from', from);
    expect(mockPlatform.save).toHaveBeenCalled();
    expect(result).toBe('Success! Platform verified.');
  });

  it('should return a failure message when no matching platform is found', async () => {
    (Platform.find as jest.Mock).mockResolvedValue([]); // Simulate no matching platforms

    // Act
    const result = await verifyTelegram(token, chat, from);

    // Assert
    expect(Platform.find).toHaveBeenCalledWith({
      name: 'telegram',
      'metadata.token.value': token,
      'metadata.token.verifiedAt': { $exists: false },
    });
    expect(mockPlatform.set).not.toHaveBeenCalled();
    expect(mockPlatform.save).not.toHaveBeenCalled();
    expect(result).toBe('Failed. Platform not found.');
  });

  it('should return a failure message when multiple matching platforms are found', async () => {
    (Platform.find as jest.Mock).mockResolvedValue([
      mockPlatform,
      mockPlatform,
    ]); // Simulate multiple matching platforms

    // Act
    const result = await verifyTelegram(token, chat, from);

    // Assert
    expect(Platform.find).toHaveBeenCalledWith({
      name: 'telegram',
      'metadata.token.value': token,
      'metadata.token.verifiedAt': { $exists: false },
    });
    expect(mockPlatform.set).not.toHaveBeenCalled();
    expect(mockPlatform.save).not.toHaveBeenCalled();
    expect(result).toBe('Failed. Platform not found.');
  });

  it('should throw an error if `setVerified` encounters an issue', async () => {
    (Platform.find as jest.Mock).mockResolvedValue([mockPlatform]);
    mockPlatform.save.mockRejectedValue(new Error('Save failed')); // Simulate save failure

    // Act & Assert
    await expect(verifyTelegram(token, chat, from)).rejects.toThrow(
      'Save failed',
    );

    expect(Platform.find).toHaveBeenCalledWith({
      name: 'telegram',
      'metadata.token.value': token,
      'metadata.token.verifiedAt': { $exists: false },
    });
    expect(mockPlatform.set).toHaveBeenCalledWith(
      'metadata.token.verifiedAt',
      expect.any(Date),
    );
    expect(mockPlatform.set).toHaveBeenCalledWith('metadata.chat', chat);
    expect(mockPlatform.set).toHaveBeenCalledWith('metadata.from', from);
    expect(mockPlatform.save).toHaveBeenCalled();
  });
});
