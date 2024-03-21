import "./utils/checks";
import { PORT, PUBLIC_KEY, PROJECT_NAME, TRY_CATCH_CLOUD_API_KEY } from './config';
import { tryCatch } from "try-catch-cloud/hono";
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import botMiddleware from './middlewares/BotMiddleware';
import { AddressInfo } from 'net';
import botController from './controllers/BotController';


const app = new Hono();

app.get('/', (c) => {
  return c.text('Hello Hono!');
})

app.use(
  tryCatch({
    projectName: PROJECT_NAME,
    apiKey: TRY_CATCH_CLOUD_API_KEY
  })
)

app.post(
  "/interactions",
  botMiddleware.verifyDiscordRequest(PUBLIC_KEY!),
  botController.interactions
);

// app.onError((err, c) => {
//   console.log("something went wrong on the server side. Error: ", err);
//   c.status(500);
//   return c.text("something went wrong on the server side.");
// })

const port = Number(process.env.PORT) || 80;

serve(
  {
    fetch: app.fetch,
    port
  },
  async (info: AddressInfo) => {
    console.log(`Bot server is running on port ${PORT}`);
    console.log(info);
  }
);


