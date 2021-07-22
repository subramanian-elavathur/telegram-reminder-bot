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
  group: string;
}

interface GroupedTests {
  [key: string]: Test[];
}

interface TestResult {
  name: string;
  status: boolean;
  group: string;
  message?: string;
}

const DEFAULT_TEST_GROUP = "Default";

const tests: GroupedTests = {
  [DEFAULT_TEST_GROUP]: [],
};

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

export const test = async (
  name: string,
  testImplementation: AsyncTest,
  group?: string
) => {
  const groupToUpdate = group ?? DEFAULT_TEST_GROUP;
  const existingTests = tests[groupToUpdate] ?? [];
  tests[groupToUpdate] = [
    ...existingTests,
    { name, test: testImplementation, group: groupToUpdate },
  ];
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
      group: test.group,
      status: await testResults,
    };
  } catch (error) {
    result = {
      name: test.name,
      group: test.group,
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

const runTestsInAGroup = async (group: string): Promise<TestResult[]> => {
  console.log(`Running ${tests[group].length} tests from ${group} group\n`);
  const results = await Promise.all(tests[group].map(runOneTest));
  console.log(
    `\nFinished running ${tests[group].length} tests from ${group} group\n`
  );
  return results.filter((each) => !each.status);
};

const run = async () => {
  banner();
  const totalTests = Object.values(tests).reduce(
    (acc, each) => [...acc, ...each],
    []
  ).length;
  let failedTests: TestResult[] = [];
  for (const group in tests) {
    const failedTestsInGroup = await runTestsInAGroup(group);
    failedTests = [...failedTests, ...failedTestsInGroup];
  }
  if (failedTests?.length) {
    console.log(
      `Hey ${failedTests.length}/${totalTests} tests failed, but its going to be ok. Start by going through the list below and adding some logs to figure out whats going wrong:`
    );
    failedTests.forEach((each, index) =>
      console.log(
        `${index}. [${each.group}] ${each.name} ${
          each.message ? `(${each.message})` : ""
        }`
      )
    );
    process.exit(1);
  }
  console.log(`All ${totalTests} tests passed, good vibes :)`);
  process.exit(0);
};

export default run;
