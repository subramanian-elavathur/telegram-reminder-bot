import { Context } from "telegraf";
import TIMEZONES from "./IANATimezone";
import * as chunk from "lodash.chunk";
import GlitchDB from "glitch-db";
require("dotenv").config();

const usersTimezone = new GlitchDB(process.env.TIMEZONE_DB_DIRECTORY);

export const getUserId = (ctx: Context) => ctx.from.id.toString();

export const getTimezone = async (ctx: Context): Promise<any> =>
  await usersTimezone.get(getUserId(ctx));

export const startConfigurator = async (ctx: Context) => {
  const timezone = await usersTimezone.get(getUserId(ctx));
  if (!timezone) {
    ctx.reply(
      "Thanks to remind you of this I need you to specify your timezone. Start by selecting your continent",
      getContinentsInlineKeyboard()
    );
  }
};

const getContinentsInlineKeyboard = () => ({
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

export const parseResponse = async (message: string, ctx: any) => {
  if (message === "reset-timezone") {
    await usersTimezone.unset(getUserId(ctx));
    ctx.reply(
      "Start by selecting your continent",
      getContinentsInlineKeyboard()
    );
    return;
  }
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
    await usersTimezone.set(getUserId(ctx), timezone);
    ctx.editMessageText(`Timezone has been set to ${timezone}`, {
      inline_message_id: ctx.callbackQuery.id,
      reply_markup: {},
    });
  }
};
