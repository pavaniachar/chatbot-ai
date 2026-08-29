import { APICallError } from 'ai';

const CONTACT_NOTICE =
  'You can reach a Cadre AI strategist directly at hello@gocadre.ai or through the [contact form on cadreai.com](https://cadreai.com/contact).';

export function mapErrorToUserMessage(error: unknown): string {
  console.error('[chat] provider error', error);

  const statusCode = APICallError.isInstance(error) ? error.statusCode : undefined;

  if (statusCode === 401 || statusCode === 402) {
    return `The assistant is temporarily unavailable. ${CONTACT_NOTICE}`;
  }

  if (statusCode === 429) {
    return "We're seeing high demand right now — please try again in a moment.";
  }

  if (statusCode !== undefined && statusCode >= 500) {
    return 'Something went wrong on our end. Please try again in a moment.';
  }

  return `Something went wrong. ${CONTACT_NOTICE}`;
}
