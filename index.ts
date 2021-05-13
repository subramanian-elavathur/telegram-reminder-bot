const { Telegraf } = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.start((ctx) => ctx.reply("Hello There"));
bot.help((ctx) => ctx.reply("Send me a sticker"));
bot.on("sticker", (ctx) => ctx.reply("👍"));
bot.hears("hi", (ctx) => ctx.reply("Hey there"));
bot.command("lucky", (ctx) => {
  bot.telegram.sendDice(ctx.message.chat.id);
});
bot.command("countdown", (ctx) => {
  let counter = 5;
  let clr = setInterval(() => {
    bot.telegram.sendMessage(ctx.message.chat.id, counter);
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
