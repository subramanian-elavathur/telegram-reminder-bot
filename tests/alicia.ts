interface AsyncTest {
  (): Promise<boolean>;
}

const run = async (name: string, test: AsyncTest) => {
  console.log(`Running Test: ${name}`);
  const startTime = new Date().valueOf();
  const result = await test();
  const endTime = new Date().valueOf();
  console.log(
    `Finished Test: ${name} [${result ? "PASSED" : "FAILED"} in ${
      (endTime - startTime) / 1000
    } seconds]`
  );
};

console.log("\n\nThis testing library is dedicated to Alicia Keys\n\n");

run("Lets check if this works", async () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(true), 2000);
  });
});
