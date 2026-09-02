import { test, expect } from './helpers/fixtures';
import { ChatPage } from './helpers/chat-page';
import { assistantReplyThenError } from './helpers/ui-message-stream';

/**
 * Every case here asserts the same thing twice: the failure is *shown*, and the
 * chat window survives it. A backend error should never take the UI down with
 * it.
 */
test.describe('error handling', () => {
  test('a 400 from validation surfaces an error notice, and the UI stays usable', async ({
    page,
    chat,
  }) => {
    chat.failWith(400, 'Invalid request body.');
    const ui = new ChatPage(page);
    await ui.goto();

    await ui.send('Hello');

    await expect(ui.errorNotice).toBeVisible();
    await ui.expectStillAlive();
  });

  test('a 429 rate-limit response is reported to the user', async ({ page, chat }) => {
    chat.failWith(429, "You're sending messages quickly — try again shortly.");
    const ui = new ChatPage(page);
    await ui.goto();

    await ui.send('Hello');

    await expect(ui.errorNotice).toContainText(/quickly|too many|try again/i);
    await ui.expectStillAlive();
  });

  test('a 500 shows the notice and Retry sends the turn again successfully', async ({
    page,
    chat,
  }) => {
    chat.failWith(500, 'Something went wrong on our end.').replyInOrder('Recovered — here you go.');
    const ui = new ChatPage(page);
    await ui.goto();

    await ui.send('What does Cadre AI do?');
    await expect(ui.errorNotice).toBeVisible();

    await ui.retryButton.click();

    await expect(ui.lastBubble('assistant')).toContainText('Recovered — here you go.');
    await expect(ui.errorNotice).toHaveCount(0);
    await ui.expectStillAlive();
  });

  test('a stream that dies mid-reply keeps the partial text and reports the failure', async ({
    page,
    chat,
  }) => {
    chat.replyWithStream(
      assistantReplyThenError('Cadre AI helps teams', 'The assistant is temporarily unavailable.'),
    );
    const ui = new ChatPage(page);
    await ui.goto();

    await ui.send('What does Cadre AI do?');

    await expect(ui.errorNotice).toBeVisible();
    await ui.expectStillAlive();
  });

  test('the error notice renders markdown links in the handoff message', async ({ page, chat }) => {
    chat.failWith(
      500,
      'Something went wrong. You can reach a Cadre AI strategist at [the contact form](https://cadreai.com/contact).',
    );
    const ui = new ChatPage(page);
    await ui.goto();

    await ui.send('Hello');

    const link = ui.errorNotice.getByRole('link', { name: 'the contact form' });
    await expect(link).toHaveAttribute('href', 'https://cadreai.com/contact');
    await ui.expectStillAlive();
  });

  test('the user can keep chatting after an error', async ({ page, chat }) => {
    chat.failWith(500, 'Something went wrong.').replyInOrder('Back to normal.');
    const ui = new ChatPage(page);
    await ui.goto();

    await ui.send('First question');
    await expect(ui.errorNotice).toBeVisible();

    await ui.send('Second question');

    await expect(ui.lastBubble('assistant')).toContainText('Back to normal.');
    await expect(ui.bubbles('user')).toHaveCount(2);
  });
});
