import { Context } from "hono";
import botService from "../services/BotService";

class BotController {
    interactions = async (c: Context) => {
        console.time("interactions");
        const body = await c.req.json();
        console.log("obtain body");

        const responseBody = await botService.interactions(body)
        console.log("before response");
        console.log(responseBody)

        console.timeEnd("interactions");
        return c.json(responseBody);

    }
}

export default new BotController();
