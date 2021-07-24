import { before, test, after } from "./alicia";
import { Settings, DateTime } from "luxon";
import { remindClause } from "../src/reminders";

const now = Settings.now;
const group = "reminders";

before((done, log) => {
  log("Updating Luxon now method to return static date");
  Settings.now = () => new Date(Date.UTC(0, 0, 0, 0, 0, 0));
  done();
}, group);

test(
  "Reminder In Clause",
  ({ passed, failed }, log) => {
    remindClause("in 2 hours", "Asia/Kolkata")[0] === 7200000
      ? passed()
      : failed();
  },
  group
);

after((done) => {
  Settings.now = now;
  done();
}, group);
