// =============================================================================
// Dispatch board — hero fixture
//
// Typed hero data for the dispatch board, mirroring the static-helper pattern
// of src/data/navigation.ts. The slips describe the owner's orchestration
// method only; they never imply a shipped product or invented activity.
// =============================================================================

/** Section ink used for a lane's rule, slip edge and progress bar. */
export type DispatchLaneInk = "petrol" | "cornflower" | "lovebird" | "burgundy";

export interface DispatchTicket {
  id: string;
  title: string;
  note: string;
}

export interface DispatchLane {
  id: string;
  label: string;
  ink: DispatchLaneInk;
  tickets: DispatchTicket[];
}

export const dispatchLanes: DispatchLane[] = [
  {
    id: "plan",
    label: "Plan",
    ink: "petrol",
    tickets: [
      {
        id: "contract",
        title: "Set the contract",
        note: "Task boundary and acceptance checks agreed before any code is written.",
      },
    ],
  },
  {
    id: "build",
    label: "Build",
    ink: "cornflower",
    tickets: [
      {
        id: "executors",
        title: "Isolated executors",
        note: "Each writer gets its own worktree, branch, test database and port block.",
      },
      {
        id: "runs",
        title: "Rated runs",
        note: "Runs are compared against each other and kept in a model scorecard.",
      },
    ],
  },
  {
    id: "review",
    label: "Review",
    ink: "lovebird",
    tickets: [
      {
        id: "review",
        title: "Independent review",
        note: "A reviewer that did not write the code checks the whole diff.",
      },
    ],
  },
  {
    id: "ship",
    label: "Ship",
    ink: "burgundy",
    tickets: [
      {
        id: "rehearsal",
        title: "Rehearse, then ship",
        note: "The real product flows are run in a browser and earlier fixes are rechecked.",
      },
    ],
  },
];
