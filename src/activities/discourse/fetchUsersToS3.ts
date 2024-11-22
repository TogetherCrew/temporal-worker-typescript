import { KeyGenDiscourse, KeyTypeDiscourse } from '../../libs/discourse/KeyGenDiscourse';
import { ApiDiscourse } from '../../libs/discourse/ApiDiscourse';
import { S3Gzip } from '../../libs/s3/S3Gzip';
import pLimit from 'p-limit';
import axios from 'axios';
import { S3ServiceException } from '@aws-sdk/client-s3';

const g = new KeyGenDiscourse()
const s = new S3Gzip()
const a = new ApiDiscourse()

export async function fetchUsersToS3(endpoint: string, formattedDate: string) {
  const key = g.getUsernamesKey(endpoint, formattedDate)
  const usernames: string[] = await s.get(key) as string[]
  console.debug('usernames', usernames.length);

  const limit = pLimit(500)

  await Promise.all(
    usernames.map(username => limit(async () => {
      try {
        const data = await a.user(endpoint, username)
        const key = g.genKey(endpoint, KeyTypeDiscourse.users, username, formattedDate)
        await s.put(key, data)
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error('Failed to fetch username', error.message)
        } else if (error instanceof S3ServiceException) {
          console.error('Failed to store username', error.message)
        } else {
          throw error
        }
      }
    }))
  )
}