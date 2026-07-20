// One-time setup: generates Convex Auth JWT keys and an AES encryption key,
// then stores them as Convex deployment environment variables.
// Usage: node scripts/setup-env.mjs [--prod]
import { exportJWK, exportPKCS8, generateKeyPair } from "jose";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";

const prod = process.argv.includes("--prod");
const prodFlag = prod ? "--prod" : "";

function convexEnvSet(name, value) {
  // Quote for cmd.exe: wrap in double quotes, escape inner double quotes.
  const quoted = `"${String(value).replace(/"/g, '\\"')}"`;
  const result = spawnSync(`npx convex env set ${prodFlag} -- ${name} ${quoted}`, {
    shell: true,
    stdio: "inherit",
  });
  if (result.status !== 0) {
    throw new Error(`Failed to set ${name}`);
  }
}

const keys = await generateKeyPair("RS256", { extractable: true });
const privateKey = (await exportPKCS8(keys.privateKey))
  .trimEnd()
  .replace(/\n/g, " ");
const publicKey = await exportJWK(keys.publicKey);
const jwks = JSON.stringify({ keys: [{ use: "sig", ...publicKey }] });

convexEnvSet("JWT_PRIVATE_KEY", privateKey);
convexEnvSet("JWKS", jwks);
const defaultSiteUrl = prod
  ? "https://unbury-ameya-kulkarnis-projects-88deb18f.vercel.app"
  : "http://localhost:3000";
convexEnvSet("SITE_URL", process.env.SITE_URL ?? defaultSiteUrl);
convexEnvSet("ENCRYPTION_KEY", crypto.randomBytes(32).toString("base64"));

console.log("\nDone. Remember to also set GROQ_API_KEY:");
console.log("  npx convex env set GROQ_API_KEY <your-key>");
