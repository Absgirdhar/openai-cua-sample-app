import { launchBrowserSession } from "@cua-sample/browser-runtime";
import { type ExecutionMode } from "@cua-sample/replay-schema";

import {
  createDefaultResponsesClient,
  runResponsesCodeLoop,
  runResponsesNativeComputerLoop,
} from "../responses-loop.js";
import {
  assertActive,
  failLiveResponsesUnavailable,
  maybeHoldHeadfulBrowserOpen,
  type RunExecutionContext,
  type RunExecutor,
} from "../scenario-runtime.js";

const liveOnlyMessage =
  "Open-web mode requires the live Responses API. Set OPENAI_API_KEY in the runner environment.";

const codeInstructions = [
  "You are a powerful browser automation agent. You have access to a Playwright page through the exec_js tool.",
  "The browser is already open and navigated to the target website.",
  "Available globals: page (Playwright Page), context (BrowserContext), browser (Browser), console.log, Buffer.",
  "Use Playwright locator-based APIs to interact with page elements.",
  "",
  "CRITICAL RULES — YOU MUST FOLLOW THESE:",
  "1. The user's prompt contains ALL the information you need, including any credentials (email, password, name, etc.).",
  "2. NEVER stop to ask the user for credentials or information that is already in their prompt. Read the prompt carefully.",
  "3. When you encounter a login or signup page, IMMEDIATELY fill in the form fields using the credentials from the user's prompt and submit.",
  "4. Do NOT return a text response asking for credentials. Instead, take ACTION — execute code to fill fields and click buttons.",
  "5. You must continue working until the user's FULL task is complete, not just the first step.",
  "",
  "GUIDELINES:",
  "- Handle login/signup flows confidently: fill in forms, click submit buttons, handle multi-step registration.",
  "- If a signup form asks for a name, use a reasonable name derived from the email or use 'Test User'.",
  "- Dismiss cookie banners, popups, modals, and overlay dialogs that block interaction — click 'Accept', 'Close', 'X', or 'Dismiss'.",
  "- If you encounter a CAPTCHA or email/phone verification you cannot complete, report it and explain what's needed.",
  "- Wait for pages to fully load before interacting. Use waitForSelector or waitForLoadState when needed.",
  "- If a page redirects after login/signup, continue with the user's task on the new page.",
  "- If you get stuck, try alternative approaches: different selectors, scrolling to find elements, or clicking through navigation.",
  "- Never give up on the first try — retry failed actions with slight variations.",
  "",
  "When the ENTIRE task is done, respond with a brief summary of what you accomplished.",
].join("\n");

const nativeInstructions = [
  "You are a powerful browser automation agent controlling a browser through computer-use actions.",
  "The browser is already open and navigated to the target website.",
  "Use click, type, scroll, screenshot, and other actions to interact with the page.",
  "",
  "CRITICAL RULES — YOU MUST FOLLOW THESE:",
  "1. The user's prompt contains ALL the information you need, including any credentials (email, password, name, etc.).",
  "2. NEVER stop to ask the user for credentials or information that is already in their prompt. Read the prompt carefully.",
  "3. When you encounter a login or signup page, IMMEDIATELY fill in the form fields using the credentials from the user's prompt and submit.",
  "4. Do NOT return a text response asking for credentials. Instead, take ACTION — click fields, type values, click buttons.",
  "5. You must continue working until the user's FULL task is complete, not just the first step.",
  "",
  "GUIDELINES:",
  "- Handle login/signup flows confidently: click on form fields, type credentials, click submit/sign-up buttons, handle multi-step registration.",
  "- If a signup form asks for a name, use a reasonable name derived from the email or use 'Test User'.",
  "- Dismiss cookie banners, popups, modals, and overlay dialogs that block interaction — click 'Accept', 'Close', 'X', or 'Dismiss'.",
  "- If you encounter a CAPTCHA or email/phone verification you cannot complete, report it and explain what's needed.",
  "- Wait for pages to fully load before interacting. Take screenshots to verify the current state if unsure.",
  "- If a page redirects after login/signup, continue with the user's task on the new page.",
  "- If you get stuck, try alternative approaches: scroll to find elements, take a screenshot to reassess, or try clicking different areas.",
  "- Never give up on the first try — retry failed actions with slight variations.",
  "",
  "When the ENTIRE task is done, respond with a brief summary of what you accomplished.",
].join("\n");

