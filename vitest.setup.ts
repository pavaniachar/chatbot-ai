import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Automatically cleanup after each test to prevent DOM pollution
afterEach(() => {
  cleanup();
});

// jsdom does not implement scrollIntoView; MessageList calls it on every
// message update to auto-scroll.
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
