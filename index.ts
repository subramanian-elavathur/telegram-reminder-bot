import {
  startConfigurator,
  parseResponse,
  getTimezone,
} from "./TimezoneConfigurator";
import { remindClause } from "./reminders";
import { SimpleLocalDB } from "./local-db";
import { DateTime } from "luxon";

require("dotenv").config();
const { Telegraf } = require("telegraf");

const pendingDuration = new Set();
const reminderTexts = {};

interface ReminderLogEntry {
  text: string;
  chatId: number;
}

const reminderLog = new SimpleLocalDB(process.env.REMINDERS_DB_DIRECTORY);

let currentSecond = Math.floor(DateTime.now().toMillis() / 1000);

const reminderDaemon = setInterval(async () => {
  console.log(`starting daemon at ${currentSecond}`);
  const remindersToSend: ReminderLogEntry[] = await reminderLog.get(
    currentSecond.toString()
  );
  if (remindersToSend?.length > 0) {
    console.log(JSON.stringify(remindersToSend));
    remindersToSend.forEach((each) =>
      bot.telegram.sendMessage(each.chatId, each.text)
    );
  }
  currentSecond = currentSecond + 1;
}, 1000);

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => ctx.reply("What would you like to be reminded of?"));

bot.command("help", (ctx) => {
  ctx.reply(
    `Welcome to the Recurring Reminders Bot.\nJust send it a message with what you would like to be reminded of.\nAnd then you tell the bot when you would like to be reminded - thats all!.\nYou can also use the menu below to change your settings`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Change your timezone",
              callback_data: `reset-timezone`,
            },
          ],
        ],
      },
    }
  );
});

bot.on("callback_query", (ctx) => {
  parseResponse(ctx.callbackQuery.data, ctx);
  ctx.answerCbQuery();
});

bot.on("message", async (ctx) => {
  const chatId = ctx.message.chat.id;
  const message = ctx.message.text;
  if (pendingDuration.has(chatId)) {
    const durations = remindClause(message, await getTimezone(ctx));
    if (durations && durations.length > 0) {
      pendingDuration.delete(chatId);
      bot.telegram.sendMessage(
        chatId,
        `Kelzo will remind you about ${reminderTexts[chatId]}`
      );
      const reminderText = reminderTexts[chatId];
      const timeKeys = durations.map((each) => {
        const recur = Math.ceil(each.toMillis() / 1000);
        console.log(`TIMEKEY: ${currentSecond + recur}`);
        return currentSecond + recur;
      });
      timeKeys.forEach(async (each) => {
        const existingReminders: ReminderLogEntry[] = await reminderLog.get(
          each.toString()
        );
        const updatedReminders = existingReminders
          ? [...existingReminders, { chatId, text: reminderText }]
          : [{ chatId, text: reminderText }];
        reminderLog.set(each.toString(), updatedReminders);
      });
    } else {
      bot.telegram.sendMessage(
        chatId,
        `That is not a valid spec OK! Try Again!
        \nFor example 'In 2 years 3 days 4 seconds'\nor 'On 13-06-2022 at 11:45'\nor 'Every weekday'`
      );
    }
  } else {
    // users are trying to start a conversation with the bot
    reminderTexts[chatId] = message;
    if (startConfigurator(ctx)) {
      bot.telegram.sendMessage(
        chatId,
        `When would you like me to remind you of ${message}?
        \nYou can reply with 'In 2 years 3 days 4 seconds'\nor 'On 13-06-2022 at 11:45'\nor 'Every weekday'`
      );
    }
    pendingDuration.add(chatId);
  }
});

bot.launch();

// graceful stopping
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
