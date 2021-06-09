import { DateTime } from "luxon";
import { RRule } from "rrule";
import { NUMBER } from "./reminders";

const examples = [
  "every day at hh:mm:ss",
  "every week on [M|T|W|T|F|S|S].* at hh:mm:ss",
  "every month on (the d+)? [(first|second|third|fourth|fifth) (M|T|W|T|F|S|S]) at hh:mm:ss",
  "every year on (the d+) | ([first-fifth] [day]) of [month] at hh:mm:ss",
];

const EVERY_DAY_AT =
  /every day at (?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d)/g;

const EVERY_WEEK_ON =
  /every week on (monday|tuesday|wednesday|thursday|friday|saturday|sunday)( at (?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d))?/g;

const WEEK_DAY = /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/g;

const getRRuleWeekDay = (day: string) => {
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

const parseEveryWeekOn = (spec: string, timezone: string): DateTime[] => {
  const [week] = spec.match(WEEK_DAY);
  const [hour, minute, second] = spec.match(NUMBER);
  const parsedHour = parseInt(hour);
  const parsedMinute = parseInt(minute);
  const parsedSecond = parseInt(second);
  const parsedWeek = getRRuleWeekDay(week);
  const rrule = new RRule({
    freq: RRule.WEEKLY,
    tzid: timezone,
    count: 30, // default for 30 days
    byweekday: parsedWeek,
    byhour: isNaN(parsedHour) ? undefined : [parsedHour],
    byminute: isNaN(parsedMinute) ? undefined : [parsedMinute],
    bysecond: isNaN(parsedSecond) ? undefined : [parsedSecond],
  });
  return rrule.all().map((each) => DateTime.fromISO(each.toISOString()));
};

const parseEveryDayAt = (spec: string, timezone: string): DateTime[] => {
  const [hour, minute, second] = spec.match(NUMBER);
  const parsedHour = parseInt(hour);
  const parsedMinute = parseInt(minute);
  const parsedSecond = parseInt(second);
  const rrule = new RRule({
    freq: RRule.DAILY,
    tzid: timezone,
    count: 30, // default for 30 days
    byhour: isNaN(parsedHour) ? undefined : [parsedHour],
    byminute: isNaN(parsedMinute) ? undefined : [parsedMinute],
    bysecond: isNaN(parsedSecond) ? undefined : [parsedSecond],
  });
  return rrule.all().map((each) => DateTime.fromISO(each.toISOString()));
};

const parse = (spec: string, timezone: string): DateTime[] => {
  let result;
  if (EVERY_DAY_AT.test(spec)) {
    result = parseEveryDayAt(spec, timezone);
    result.forEach((each) => console.log(each.toString()));
  } else if (EVERY_WEEK_ON.test(spec)) {
    result = parseEveryWeekOn(spec, timezone);
    result.forEach((each) => console.log(each.toString()));
  } else {
    console.log("Unsupported format");
  }
  return [];
};

//parse("every day at 12:30", "Asia/Kolkata");
parse("every week on friday at 12:30", "Asia/Kolkata");
