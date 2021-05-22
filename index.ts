require("dotenv").config();
const { Telegraf } = require("telegraf");
const { Duration } = require("luxon");

const pendingReminderText = new Set();
const pendingDuration = new Set();
const pendingFrequency = new Set();
const reminderTexts = {};
const reminderDurations = {};

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
bot.start((ctx) => ctx.reply("Hello There"));

bot.command("sup", (ctx) => {
  bot.telegram.sendMessage(
    ctx.message.chat.id,
    "So what would you like to do today",
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "countdown", callback_data: "countdown" },
            { text: "lucky", callback_data: "lucky" },
            { text: "reminder", callback_data: "reminder" },
          ],
        ],
      },
    }
  );
});

bot.on("callback_query", (ctx) => {
  switch (ctx.callbackQuery.data) {
    case "lucky":
      makeLucky(ctx);
      break;
    case "countdown":
      startCountdown(ctx);
      break;
    case "reminder":
      remind(ctx);
      break;
    default:
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
      "When would you like me to remind you?\n\nGive me an ISO 8601 duration string\n\nDont know what this is?\nRead about it here: https://en.wikipedia.org/wiki/ISO_8601#Durations"
    );
    pendingReminderText.delete(chatId);
    pendingDuration.add(chatId);
  } else if (pendingDuration.has(chatId)) {
    const duration = Duration.fromISO(message);
    if (Object.keys(duration.toObject()).length === 0) {
      bot.telegram.sendMessage(
        chatId,
        "That is not a valid duration OK! Try Again!\n\nGive me an ISO 8601 duration string\n\nDont know what this is?\nRead about it here: https://en.wikipedia.org/wiki/ISO_8601#Durations"
      );
    } else {
      reminderDurations[chatId] = duration;
      pendingDuration.delete(chatId);
      bot.telegram.sendMessage(
        chatId,
        "How many times would you like me to remind you?"
      );
      pendingFrequency.add(chatId);
    }
  } else if (pendingFrequency.has(chatId)) {
    const frequency = parseInt(message);
    bot.telegram.sendMessage(
      chatId,
      `Kelzo will remind you about ${reminderTexts[chatId]} in ${JSON.stringify(
        reminderDurations[chatId].toObject()
      )}\n and will repeat ${isNaN(frequency) ? 0 : frequency} times`
    );
    const reminderText = reminderTexts[chatId];
    const timeKey =
      currentSecond + Math.ceil(reminderDurations[chatId].toMillis() / 1000); // to seconds and then upper limit
    const timeKeys = isNaN(frequency)
      ? [timeKey]
      : Array(frequency)
          .fill(0)
          .map((each, index) => {
            const recur =
              Math.ceil(reminderDurations[chatId].toMillis() / 1000) *
              (index + 1);
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

const makeLucky = (ctx) => {
  bot.telegram.sendDice(ctx.callbackQuery.message.chat.id, {
    reply_markup: { remove_keyboard: true },
  });
};

const startCountdown = (ctx) => {
  let counter = 5;
  let clr = setInterval(() => {
    bot.telegram.sendMessage(ctx.callbackQuery.message.chat.id, counter);
    counter = counter - 1;
    if (counter === 0) {
      bot.telegram.sendMessage(
        ctx.callbackQuery.message.chat.id,
        `I did as you asked ${ctx.callbackQuery.message.chat.first_name} ${ctx.callbackQuery.message.chat.last_name}`
      );
      clearInterval(clr);
    }
  }, 1000);
};

bot.launch();

// graceful stopping
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
