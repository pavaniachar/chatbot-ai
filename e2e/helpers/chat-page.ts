import { expect, type Locator, type Page } from '@playwright/test';

/** Selectors and actions for the chat surface, so specs read as behaviour. */
export class ChatPage {
  readonly input: Locator;
  readonly sendButton: Locator;
  readonly resetButton: Locator;
  readonly conversation: Locator;
  readonly typingIndicator: Locator;
  readonly errorNotice: Locator;
  readonly retryButton: Locator;
  readonly suggestedPrompts: Locator;

  constructor(private readonly page: Page) {
    this.input = page.getByRole('textbox', { name: /message cadre ai/i });
    this.sendButton = page.getByRole('button', { name: 'Send' });
    this.resetButton = page.getByRole('button', { name: 'New chat' });
    this.conversation = page.getByRole('log', { name: /conversation with cadre ai/i });
    this.typingIndicator = page.getByTestId('typing-indicator');
    this.retryButton = page.getByRole('button', { name: 'Retry' });
    // Next renders its own empty `role="alert"` route announcer, so the notice
    // is identified by the Retry button it wraps.
    this.errorNotice = page.getByRole('alert').filter({ has: this.retryButton });
    this.suggestedPrompts = page.getByRole('group', { name: 'Try asking:' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
    await expect(this.input).toBeVisible();
  }

  async send(text: string): Promise<void> {
    await this.input.fill(text);
    await this.sendButton.click();
  }

  bubbles(role: 'user' | 'assistant'): Locator {
    return this.page.locator(`[data-role="${role}"]`);
  }

  lastBubble(role: 'user' | 'assistant'): Locator {
    return this.bubbles(role).last();
  }

  /**
   * Scroll state of the message list and everything above it.
   *
   * `displacedAncestors` is the load-bearing one: the list lives inside
   * `overflow: hidden` wrappers, which are invisible to the user but still
   * scrollable from script. Anything that scrolls one drags the conversation
   * off the card and leaves a blank panel behind.
   */
  async scrollState(): Promise<{
    displacedAncestors: string[];
    latestMessageOnScreen: boolean;
    logBand: string;
  }> {
    return this.page.evaluate(() => {
      const log = document.querySelector('[role="log"]') as HTMLElement | null;
      if (!log) throw new Error('message list is not rendered');

      const displacedAncestors: string[] = [];
      for (let el = log.parentElement; el && el.tagName !== 'HTML'; el = el.parentElement) {
        if (Math.round(el.scrollTop) !== 0) {
          displacedAncestors.push(
            `<${el.tagName.toLowerCase()} class="${(el.className || '').slice(0, 45)}"> ` +
              `scrollTop=${Math.round(el.scrollTop)}`,
          );
        }
      }

      const band = log.getBoundingClientRect();
      const bubbles = [...document.querySelectorAll('[data-role]')] as HTMLElement[];
      const last = bubbles.at(-1)?.getBoundingClientRect();

      return {
        displacedAncestors,
        latestMessageOnScreen:
          !!last && last.bottom > band.top + 1 && last.top < band.bottom - 1,
        logBand: `${Math.round(band.top)}..${Math.round(band.bottom)}`,
      };
    });
  }

  /**
   * The chat window is still mounted and usable. A React throw during render
   * unmounts the whole client tree, so this failing is the blank-page symptom.
   */
  async expectStillAlive(): Promise<void> {
    await expect(this.input).toBeVisible();
    await expect(this.resetButton).toBeVisible();
    await expect(this.input).toBeEnabled();
  }
}
