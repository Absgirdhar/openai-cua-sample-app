import React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createRunnerUnavailableIssue } from "./helpers";
import { OperatorConsole } from "./OperatorConsole";

class MockEventSource {
  close() {}

  onerror: ((event: Event) => void) | null = null;

  onmessage: ((event: MessageEvent<string>) => void) | null = null;

  constructor(url: string) {
    void url;
  }
}

describe("OperatorConsole", () => {
  beforeEach(() => {
    vi.stubGlobal("EventSource", MockEventSource);
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("explains how to recover when the runner is offline", () => {
    render(
      <OperatorConsole
        initialRunnerIssue={createRunnerUnavailableIssue("Connection refused")}
        runnerBaseUrl="http://127.0.0.1:4001"
      />,
    );

    expect(screen.getByText("Runner unavailable")).toBeTruthy();
    expect(
      screen.getAllByText(
        /The operator console could not reach the runner\. Connection refused/,
      ).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText(
        /Start `pnpm dev` or `OPENAI_API_KEY=... pnpm dev:runner`/,
      ).length,
    ).toBeGreaterThan(0);
    expect(screen.getByText("Runner Offline")).toBeTruthy();
  });

  it("disables start when url or prompt is empty", () => {
    render(
      <OperatorConsole
        initialRunnerIssue={null}
        runnerBaseUrl="http://127.0.0.1:4001"
      />,
    );

    const startButton = screen.getByRole("button", { name: "Start Run" });
    expect((startButton as HTMLButtonElement).disabled).toBe(true);
  });
});
