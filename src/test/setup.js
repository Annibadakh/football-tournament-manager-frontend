import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => cleanup());

// jsdom has no matchMedia; ThemeProvider needs it
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  });
}
