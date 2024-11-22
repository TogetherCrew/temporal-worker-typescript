export const MAX_PARTITIONS = 1000

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

  private getPartition(): number {
    return Math.floor(Math.random() * (MAX_PARTITIONS - 0 + 1));
  }

  public genKey(endpoint: string, type: KeyTypeDiscourse, id: number | string, formattedDate: string, fileExtension = 'json.gz') {
    const partition = this.getPartition()
    return `discourse/${endpoint}/${formattedDate}/${type}/${partition}/${id}.${fileExtension}`
  }

  public getListPrefix(endpoint: string, type: KeyTypeDiscourse, formattedDate: string, partition: number) {
    return `discourse/${endpoint}/${formattedDate}/${type}/${partition}/`
  }

  public getUsernamesKey(endpoint: string, formattedDate, fileExtension = 'json.gz') {
    return `discourse/${endpoint}/${formattedDate}/usernames.${fileExtension}`
  }

}