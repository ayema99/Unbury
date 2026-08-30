/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ResendOTP from "../ResendOTP.js";
import type * as auth from "../auth.js";
import type * as chat from "../chat.js";
import type * as crons from "../crons.js";
import type * as documents from "../documents.js";
import type * as http from "../http.js";
import type * as ingest from "../ingest.js";
import type * as ingestHelpers from "../ingestHelpers.js";
import type * as lib_chunk from "../lib/chunk.js";
import type * as lib_citations from "../lib/citations.js";
import type * as lib_crypto from "../lib/crypto.js";
import type * as lib_govuk from "../lib/govuk.js";
import type * as lib_groq from "../lib/groq.js";
import type * as lib_pdf from "../lib/pdf.js";
import type * as lib_policyAllowlist from "../lib/policyAllowlist.js";
import type * as lib_policyMeta from "../lib/policyMeta.js";
import type * as policy from "../policy.js";
import type * as policyIngest from "../policyIngest.js";
import type * as rag from "../rag.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ResendOTP: typeof ResendOTP;
  auth: typeof auth;
  chat: typeof chat;
  crons: typeof crons;
  documents: typeof documents;
  http: typeof http;
  ingest: typeof ingest;
  ingestHelpers: typeof ingestHelpers;
  "lib/chunk": typeof lib_chunk;
  "lib/citations": typeof lib_citations;
  "lib/crypto": typeof lib_crypto;
  "lib/govuk": typeof lib_govuk;
  "lib/groq": typeof lib_groq;
  "lib/pdf": typeof lib_pdf;
  "lib/policyAllowlist": typeof lib_policyAllowlist;
  "lib/policyMeta": typeof lib_policyMeta;
  policy: typeof policy;
  policyIngest: typeof policyIngest;
  rag: typeof rag;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
