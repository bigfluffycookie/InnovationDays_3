import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { SplitIntoGroupsFunctionDefinition } from "../functions/split_into_groups_function.ts";

/**
 * A workflow is a set of steps that are executed in order.
 * Each step in a workflow is a function.
 * https://api.slack.com/automation/workflows
 */
const SplitIntoGroupsWorkflow = DefineWorkflow({
  callback_id: "greeting_workflow",
  title: "Send a greeting",
  description: "Send a greeting to channel",
  input_parameters: {
    properties: {
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
      channel: {
        type: Schema.slack.types.channel_id,
      },
    },
    required: ["interactivity"],
  },
});

const splitIntoGroupsFunctionStep = SplitIntoGroupsWorkflow.addStep(
  SplitIntoGroupsFunctionDefinition,
  {
    channel: SplitIntoGroupsWorkflow.inputs.channel,
    groupSize: 2,
  },
);

SplitIntoGroupsWorkflow.addStep(Schema.slack.functions.SendMessage, {
  channel_id: SplitIntoGroupsWorkflow.inputs.channel,
  message: splitIntoGroupsFunctionStep.outputs.message,
});

export default SplitIntoGroupsWorkflow;