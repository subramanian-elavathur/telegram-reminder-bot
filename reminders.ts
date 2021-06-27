import { Duration, DateTime } from "luxon";
import { recur } from "./recurrence";

export const NUMBER = /\d+/g;
const IN_YEARS = /\d+ years/g;
const IN_MONTHS = /\d+ months/g;
const IN_DAYS = /\d+ days/g;
const IN_HOURS = /\d+ hours/g;
const IN_MINUTES = /\d+ minutes/g;
const IN_SECONDS = /\d+ seconds/g;
const ON_DATE = /\d+-\d+-\d+/g;
const ON_TIME = /\d+:\d+(:\d+)?/g;

export const remindClause = (spec: string, timezone: string): number[] => {
  try {
    // prevent failures
    if (spec.toLowerCase().startsWith("in")) {
      return parseWhenClauseInSpec(spec);
    } else if (spec.toLowerCase().startsWith("on")) {
      return parseWhenClauseOnSpec(spec, timezone);
    } else if (spec.toLowerCase().startsWith("every")) {
      return recur(spec, timezone);
    }
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const parseWhenClauseOnSpec = (
  spec: string,
  zone: string
): Duration[] => {
  let day, month, year, hour, minute, second;
  let matched = spec.match(ON_DATE);
  if (matched && matched.length > 0) {
    matched = matched[0].match(NUMBER);
    if (matched && matched.length > 0) {
      const parsedDay = parseInt(matched[0]);
      const parsedMonth = parseInt(matched[1]);
      const parsedYear = parseInt(matched[2]);
      day = isNaN(parsedDay) ? undefined : parsedDay;
      month = isNaN(parsedMonth) ? undefined : parsedMonth;
      year = isNaN(parsedYear) ? undefined : parsedYear;
    }
  }
  matched = spec.match(ON_TIME);
  if (matched && matched.length > 0) {
    matched = matched[0].match(NUMBER);
    if (matched && matched.length > 0) {
      const parsedHour = parseInt(matched[0]);
      const parsedMinute = parseInt(matched[1]);
      const parsedSecond = parseInt(matched[2]);
      hour = isNaN(parsedHour) ? undefined : parsedHour;
      minute = isNaN(parsedMinute) ? undefined : parsedMinute;
      second = isNaN(parsedSecond) ? undefined : parsedSecond;
    }
  }

  return [
    DateTime.fromObject({
      year,
      month,
      day,
      hour,
      minute,
      second,
      zone,
    })
      .diffNow()
      .toMillis(),
  ];
};

export const parseWhenClauseInSpec = (spec: string): Duration[] => {
  return [
    Duration.fromObject({
      years: inValueExtractor(spec, IN_YEARS),
      months: inValueExtractor(spec, IN_MONTHS),
      days: inValueExtractor(spec, IN_DAYS),
      hours: inValueExtractor(spec, IN_HOURS),
      minutes: inValueExtractor(spec, IN_MINUTES),
      seconds: inValueExtractor(spec, IN_SECONDS),
    }).toMillis(),
  ];
};

const inValueExtractor = (spec: string, regex: RegExp) => {
  let matched = spec.match(regex); // extract specified with value i.e. "24 days"
  if (matched && matched.length > 0) {
    matched = matched[0].match(NUMBER); // extract value i.e. "24"
    if (matched && matched.length > 0) {
      const parsed = parseInt(matched[0]); // convert to number, 24
      return isNaN(parsed) ? undefined : parsed;
    }
  }
  return undefined;
};
