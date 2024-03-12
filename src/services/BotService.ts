import { InteractionResponseType, InteractionType } from "discord-interactions";
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

        switch (type) {
            case InteractionType.PING:
                return { type: InteractionResponseType.PONG };

            case InteractionType.APPLICATION_COMMAND:
                const channelType = Number(body?.channel?.type);
                const channelId = body?.channel?.id;
                const guildId = body?.channel?.guild_id;

                const [commandToken0, commandToken1, priority] = this.getCommandFromRawData(body.data);

                if (channelType !== 11) {
                    return {
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: {
                            content: 'bot is available only in threads.',
                        }
                    };
                }

                // if (commandToken0 === "test") {
                //     return {
                //         type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                //         data: {
                //             content: 'hello world.',
                //         }
                //     };
                // }

                console.time("getThreadInfo");
                const { threadTitle, threadDescription, threadUrl } = await this.getThreadInfo(channelId, guildId);
                console.timeEnd("getThreadInfo");

                // console.log(body);
                console.time("createIssue");
                const { issueUrl } = await githubService.createIssue(
                    threadTitle,
                    threadDescription,
                    threadUrl,
                    ["discord", commandToken1, priority]
                );
                console.timeEnd("createIssue");

                return {
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `[Github ${commandToken1} ${commandToken0}](${issueUrl}) with ${priority} priority has been created.`,
                        // embeds: [
                        //     {
                        //         type: "url",
                        // description: `[Github ${commandToken1} ${commandToken0}](${issueUrl}) with ${priority} priority has been created.`,
                        //         thumbnail: { url: issueUrl },
                        //         // image: { url: issueUrl }
                        //     }
                        // ]
                    }
                };

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

    getThreadInfo = async (channelId: string, guildId: string) => {
        const endpoint = `channels/${channelId}/messages`;
        const res = await this.discordRequest(endpoint, { method: "GET" });
        const messages: MessageType[] = (await res.json());

        // console.log(messages);
        const threadStarterMsg = messages.at(-1);
        let descriptionMsg = messages.at(-2);

        // for (let i = -2; i >= -messages.length; i--) {
        //     if (messages.at(i)?.author.id === threadStarterMsg?.author.id) {
        //         descriptionMsg = messages.at(i);
        //         break;
        //     }
        // }

        const threadTitle = threadStarterMsg!.referenced_message!.content;
        const threadDescription = descriptionMsg!.content;
        const threadUrl = `https://discord.com/channels/${guildId}/${channelId}`;

        return { threadTitle, threadDescription, threadUrl };
    }

    getMessage = async (channelId: string, messageId: string) => {
        const endpoint = `channels/${channelId}/messages/${messageId}`;
        const msg = await this.discordRequest(endpoint, { method: "GET" });
    }
}

export default new BotService();
