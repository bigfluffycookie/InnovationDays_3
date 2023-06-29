import { Trigger } from "deno-slack-sdk/types.ts";
import { TriggerContextData, TriggerTypes } from "deno-slack-api/mod.ts";
import SplitIntoGroupsWorkflow from "../workflows/split_into_groups.ts";

/**
 * Triggers determine when workflows are executed. A trigger
 * file describes a scenario in which a workflow should be run,
 * such as a user pressing a button or when a specific event occurs.
 * https://api.slack.com/automation/triggers
 */
const shortcutTrigger: Trigger<typeof SplitIntoGroupsWorkflow.definition> = {
  type: TriggerTypes.Shortcut,
  name: "SonarLint Coffee Break",
  description: "Shuffle groups and assign to breakout rooms",
  workflow: `#/workflows/${SplitIntoGroupsWorkflow.definition.callback_id}`,
  inputs: {
    interactivity: {
      value: TriggerContextData.Shortcut.interactivity,
    },
    channel: {
      value: TriggerContextData.Shortcut.channel_id,
    },
  },
};

export default shortcutTrigger;
