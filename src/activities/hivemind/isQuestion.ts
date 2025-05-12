import axios from 'axios';
import { ConfigService } from '../../config/config.service';
import { QuestionResult } from '../../shared/types/hivemind/QuestionResult';
import parentLogger from '../../config/logger.config';

const logger = parentLogger.child({ module: 'hivemind:isQuestion' });

export async function isQuestion(text: string): Promise<boolean> {
  const configService = ConfigService.getInstance();
  const questionServiceUri = configService.get('questionService').URI;
  const minQuestionScore = configService.get('MIN_QUESTION_SCORE');

  const { data }: { data: QuestionResult } = await axios.post(
    questionServiceUri,
    { text },
  );
  logger.debug(data);
  if (data.label === 'QUESTION' && data.score > minQuestionScore) {
    return true;
  }
  return false;
}
