FROM node:20.11.1

WORKDIR /drizzle_bot

RUN npm install -g pnpm

COPY package.json /drizzle_bot/package.json

RUN pnpm install

COPY . /drizzle_bot/

EXPOSE 80
CMD ["pnpm", "start"]
