import { Context } from "hono";
import botService from "../services/BotService";

class BotController {
    interactions = async (c: Context) => {
        const body = await c.req.json();
        
        const responseBody = await botService.interactions(body)

        return c.json(responseBody);
    }


}

export default new BotController();
