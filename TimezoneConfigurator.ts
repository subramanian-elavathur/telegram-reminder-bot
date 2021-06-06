import { Context } from "telegraf";
import TIMEZONES from "./IANATimezone";
import * as chunk from "lodash.chunk";

interface UserTimezone {
  [key: number]: string;
}

const usersTimezone: UserTimezone = {};

export const getUserId = (ctx: Context) => ctx.from.id;

export const getTimezone = (ctx: Context): string =>
  usersTimezone[getUserId(ctx)];

export const startConfigurator = (ctx: Context) => {
  const timezone = usersTimezone[getUserId(ctx)];
  if (timezone) {
    ctx.reply(`Timezone has been set to ${timezone}`);
    return true;
  } else {
    ctx.reply(
      "Thanks to remind you of this I need you to specify your timezone. Start by selecting your continent",
      {
        reply_markup: {
          inline_keyboard: chunk(
            Object.keys(TIMEZONES).map((each) => ({
              text: each,
              callback_data: `timezone-${each}`,
            })),
            3
          ),
        },
      }
    );
    return false;
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
    ctx.reply(
      `When would you like me to remind you?
      \nYou can reply with 'In 2 years 3 days 4 seconds'\nor 'On 13-06-2022 at 11:45'\nor 'Every weekday'`
    );
  }
};
