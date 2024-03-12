import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import botMiddleware from './middlewares/BotMiddleware';
import { AddressInfo } from 'net';
import botController from './controllers/BotController';


const app = new Hono();

app.get('/', (c) => {
  return c.text('Hello Hono!');
})

app.post(
  "/interactions",
  botMiddleware.verifyDiscordRequest(process.env.PUBLIC_KEY!),
  // botMiddleware.followUpMessage,
  botController.interactions
);


const port = Number(process.env.PORT) || 80;

serve(
  {
    fetch: app.fetch,
    port
  },
  async (info: AddressInfo) => {
    console.log(`Bot server is running on port ${port}`);
    console.log(info);
  }
);


