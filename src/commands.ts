import { APP_ID } from "./config";
import botService from "./services/BotService";


const testCommand = {
    name: "test",
    description: "Basic command",
    type: 1,
};

const ticketCommand = {
    name: "ticket",
    description: "create a ticket",
    options: [
        {
            name: "bug",
            description: "create a bug ticket",
            type: 2,
            options: [
                {
                    name: "low",
                    description: "create a bug ticket with low priority",
                    type: 1
                },
                {
                    name: "high",
                    description: "create a bug ticket with high priority",
                    type: 1
                }
            ],
        },
        {
            name: "feature",
            description: "create a feature ticket",
            type: 2,
            options: [
                {
                    name: "low",
                    description: "create a feature ticket with low priority",
                    type: 1
                },
                {
                    name: "high",
                    description: "create a feature ticket with high priority",
                    type: 1
                }
            ]
        }
    ]
}

const allCommands = [testCommand, ticketCommand];

botService.installGlobalCommands(APP_ID!, allCommands);
