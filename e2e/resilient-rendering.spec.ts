import { test, expect } from './helpers/fixtures';
import { ChatPage } from './helpers/chat-page';
import { assistantReply, encodeStream } from './helpers/ui-message-stream';

/**
 * The model's output is not under our control, and neither is the exact chunk
 * sequence the provider sends. A render that throws on any of it takes the
 * whole client tree down — a blank page, not a graceful failure.
 *
 * Each case here feeds the UI something awkward and asserts the same thing: the
 * chat window is still there. The page-error guard does the rest.
 */
test.describe('rendering resilience', () => {
  test('handles chunk types the UI does not render', async ({ page, chat }) => {
    chat.replyWithStream(
      assistantReply('Here is the answer.', {
        leadingChunks: [
          { type: 'reasoning-start', id: 'r-0' },
          { type: 'reasoning-delta', id: 'r-0', delta: 'thinking' },
          { type: 'reasoning-end', id: 'r-0' },
        ],
        trailingChunks: [
          { type: 'data-custom', id: 'd-0', data: { anything: true } },
          { type: 'source-url', sourceId: 's-0', url: 'https://cadreai.com' },
        ],
      }),
    );
    const ui = new ChatPage(page);
    await ui.goto();

    await ui.send('Tell me about Cadre AI');

    await expect(ui.lastBubble('assistant')).toContainText('Here is the answer.');
    await ui.expectStillAlive();
  });

  test('handles a reply with no text at all', async ({ page, chat }) => {
    chat.replyWithStream(
      encodeStream([
        { type: 'start', messageId: 'empty' },
        { type: 'start-step' },
        { type: 'finish-step' },
        { type: 'finish' },
      ]),
    );
    const ui = new ChatPage(page);
    await ui.goto();

    await ui.send('Hello');

    await ui.expectStillAlive();
    await expect(ui.bubbles('user')).toHaveCount(1);
  });

  test('handles a stream that stops mid-reply without closing', async ({ page, chat }) => {
    chat.replyWithStream(
      encodeStream([
        { type: 'start', messageId: 'truncated' },
        { type: 'start-step' },
        { type: 'text-start', id: 'text-0' },
        { type: 'text-delta', id: 'text-0', delta: 'Cadre AI helps teams ad' },
      ]),
    );
    const ui = new ChatPage(page);
    await ui.goto();

    await ui.send('What does Cadre AI do?');

    await expect(ui.lastBubble('assistant')).toContainText('Cadre AI helps teams ad');
    await ui.expectStillAlive();
  });

  test('handles markdown the bubble has no styling for', async ({ page, chat }) => {
    chat.alwaysReply(
      [
        '| Service | Length |',
        '| --- | --- |',
        '| Maturity Index | 2 weeks |',
        '',
        '> A blockquote.',
        '',
        '```ts',
        'const unterminated = true;',
        '',
        '# A heading',
        '',
        'An [unterminated link](https://cadreai.com',
        '',
        '<div onclick="alert(1)">raw html</div>',
      ].join('\n'),
    );
    const ui = new ChatPage(page);
    await ui.goto();

    await ui.send('Show me everything');

    await expect(ui.lastBubble('assistant')).toContainText('Maturity Index');
    await ui.expectStillAlive();
  });

  test('handles a very long reply without breaking the layout', async ({ page, chat }) => {
    chat.alwaysReply(`${'Cadre AI helps teams adopt AI responsibly. '.repeat(80)}End of answer.`);
    const ui = new ChatPage(page);
    await ui.goto();

    await ui.send('Tell me everything');

    await expect(ui.lastBubble('assistant')).toContainText('End of answer.');
    await ui.expectStillAlive();
    // A long reply must not push the page into horizontal scrolling.
    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    expect(overflows, 'page scrolls horizontally').toBe(false);
  });

  test('handles two replies arriving under the same message id', async ({ page, chat }) => {
    chat
      .replyWithStream(assistantReply('First answer.', { messageId: 'duplicate-id' }))
      .replyWithStream(assistantReply('Second answer.', { messageId: 'duplicate-id' }));
    const ui = new ChatPage(page);
    await ui.goto();

    await ui.send('First question');
    await expect(ui.lastBubble('assistant')).toContainText('First answer.');

    await ui.send('Second question');
    await expect(ui.lastBubble('assistant')).toContainText('Second answer.');
    await ui.expectStillAlive();
  });

  test('handles a response that is not a stream at all', async ({ page, chat }) => {
    chat.failWith(200, 'plain text, not server-sent events');
    const ui = new ChatPage(page);
    await ui.goto();

    await ui.send('Hello');

    await ui.expectStillAlive();
  });
});
