import { DiscourseRawTopic } from 'src/shared/types';
import { ApiDiscourse } from '../../libs/discourse/ApiDiscourse';
import { S3Discourse } from '../../libs/discourse/s3/S3Discourse';

const api = new ApiDiscourse();
const s3 = new S3Discourse();

interface IFetchBatch {
  nextPage: number | undefined;
  batch: DiscourseRawTopic[];
}

export async function fetchTopicsToS3(endpoint: string) {
  let page: number | undefined = 0;
  while (page !== undefined) {
    try {
      const { nextPage, batch }: IFetchBatch = await fetchBatch(endpoint, page);
      await storeBatch(endpoint, batch);
      page = nextPage;
    } catch (error) {
      console.error('Failed to fetch and store topics', { endpoint, page });
      throw error;
    }
  }
}

async function storeBatch(endpoint: string, batch: DiscourseRawTopic[]) {
  Promise.all(
    batch.map((topic) => s3.put(endpoint, 'topics', topic.id, topic)),
  );
}

async function fetchBatch(
  endpoint: string,
  page: number,
): Promise<IFetchBatch> {
  const { topic_list } = await api.latest(endpoint, page);
  let nextPage: number | undefined = undefined;
  if (topic_list.more_topics_url) {
    nextPage = page + 1;
  }
  return { nextPage, batch: topic_list.topics };
}
