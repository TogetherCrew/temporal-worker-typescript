import { S3_NUM_PARTITIONS } from './s3';

describe('s3', () => {
  test('S3_NUM_PARTITIONS should equal 500', () => {
    expect(S3_NUM_PARTITIONS).toBe(500);
  });
});
