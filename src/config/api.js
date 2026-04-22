/**
 * Central API / realtime origin. Set NEXT_PUBLIC_API_URL in `.env.local` when not using localhost.
 */
export function getApiBaseUrl() {
    const explicitUrl =
        typeof process !== "undefined" ? process.env.NEXT_PUBLIC_API_URL : "";

    if (explicitUrl) {
        return explicitUrl.replace(/\/$/, "");
    }

    if (typeof window !== "undefined") {
        const host = window.location.hostname;
        const isLocalhost = host === "localhost" || host === "127.0.0.1";
        const isPrivateNetworkIp =
            /^192\.168\.\d{1,3}\.\d{1,3}$/.test(host) ||
            /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host) ||
            /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(host);

        if (isLocalhost || isPrivateNetworkIp) {
            return `http://${host}:5000`;
        }
    }

    return "http://localhost:5000";
}
