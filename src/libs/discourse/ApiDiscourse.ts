import {
  DiscourseRawActions,
  DiscourseRawLatest,
  DiscourseRawPosts,
  DiscourseRawUser,
} from 'src/shared/types';
import { LimiterService } from '../helpers/LimiterService';

export class ApiDiscourse extends LimiterService {
  public async latest(
    endpoint: string,
    page: number,
  ): Promise<DiscourseRawLatest> {
    const params = {
      page,
      order: 'created',
      no_definitions: true,
    };
    const { data } = await this.get(endpoint, 'latest.json', params);
    return data;
  }

  public async posts(
    endpoint: string,
    before: number | undefined,
  ): Promise<DiscourseRawPosts> {
    const params = before ? { before } : {};
    const { data } = await this.get(endpoint, 'posts.json', params);
    return data;
  }

  public async actions(
    endpoint: string,
    username: string,
    offset = 0,
    limit = 50,
    filters: number[] = [1, 2, 4, 5, 6, 7, 9],
  ): Promise<DiscourseRawActions> {
    const params = {
      username,
      offset,
      limit,
      filters,
    };
    const { data } = await this.get(endpoint, 'user_actions.json', params);
    return data;
  }

  public async user(
    endpoint: string,
    username: string,
  ): Promise<DiscourseRawUser> {
    const path = `u/${username}.json`;
    const { data } = await this.get(endpoint, path, {});
    return data;
  }
}
