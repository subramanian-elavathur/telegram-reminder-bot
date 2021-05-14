const { Telegraf } = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.start((ctx) => ctx.reply("Hello There"));
bot.command("lucky", (ctx) => {
  bot.telegram.sendDice(ctx.message.chat.id, {
    reply_markup: { remove_keyboard: true },
  });
});
bot.command("sup", (ctx) => {
  bot.telegram.sendMessage(
    ctx.message.chat.id,
    "So what would you like to do today",
    {
      reply_markup: {
        keyboard: [["/countdown"], ["/lucky"]],
      },
    }
  );
});

bot.command("countdown", (ctx) => {
  let counter = 5;
  let clr = setInterval(() => {
    bot.telegram.sendMessage(ctx.message.chat.id, counter, {
      reply_markup: { remove_keyboard: true },
    });
    counter = counter - 1;
    if (counter === 0) {
      bot.telegram.sendMessage(ctx.message.chat.id, "I did as you asked");
      clearInterval(clr);
    }
  }, 1000);
});
bot.launch();

// graceful stopping
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
