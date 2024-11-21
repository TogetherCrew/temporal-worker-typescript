import { S3_NUM_PARTITIONS } from "../../shared/s3";

export enum KeyTypeDiscourse {
  latest = 'latest',
  posts = 'posts',
  user_actions = 'user_actions',
  users = 'users'
}

// discourse/${endpoint}/${type}/...
// latest/${partition}/${id}
// posts/${partition}/${id}
// user_actions/${partition}/${id}
// users/${partition}/${id}

export class KeyGenDiscourse {

  private getPartition(id: number | string): number {
    if (typeof id === 'string') {
      id = parseInt(id, 16);
    }
    return id % S3_NUM_PARTITIONS;
  }

  public getKey(endpoint: string, type: KeyTypeDiscourse, id: number | string, formattedDate: string, fileExtension = 'json.gz') {
    const partition = this.getPartition(id)
    return `discourse/${endpoint}/${formattedDate}/${type}/${partition}/${id}.${fileExtension}`
  }

}