import { before, test, after } from "good-vibes";
import { Settings } from "luxon";
import { remindClause } from "../src/reminders";

const now = Settings.now;
const group = "reminders";

before((done, log) => {
  log("Updating Luxon now method to return static date");
  Settings.now = () => new Date(Date.UTC(0, 0, 0, 0, 0, 0)).valueOf();
  done();
}, group);

test(
  "In Clause 1",
  (verify) =>
    verify
      .check(7200000)
      .equals(remindClause("in 2 hours", "Asia/Kolkata")[0])
      .done(),
  group
);

test(
  "In Clause 2",
  (v) =>
    v
      .check(7320000)
      .equals(remindClause("in 2 hours and 2 minutes", "Asia/Kolkata")[0])
      .done(),
  group
);

// todo fix
// test(
//   "On Clause",
//   (v) =>
//     v
//       .check(99530000)
//       .equals(remindClause("On 1-1-1900 at 09:00", "Asia/Kolkata"))
//       .done(),
//   group
// );

after((done) => {
  Settings.now = now;
  done();
}, group);
