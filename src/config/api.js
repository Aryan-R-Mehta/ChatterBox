/**
 * Central API / realtime origin. Set NEXT_PUBLIC_API_URL in `.env.local` when not using localhost.
 */
export function getApiBaseUrl() {
    if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
    }
    return "http://localhost:5000";
}
