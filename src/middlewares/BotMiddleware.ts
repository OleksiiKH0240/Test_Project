import { verifyKey } from "discord-interactions";
import { Context, Next } from "hono";
import { errorTrack } from '../config';


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
                    const resMsg = "Bad request signature.";
                    await errorTrack.sendError(new Error(resMsg));
                    
                    c.status(401);
                    return c.body(resMsg);
                }
            }
            else {
                const resMsg = "Some of the headers: 'X-Signature-Ed25519', 'X-Signature-Timestamp' are not specified. ";
                await errorTrack.sendError(new Error(resMsg));

                c.status(401);
                return c.body(resMsg);
            }

            await next();
        }
    }
}

export default new BotMiddleware();
