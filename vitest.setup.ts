import '@testing-library/jest-dom/vitest';

// jsdom does not implement scrollIntoView; MessageList calls it on every
// message update to auto-scroll.
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
