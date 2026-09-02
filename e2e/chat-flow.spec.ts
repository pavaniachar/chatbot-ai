import { test, expect } from './helpers/fixtures';
import { ChatPage } from './helpers/chat-page';

test.describe('chat flow', () => {
  test('landing state offers suggested prompts and an empty composer', async ({ page }) => {
    const chat = new ChatPage(page);
    await chat.goto();

    await expect(chat.suggestedPrompts).toBeVisible();
    await expect(chat.conversation).toHaveCount(0);
    await expect(chat.sendButton).toBeDisabled();
  });

  test('a suggested prompt sends that question and renders the reply', async ({ page, chat }) => {
    chat.alwaysReply('Cadre AI is an AI strategy consultancy.');
    const ui = new ChatPage(page);
    await ui.goto();

    await page.getByRole('button', { name: 'What does Cadre AI do?' }).click();

    await expect(ui.lastBubble('user')).toContainText('What does Cadre AI do?');
    await expect(ui.lastBubble('assistant')).toContainText(
      'Cadre AI is an AI strategy consultancy.',
    );
    await expect(ui.suggestedPrompts).toHaveCount(0);
  });

  test('typing a message streams a reply back', async ({ page, chat }) => {
    chat.alwaysReply('You can book a call through the Cadre AI website.');
    const ui = new ChatPage(page);
    await ui.goto();

    await ui.send('How do I book a call?');

    await expect(ui.lastBubble('user')).toContainText('How do I book a call?');
    await expect(ui.lastBubble('assistant')).toContainText(
      'You can book a call through the Cadre AI website.',
    );
    await expect(ui.input).toHaveValue('');
  });

  test('composer is locked while a reply is in flight and unlocks after', async ({ page, chat }) => {
    chat.withDelay(1500).alwaysReply('Here is the answer.');
    const ui = new ChatPage(page);
    await ui.goto();

    await ui.send('What is the AI Maturity Index?');

    await expect(ui.typingIndicator).toBeVisible();
    await expect(ui.input).toBeDisabled();
    await expect(ui.sendButton).toBeDisabled();

    await expect(ui.lastBubble('assistant')).toContainText('Here is the answer.');
    await expect(ui.typingIndicator).toHaveCount(0);
    await expect(ui.input).toBeEnabled();
  });

  test('a three-turn conversation keeps every message and sends the full history', async ({
    page,
    chat,
  }) => {
    chat.replyInOrder(
      'Cadre AI helps teams adopt AI.',
      'We work across several industries.',
      'A strategist can walk you through it.',
    );
    const ui = new ChatPage(page);
    await ui.goto();

    await ui.send('What does Cadre AI do?');
    await expect(ui.lastBubble('assistant')).toContainText('Cadre AI helps teams adopt AI.');

    await ui.send('Which industries?');
    await expect(ui.lastBubble('assistant')).toContainText('We work across several industries.');

    await ui.send('Can I talk to someone?');
    await expect(ui.lastBubble('assistant')).toContainText('A strategist can walk you through it.');

    await expect(ui.bubbles('user')).toHaveCount(3);
    await expect(ui.bubbles('assistant')).toHaveCount(3);
    await ui.expectStillAlive();

    // The third request carries the two prior exchanges, so the model has context.
    const lastRequest = chat.requests.at(-1);
    expect(lastRequest?.messages).toHaveLength(5);
    expect(lastRequest?.messages.map((message) => message.role)).toEqual([
      'user',
      'assistant',
      'user',
      'assistant',
      'user',
    ]);
  });

  test('New chat clears the conversation back to the landing state', async ({ page, chat }) => {
    chat.alwaysReply('Cadre AI is an AI strategy consultancy.');
    const ui = new ChatPage(page);
    await ui.goto();

    await ui.send('What does Cadre AI do?');
    await expect(ui.lastBubble('assistant')).toBeVisible();

    await ui.resetButton.click();

    await expect(ui.bubbles('user')).toHaveCount(0);
    await expect(ui.bubbles('assistant')).toHaveCount(0);
    await expect(ui.suggestedPrompts).toBeVisible();
  });

  test('markdown in a reply renders as HTML, and links open safely', async ({ page, chat }) => {
    chat.alwaysReply(
      'Reach us at [the contact form](https://cadreai.com/contact) or **email us**.',
    );
    const ui = new ChatPage(page);
    await ui.goto();

    await ui.send('How do I get in touch?');

    const link = ui.lastBubble('assistant').getByRole('link', { name: 'the contact form' });
    await expect(link).toHaveAttribute('href', 'https://cadreai.com/contact');
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(ui.lastBubble('assistant').locator('strong')).toHaveText('email us');
  });
});
