import {SlackFunctionTester} from "deno-slack-sdk/mod.ts";
import { assertEquals, assertExists, assertStringIncludes} from "https://deno.land/std@0.153.0/testing/asserts.ts";
import {stub, returnsArg} from "https://deno.land/std@0.192.0/testing/mock.ts";
import * as mf from "https://deno.land/x/mock_fetch@0.3.0/mod.ts";
import SplitIntoGroupsFunction, {_internals} from "./split_into_groups_function.ts";
import {mock} from "https://deno.land/x/mock_fetch@0.3.0/mod.ts";

mf.install();

const {createContext} = SlackFunctionTester("split_into_groups_function");

// replace shuffle with identity function
stub(_internals, "shuffle", returnsArg(0));

const mockChannelMembers = (members: string[]) => {
    mf.mock("POST@/api/conversations.members", () => {
        return new Response(`{"ok": true, "members": [${members.map(m => `"${m}"`).join()}]}`);
    });
}

Deno.test("Should split 8 people into 2 groups with default size of 4", async () => {
    const inputs = {channel: "channelId"};
    mockChannelMembers(["M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8"])


    const {outputs, error} = await SplitIntoGroupsFunction(createContext({inputs}));

    assertExists(outputs);
    assertEquals(error, undefined);
    assertExists(outputs.message);
    assertEquals(outputs.message,
        "Coffee break groups have been assigned!\n\n" +
        "Breakout room 1: <@M1>, <@M2>, <@M3>, <@M4>\n" +
        "Breakout room 2: <@M5>, <@M6>, <@M7>, <@M8>");
});

Deno.test("Should split 3 people into 1 group with size of 2 cause we don't want people alone", async () => {
    const inputs = {channel: "channelId", groupSize: 2};
    mockChannelMembers(["M1", "M2", "M3"])

    const {outputs, error} = await SplitIntoGroupsFunction(createContext({inputs}));

    assertExists(outputs);
    assertEquals(error, undefined);
    assertExists(outputs.message);
    assertEquals(outputs.message,
        "Coffee break groups have been assigned!\n\n" +
        "Breakout room 1: <@M1>, <@M2>, <@M3>");
});

Deno.test("Should not split if number of people is smaller than preferred group size", async () => {
    const inputs = {channel: "channelId", groupSize: 4};
    mockChannelMembers(["M1", "M2", "M3"])


    const {outputs, error} = await SplitIntoGroupsFunction(createContext({inputs}));

    assertExists(outputs);
    assertEquals(error, undefined);
    assertExists(outputs.message);
    assertEquals(outputs.message,
        "Coffee break groups have been assigned!\n\n" +
        "Breakout room 1: <@M1>, <@M2>, <@M3>");
});