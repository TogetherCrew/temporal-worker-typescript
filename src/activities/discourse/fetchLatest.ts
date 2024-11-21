import { ApiDiscourse } from "../../libs/discourse/ApiDiscourse";
import { DiscourseRawLatest } from "src/shared/types";

const api = new ApiDiscourse()

export async function fetchLatest(endpoint: string, page: number): Promise<DiscourseRawLatest> {
  return await api.latest(endpoint, page);
}