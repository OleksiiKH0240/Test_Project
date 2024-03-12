import { InteractionResponseType, InteractionType, ChannelTypes } from "discord-interactions";
import githubService from "./GithubService";


type CommandType = {
    name: string,
    options: CommandType[] | undefined,
    type: number
};

type DataType = {
    id: string
} & CommandType

type MessageType = {
    id: string,
    type: number,
    content: string,
    channel_id: string
    author: {
        id: string,
        username: string
    },
    referenced_message?: MessageType
    attachments?: any[]
}

type ChannelType = {
    id: string,
    type: number,
    name?: string,
    guild_id?: string,
    parent_id?: string,
    total_message_sent?: number,
    message_count?: number
};

const ChannelTypesNew = {
    ...ChannelTypes,
    PUBLIC_THREAD: 11,
    GUILD_FORUM: 15
};

enum MessagesTypes {
    DEFAULT = 0,
    CHAT_INPUT_COMMAND = 20,
    THREAD_STARTER_MESSAGE = 21
}

class BotService {
    discordRequest = async (endpoint: string, options: { method: string, body?: any }) => {
        const url = 'https://discord.com/api/v10/' + endpoint;

        if (options.body) options.body = JSON.stringify(options.body);
        const res = await fetch(url, {
            headers: {
                Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
                'Content-Type': 'application/json; charset=UTF-8',
                'User-Agent': 'DiscordBot (https://github.com/OleksiiKH0240/Test_Project)',
            },
            ...options
        });

        if (!res.ok) {
            const data = await res.json();
            console.log(res.status);
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
                    this.followUpMessage(command, channel, token, process.env.APP_ID!);

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


        const endpoint = `channels/${channelId}/messages?limit=100`;
        const res = await this.discordRequest(endpoint, { method: "GET" });
        let messages: MessageType[] = (await res.json());
        messages = messages.at(0)!.type === MessagesTypes.CHAT_INPUT_COMMAND ? messages.slice(1) : messages;

        console.log(channel.message_count! + 1);
        console.log(messages.length);
        console.log(messages);

        let threadDescription = "{Description}";
        if (parentChannel.type === ChannelTypesNew.GUILD_TEXT && messages.at(-1)!.type === 21) {
            threadDescription = messages.at(-2)!.content;
        }
        else if (parentChannel.type === ChannelTypesNew.GUILD_FORUM && channel.message_count! + 1 === messages.length) {
            threadDescription = messages.at(-1)!.content;
        }

        const threadUrl = `https://discord.com/channels/${guildId}/${channelId}`;

        return { threadTitle, threadDescription, threadUrl };
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
                content: `[Github ${commandToken1} ${commandToken0}](${issueUrl}) with ${priority} priority has been created.`
            })
        });



        // console.log("followUpMessage res");
        // console.log(await res.json());
    }
}

export default new BotService();
