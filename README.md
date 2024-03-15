# Drizzle_Bot

## There are several variables you must specify in your .env file before starting the bot.

### Variables of your .env file:


- #### PORT
#
Port of bot server, part of url using to communicate with server.

Example: PORT=80
#


- #### DISCORD_TOKEN
#
To obtain DISCORD_TOKEN go to the url https://discord.com/developers/applications and create application if you haven't had one yet.

Choose your application and go to the section 'Bot' in settings on the left.

Locate 'Token' subsection in 'Build-A-Bot' section and press 'Reset Token' button then copy your token and paste it in your .env file like this: 

DISCORD_TOKEN={DISCORD_TOKEN value}.

#


- #### APP_ID, PUBLIC_KEY
#
To obtain APP_ID and PUBLIC_KEY go to the url https://discord.com/developers/applications, choose your application and go to the section 'General Information' in settings on the left.

Copy your 'APPLICATION ID' and 'PUBLIC KEY' and paste them in your .env file like this:

APP_ID={APP_ID value}

PUBLIC_KEY={PUBLIC_KEY value}
#


- #### GITHUB_TOKEN
#
To obtain GITHUB_TOKEN go to the url https://github.com/settings/apps and choose section 'Personal access tokens' then go to 'Fine-grained tokens' subsection (might as well go to the url https://github.com/settings/tokens?type=beta)

Press 'Generate new token' button.

Write name of your token, specify expiration date.
Then in 'Repository access' section choose 'Only select repositories' option and select repository which you'll use for creating issues. 

In 'Permissions' section locate 'Repository permissions' subsection, find option 'Issues' and change an access level to 'Read and write'. ('Metadata' option access level will be automatically changed to 'Read-only')

Press 'Generate token' button at the bottom, copy token and paste it your .env file like this:
GITHUB_TOKEN={GITHUB_TOKEN value}

#


- #### GITHUB_REPO, GITHUB_REPO_OWNER
#
You can find your GITHUB_REPO and GITHUB_REPO_OWNER variables in url of github repository where you're going create issues.

Example of github repository url: https://github.com/{GITHUB_REPO_OWNER}/{GITHUB_REPO}

Copy your GITHUB_REPO and GITHUB_REPO_OWNER and paste them in your .env file like this:

GITHUB_REPO={GITHUB_REPO value}

GITHUB_REPO_OWNER={GITHUB_REPO_OWNER value}
#


## To run bot server in docker use commands:

#### docker build -t drizzle-bot .

#### docker run -d -p {PORT}:{PORT} --name drizzle-bot drizzle-bot

, where PORT is environmental variable you specified in your .env file before.

## To run bot server without docker use commands:
### To run with pnpm:
#### npm install -g pnpm
#### pnpm install
#### pnpm start

### To run without pnpm:
#### npm install
#### npm run start

## If bot server has been started successfully, you can specify Interactions Endpoint URL to bond your bot with Discord application.
To do so go to the url https://discord.com/developers/applications, choose your application and go to the section 'General Information' in settings on the left.

Locate 'Interactions Endpoint URL' subsection and fill it with url which you can form in the following way: 

**{host}:{PORT}/interactions**

then press green button 'Save Changes' to confirm changes

, where 

PORT is environmental variable you specified in your .env file before
(if PORT equal 80 you can omit it and form url like this: **{host}/interactions**),

host is url which is usually given you by hosting service you are using (Example of host: **https://coolhosting.com**).

In the end your Interactions Endpoint URL should look similar to that:
**https://coolhosting.com/interactions** or
**https://coolhosting.com:8080/interactions**

## Add your bot to the discord server
To do so go to the url https://discord.com/developers/applications, choose your application and go to the section 'OAuth2' in settings on the left.

Locate 'OAuth2 URL Generator' and select bot option(new section 'BOT PERMISSIONS' will appear below).

In section 'BOT PERMISSIONS' check options:
- Read Messages/View Channels
- Send Messages
- Send Messages in Threads
- Read Message History
- Use Slash Commands

Then copy generated url and paste it to the browser.
