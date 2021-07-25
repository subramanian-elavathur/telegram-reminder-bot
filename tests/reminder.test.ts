import { before, test, after } from "./alicia";
import { Settings } from "luxon";
import { remindClause } from "../src/reminders";

const now = Settings.now;
const group = "reminders";

before((done, log) => {
  log("Updating Luxon now method to return static date");
  Settings.now = () => new Date(Date.UTC(0, 0, 0, 0, 0, 0));
  done();
}, group);

test(
  "In Clause 1",
  (check) => check(7200000, remindClause("in 2 hours", "Asia/Kolkata")[0]),
  group
);

test(
  "In Clause 2",
  (check) =>
    check(7320000, remindClause("in 2 hours and 2 minutes", "Asia/Kolkata")[0]),
  group
);

after((done) => {
  Settings.now = now;
  done();
}, group);
