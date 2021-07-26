const fs = require("fs/promises");
const path = require("path");
const os = require("os");

import { GlitchDB } from "../src/glitch-db";
import { before, test, after } from "./alicia";

const group = "Glitch DB";
let tempDirectory: string;
let glitchDB: GlitchDB<string>;

before(async (done, log) => {
  tempDirectory = await fs.mkdtemp(path.join(os.tmpdir(), "glitch-"));
  log(`Created temp directory for tests at: ${tempDirectory}`);
  glitchDB = new GlitchDB<string>(tempDirectory);
  await glitchDB.set("key-1", "value-1");
  await glitchDB.set("key-2", "value-2");
  await glitchDB.set("key-3", "value-3");
  log(`Glitch DB setup with dummy data complete`);
  done();
}, group);

test(
  "Test retrieve",
  async (check) => {
    check("value-1", await glitchDB.get("key-1"));
  },
  group
);

test(
  "Test exists",
  async (check) => {
    check(true, await glitchDB.exists("key-1"));
  },
  group
);

test(
  "Test unset",
  async (check) => {
    await glitchDB.unset("key-3");
    check(undefined, await glitchDB.get("key-3"));
  },
  group
);

after(async (done, log) => {
  try {
    await fs.rmdir(tempDirectory, { recursive: true });
    log("Deleted temp directory after tests");
    done();
  } catch (e) {
    log(`Could not delete temp directory at: ${tempDirectory}`);
    done();
  } finally {
    tempDirectory = "";
  }
}, group);
