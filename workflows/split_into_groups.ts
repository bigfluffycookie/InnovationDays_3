import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { SplitIntoGroupsFunctionDefinition } from "../functions/split_into_groups_function.ts";

/**
 * A workflow is a set of steps that are executed in order.
 * Each step in a workflow is a function.
 * https://api.slack.com/automation/workflows
 */
const SplitIntoGroupsWorkflow = DefineWorkflow({
  callback_id: "split_into_groups",
  title: "Sonarlint Coffee break",
  description: "Schedule Sonarlint Coffee Break",
  input_parameters: {
    properties: {},
    required: [],
  },
});
const channel_id = "C04QJ5HE5TM"

const splitIntoGroupsFunctionStep = SplitIntoGroupsWorkflow.addStep(
  SplitIntoGroupsFunctionDefinition,
  {
    channel: channel_id,
    groupSize: 4,
  },
);

SplitIntoGroupsWorkflow.addStep(Schema.slack.functions.SendMessage, {
  channel_id: channel_id,
  message: splitIntoGroupsFunctionStep.outputs.message,
});

export default SplitIntoGroupsWorkflow;