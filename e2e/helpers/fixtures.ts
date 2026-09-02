import { test as base, expect, type Page, type Route } from '@playwright/test';
import {
  UI_MESSAGE_STREAM_HEADERS,
  assistantReply,
  type StreamChunk,
} from './ui-message-stream';

const CHAT_ENDPOINT = '**/api/chat';

export interface ChatRequest {
  messages: Array<{
    id: string;
    role: string;
    parts: StreamChunk[];
  }>;
}

/**
 * Stands in for `/api/chat`. Interception happens in the browser, so the real
 * route handler — and the OpenRouter call behind it — never runs.
 */
export class ChatMock {
  /** Bodies the UI actually sent, in order. Multi-turn tests assert against these. */
  readonly requests: ChatRequest[] = [];

  private script: Array<(route: Route) => Promise<void>> = [];
  private fallback: (route: Route) => Promise<void>;
  private delayMs = 0;

  constructor(private readonly page: Page) {
    this.fallback = this.streamHandler(assistantReply('Happy to help with that.'));
  }

  async install(): Promise<void> {
    await this.page.route(CHAT_ENDPOINT, async (route) => {
      const body = route.request().postDataJSON() as ChatRequest;
      this.requests.push(body);
      if (this.delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, this.delayMs));
      }
      const handler = this.script.shift() ?? this.fallback;
      await handler(route);
    });
  }

  /** Holds each response open for `ms` — used to observe the busy/streaming state. */
  withDelay(ms: number): this {
    this.delayMs = ms;
    return this;
  }

  /** Replies with `text` to every turn that has no scripted response of its own. */
  alwaysReply(text: string): this {
    this.fallback = this.streamHandler(assistantReply(text));
    return this;
  }

  /** Queues one scripted reply per turn, in order. */
  replyInOrder(...texts: string[]): this {
    for (const text of texts) {
      this.script.push(this.streamHandler(assistantReply(text)));
    }
    return this;
  }

  /** Queues a raw stream body — for chunk sequences `assistantReply` doesn't cover. */
  replyWithStream(body: string): this {
    this.script.push(this.streamHandler(body));
    return this;
  }

  /** Queues a plain HTTP failure, the way the route handler returns 400/429. */
  failWith(status: number, body: string): this {
    this.script.push(async (route) => {
      await route.fulfill({ status, contentType: 'text/plain', body });
    });
    return this;
  }

  private streamHandler(body: string) {
    return async (route: Route) => {
      await route.fulfill({ status: 200, headers: { ...UI_MESSAGE_STREAM_HEADERS }, body });
    };
  }
}

/**
 * Fails a test if the page throws an uncaught exception or logs an error.
 *
 * This is the guard against the blank-page class of bug: a throw during render
 * unmounts the whole client tree, and without this the surviving assertions
 * would just time out with an unhelpful "element not found".
 */
export class PageErrorGuard {
  readonly pageErrors: string[] = [];
  readonly consoleErrors: string[] = [];
  private readonly ignored: RegExp[] = [];

  constructor(page: Page) {
    page.on('pageerror', (error) => {
      this.pageErrors.push(error.stack ?? error.message);
    });
    page.on('console', (message) => {
      if (message.type() === 'error') {
        this.consoleErrors.push(message.text());
      }
    });
  }

  /** Allows a known-benign message through — e.g. dev-server noise. */
  ignore(pattern: RegExp): this {
    this.ignored.push(pattern);
    return this;
  }

  assertClean(): void {
    const isIgnored = (text: string) => this.ignored.some((pattern) => pattern.test(text));
    expect(this.pageErrors.filter((text) => !isIgnored(text)), 'uncaught page errors').toEqual([]);
    expect(
      this.consoleErrors.filter((text) => !isIgnored(text)),
      'console errors',
    ).toEqual([]);
  }
}

export const test = base.extend<{ chat: ChatMock; errors: PageErrorGuard }>({
  chat: async ({ page }, use) => {
    const mock = new ChatMock(page);
    await mock.install();
    await use(mock);
  },
  // Auto-applied: every test in the suite gets the crash guard, whether or not
  // it asks for it.
  errors: [
    async ({ page }, use) => {
      const guard = new PageErrorGuard(page);
      // The browser logs this for any non-2xx response, including the ones the
      // error specs inject on purpose. It says nothing about how the app
      // handled the failure — the specs assert that directly.
      guard.ignore(/^Failed to load resource: the server responded with a status of/);
      await use(guard);
      guard.assertClean();
    },
    { auto: true },
  ],
});

export { expect };
