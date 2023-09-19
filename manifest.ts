import { Manifest } from "deno-slack-sdk/mod.ts";
import SplitIntoGroupsWorkflow from "./workflows/split_into_groups.ts";

/**
 * The app manifest contains the app's configuration. This
 * file defines attributes like app name and description.
 * https://api.slack.com/automation/manifest
 */
export default Manifest({
  name: "SonarLint Coffee Break",
  description:
    "Creates random small groups from the list of channel members and assigns them to breakout rooms",
  icon: "assets/sonarlint_coffe_break_app_icon.png",
  workflows: [SplitIntoGroupsWorkflow],
  outgoingDomains: [],
  botScopes: ["commands", "chat:write", "chat:write.public", "channels:read", "groups:read", "im:read", "mpim:read", "workflow.steps:execute"],
});
