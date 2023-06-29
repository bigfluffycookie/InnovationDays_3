import { Trigger } from "deno-slack-sdk/types.ts";
import { TriggerTypes } from "deno-slack-api/mod.ts";
import SplitIntoGroupsFunctionDefinition from "../workflows/split_into_groups.ts";

/**
 * Triggers determine when workflows are executed. A trigger
 * file describes a scenario in which a workflow should be run,
 * such as a user pressing a button or when a specific event occurs.
 * https://api.slack.com/automation/triggers
 */
const scheduleTrigger: Trigger<typeof SplitIntoGroupsFunctionDefinition.definition> = {
  type: TriggerTypes.Scheduled,
  name: "SonarLint Coffe Break",
  description: "Schedule Coffee Break",
  workflow: `#/workflows/${SplitIntoGroupsFunctionDefinition.definition.callback_id}`,
  inputs: {
  },
  schedule: {
    // Starts 20 seconds after creation
    start_time: new Date(new Date().getTime() + 20000).toISOString(),
    frequency: {
      type: "weekly",
      repeats_every: 1,
      on_days: ["Monday"],
    },
  },
};

export default scheduleTrigger;
