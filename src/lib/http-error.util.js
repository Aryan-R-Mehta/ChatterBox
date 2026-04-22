export function getApiErrorMessage(error, fallbackMessage = "Something went wrong") {
    if (!error) return fallbackMessage;

    if (typeof error === "string") return error;

    if (error.response?.data?.message) {
        return error.response.data.message;
    }

    if (error.message) {
        return error.message;
    }

    return fallbackMessage;
}

export function isUnauthorizedError(error) {
    return Number(error?.response?.status) === 401;
}
