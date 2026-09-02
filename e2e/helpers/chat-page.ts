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
   * The chat window is still mounted and usable. A React throw during render
   * unmounts the whole client tree, so this failing is the blank-page symptom.
   */
  async expectStillAlive(): Promise<void> {
    await expect(this.input).toBeVisible();
    await expect(this.resetButton).toBeVisible();
    await expect(this.input).toBeEnabled();
  }
}
