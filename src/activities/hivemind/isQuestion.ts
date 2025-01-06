import axios from 'axios';
import { config } from '../../config';
import { QuestionResult } from '../../shared/types/hivemind/QuestionResult';

export async function isQuestion(text: string): Promise<boolean> {
  const { data }: { data: QuestionResult } = await axios.post(
    config.QUESTION_SERVICE_URI,
    { text },
  );
  console.log(data);
  if (data.label === 'QUESTION' && data.score > config.MIN_QUESTION_SCORE) {
    return true;
  }
  return false;
}
