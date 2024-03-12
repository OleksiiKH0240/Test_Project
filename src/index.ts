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
  botController.interactions
);

const port = Number(process.env.PORT) || 80;

serve(
  {
    fetch: app.fetch,
    port
  },
  async (info: AddressInfo) => {
    console.log(`Server is running on port ${port}`);
    console.log(info);
  }
);
