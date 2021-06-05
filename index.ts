import {
  startConfigurator,
  parseResponse,
  getTimezone,
} from "./TimezoneConfigurator";
import countdown from "./countdown";
import { remindClause } from "./reminders";
import { Duration, DateTime } from "luxon";

require("dotenv").config();
const { Telegraf } = require("telegraf");

const pendingReminderText = new Set();
const pendingDuration = new Set();
const reminderTexts = {};

interface ReminderLogEntry {
  text: string;
  chatId: number;
}

interface ReminderLog {
  [key: number]: ReminderLogEntry[];
}

let reminderLog: ReminderLog = {
  0: [],
};

let currentSecond = 0;

const reminderDaemon = setInterval(() => {
  console.log(`starting daemon at ${currentSecond}`);
  const remindersToSend = reminderLog[currentSecond];
  if (remindersToSend?.length > 0) {
    console.log(JSON.stringify(remindersToSend));
    remindersToSend.forEach((each) =>
      bot.telegram.sendMessage(each.chatId, `REMINDER\n\n${each.text}`)
    );
  }
  currentSecond = currentSecond + 1;
}, 1000);

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.start((ctx) => {
  ctx.reply(
    `Hello there and thanks for checking out the telegram recurring reminders bot.
    \n\nI require your timezone information to be able to accurately remind you.
    \n\nPlease use the following use the buttons below this message to select your timezone.`
  );
  startConfigurator(ctx);
});

bot.on("callback_query", (ctx) => {
  switch (ctx.callbackQuery.data) {
    case "countdown":
      countdown(ctx);
      break;
    case "reminder":
      remind(ctx);
      break;
    default:
      parseResponse(ctx.callbackQuery.data, ctx);
      break;
  }
  ctx.answerCbQuery();
});

bot.on("message", (ctx) => {
  const chatId = ctx.message.chat.id;
  const message = ctx.message.text;
  if (pendingReminderText.has(chatId)) {
    reminderTexts[chatId] = message;
    bot.telegram.sendMessage(
      chatId,
      `When would you like me to remind you?
      \nFor example 'In 2 years 3 days 4 seconds'\nor 'On 13-06-2022 at 11:45'\nor 'Every weekday'`
    );
    pendingReminderText.delete(chatId);
    pendingDuration.add(chatId);
  } else if (pendingDuration.has(chatId)) {
    const durations = remindClause(message, getTimezone(ctx));
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
      const transformedTimeKeys = timeKeys.reduce((acc, each) => {
        const updatedReminders = reminderLog[each]
          ? [...reminderLog[each], { chatId, text: reminderText }]
          : [{ chatId, text: reminderText }];
        acc[each] = updatedReminders;
        return acc;
      }, {});
      reminderLog = {
        ...reminderLog,
        ...transformedTimeKeys,
      };
    } else {
      bot.telegram.sendMessage(
        chatId,
        `That is not a valid spec OK! Try Again!
        \nFor example 'In 2 years 3 days 4 seconds'\nor 'On 13-06-2022 at 11:45'\nor 'Every weekday'`
      );
    }
  }
});

const remind = (ctx) => {
  const chatId = ctx.callbackQuery.message.chat.id;
  pendingReminderText.add(chatId);
  bot.telegram.sendMessage(
    ctx.callbackQuery.message.chat.id,
    "what would you like to be reminded of?"
  );
};

bot.launch();

// graceful stopping
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
