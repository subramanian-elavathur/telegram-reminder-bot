import { group } from "good-vibes";
import { Settings } from "luxon";
import { remindClause } from "../src/reminders";

const now = Settings.now;
const { before, test, after } = group("reminders");

before((c) => {
  c.log("Updating Luxon now method to return static date");
  Settings.now = () => new Date(Date.UTC(0, 0, 0, 0, 0, 0)).valueOf();
  c.done();
});

test("In Clause 1", (c) =>
  c.check(7200000, remindClause("in 2 hours", "Asia/Kolkata")[0]).done());

test("In Clause 2", (c) =>
  c
    .check(7320000, remindClause("in 2 hours and 2 minutes", "Asia/Kolkata")[0])
    .done());

// todo fix
// test("On Clause", (v) =>
//   v
//     .check(99530000, remindClause("On 1-1-1900 at 09:00", "Asia/Kolkata")[0])
//     .done());

after((c) => {
  Settings.now = now;
  c.done();
});
