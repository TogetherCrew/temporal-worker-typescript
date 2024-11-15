import { ApiDiscourse } from '../../libs/discourse/ApiDiscourse';
import { S3Discourse } from '../../libs/discourse/s3/S3Discourse';

const api = new ApiDiscourse();
const s3 = new S3Discourse();

export async function fetchUsersToS3(endpoint: string) {
  const usernames: string[] = await s3.get(endpoint, 'other', 'usernames');
  console.debug('fetchUsersToS3', usernames.length);

  const groups: string[][] = createGroups(
    usernames,
    Math.round(usernames.length / 100),
  );

  for (const group of groups) {
    await Promise.all(
      group.map((username) => fetchUserToS3(endpoint, username)),
    );
  }
  await Promise.all(
    usernames.map((username) => fetchUserToS3(endpoint, username)),
  );
}

function createGroups(arr: any[], n: number): string[][] {
  const groups: any[][] = Array.from({ length: n }, () => []);
  arr.forEach((obj, index) => groups[index % n].push(obj));
  return groups;
}

async function fetchUserToS3(endpoint: string, username: string) {
  try {
    const data = await api.user(endpoint, username);
    await s3.put(endpoint, 'users', data.user.id, data);
  } catch (error) {
    console.error(`Failed to process user.`, { endpoint, username, error });
  }
}
