import { DateTime } from "luxon";
import { RRule, Weekday } from "rrule";
import { NUMBER } from "./reminders";

const examples = [
  "every day at hh:mm:ss",
  "every week on [M|T|W|T|F|S|S].* at hh:mm:ss",
  "every month on (the d+)? [(first|second|third|fourth|fifth) (M|T|W|T|F|S|S]) at hh:mm:ss",
  "every year on (the d+) | ([first-fifth] [day]) of [month] at hh:mm:ss",
];

const TIME_SPEC = /(?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d)/g;

const EVERY_DAY_AT =
  /every day at (?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d)/g;

const EVERY_WEEK_ON =
  /every week on (?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)(?: at (?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d))?/g;

const EVERY_MONTH_ON =
  /every month on the (?:\d+(?:th|rd|st|nd)|(?:(?:first|second|third|fourth|fifth) (?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)))(?: at (?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d))?/g;

const DAY_OCCURENCE = /(?:first|second|third|fourth|fifth)/g;

const WEEK_DAY =
  /(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)/g;

const MONTH_DAY = /\d+(?:th|rd|st|nd)/g;

const getDefaults = (timezone: string): { tzid: string; count: number } => {
  return {
    tzid: timezone,
    count: 30, // default for 30 days
  };
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

const parse = (spec: string, timezone: string): DateTime[] => {
  let freq = undefined;
  if (EVERY_DAY_AT.test(spec)) {
    freq = RRule.DAILY;
  } else if (EVERY_WEEK_ON.test(spec)) {
    freq = RRule.WEEKLY;
  } else if (EVERY_MONTH_ON.test(spec)) {
    freq = RRule.MONTHLY;
  } else {
    console.log("Unsupported format");
  }
  const rrule = new RRule({
    freq,
    ...getDefaults(timezone),
    ...getDayOccurence(spec),
    ...extractMonthDay(spec),
    ...extractWeekDay(spec),
    ...extractTime(spec),
  });
  rrule
    .all()
    .map((each) => DateTime.fromISO(each.toISOString()))
    .forEach((each) => console.log(each.toString()));
  return [];
};

console.log("\nEVERY DAY\n");
parse("every day at 12:30", "Asia/Kolkata");
console.log("\nEVERY WEEK\n");
parse("every week on friday at 12:30", "Asia/Kolkata");
console.log("\nEVERY MONTH 1\n");
parse("every month on the third friday at 11:30", "Asia/Kolkata");
console.log("\nEVERY MONTH 2\n");
parse("every month on the 13th at 11:30", "Asia/Kolkata");
