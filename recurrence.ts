import { DateTime } from "luxon";
import { RRule, Weekday } from "rrule";
import { NUMBER } from "./reminders";

const UNTIL_SPEC = /until \d+-\d+-\d+/;

const INTERVAL_SPEC = /every \d+/;

const TIME_SPEC = /(?:([01]?\d|2[0-3]):([0-5]?\d)(:([0-5]?\d))?)/;

const EVERY_SECOND = /every( \d+)? second(s)?( until \d+-\d+-\d+)?/;

const EVERY_MINUTE = /every( \d+)? minute(s)?( until \d+-\d+-\d+)?/;

const EVERY_HOUR = /every( \d+)? hour(s)?( until \d+-\d+-\d+)?/;

const EVERY_DAY_AT =
  /every( \d+)? day(s)?( at (?:([01]?\d|2[0-3]):([0-5]?\d)(:([0-5]?\d))?))?( until \d+-\d+-\d+)?/;

const EVERY_WEEK_ON =
  /every( \d+)? week(s)? on (monday|tuesday|wednesday|thursday|friday|saturday|sunday)( at (?:([01]?\d|2[0-3]):([0-5]?\d)(:([0-5]?\d))?))?( until \d+-\d+-\d+)?/;

const EVERY_MONTH_ON =
  /every( \d+)? month(s)? on the (\d+(th|rd|st|nd)|((first|second|third|fourth|fifth) (monday|tuesday|wednesday|thursday|friday|saturday|sunday)))( at (?:([01]?\d|2[0-3]):([0-5]?\d)(:([0-5]?\d))?))?( until \d+-\d+-\d+)?/;

const EVERY_YEAR_ON =
  /every( \d+)? year(s)? on( the)? \d+(th|rd|st|nd) of (jan(uary)?|feb(ruary)?|mar(ch)?|apr(il)?|may|jun(e)?|jul(y)?|aug(ust)?|sep(tember)?|oct(ober)?|nov(ember)?|dec(ember)?)( at (?:([01]?\d|2[0-3]):([0-5]?\d)(:([0-5]?\d))?))?( until \d+-\d+-\d+)?/;

const DAY_OCCURENCE = /(first|second|third|fourth|fifth)/;

const WEEK_DAY = /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/;

const MONTH_DAY = /\d+(th|rd|st|nd)/;

const MONTH =
  /(jan(uary)?|feb(ruary)?|mar(ch)?|apr(il)?|may|jun(e)?|jul(y)?|aug(ust)?|sep(tember)?|oct(ober)?|nov(ember)?|dec(ember)?)/;

const getDefaults = (): { count: number } => {
  return {
    count: 30, // default for 30 days
  };
};

const getUntil = (spec: string, timezone: string): { until?: Date } => {
  const until = spec.match(UNTIL_SPEC);
  if (until?.length) {
    const [day, month, year] = until[0].match(NUMBER);
    const dateTime = DateTime.fromObject({
      year,
      month,
      day,
      zone: timezone,
    });
    return {
      until: dateTime.toJSDate(),
    };
  }
  return {};
};

const getDayOccurence = (spec: string): { bysetpos?: number } => {
  let setpos;
  const value = spec.match(DAY_OCCURENCE);
  if (value?.length) {
    switch (value[0]) {
      case "first":
        setpos = 1;
        break;
      case "second":
        setpos = 2;
        break;
      case "third":
        setpos = 3;
        break;
      case "fourth":
        setpos = 4;
        break;
      case "fifth":
        setpos = 5;
        break;
      default:
        break;
    }
  }
  return {
    bysetpos: setpos,
  };
};

const getRRuleWeekDay = (day: string): Weekday | undefined => {
  switch (day) {
    case "monday":
      return RRule.MO;
    case "tuesday":
      return RRule.TU;
    case "wednesday":
      return RRule.WE;
    case "thursday":
      return RRule.TH;
    case "friday":
      return RRule.FR;
    case "saturday":
      return RRule.SA;
    case "sunday":
      return RRule.SU;
    default:
      return undefined;
  }
};

