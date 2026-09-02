import { test, expect } from './helpers/fixtures';
import { ChatPage } from './helpers/chat-page';

/**
 * Regression cover for a reported crash: after saying "I'm a client" and asking
 * how to log in, the chat window went blank.
 *
 * The replies below are the real ones captured from the model for this exact
 * exchange. The load-bearing assertion is not the text — it is that the window
 * is still mounted afterwards, backed by the suite-wide page-error guard, which
 * fails the test on any uncaught exception or console error.
 */

const CLIENT_GREETING_REPLY = `Great to hear from you! How can I help with your engagement today?

Are you looking for:
- **Dashboard access** or login help
- An update on a current project or deliverable
- Support with a tool or agent we've built
- Something else related to your account

Let me know what you need and I'll point you in the right direction.`;

const LOGIN_REPLY = `Your **AI Results Dashboard** access is provisioned by your account manager — there's no general login link I can send you.

If you need access restored or you're not sure who your account manager is, reach out to **hello@gocadre.ai** and they'll get you sorted quickly.

Is there anything else I can help with in the meantime?`;

test.describe('client login handoff', () => {
  test('survives the two-turn "I\'m a client" → "how do I log in" exchange', async ({
    page,
    chat,
  }) => {
    chat.replyInOrder(CLIENT_GREETING_REPLY, LOGIN_REPLY);
    const ui = new ChatPage(page);
    await ui.goto();

    await ui.send("I'm a client");
    await expect(ui.lastBubble('assistant')).toContainText('How can I help with your engagement');

    await ui.send('How do I log in?');
    await expect(ui.lastBubble('assistant')).toContainText('provisioned by your account manager');

    await expect(ui.bubbles('user')).toHaveCount(2);
    await expect(ui.bubbles('assistant')).toHaveCount(2);
    await ui.expectStillAlive();
  });

  test('survives the same question asked in a single message', async ({ page, chat }) => {
    chat.alwaysReply(LOGIN_REPLY);
    const ui = new ChatPage(page);
    await ui.goto();

    await ui.send("I'm a client, how do I log in?");

    await expect(ui.lastBubble('assistant')).toContainText('account manager');
    await ui.expectStillAlive();
  });

  test('renders the bulleted options and bolded terms in the greeting reply', async ({
    page,
    chat,
  }) => {
    chat.alwaysReply(CLIENT_GREETING_REPLY);
    const ui = new ChatPage(page);
    await ui.goto();

    await ui.send("I'm a client");

    const bubble = ui.lastBubble('assistant');
    await expect(bubble.locator('li')).toHaveCount(4);
    await expect(bubble.locator('strong').first()).toHaveText('Dashboard access');
    await ui.expectStillAlive();
  });

  test('stays up across a longer client conversation', async ({ page, chat }) => {
    chat.replyInOrder(
      CLIENT_GREETING_REPLY,
      LOGIN_REPLY,
      'Your account manager can reset that for you.',
      'You can reach the team at hello@gocadre.ai.',
      'Happy to help — anything else?',
    );
    const ui = new ChatPage(page);
    await ui.goto();

    for (const message of [
      "I'm a client",
      'How do I log in?',
      "I've forgotten my password",
      'Who do I email?',
      'Thanks',
    ]) {
      await ui.send(message);
      await expect(ui.input).toBeEnabled();
    }

    await expect(ui.bubbles('assistant')).toHaveCount(5);
    await ui.expectStillAlive();
  });
});
