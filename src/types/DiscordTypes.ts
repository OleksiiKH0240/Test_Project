import { ChannelTypes } from "discord-interactions";

export type CommandType = {
    name: string,
    options: CommandType[] | undefined,
    type: number
};

export type DataType = {
    id: string
} & CommandType

export type MessageType = {
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

export type ChannelType = {
    id: string,
    type: number,
    name?: string,
    guild_id?: string,
    parent_id?: string,
    total_message_sent?: number,
    message_count?: number
};

export const NewChannelTypes = {
    ...ChannelTypes,
    PUBLIC_THREAD: 11,
    GUILD_FORUM: 15
};

export enum MessagesTypes {
    DEFAULT = 0,
    CHAT_INPUT_COMMAND = 20,
    THREAD_STARTER_MESSAGE = 21
}
