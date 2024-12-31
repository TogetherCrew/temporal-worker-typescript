export interface DiscourseRawCategory {
  id: number
  name: string
  subcategory_list?: DiscourseRawCategory[]
}