"use client";

import { formatRunnerIssueMessage } from "./helpers";
import { ActivityFeed } from "./ActivityFeed";
import { RunControls, RunActionButtons } from "./RunControls";
import { ConsoleTopbar, RunSummary } from "./RunSummary";
import { ScreenshotPane } from "./ScreenshotPane";
import type { OperatorConsoleProps } from "./types";
import { useRunStream } from "./useRunStream";

export function OperatorConsole({
  initialRunnerIssue,
  runnerBaseUrl,
}: OperatorConsoleProps) {
  const {
    activityFeedLabel,
    activityFeedRef,
    activityItems,
    browserMode,
    controlsLocked,
    currentIssue,
    followActivityFeed,
    handleActivityFeedScroll,
    handleJumpToLatestActivity,
    handleJumpToLatestScreenshot,
    handleOpenReplay,
    handleScrubberChange,
    handleSelectScreenshot,
    handleStartRun,
    handleStopRun,
    maxResponseTurns,
    mode,
    pendingAction,
    prompt,
    runnerOnline,
    screenshots,
    selectedBrowser,
    selectedRun,
    selectedScreenshot,
    selectedScreenshotIndex,
    setBrowserMode,
    setMaxResponseTurns,
    setMode,
    setPrompt,
    setStreamLogs,
    setUrl,
    streamLogs,
    url,
    viewingLiveFrame,
  } = useRunStream({
    initialRunnerIssue,
    runnerBaseUrl,
  });

  const stageUrl =
    selectedBrowser?.currentUrl ??
    (selectedRun
      ? url || "Navigating..."
      : "Awaiting task");
  const startDisabled =
    !runnerOnline ||
    pendingAction !== null ||
    controlsLocked ||
    url.trim().length === 0 ||
    prompt.trim().length === 0;
  const stopDisabled =
    !selectedRun ||
    selectedRun.run.status !== "running" ||
    pendingAction !== null;
  const replayDisabled = !selectedRun;
  const issueMessage = currentIssue ? formatRunnerIssueMessage(currentIssue) : null;
  const stageHeadline = selectedRun
    ? selectedRun.run.status === "running"
      ? "Run active"
      : selectedRun.run.status === "completed"
        ? "Run completed"
        : selectedRun.run.status === "cancelled"
          ? "Run cancelled"
          : currentIssue?.title ?? "Run failed"
    : currentIssue
      ? currentIssue.title
      : runnerOnline
        ? "Idle, ready"
        : "Runner offline";
  const stageSupportCopy = selectedRun
    ? selectedRun.run.status === "failed"
      ? issueMessage
      : null
    : currentIssue
      ? issueMessage
      : runnerOnline
      ? "Enter a URL and instructions, then start a run."
      : issueMessage;
  const topbarSubtitle = selectedRun
    ? `Browsing ${url || "website"}`
    : "Run, inspect, and review browser tasks.";
  const emptyReviewMessage = selectedRun
    ? selectedRun.run.status === "running"
      ? "The run is active. The first captured frame will appear here shortly."
      : selectedRun.run.status === "failed"
        ? issueMessage ?? "The run failed before a screenshot was captured."
        : "This run finished without a captured browser frame."
    : currentIssue
      ? issueMessage ?? currentIssue.error
      : runnerOnline
        ? "Start a run to begin reviewing captured frames."
        : issueMessage ?? "Runner is unavailable.";
  const emptyTimelineMessage = selectedRun
    ? selectedRun.run.status === "failed"
      ? issueMessage ?? "The run ended before any captures were saved."
      : "Captured frames will appear here as the run progresses."
    : currentIssue
      ? issueMessage ?? currentIssue.error
      : runnerOnline
        ? "Captured frames will appear here once the run starts."
        : issueMessage ?? "Runner is unavailable.";

  return (
    <main className="consoleShell">
      <section className="consoleFrame">
        <ConsoleTopbar
          runnerOnline={runnerOnline}
          topbarSubtitle={topbarSubtitle}
        />

        <section className="benchTop">
          <section className="controlColumn">
            <RunControls
              browserMode={browserMode}
              controlsLocked={controlsLocked}
              maxResponseTurns={maxResponseTurns}
              mode={mode}
              onBrowserModeChange={setBrowserMode}
              onMaxResponseTurnsChange={setMaxResponseTurns}
              onModeChange={setMode}
              onPromptChange={setPrompt}
              onStartRun={handleStartRun}
              onStopRun={handleStopRun}
              onUrlChange={setUrl}
              pendingAction={pendingAction}
              prompt={prompt}
              showActionButtons={false}
              startDisabled={startDisabled}
              stopDisabled={stopDisabled}
              url={url}
            />

            <ActivityFeed
              activityFeedLabel={activityFeedLabel}
              activityFeedRef={activityFeedRef}
              activityItems={activityItems}
              followActivityFeed={followActivityFeed}
              onActivityFeedScroll={handleActivityFeedScroll}
              onJumpToLatestActivity={handleJumpToLatestActivity}
              onSelectScreenshot={handleSelectScreenshot}
              onStreamLogsChange={setStreamLogs}
              screenshots={screenshots}
              streamLogs={streamLogs}
            />
          </section>

          <section className="stageColumn">
            <div className="stageControlBar">
              <RunSummary
                stageHeadline={stageHeadline}
                stageSupportCopy={stageSupportCopy}
              />
              <RunActionButtons
                onStartRun={handleStartRun}
                onStopRun={handleStopRun}
                pendingAction={pendingAction}
                startDisabled={startDisabled}
                stopDisabled={stopDisabled}
              />
            </div>

            <ScreenshotPane
              emptyReviewMessage={emptyReviewMessage}
              emptyTimelineMessage={emptyTimelineMessage}
              onJumpToLatestScreenshot={handleJumpToLatestScreenshot}
              onOpenReplay={handleOpenReplay}
              onScrubberChange={handleScrubberChange}
              onSelectScreenshot={handleSelectScreenshot}
              replayDisabled={replayDisabled}
              runnerBaseUrl={runnerBaseUrl}
              screenshots={screenshots}
              selectedBrowser={selectedBrowser}
              selectedRun={selectedRun}
              selectedScenarioTitle={"Open Web Agent"}
              selectedScreenshot={selectedScreenshot}
              selectedScreenshotIndex={selectedScreenshotIndex}
              stageUrl={stageUrl}
              viewingLiveFrame={viewingLiveFrame}
            />
          </section>
        </section>
      </section>
    </main>
  );
}
