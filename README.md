# telegram-recurring-reminder-bot

telegram-recurring-reminder-bot allows users to create recurring and non recurring reminders. It works in private chat and group chats too. Tell the bot what you would like to be reminded of and when (including how often) and the bot will send you a reminder when its time.

## Running the bot

1. Create a .env file at the rot of this project with one line BOT_TOKEN=\<enter-bot-token-here\>
2. `npm i`
3. `npm start`

## Start

**Pending Telegram Bot Support Clarification**

We might need to start by asking users their timezone or include it in the `When` clause below.

## What

The bot starts by asking you "What would you like me to remind you of?" - this text is saved to remind you at a later time.

## When

### In

The `In` clause can be used to specify a non recurring reminder, for example

`In ([0-9.*] [seconds|minutes|hours|days|weeks|months|years]).*`

**In 1 year 2 months 3 days 4 hours 5 minutes 2 seconds**

### On

The `On` clause can be used to specify a non recurring reminder, for example

`On DD-MM-YYYY`
`On DD-MM-YYYY HH:MM:SS`

**On 13-06-2022 at 11:45**

### Every

`Every ([0-9.*] [seconds|minutes|hours|days|weeks|months|years]).* starting on DD-MM-YYYY HH:MM:SS ending [on DD-MM-YYYY HH:MM:SS | after [0-9].* occurences]`

## How

When a reminder with fully specified What and When clause is provided. We:

1. Run validations
   1. To ensure its not in the past
   2. To ensure its not in the next 1 minute (unless countdown)
   3. Recurrence is not greater than 1 year
2. Generate all timestamps (in IST) when the reminder needs to be sent to the user
3. Add one entry per timestamp into the reminder log with columns - timestamp, chatId, and reminder message

When the bot starts, it starts a daemon that runs every second to check if there are reminders to be sent out for that second from the reminder log. If it finds reminders to send it will attempt to notify the chat (subject to telegram throttling)
