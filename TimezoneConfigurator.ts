import { Context } from "telegraf";
import TIMEZONES from "./IANATimezone";
import * as chunk from "lodash.chunk";

interface UserTimezone {
  [key: number]: string;
}

const usersTimezone: UserTimezone = {};

export const getUserId = (ctx: Context) => ctx.from.id;

export const promptFeatures = (ctx: Context) => {
  ctx.reply("So what would you like to do today", {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "countdown", callback_data: "countdown" },
          { text: "reminder", callback_data: "reminder" },
        ],
      ],
    },
  });
};

export const startConfigurator = (ctx: Context) => {
  const timezone = usersTimezone[getUserId(ctx)];
  if (timezone) {
    ctx.reply(`Timezone has been set to ${timezone}`);
    promptFeatures(ctx);
  } else {
    ctx.reply("Start by selecting your continent", {
      reply_markup: {
        inline_keyboard: chunk(
          Object.keys(TIMEZONES).map((each) => ({
            text: each,
            callback_data: `timezone-${each}`,
          })),
          3
        ),
      },
    });
  }
};

export const parseResponse = (message: string, ctx: any) => {
  const instruction = message.split("-");
  if (instruction.length === 2) {
    const locations = TIMEZONES[instruction[1]];
    const keyboard = locations.map((each) => {
      const [continent, city] = each.split("/");
      return {
        text: city,
        callback_data: "timezone-" + continent + "-" + city,
      };
    });
    ctx.editMessageText("Now select the city closest to you", {
      inline_message_id: ctx.callbackQuery.id,
      reply_markup: {
        inline_keyboard: chunk(keyboard, 4),
      },
    });
  } else {
    const timezone = `${instruction[1]}/${instruction[2]}`;
    usersTimezone[getUserId(ctx)] = timezone;
    ctx.editMessageText(`Timezone has been set to ${timezone}`, {
      inline_message_id: ctx.callbackQuery.id,
      reply_markup: {},
    });
    promptFeatures(ctx);
  }
};
