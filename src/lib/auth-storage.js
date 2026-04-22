const ACCESS_TOKEN_KEY = "accessToken";
const SESSION_HINT_KEY = "cb_has_session";

export function getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    localStorage.setItem(SESSION_HINT_KEY, "1");
}

export function clearAccessToken() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.setItem(SESSION_HINT_KEY, "0");
}

export function hasSessionHint() {
    return localStorage.getItem(SESSION_HINT_KEY) === "1";
}

export function setSessionHint(value) {
    localStorage.setItem(SESSION_HINT_KEY, value ? "1" : "0");
}
