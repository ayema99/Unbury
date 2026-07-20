import { spawnSync } from "node:child_process";

const list = spawnSync("npx convex env list", { shell: true, encoding: "utf8" });
const match = list.stdout.match(/^GROQ_API_KEY=(.+)$/m);
if (!match) throw new Error("GROQ_API_KEY not found on dev deployment");

const quoted = `"${match[1].replace(/"/g, '\\"')}"`;
const result = spawnSync(`npx convex env set --prod -- GROQ_API_KEY ${quoted}`, {
  shell: true,
  stdio: "inherit",
});
if (result.status !== 0) process.exit(result.status ?? 1);

console.log("GROQ_API_KEY copied to production.");
