const { Telegraf } = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.start((ctx) => ctx.reply("Hello There"));
bot.on("callback_query", (ctx) => {
  switch (ctx.callbackQuery.data) {
    case "lucky":
      makeLucky(ctx);
      break;
    case "countdown":
      startCountdown(ctx);
      break;
    default:
      break;
  }
  ctx.answerCbQuery();
});

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
          ],
        ],
      },
    }
  );
});

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
        "I did as you asked"
      );
      clearInterval(clr);
    }
  }, 1000);
};

bot.launch();

// graceful stopping
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
