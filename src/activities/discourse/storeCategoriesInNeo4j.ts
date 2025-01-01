import { KeyGenDiscourse } from '../../libs/discourse/KeyGenDiscourse';
import { Neo4jDiscourse } from '../../libs/discourse/neo4j/Neo4jDiscourse';
import { S3Gzip } from '../../libs/s3/S3Gzip';
import {
  DiscourseNeo4jCategory,
  DiscourseRawCategories,
  DiscourseRawCategory,
} from '../../shared/types';

const g = new KeyGenDiscourse();
const s = new S3Gzip();
const neo4j = new Neo4jDiscourse();

export async function storeCategoriesInNeo4j(
  endpoint: string,
  formattedDate: string,
) {
  const key = g.getCategoriesKey(endpoint, formattedDate);
  const data = (await s.get(key)) as DiscourseRawCategories;
  const categories = transform(data.category_list.categories, { endpoint });
  await neo4j.createCategories(categories);
}

function transform(
  data: DiscourseRawCategory[],
  other: object,
): DiscourseNeo4jCategory[] {
  return data.map((d) => ({
    id: d.id,
    name: d.name,
    subcategoryList: d.subcategory_list?.map((s) => ({
      id: s.id,
      name: s.name,
      ...other,
    })),
    ...other,
  }));
}
