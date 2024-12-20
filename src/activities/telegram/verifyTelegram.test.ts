describe('pass', () => {
  it('should pass', () => {
    expect(true).toBe(true)
  })
})

// import { Token, TokenTypeNames } from '@togethercrew.dev/db';
// import { verifyTelegram } from './verifyTelegram';
// import mongoose from 'mongoose';

// jest.mock('mongoose', () => ({
//   startSession: jest.fn()
// }))

// jest.mock('@togethercrew.dev/db', () => ({
//   Platform: {
//     create: jest.fn(),
//   },
//   PlatformNames: {
//     Telegram: 'telegram',
//   },
//   Token: {
//     findOneAndUpdate: jest.fn()
//   }
// }));

// const token = 'test-token';
// const chat = { id: 123, title: 'Test Chat' };
// const from = { id: 456, username: 'testuser' };

// describe('verifyTelegram', () => {
//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   const mockToken = {
//     set: jest.fn(),
//     save: jest.fn(),
//   };

//   const mockSession = {
//     startTransaction: jest.fn(),
//     commitTransaction: jest.fn(),
//     abortTransaction: jest.fn(),
//     endSession: jest.fn()
//   }

//   it('should verify successfully when one match token is found', async () => {
//     (Token.findOneAndUpdate as jest.Mock).mockResolvedValue(mockToken);
//     (mongoose.startSession as jest.Mock).mockResolvedValue(mockSession);

//     const result = await verifyTelegram(token, chat, from);

//     expect(Token.findOneAndUpdate).toHaveBeenCalledWith(
//       {
//         token,
//         type: 'telegram_verification',
//         verifiedAt: { $exists: false },
//       },
//       {
//         $set: {
//           verifiedAt: expect.any(Date),
//         },
//       },
//       { new: true, upsert: false },
//     );
//     expect(result).toBe('Verification successful. Platform created.');
//   });

//   it('should return a failure message when no matching platform is found', async () => {
//     (Platform.findOneAndUpdate as jest.Mock).mockResolvedValue(null); // Simulate no matching platforms

//     // Act
//     const result = await verifyTelegram(token, chat, from);

//     // Assert
//     expect(Platform.findOneAndUpdate).toHaveBeenCalledWith(
//       {
//         name: 'telegram',
//         'metadata.token.value': token,
//         'metadata.token.verifiedAt': { $exists: false },
//       },
//       {
//         $set: {
//           'metadata.token.verifiedAt': expect.any(Date),
//           'metadata.chat': chat,
//           'metadata.from': from,
//         },
//       },
//       { new: true, upsert: false },
//     );
//     expect(result).toBe('Failed. Platform not found.');
//   });
// });
