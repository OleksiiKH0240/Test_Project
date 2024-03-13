import { DISCORD_TOKEN, APP_ID } from "../config";
import { DataType, ChannelType, MessageType, MessagesTypes, NewChannelTypes } from "../types/DiscordTypes";
import { InteractionResponseType, InteractionType } from "discord-interactions";
import githubService from "./GithubService";


class BotService {
    discordRequest = async (endpoint: string, options: { method: string, body?: any }) => {
        const url = 'https://discord.com/api/v10/' + endpoint;

        if (options.body) options.body = JSON.stringify(options.body);
        const res = await fetch(url, {
            headers: {
                Authorization: `Bot ${DISCORD_TOKEN}`,
                'Content-Type': 'application/json; charset=UTF-8',
                'User-Agent': 'DiscordBot (https://github.com/OleksiiKH0240/Test_Project)',
            },
            ...options
        });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(JSON.stringify(data));
        }

        return res;
    }

    installGlobalCommands = async (appId: string, commands: any) => {
        const endpoint = `applications/${appId}/commands`;

        try {
            // This is calling the bulk overwrite endpoint: https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands
            const res = await this.discordRequest(endpoint, { method: 'PUT', body: commands });
            // console.log(res);
        } catch (err) {
            console.error(err);
        }
    }

    interactions = async (body: any) => {
        const type = Number(body.type);
        // console.log(body);

        switch (type) {
            case InteractionType.PING:
                return { type: InteractionResponseType.PONG };

            case InteractionType.APPLICATION_COMMAND:
                const channelType = Number(body?.channel?.type);
                const channel = body?.channel;

                const command = this.getCommandFromRawData(body.data);
                const [commandToken0,] = command

                if (channelType !== 11) {
                    return {
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: {
                            content: 'bot is available only in threads.',
                        }
                    };
                }

                if (commandToken0 === "test") {
                    return {
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: {
                            content: 'hello world.',
                        }
                    };
                }

                if (commandToken0 === "ticket") {
                    const token = body.token;
                    this.followUpMessage(command, channel, token, APP_ID!);

                    return {
                        type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE
                    };
                }

            default:
                return { message: "Hello Hono! post /interactions" };
        }
    }

    getCommandFromRawData = (data: DataType): string[] => {
        const commandTokens = [data.name];
        let currOptions = data.options;

        while (currOptions !== undefined && currOptions.length > 0) {
            commandTokens.push(currOptions[0].name);
            currOptions = currOptions[0].options;
        }

        return commandTokens;
    }

    getThreadInfo = async (channel: ChannelType) => {
        const channelId = channel.id;
        const threadTitle = channel.name!;
        const guildId = channel.guild_id!;

        const parentChannel: ChannelType = await (await
            this.discordRequest(`channels/${channel.parent_id}`, { method: "GET" })).json();

        const messages = await this.getChannelMessages(channelId, channel.message_count!);
        // console.log(messages);

        let threadDescription = "";
        if (parentChannel.type === NewChannelTypes.GUILD_TEXT) {
            threadDescription = messages.at(-2)!.content;
        }
        else if (parentChannel.type === NewChannelTypes.GUILD_FORUM) {
            threadDescription = messages.at(-1)!.content;
        }

        const threadUrl = `https://discord.com/channels/${guildId}/${channelId}`;

        return { threadTitle, threadDescription, threadUrl };
    }

    getChannelMessages = async (channelId: string, messageCount: number) => {
        const channelMessagesLimit = 3;

        const endpoint = `channels/${channelId}/messages?limit=${channelMessagesLimit}`;
        let res = await this.discordRequest(endpoint, { method: "GET" });

        let messages: MessageType[] = (await res.json());
        messages = messages.at(0)!.type === MessagesTypes.CHAT_INPUT_COMMAND ? messages.slice(1) : messages;

        // console.log(messageCount + 1);
        // console.log(messages.length);
        // console.log(messages);

        const hasAllMessages = (messageCount: number, messages: MessageType[]) => {
            return messageCount + 1 === messages.length;
        };

        let lastMessageId: string, newMessages: MessageType[];
        while (hasAllMessages(messageCount, messages) === false) {
            lastMessageId = messages.at(-1)!.id;

            try {
                res = await this.discordRequest(endpoint + `&before=${lastMessageId}`, { method: "GET" });
            }
            catch (error) {
                console.log(error);
                const { retry_after } = JSON.parse((error as Error).message);

                const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
                await sleep((Number(retry_after) | 1) * 1000);
                continue;
            }
            newMessages = (await res.json());
            if (newMessages.length === 0) break;

            messages = messages.concat(newMessages)

            console.log(messages.length);
        }

        return messages;
    }

    followUpMessage = async (
        command: string[],
        channel: ChannelType,
        token: string, appId: string) => {
        const [commandToken0, commandToken1, priority] = command;

        const channelId = channel.id;

        console.time("getThreadInfo");
        const { threadTitle, threadDescription, threadUrl } = await this.getThreadInfo(channel);
        console.timeEnd("getThreadInfo");

        // console.time("sleepFor2Secs");
        // const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        // await sleep(2000);
        // console.timeEnd("sleepFor2Secs");

        // console.log(body);

        console.time("createIssue");
        const { issueUrl } = await githubService.createIssue(
            threadTitle,
            threadDescription,
            threadUrl,
            ["discord", commandToken1, priority]
        );
        console.timeEnd("createIssue");

        const followUpMessageUrl = `https://discord.com/api/v10/webhooks/${appId}/${token}/messages/@original?thread_id=${channelId}`;
        // console.log(followUpMessageUrl)

        const res = await fetch(followUpMessageUrl, {
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
                'User-Agent': 'DiscordBot (https://github.com/OleksiiKH0240/Test_Project)',
            },
            method: "PATCH",
            body: JSON.stringify({
                content: `[Github ${commandToken1} ${commandToken0}](<${issueUrl}>) with ${priority} priority has been created.`
            })
        });



        // console.log("followUpMessage res");
        // console.log(await res.json());
    }
}

export default new BotService();
