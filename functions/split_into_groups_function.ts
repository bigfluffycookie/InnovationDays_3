import {DefineFunction, Schema, SlackFunction} from "deno-slack-sdk/mod.ts";
import {SlackAPIClient} from "deno-slack-sdk/types.ts";

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
        required: [],
    },
});

export default SlackFunction(
    SplitIntoGroupsFunctionDefinition,
    async ({inputs, client}) => {
        let {channel, groupSize} = inputs;
        groupSize = groupSize || 4;
        try {
            const messageToSend = await splitIntoGroups(client, channel, groupSize);
            return {outputs: {message: messageToSend}};
        } catch (e) {
            const errorMessage = `An error occurred when retrieving channel members: ${e.toString()}`;
            return {outputs: {}, error: errorMessage};
        }

    },
);

async function splitIntoGroups(client: SlackAPIClient, channel: string, groupSize: number): Promise<string> {
    const memberIds = await getChannelMembersIDs(channel, client);
    const shuffledMemberIds = _internals.shuffle(memberIds);

    const groups = chunk(shuffledMemberIds, groupSize);
    return "Coffee break groups have been assigned!\n\n"
        + groups.map((group, index: number) => `Breakout room ${index + 1}: ${group.map(toMention).join(', ')}`).join('\n');
}

const getChannelMembersIDs = async (channelId: string, client: SlackAPIClient): Promise<string[]> => {
    const response = await client.conversations.members({channel: channelId});
    if (response.ok) {
        return response.members;
    }
    throw new Error(response.error)
}

function shuffle(array: any[]): any[] {
    let currentIndex = array.length, randomIndex;

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

const toMention = (memberId: string): string => `<@${memberId}>`


function chunk(array: any[], chunk_size: number): any[][] {
    const smallestChunkSize: number = array.length % chunk_size;
    let nbChunks = Math.ceil(array.length / chunk_size);
    const hasTooSmallChunk = nbChunks > 1 && smallestChunkSize > 0 && smallestChunkSize <= (chunk_size / 2);
    if (hasTooSmallChunk) {
        // the last one will be distributed over the first one(s)
        nbChunks--;
    }
    let chunkedArray: any[][] = Array(nbChunks).fill(0).map((_, index) => index * chunk_size).map(begin => array.slice(begin, begin + chunk_size));
    if (hasTooSmallChunk) {
        array.slice(-smallestChunkSize).forEach((value, index) => chunkedArray[index].push(value));
    }
    return chunkedArray;
}

// for testing purposes
export const _internals = { shuffle };