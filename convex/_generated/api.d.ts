/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as chat from "../chat.js";
import type * as documents from "../documents.js";
import type * as http from "../http.js";
import type * as ingest from "../ingest.js";
import type * as ingestHelpers from "../ingestHelpers.js";
import type * as lib_chunk from "../lib/chunk.js";
import type * as lib_crypto from "../lib/crypto.js";
import type * as lib_embed from "../lib/embed.js";
import type * as lib_groq from "../lib/groq.js";
import type * as lib_pdf from "../lib/pdf.js";
import type * as rag from "../rag.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  chat: typeof chat;
  documents: typeof documents;
  http: typeof http;
  ingest: typeof ingest;
  ingestHelpers: typeof ingestHelpers;
  "lib/chunk": typeof lib_chunk;
  "lib/crypto": typeof lib_crypto;
  "lib/embed": typeof lib_embed;
  "lib/groq": typeof lib_groq;
  "lib/pdf": typeof lib_pdf;
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
