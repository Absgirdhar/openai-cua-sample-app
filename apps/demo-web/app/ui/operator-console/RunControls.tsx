"use client";

import type {
  BrowserMode,
  ExecutionMode,
  ResponseTurnBudget,
} from "@cua-sample/replay-schema";

import {
  browserHelpText,
  engineHelpText,
  turnBudgetHelpText,
} from "./helpers";
import type { ActionButtonsProps } from "./types";

type RunControlsProps = ActionButtonsProps & {
  browserMode: BrowserMode;
  controlsLocked: boolean;
  maxResponseTurns: ResponseTurnBudget;
  mode: ExecutionMode;
  onBrowserModeChange: (value: BrowserMode) => void;
  onMaxResponseTurnsChange: (value: ResponseTurnBudget) => void;
  onModeChange: (value: ExecutionMode) => void;
  onPromptChange: (value: string) => void;
  onUrlChange: (value: string) => void;
  prompt: string;
  showActionButtons?: boolean;
  url: string;
};

type InfoPopoverProps = {
  id: string;
  label: string;
  text: string;
};

function InfoPopover({ id, label, text }: InfoPopoverProps) {
  return (
    <span className="fieldInfo">
      <button
        aria-describedby={id}
        aria-label={`${label} help`}
        className="fieldInfoButton"
        type="button"
      >
        i
      </button>
      <span className="fieldPopover" id={id} role="tooltip">
        {text}
      </span>
    </span>
  );
}

function SegmentControl<T extends string>({
  ariaLabel,
  disabled,
  onChange,
  options,
  value,
}: {
  ariaLabel: string;
  disabled?: boolean;
  onChange: (value: T) => void;
  options: Array<{ label: string; value: T }>;
  value: T;
}) {
  return (
    <div aria-label={ariaLabel} className="segmentControl" role="tablist">
      {options.map((option) => (
        <button
          aria-pressed={value === option.value}
          className={`segmentButton ${value === option.value ? "isActive" : ""}`}
          disabled={disabled}
          key={option.value}
          onClick={() => onChange(option.value)}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function RunActionButtons({
  onStartRun,
  onStopRun,
  pendingAction,
  startDisabled,
  stopDisabled,
}: ActionButtonsProps) {
  return (
    <div className="stageToolbarActions">
      <button
        className="primaryButton"
        disabled={startDisabled}
        onClick={() => void onStartRun()}
        type="button"
      >
        {pendingAction === "start" ? "Starting..." : "Start Run"}
      </button>
      <button
        className="secondaryButton"
        disabled={stopDisabled}
        onClick={() => void onStopRun()}
        type="button"
      >
        {pendingAction === "stop" ? "Stopping..." : "Stop"}
      </button>
    </div>
  );
}

export function RunControls({
  browserMode,
  controlsLocked,
  maxResponseTurns,
  mode,
  onBrowserModeChange,
  onMaxResponseTurnsChange,
  onModeChange,
  onPromptChange,
  onUrlChange,
  prompt,
  showActionButtons = true,
  url,
  ...actionButtons
}: RunControlsProps) {
  return (
    <aside className="panel controlsPanel">
      <div className="controlsHeader">
        <h2>Controls</h2>
      </div>

      <div className="controlsGrid">
        <div className="railField scenarioField">
          <label htmlFor="url-input">Target URL</label>
          <input
            disabled={controlsLocked}
            id="url-input"
            onChange={(event) => onUrlChange(event.target.value)}
            placeholder="https://example.com"
            type="url"
            value={url}
          />
        </div>

        <div className="railField promptField">
          <label htmlFor="run-prompt">Instructions</label>
          <textarea
            disabled={controlsLocked}
            id="run-prompt"
            onChange={(event) => onPromptChange(event.target.value)}
            placeholder="Tell the agent what to do on this website..."
            rows={5}
            value={prompt}
          />
        </div>
      </div>

      <details className="advancedPanel">
        <summary>
          <span className="advancedSummaryCopy">
            <span className="advancedLabel">Advanced settings</span>
            <span className="advancedHint">
              Engine, browser, and turn budget
            </span>
          </span>
        </summary>

        <div className="advancedContent">
          <div className="railField">
            <div className="fieldLabel">
              <span>Engine</span>
              <InfoPopover
                id="engine-help-popover"
                label="Engine"
                text={engineHelpText}
              />
            </div>
            <SegmentControl
              ariaLabel="Execution mode"
              disabled={controlsLocked}
              onChange={onModeChange}
              options={[
                { label: "Code", value: "code" },
                { label: "Native", value: "native" },
              ]}
              value={mode}
            />
          </div>

          <div className="railField">
            <div className="fieldLabel">
              <span>Browser</span>
              <InfoPopover
                id="browser-help-popover"
                label="Browser"
                text={browserHelpText}
              />
            </div>
            <SegmentControl
              ariaLabel="Browser mode"
              disabled={controlsLocked}
              onChange={onBrowserModeChange}
              options={[
                { label: "Headless", value: "headless" },
                { label: "Visible", value: "headful" },
              ]}
              value={browserMode}
            />
          </div>

          <div className="railField budgetField">
            <div className="fieldLabel">
              <label htmlFor="turn-budget">Turn budget</label>
              <InfoPopover
                id="turn-budget-help-popover"
                label="Turn budget"
                text={turnBudgetHelpText}
              />
            </div>
            <div className="budgetControl">
              <input
                disabled={controlsLocked}
                id="turn-budget"
                max={50}
                min={4}
                onChange={(event) =>
                  onMaxResponseTurnsChange(
                    Number(event.target.value) as ResponseTurnBudget,
                  )
                }
                step={1}
                type="range"
                value={maxResponseTurns}
              />
              <span className="budgetValue">{maxResponseTurns} turns</span>
            </div>
          </div>
        </div>
      </details>

      {showActionButtons ? <RunActionButtons {...actionButtons} /> : null}
    </aside>
  );
}
