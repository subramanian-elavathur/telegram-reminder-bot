import { Duration } from "luxon";

const NUMBER = /\d+/g;
const IN_YEARS = /\d+ years/g;
const IN_MONTHS = /\d+ months/g;
const IN_DAYS = /\d+ days/g;
const IN_HOURS = /\d+ hours/g;
const IN_MINUTES = /\d+ minutes/g;
const IN_SECONDS = /\d+ seconds/g;

export const parseWhenClauseInSpec = (spec: string): Duration => {
  return Duration.fromObject({
    years: valueExtractor(spec, IN_YEARS),
    months: valueExtractor(spec, IN_MONTHS),
    days: valueExtractor(spec, IN_DAYS),
    hours: valueExtractor(spec, IN_HOURS),
    minutes: valueExtractor(spec, IN_MINUTES),
    seconds: valueExtractor(spec, IN_SECONDS),
  });
};

const valueExtractor = (spec: string, regex: RegExp) => {
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
