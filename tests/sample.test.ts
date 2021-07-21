import { test } from "./alicia";

test("Gramercy Park", ({ passed }, log) => {
  setTimeout(() => {
    log("Just good vibes");
    passed();
  }, 2000);
});

test("Fallin", ({ failed }) => {
  setTimeout(() => {
    failed();
  }, 2000);
});

test("Show me love", () => {
  throw new Error("I keep on fallin");
});

test("Underdog", ({ passed }) => {
  passed();
});
