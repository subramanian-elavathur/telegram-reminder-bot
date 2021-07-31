import {
  startConfigurator,
  parseResponse,
  getTimezone,
} from "./TimezoneConfigurator";
import { remindClause } from "./reminders";
import GlitchDB from "glitch-db";
import { updateTracker, deactivateTracker, getTrackers } from "./tracker";
import { DateTime } from "luxon";
import * as chunk from "lodash.chunk";

require("dotenv").config();
const { Telegraf } = require("telegraf");

const pendingDuration = new Set();
const reminderTexts = {};

interface ReminderLogEntry {
  text: string;
  chatId: number;
}

const reminderLog = new GlitchDB<ReminderLogEntry[]>(
  process.env.REMINDERS_DB_DIRECTORY
);

let currentSecond = Math.floor(DateTime.now().toMillis() / 1000);

const reminderDaemon = setInterval(async () => {
  const remindersToSend: ReminderLogEntry[] = await reminderLog.get(
    currentSecond.toString()
  );
  if (remindersToSend?.length > 0) {
    for (const each of remindersToSend) {
      bot.telegram.sendMessage(each.chatId, each.text);
      await deactivateTracker(each.chatId.toString(), currentSecond);
    }
  }
  reminderLog.unset(currentSecond.toString());
  currentSecond = currentSecond + 1;
}, 1000);

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => ctx.reply("What would you like to be reminded of?"));

const formatTime = (epoch: number): string => {
  return DateTime.fromSeconds(epoch).toLocaleString(DateTime.DATETIME_MED);
};

const viewReminders = async (userId: string, ctx) => {
  const trackers = await getTrackers(userId);
  if (trackers?.length) {
    ctx.reply(
      trackers.reduce((acc, each) => {
        acc += `${each.id} - ${each.reminderText} (on ${formatTime(
          each.duration
        )})\n`;
        return acc;
      }, ""),
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Delete a reminder",
                callback_data: `delete-reminder`,
              },
            ],
          ],
        },
      }
    );
  }
};

const deleteReminder = async (userId: string, id: string, ctx) => {
  const trackers = await getTrackers(userId);
  const tracker = trackers.find((each) => each.id.toString() === id);
  if (tracker) {
    await deactivateTracker(userId, tracker.duration);
    await reminderLog.unset(tracker.duration.toString());
    ctx.editMessageText(
      `Reminder with id: ${id} and message: ${tracker.reminderText} was deleted.`,
      {
        inline_message_id: ctx.callbackQuery.id,
        reply_markup: {},
      }
    );
  } else {
    ctx.editMessageText(`Reminder with id: ${id} could not be deleted :(`, {
      inline_message_id: ctx.callbackQuery.id,
      reply_markup: {},
    });
  }
};

const createDeleteRemindersButton = async (userId: string, ctx) => {
  const trackers = await getTrackers(userId);
  if (trackers?.length) {
    ctx.reply("Which reminder would you like to delete", {
      reply_markup: {
        inline_keyboard: chunk(
          trackers.map((each) => ({
            text: `${each.id}`,
            callback_data: `delete-reminder-${each.id}`,
          })),
          6
        ),
      },
    });
  }
};

bot.command("reminders", (ctx) => {
  viewReminders(ctx.message.chat.id, ctx);
});

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
            {
              text: "View your reminders",
              callback_data: `view-reminders`,
            },
          ],
        ],
      },
    }
  );
});

bot.on("callback_query", (ctx) => {
  if (ctx.callbackQuery.data === "view-reminders") {
    viewReminders(ctx.from.id, ctx);
  } else if (ctx.callbackQuery.data === "delete-reminder") {
    createDeleteRemindersButton(ctx.from.id, ctx);
  } else if (ctx.callbackQuery.data.startsWith("delete-reminder")) {
    const [a, b, id] = ctx.callbackQuery.data.split("-");
    deleteReminder(ctx.from.id, id, ctx);
  } else {
    parseResponse(ctx.callbackQuery.data, ctx);
  }
  ctx.answerCbQuery();
});

bot.on("message", async (ctx) => {
  const chatId = ctx.message.chat.id;
  const message = ctx.message.text;
  if (pendingDuration.has(chatId)) {
    const timezone = await getTimezone(ctx);
    const durations = remindClause(message, timezone);
    if (durations && durations.length > 0) {
      pendingDuration.delete(chatId);
      bot.telegram.sendMessage(chatId, "Reminder Set!");
      const reminderText = reminderTexts[chatId];
      const timeKeys = durations.map((each) => {
        const recur = Math.ceil(each / 1000);
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
      updateTracker(chatId, timeKeys, reminderText, timezone);
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
