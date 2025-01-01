export interface DiscourseNeo4jCategory {
  id: number;
  name: string;
  subcategoryList?: DiscourseNeo4jCategory[];
}
