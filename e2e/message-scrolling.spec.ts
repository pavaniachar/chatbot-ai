import { test, expect } from './helpers/fixtures';
import { ChatPage } from './helpers/chat-page';

/**
 * Regression cover for the reported blank message panel: from the third
 * question on, the conversation vanished while the header and composer stayed
 * put.
 *
 * Nothing crashed — auto-scroll was dragging the message list up and out of the
 * card. `Element.scrollIntoView()` scrolls *every* scrollable ancestor, and
 * `overflow: hidden` still counts as scrollable from script, so following the
 * stream also scrolled the wrapper the list sits in.
 *
 * These assertions are geometric on purpose. Playwright's `toBeVisible()` only
 * checks for a non-empty box, so it passes happily on a message parked far
 * outside its scroll container — which is why the existing specs stayed green
 * through the bug.
 */

const REPLY =
  'Thanks for asking — here is a reply long enough that the conversation grows ' +
  'steadily with each turn and the message list has to start scrolling.';

test.describe('message list scrolling', () => {
  test('the message list stays put as the conversation grows', async ({ page, chat }) => {
    chat.alwaysReply(REPLY);
    const ui = new ChatPage(page);
    await ui.goto();

    // The list only mounts once there is a message, so anchor on turn one.
    await ui.send('Question number 1');
    await expect(ui.lastBubble('assistant')).toContainText('Thanks for asking');
    const initial = await ui.scrollState();

    for (let turn = 2; turn <= 6; turn += 1) {
      await ui.send(`Question number ${turn}`);
      await expect(ui.lastBubble('assistant')).toContainText('Thanks for asking');

      const state = await ui.scrollState();
      expect(state.displacedAncestors, `ancestors scrolled after turn ${turn}`).toEqual([]);
      expect(state.logBand, `message list moved after turn ${turn}`).toBe(initial.logBand);
    }
  });

  test('the newest reply is on screen after every turn', async ({ page, chat }) => {
    chat.alwaysReply(REPLY);
    const ui = new ChatPage(page);
    await ui.goto();

    for (let turn = 1; turn <= 6; turn += 1) {
      await ui.send(`Question number ${turn}`);
      await expect(ui.lastBubble('assistant')).toContainText('Thanks for asking');

      await expect
        .poll(async () => (await ui.scrollState()).latestMessageOnScreen, {
          message: `latest reply is off screen after turn ${turn}`,
        })
        .toBe(true);
    }
  });

  test('scrolling up offers a jump back to the latest message', async ({ page, chat }) => {
    chat.alwaysReply(REPLY);
    const ui = new ChatPage(page);
    await ui.goto();

    for (let turn = 1; turn <= 4; turn += 1) {
      await ui.send(`Question number ${turn}`);
      await expect(ui.lastBubble('assistant')).toContainText('Thanks for asking');
    }

    await ui.conversation.evaluate((el) => el.scrollTo({ top: 0 }));
    const jumpButton = page.getByRole('button', { name: /jump to latest/i });
    await expect(jumpButton).toBeVisible();

    await jumpButton.click();

    await expect(jumpButton).toHaveCount(0);
    await expect
      .poll(async () => (await ui.scrollState()).latestMessageOnScreen)
      .toBe(true);
    expect((await ui.scrollState()).displacedAncestors).toEqual([]);
    await ui.expectStillAlive();
  });
});
