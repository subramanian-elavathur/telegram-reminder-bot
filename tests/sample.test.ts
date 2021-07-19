import test from "./alicia";

test("Gramercy Park", async (log) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      log("Just good vibes");
      resolve(true);
    }, 2000);
  });
});

test("Fallin", async () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(true), 2000);
  });
});

test("Show me love", async () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(true), 2000);
  });
});

test("Underdog", async () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(true), 2000);
  });
});
