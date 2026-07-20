import { ConvexHttpClient } from "convex/browser";
import fs from "node:fs";

const url =
  process.env.NEXT_PUBLIC_CONVEX_URL ??
  fs.readFileSync(".env.local", "utf8").match(/NEXT_PUBLIC_CONVEX_URL=(\S+)/)?.[1];
if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL not found");
console.log(`Testing against ${url}`);
const client = new ConvexHttpClient(url);

// 1. Sign up a test account (exercises JWT key config end to end).
const email = `smoke-${Date.now()}@example.com`;
const signUp = await client.action("auth:signIn", {
  provider: "password",
  params: { email, password: "smoke-test-password-1", flow: "signUp" },
});
if (!signUp?.tokens?.token) throw new Error("Sign-up did not return tokens");
console.log("PASS auth sign-up returned a JWT");

client.setAuth(signUp.tokens.token);

// 2. Authenticated, user-scoped queries.
const docs = await client.query("documents:list", {});
if (!Array.isArray(docs) || docs.length !== 0)
  throw new Error("Expected empty document list for new user");
console.log("PASS documents.list returns empty list for new user");

const sessionId = await client.mutation("chat:createSession", {});
if (!sessionId) throw new Error("createSession failed");
console.log("PASS chat.createSession works");

const messages = await client.query("chat:listMessages", { sessionId });
if (!Array.isArray(messages) || messages.length !== 0)
  throw new Error("Expected empty message list");
console.log("PASS chat.listMessages returns empty list");

const uploadUrl = await client.mutation("documents:generateUploadUrl", {});
if (!uploadUrl.startsWith("http")) throw new Error("Upload URL invalid");
console.log("PASS documents.generateUploadUrl returns a URL");

// 3. Unauthenticated access is rejected / empty.
const anonClient = new ConvexHttpClient(url);
const anonDocs = await anonClient.query("documents:list", {});
if (anonDocs.length !== 0) throw new Error("Anonymous saw documents!");
let threw = false;
try {
  await anonClient.mutation("chat:createSession", {});
} catch {
  threw = true;
}
if (!threw) throw new Error("Anonymous createSession should have thrown");
console.log("PASS unauthenticated access is rejected");

console.log("\nAll smoke tests passed.");
