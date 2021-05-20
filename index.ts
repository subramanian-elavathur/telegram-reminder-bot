require("dotenv").config();
const { Telegraf } = require("telegraf");
const { Duration } = require("luxon");

const pendingReminderText = new Set();
const pendingDuration = new Set();
const reminderTexts = {};

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
      bot.telegram.sendMessage(
        chatId,
        `Kelzo will remind you about ${
          reminderTexts[chatId]
        } in ${JSON.stringify(duration.toObject())}`
      );
      const reminderText = reminderTexts[chatId];
      setTimeout(() => {
        bot.telegram.sendMessage(chatId, `REMINDER\n\n${reminderText}`);
      }, duration.toMillis());
      pendingDuration.delete(chatId);
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
