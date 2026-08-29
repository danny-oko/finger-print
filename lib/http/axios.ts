import axios from "axios";

/**
 * Shared axios instance for outbound calls that carry secrets (API tokens,
 * checksums) in headers — Cloudflare D1's REST API, and anywhere else a
 * server-only credential needs to leave this process. Never import this
 * from client components; every caller must run on the server.
 */
export const secureHttp = axios.create({
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});
