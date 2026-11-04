import { execFileSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { join } from "node:path";

function findTests(directory: string): string[] {
  const tests: string[] = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) tests.push(...findTests(path));
    else if (entry.isFile() && entry.name.endsWith(".test.ts")) tests.push(path);
  }
  return tests;
}

const files = findTests("src").sort();
if (files.length === 0) {
  console.error("No unit test files found.");
  process.exit(1);
}

for (const file of files) {
  console.log(`\n▶ ${file}`);
  execFileSync("bun", ["run", file], {
    stdio: "inherit",
    env: {
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL ?? "mysql://u:p@127.0.0.1:1/x",
    },
  });
}
