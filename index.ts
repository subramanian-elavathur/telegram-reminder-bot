const { Telegraf } = require("telegraf");

const draftChatReminders = new Set();

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
  if (draftChatReminders.has(chatId)) {
    setTimeout(() => {
      bot.telegram.sendMessage(chatId, `REMINDER - ${ctx.message.text}`);
    }, 10000);
    bot.telegram.sendMessage(chatId, "Reminder set! Will remind in 10 sec");
    draftChatReminders.delete(chatId);
  }
});

const remind = (ctx) => {
  const chatId = ctx.callbackQuery.message.chat.id;
  draftChatReminders.add(chatId);
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
