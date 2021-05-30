const countdown = (ctx) => {
  let counter = 5;
  let clr = setInterval(() => {
    ctx.telegram.sendMessage(ctx.callbackQuery.message.chat.id, counter);
    counter = counter - 1;
    if (counter === 0) {
      ctx.telegram.sendMessage(
        ctx.callbackQuery.message.chat.id,
        `I did as you asked ${ctx.callbackQuery.message.chat.first_name} ${ctx.callbackQuery.message.chat.last_name}`
      );
      clearInterval(clr);
    }
  }, 1000);
};

export default countdown;
