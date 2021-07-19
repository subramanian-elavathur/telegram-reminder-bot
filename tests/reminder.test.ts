import test from "./alicia";
import { Settings, DateTime } from "luxon";

const now = Settings.now;

test("testing luxon mock", async (log) => {
  Settings.now = () => new Date(2020, 1, 12).valueOf();
  log(DateTime.local().toISO());
  return Promise.resolve(true);
});
