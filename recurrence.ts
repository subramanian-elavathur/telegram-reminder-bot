import { DateTime } from "luxon";
import { RRule } from "rrule";
import { NUMBER } from "./reminders";

const examples = [
  "every day at hh:mm:ss",
  "every week on [M|T|W|T|F|S|S].* at hh:mm:ss",
  "every month on (the d+)? [(first|second|third|fourth|fifth) (M|T|W|T|F|S|S]) at hh:mm:ss",
  "every year on (the d+) | ([first-fifth] [day]) of [month] at hh:mm:ss",
];

const EVERY_DAY_AT = /every day at \d+:\d+/g; // todo enhance to support hh, hh:mm or hh:mm:ss

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
  if (EVERY_DAY_AT.test(spec)) {
    const result = parseEveryDayAt(spec, timezone);
    result.forEach((each) => console.log(each.toString()));
  }
  console.log("Unsupported format");
  return [];
};

parse("every day at 12:30", "Asia/Kolkata");
