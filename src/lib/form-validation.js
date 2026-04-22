export function validateEmail(value) {
    const email = String(value || "").trim();
    if (!email) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Enter a valid email address";
    return null;
}

export function validatePassword(value) {
    const password = String(value || "");
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    if (password.length > 100) return "Password is too long";
    return null;
}

export function validateUsername(value) {
    const username = String(value || "").trim();
    if (!username) return "Username is required";
    if (username.length < 2) return "Username must be at least 2 characters";
    if (username.length > 40) return "Username must be at most 40 characters";
    return null;
}