const extractInterval = (spec: string): { interval?: number } => {
  let output = {};
  const intervalString = spec.match(INTERVAL_SPEC);
  if (intervalString?.length) {
    const [interval] = intervalString[0].match(NUMBER);
    const parsedInterval = parseInt(interval);
    output = {
      interval: isNaN(parsedInterval) ? undefined : parsedInterval,
    };
  }
  return output;
};

const extractTime = (
  spec: string
):
  | { byhour?: [number]; byminute?: [number]; bysecond?: [number] }
  | undefined => {
  const time = spec.match(TIME_SPEC);
  if (time?.length) {
    const [hour, minute, second] = spec.match(NUMBER);
    const parsedHour = parseInt(hour);
    const parsedMinute = parseInt(minute);
    const parsedSecond = parseInt(second);
    return {
      byhour: isNaN(parsedHour) ? undefined : [parsedHour],
      byminute: isNaN(parsedMinute) ? undefined : [parsedMinute],
      bysecond: isNaN(parsedSecond) ? undefined : [parsedSecond],
    };
  }
  return undefined;
};

const extractWeekDay = (spec: string): { byweekday?: Weekday } => {
  const week = spec.match(WEEK_DAY);
  return {
    byweekday: getRRuleWeekDay(week?.[0]),
  };
};

const extractMonthDay = (spec: string): { bymonthday?: number[] } => {
  let monthDay;
  const monthDayDraft = spec.match(MONTH_DAY);
  if (monthDayDraft?.length) {
    const [value] = monthDayDraft[0].match(NUMBER);
    monthDay = parseInt(value);
  }
  return {
    bymonthday: isNaN(monthDay) ? undefined : [monthDay],
  };
};

const extractMonth = (spec: string): { bymonth?: number[] } => {
  let month: number;
  const monthDraft = spec.match(MONTH);
  if (monthDraft?.length) {
    switch (monthDraft[0]) {
      case "jan":
      case "january":
        month = 1;
        break;
      case "feb":
      case "february":
        month = 2;
        break;
      case "mar":
      case "march":
        month = 3;
        break;
      case "apr":
      case "april":
        month = 4;
        break;
      case "may":
        month = 5;
        break;
      case "jun":
      case "june":
        month = 6;
        break;
      case "jul":
      case "july":
        month = 7;
        break;
      case "aug":
      case "august":
        month = 8;
        break;
      case "sep":
      case "september":
        month = 9;
        break;
      case "oct":
      case "october":
        month = 10;
        break;
      case "nov":
      case "november":
        month = 11;
        break;
      case "dec":
      case "december":
        month = 12;
        break;
      default:
        break;
    }
  }
  return {
    bymonth: !month ? undefined : [month],
  };
};

export const recur = (specRaw: string, timezone: string): number[] => {
  const spec = specRaw.toLowerCase();
  let freq = undefined;
  if (EVERY_DAY_AT.test(spec)) {
    freq = RRule.DAILY;
  } else if (EVERY_WEEK_ON.test(spec)) {
    freq = RRule.WEEKLY;
  } else if (EVERY_MONTH_ON.test(spec)) {
    freq = RRule.MONTHLY;
  } else if (EVERY_YEAR_ON.test(spec)) {
    freq = RRule.YEARLY;
  } else if (EVERY_HOUR.test(spec)) {
    freq = RRule.HOURLY;
  } else if (EVERY_MINUTE.test(spec)) {
    freq = RRule.MINUTELY;
  } else if (EVERY_SECOND.test(spec)) {
    freq = RRule.SECONDLY;
  } else {
    console.log("Unsupported format");
  }
  const rrule = new RRule({
    freq,
    ...getDefaults(),
    bysetpos:
      freq !== RRule.SECONDLY ? getDayOccurence(spec).bysetpos : undefined,
    ...extractMonthDay(spec),
    ...extractMonth(spec),
    ...extractWeekDay(spec),
    ...extractTime(spec),
    ...extractInterval(spec),
    ...getUntil(spec, timezone),
  });
  return rrule.all().map((each) => each.valueOf() - DateTime.utc().toMillis());
};
