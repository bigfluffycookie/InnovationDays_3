import {DefineFunction, Schema, SlackFunction} from "deno-slack-sdk/mod.ts";

export const SplitIntoGroupsFunctionDefinition = DefineFunction({
    callback_id: "split_into_groups_function",
    title: "Split into groups",
    description: "Split channel members into groups randomly",
    source_file: "functions/split_into_groups_function.ts",
    input_parameters: {
        properties: {
            channel: {
                type: Schema.slack.types.channel_id,
                description: "Channel to split into groups",
            },
            groupSize: {
                type: Schema.types.integer,
                description: "Preferred size for groups (default: 4)",
            },
        },
        required: ["channel"],
    },
    output_parameters: {
        properties: {
            message: {
                type: Schema.types.string,
                description: "The result of the split",
            },
        },
        required: ["message"],
    },
});

export default SlackFunction(
    SplitIntoGroupsFunctionDefinition,
    async ({inputs, client}) => {
        let {channel, groupSize: groupSize} = inputs;
        groupSize = groupSize || 4;
        const memberIds = await getChannelMembersIDs(channel, client);
        const shuffledArray = shuffle(memberIds);

        const array_chunks = (array, chunk_size) => Array(Math.ceil(array.length / chunk_size)).fill().map((_, index) => index * chunk_size).map(begin => array.slice(begin, begin + chunk_size));
		const result = array_chunks(shuffledArray, groupSize);
        const message = "Coffee break groups have been assigned!\n\n"
          +  result.map((group, index) => `Breakout room ${index + 1}: ${group.map(toMention).join(', ')}`).join('\n');
        return {outputs: {message}};
    },
);

function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

const getChannelMembersIDs = async (channelId: string, client): Promise<string[]> => {
    const response = await client.conversations.members({channel: channelId});
    if (response.ok) {
        return response.members;
    }
    // TODO handle error
    return [response.error]
}

const toMention = (memberId: string) => `<@${memberId}>`