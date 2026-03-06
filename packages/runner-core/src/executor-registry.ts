import { type RunDetail } from "@cua-sample/replay-schema";

import { RunnerCoreError } from "./errors.js";
import { type RunExecutor } from "./scenario-runtime.js";
import { createOpenWebExecutor } from "./scenarios/open-web.js";

export function createDefaultRunExecutor(detail: RunDetail): RunExecutor {
  const url = detail.run.url;

  if (!url) {
    throw new RunnerCoreError("No target URL provided for this run.", {
      code: "missing_url",
      hint: "Provide a target URL when starting a run.",
      statusCode: 400,
    });
  }

  return createOpenWebExecutor(detail.run.mode, url);
}
