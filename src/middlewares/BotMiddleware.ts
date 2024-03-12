import 'dotenv/config';
import { verifyKey } from "discord-interactions";
import { Context, Next } from "hono";


class BotMiddleware {
    verifyDiscordRequest = (clientKey: string) => {
        return async (c: Context, next: Next) => {
            const rawBody = Buffer.from(JSON.stringify(await c.req.json()));
            // const rawBody = await c.req.arrayBuffer();

            const signature = c.req.header('X-Signature-Ed25519');
            const timestamp = c.req.header('X-Signature-Timestamp');

            if (signature !== undefined && timestamp !== undefined) {
                const isValidRequest = verifyKey(rawBody, signature, timestamp, clientKey);
                if (!isValidRequest) {
                    console.log("Bad request signature.");
                    c.status(401);
                    return c.body('Bad request signature. ');
                }
            }
            else {
                console.log("lack of headers.")
                c.status(401);
                return c.body("Some of the headers: 'X-Signature-Ed25519', 'X-Signature-Timestamp' are not specified. ");
            }

            await next();
        }
    }
}

export default new BotMiddleware();
