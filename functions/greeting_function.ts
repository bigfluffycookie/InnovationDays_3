import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
/**
 * Functions are reusable building blocks of automation that accept
 * inputs, perform calculations, and provide outputs. Functions can
 * be used independently or as steps in workflows.
 * https://api.slack.com/automation/functions/custom
 */
const auth = "Bearer xoxb-5495990415475-5489686087606-stPIPtUkDclU4Ofu7fl5AlEi"

type GetMembersResponse = {
  ok: string,
  members: string[],
  response_metadata: object
}

async function getChannelMembers(channel_id) {
  try {
    const response = await fetch(`https://slack.com/api/conversations.members?channel=${channel_id}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: auth
      }
    });
    if(response.ok){
      return (await response.json() as GetMembersResponse).members;
    } else {
      throw new Error(`Error: status ${response.status}`);
    }
  } catch(e){
    console.log(e);
  }

}

export const GreetingFunctionDefinition = DefineFunction({
  callback_id: "greeting_function",
  title: "Generate a greeting",
  description: "Generate a greeting",
  source_file: "functions/greeting_function.ts",
  input_parameters: {
    properties: {
      recipient: {
        type: Schema.slack.types.channel_id,
        description: "Greeting recipient",
      }
    },
    required: ["recipient"],
  },
  output_parameters: {
    properties: {
      greeting: {
        type: Schema.types.string,
        description: "list of users",
      },
    },
    required: ["greeting"],
  },
});

/*export default SlackFunction(
  GreetingFunctionDefinition,
  ({ inputs }) => {
    const { channel_id } = inputs;
   // const list = await getChannelMembers();
	const greeting = "ahh"//`hello: ${list.toString()}`;
    return { outputs: { greeting } };
  },
);*/

export default SlackFunction(
  GreetingFunctionDefinition,
  async ({ inputs }) => {
    const { recipient } = inputs;
    const members = await getChannelMembers(recipient) || [];
    const greeting = `hello! <@${members[0]}>`;
    return { outputs: { greeting } };
  },
);