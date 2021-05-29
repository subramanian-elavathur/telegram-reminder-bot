import { Context } from "telegraf";
import TIMEZONES from "./IANATimezone";

export const startConfigurator = (ctx: Context) =>
  ctx.reply("Start by selecting your continent", {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "Africa", callback_data: "timezone_Africa" },
          { text: "America", callback_data: "timezone_America" },
          { text: "Antarctica", callback_data: "timezone_Antarctica" },
        ],
        [
          { text: "Asia", callback_data: "timezone_Asia" },
          { text: "Europe", callback_data: "timezone_Europe" },
          { text: "Atlantic", callback_data: "timezone_Atlantic" },
        ],
        [
          { text: "Pacific", callback_data: "timezone_Pacific" },
          { text: "Australia", callback_data: "timezone_Australia" },
        ],
      ],
    },
  });

export const parseResponse = (message: string, ctx: any) => {
  const split = message.split("_");
  if (split.length === 2) {
    const locations = TIMEZONES[split[1]];
    const keyboard = locations.map((each) => {
      const test = each.split("/");
      return {
        text: test[1],
        callback_data: "timezone_" + test[0] + "_" + test[1],
      };
    });
    let i,
      j,
      chunk = 4;
    const formatted = [];
    for (i = 0, j = keyboard.length; i < j; i += chunk) {
      formatted.push(keyboard.slice(i, i + chunk));
    }

    ctx.editMessageText("Now select the city closest to you", {
      inline_message_id: ctx.callbackQuery.id,
      reply_markup: {
        inline_keyboard: formatted,
      },
    });
  } else {
    ctx.editMessageText(`Timezone has been set to ${split[1]}/${split[2]}`, {
      inline_message_id: ctx.callbackQuery.id,
      reply_markup: {},
    });
    ctx.reply("So what would you like to do today", {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "countdown", callback_data: "countdown" },
            { text: "lucky", callback_data: "lucky" },
            { text: "reminder", callback_data: "reminder" },
          ],
        ],
      },
    });
  }
};
