import type {
  ResponseTurnBudget,
  RunEventLevel,
} from "@cua-sample/replay-schema";

export type OperatorConsoleProps = {
  initialRunnerIssue: RunnerIssue | null;
  runnerBaseUrl: string;
};

export type LogEntry = {
  createdAt: string;
  detail: string;
  event: string;
  level: RunEventLevel;
  key: string;
  time: string;
};

export type TranscriptEntry = {
  body: string;
  createdAt: string;
  key: string;
  lane: "control" | "operator" | "verification";
  speaker: string;
  time: string;
};

export type ActivityItem = {
  code?: string;
  createdAt: string;
  detail?: string;
  family: "action" | "observe" | "operator" | "snapshot" | "system" | "tool" | "verify";
  headline: string;
  key: string;
  level: RunEventLevel;
  screenshotId?: string;
  summary: string;
  time: string;
};

export type PendingAction = "start" | "stop" | null;

export type RunnerIssue = {
  code: string;
  error: string;
  hint?: string;
  title: string;
};

export type ActionButtonsProps = {
  onStartRun: () => Promise<void>;
  onStopRun: () => Promise<void>;
  pendingAction: PendingAction;
  startDisabled: boolean;
  stopDisabled: boolean;
};

export type RunDefaults = {
  defaultMaxResponseTurns: ResponseTurnBudget;
  defaultRunModel: string;
};
