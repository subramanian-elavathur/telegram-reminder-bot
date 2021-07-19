interface AsyncTest {
  (log: (message: string) => void): Promise<boolean>;
}

let promptPrinted = false;

const banner = () => {
  if (!promptPrinted) {
    promptPrinted = true;
    console.log(
      "\n\nWelcome to Alicia\n\nA good vibes testing library dedicated to Alicia Keys' Tiny Desk Performance\n\n"
    );
  }
};

const logger = (name: string) => (message: string) =>
  console.log(`Log: ${name}: ${message}`);

const test = async (name: string, testImplementation: AsyncTest) => {
  banner();
  console.log(`Running: ${name}`);
  const startTime = new Date().valueOf();
  const result = await testImplementation(logger(name));
  const endTime = new Date().valueOf();
  console.log(
    `Finished: ${name} [${result ? "PASSED" : "FAILED"} in ${
      (endTime - startTime) / 1000
    } seconds]`
  );
};

export default test;
