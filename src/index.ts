import { PORT, PUBLIC_KEY } from './config';
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
  botMiddleware.verifyDiscordRequest(PUBLIC_KEY!),
  botController.interactions
);

serve(
  {
    fetch: app.fetch,
    port: PORT
  },
  async (info: AddressInfo) => {
    console.log(`Bot server is running on port ${PORT}`);
    console.log(info);
  }
);


