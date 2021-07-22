import { test } from "./alicia";
import { Settings, DateTime } from "luxon";

const now = Settings.now;

test(
  "Testing luxon mock",
  ({ passed }, log) => {
    Settings.now = () => new Date(2020, 1, 12).valueOf();
    log(DateTime.local().toISO());
    passed();
  },
  "reminders"
);
