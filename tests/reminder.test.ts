import { before, test, after } from "./alicia";
import { Settings, DateTime } from "luxon";

const now = Settings.now;
const group = "reminders";

before((done) => {
  Settings.now = new Date(2021, 6, 22);
  done();
}, group);

test(
  "Testing luxon mock",
  ({ passed }, log) => {
    Settings.now = () => new Date(2020, 1, 12).valueOf();
    log(DateTime.local().toISO());
    passed();
  },
  group
);

after((done) => {
  Settings.now = now;
  done();
}, group);
