import {
  createRunnerUnavailableIssue,
} from "./ui/operator-console/helpers";
import { OperatorConsole } from "./ui/operator-console";
import type { RunnerIssue } from "./ui/operator-console/types";

export const dynamic = "force-dynamic";

const runnerBaseUrl = process.env.RUNNER_BASE_URL ?? "http://127.0.0.1:4001";

function isRunnerIssue(value: unknown): value is RunnerIssue {
  return (
    value !== null &&
    typeof value === "object" &&
    "code" in value &&
    "error" in value &&
    "title" in value
  );
}

async function checkRunnerHealth() {
  try {
    const response = await fetch(`${runnerBaseUrl}/health`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return createRunnerUnavailableIssue(`Runner returned ${response.status}.`);
    }

    return null;
  } catch (error) {
    return isRunnerIssue(error)
      ? error
      : createRunnerUnavailableIssue(
          error instanceof Error ? error.message : undefined,
        );
  }
}

export default async function HomePage() {
  const runnerIssue = await checkRunnerHealth();

  return (
    <OperatorConsole
      initialRunnerIssue={runnerIssue}
      runnerBaseUrl={runnerBaseUrl}
    />
  );
}