class OpenWebCodeExecutor implements RunExecutor {
  constructor(private readonly url: string) {}

  async execute(context: RunExecutionContext) {
    const client = createDefaultResponsesClient();

    if (!client) {
      await failLiveResponsesUnavailable(context, liveOnlyMessage);
      return;
    }

    await context.emitEvent({
      detail: context.detail.run.model,
      level: "ok",
      message: "Using the live Responses API code loop for open-web browsing.",
      type: "run_progress",
    });

    const session = await launchBrowserSession({
      browserMode: context.detail.run.browserMode,
      screenshotDir: context.screenshotDirectory,
      startTarget: {
        kind: "remote_url",
        label: this.url,
        url: this.url,
      },
      workspacePath: context.detail.workspacePath,
    });

    try {
      assertActive(context.signal);
      await context.syncBrowserState(session);
      await context.emitEvent({
        detail: session.targetLabel,
        level: "ok",
        message: "Browser session launched and navigated to target URL.",
        type: "browser_session_started",
      });

      const state = await session.readState();
      await context.emitEvent({
        detail: state.currentUrl,
        level: "ok",
        message: `Browser navigated to ${this.url}`,
        type: "browser_navigated",
      });
      await context.captureScreenshot(session, "open-web-loaded");

      const result = await runResponsesCodeLoop(
        {
          context,
          instructions: codeInstructions,
          maxResponseTurns: context.detail.run.maxResponseTurns ?? 24,
          session,
        },
        client,
      );

      await context.captureScreenshot(session, "open-web-completed");
      await maybeHoldHeadfulBrowserOpen(context);
      await context.completeRun({
        notes: result.notes,
        outcome: "success",
        verificationPassed: false,
      });
    } finally {
      await session.close();
    }
  }
}

class OpenWebNativeExecutor implements RunExecutor {
  constructor(private readonly url: string) {}

  async execute(context: RunExecutionContext) {
    const client = createDefaultResponsesClient();

    if (!client) {
      await failLiveResponsesUnavailable(context, liveOnlyMessage);
      return;
    }

    await context.emitEvent({
      detail: context.detail.run.model,
      level: "ok",
      message:
        "Using the live Responses API native computer loop for open-web browsing.",
      type: "run_progress",
    });

    const session = await launchBrowserSession({
      browserMode: context.detail.run.browserMode,
      screenshotDir: context.screenshotDirectory,
      startTarget: {
        kind: "remote_url",
        label: this.url,
        url: this.url,
      },
      workspacePath: context.detail.workspacePath,
    });

    try {
      assertActive(context.signal);
      await context.syncBrowserState(session);
      await context.emitEvent({
        detail: session.targetLabel,
        level: "ok",
        message: "Browser session launched and navigated to target URL.",
        type: "browser_session_started",
      });

      const state = await session.readState();
      await context.emitEvent({
        detail: state.currentUrl,
        level: "ok",
        message: `Browser navigated to ${this.url}`,
        type: "browser_navigated",
      });
      await context.captureScreenshot(session, "open-web-loaded");

      const result = await runResponsesNativeComputerLoop(
        {
          context,
          instructions: nativeInstructions,
          maxResponseTurns: context.detail.run.maxResponseTurns ?? 24,
          session,
        },
        client,
      );

      await context.captureScreenshot(session, "open-web-completed");
      await maybeHoldHeadfulBrowserOpen(context);
      await context.completeRun({
        notes: result.notes,
        outcome: "success",
        verificationPassed: false,
      });
    } finally {
      await session.close();
    }
  }
}

export function createOpenWebExecutor(
  mode: ExecutionMode,
  url: string,
): RunExecutor {
  return mode === "code"
    ? new OpenWebCodeExecutor(url)
    : new OpenWebNativeExecutor(url);
}
