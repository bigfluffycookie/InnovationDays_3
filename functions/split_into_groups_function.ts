import {DefineFunction, Schema, SlackFunction} from "deno-slack-sdk/mod.ts";
import { SlackAPIClient } from "deno-slack-sdk/types.ts";

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

        const memberIds: string[] | Error = await getChannelMembersIDs(channel, client);
        if (memberIds instanceof Error) {
            const errorMessage: string = `An error occurred when retrieving channel members: ${memberIds.message}`;
            return {outputs: {message: errorMessage}};
        }
        const shuffledMemberIds = shuffle(memberIds);

        const groups = chunk(shuffledMemberIds, groupSize);
        const message = "Coffee break groups have been assigned!\n\n"
            + groups.map((group, index: number) => `Breakout room ${index + 1}: ${group.map(toMention).join(', ')}`).join('\n');
        return {outputs: {message}};
    },
);

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

const getChannelMembersIDs = async (channelId: string, client: SlackAPIClient): Promise<string[] | Error> => {
    const response = await client.conversations.members({channel: channelId});
    if (response.ok) {
        return response.members;
    }
    return new Error(response.error)
}

const toMention = (memberId: string): string => `<@${memberId}>`


function chunk(array: any[], chunk_size: number): any[][] {
    const smallestChunkSize: number = array.length % chunk_size;
    const hasTooSmallChunk: boolean = (smallestChunkSize <= chunk_size / 2);
    const nbChunks: number = Math.max(1, (Math.ceil(array.length / chunk_size) + (hasTooSmallChunk ? -1 : 0)));
    let chunkedArray: any[][] = Array(nbChunks).fill(0).map((_, index) => index * chunk_size).map(begin => array.slice(begin, begin + chunk_size));
    if (nbChunks > 1 && hasTooSmallChunk) {
        array.slice(-smallestChunkSize).forEach((value, index) => chunkedArray[index].push(value));
    }
    return chunkedArray;
}