interface PassedOrFailed {
  passed: () => void;
  failed: () => void;
}
interface AsyncTest {
  (passedOrFailed: PassedOrFailed, log: (message: string) => void): void;
}

interface Test {
  name: string;
  test: AsyncTest;
}

interface TestResult {
  name: string;
  status: boolean;
  message?: string;
}

const tests: Test[] = [];

let promptPrinted = false;

const banner = () => {
  if (!promptPrinted) {
    promptPrinted = true;
    console.log(
      "\nWelcome to Alicia\n\nA good vibes testing library dedicated to Alicia Keys' Tiny Desk Performance\n\nWatch it here: https://www.youtube.com/watch?v=uwUt1fVLb3E\n"
    );
  }
};

const logger = (name: string) => (message: string) =>
  console.log(`Log: ${name}: ${message}`);

const passedOrFailed = (resolve): PassedOrFailed => ({
  passed: () => resolve(true),
  failed: () => resolve(false),
});

export const test = async (name: string, testImplementation: AsyncTest) => {
  tests.push({ name, test: testImplementation });
};

const runOneTest = async (test: Test): Promise<TestResult> => {
  console.log(`Running: ${test.name}`);
  const startTime = new Date().valueOf();
  let result: TestResult;
  try {
    const testResults = new Promise<boolean>((resolve) => {
      test.test(passedOrFailed(resolve), logger(test.name));
    });
    result = {
      name: test.name,
      status: await testResults,
    };
  } catch (error) {
    result = {
      name: test.name,
      status: false,
      message: error?.message,
    };
  }
  const endTime = new Date().valueOf();
  console.log(
    `Finished: ${test.name} [${result.status ? "PASSED" : "FAILED"} in ${
      (endTime - startTime) / 1000
    } seconds]`
  );
  return Promise.resolve(result);
};

const run = () => {
  banner();
  console.log(`Running ${tests.length} tests\n`);
  Promise.all(tests.map(runOneTest)).then((results) => {
    const failedTests = results.filter((each) => !each.status);
    if (failedTests?.length) {
      console.log(
        `\nHey ${failedTests.length}/${tests.length} tests failed, but its going to be ok. Start by going through the list below and adding some logs to figure out whats going wrong:`
      );
      failedTests.forEach((each, index) =>
        console.log(
          `${index}. ${each.name}${each.message ? ` (${each.message})` : ""}`
        )
      );
      process.exit(1);
    }
    console.log("\nAll tests passed, good vibes :)");
    process.exit(0);
  });
};

export default run;
