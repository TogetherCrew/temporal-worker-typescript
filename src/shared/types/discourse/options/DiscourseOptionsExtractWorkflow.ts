import { DiscourseOptionsBase } from './DiscourseOptionsBase';
import { DiscourseOptionsComputeWorkflow } from './DiscourseOptionsComputeWorkflow';

export interface DiscourseOptionsExtractWorkflow extends DiscourseOptionsBase {
  compute: DiscourseOptionsComputeWorkflow;
}
