import { DISCORD_TOKEN, APP_ID, errorTrack } from "../config";
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
            const data = { ...(await res.json()), statusCode: res.status };
            throw new Error(JSON.stringify(data));
        }

        return res;
    }

    installGlobalCommands = async (appId: string, commands: any) => {
        const endpoint = `applications/${appId}/commands`;

        try {
            // This is calling the bulk overwrite endpoint: https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands
            const res = await this.discordRequest(endpoint, { method: 'PUT', body: commands });
        } catch (err) {
            await errorTrack.sendError(err);
            throw (err);
        }
    }

    interactions = async (body: any) => {
        const type = Number(body.type);

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

        const messages = await this.getLast2Messages(channelId, channel.message_count!);

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

    getLast2Messages = async (channelId: string, messagesCount: number) => {
        // minimum value equals 2
        const channelMessagesLimit = 100;

        const endpoint = `channels/${channelId}/messages?limit=${channelMessagesLimit}`;
        let res = await this.discordRequest(endpoint, { method: "GET" });

        let currMessages: MessageType[] = (await res.json()),
            last2Messages: MessageType[] = currMessages.slice(-2);

        currMessages = currMessages.at(0)!.type === MessagesTypes.CHAT_INPUT_COMMAND ? currMessages.slice(1) : currMessages;

        const hasAllMessages = (messageCount: number, currMessagesCount: number) => {
            return messageCount + 1 === currMessagesCount;
        };

        let lastMessageId: string, currMessagesCount = currMessages.length;
        while (hasAllMessages(messagesCount, currMessagesCount) === false) {
            lastMessageId = currMessages.at(-1)!.id;

            try {
                res = await this.discordRequest(endpoint + `&before=${lastMessageId}`, { method: "GET" });
            }
            catch (error) {
                if (error instanceof Error) {
                    const { retry_after, statusCode } = JSON.parse((error as Error).message);

                    if (Number(statusCode) === 429) {
                        const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

                        const sleepTime = (Number(retry_after) || 1);

                        await sleep(sleepTime * 1000);
                        continue;
                    }
                }

                throw (error);

            }

            currMessages = (await res.json());

            currMessagesCount += currMessages.length;
            last2Messages.push(...currMessages.slice(-2));
            last2Messages = last2Messages.slice(-2);
        }

        return last2Messages;
    }

    followUpMessage = async (
        command: string[],
        channel: ChannelType,
        token: string, appId: string) => {

        try {
            const [commandToken0, commandToken1, priority] = command;

            const channelId = channel.id;

            const { threadTitle, threadDescription, threadUrl } = await this.getThreadInfo(channel);

            const { issueUrl } = await githubService.createIssue(
                threadTitle,
                threadDescription,
                threadUrl,
                ["discord", commandToken1, priority]
            );

            const followUpMessageUrl = `https://discord.com/api/v10/webhooks/${appId}/${token}/messages/@original?thread_id=${channelId}`;

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

            if (!res.ok) {
                const data = { ...(await res.json()), statusCode: res.status };
                throw new Error(JSON.stringify(data));
            }
        }
        catch(error) {
            await errorTrack.sendError(error);
        }
    }
}

export default new BotService();
