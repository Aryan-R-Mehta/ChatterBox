import { axiosClient } from "@/utils/axios";

export async function registerAccount(payload) {
    try {
        const response = await axiosClient.post("/auth/signup", payload);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Something went wrong" };
    }
}

export async function signInWithEmail(payload) {
    try {
        const response = await axiosClient.post("/auth/login", payload);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Something went wrong" };
    }
}

export async function resetPassword(data) {
    const res = await axiosClient.post("/user/resetPassword", data);
    return res.data;
}

export async function deleteAccount() {
    const res = await axiosClient.delete("/user/deleteAccount");
    return res.data;
}

export async function fetchAuthenticatedProfile() {
    const res = await axiosClient.get("/user/me");
    return res.data;
}

export async function fetchDirectoryContacts() {
    const res = await axiosClient.get("/user/contacts");
    return res.data;
}

export async function fetchJoinedChannels() {
    const res = await axiosClient.get("/user/channels");
    return res.data;
}

export async function updateAuthenticatedProfile(payload) {
    const res = await axiosClient.patch("/user/profile", payload);
    return res.data;
}

export async function signOutAndInvalidateSession() {
    localStorage.removeItem("accessToken");
    localStorage.setItem("cb_has_session", "0");
    const res = await axiosClient.post("/user/logout");
    return res.data;
}

export async function createChannelConversation(payload) {
    const res = await axiosClient.post("/channel", payload);
    return res.data;
}

export async function fetchChannelDetail(channelId) {
    const res = await axiosClient.get(`/channel/${channelId}`);
    return res.data;
}

export async function sendChannelMessage({ channelId, content }) {
    const res = await axiosClient.post("/message", { channelId, content });
    return res.data;
}

export async function renameChannelTitle({ channelId, name }) {
    const res = await axiosClient.patch(`/channel/${channelId}`, { name });
    return res.data;
}

export async function editChannelMessage({ channelId, messageId, content }) {
    const res = await axiosClient.patch("/message", {
        channelId,
        messageId,
        content,
    });
    return res.data;
}

export async function softDeleteChannelMessage({ channelId, messageId }) {
    const res = await axiosClient.post("/message/delete", {
        channelId,
        messageId,
    });
    return res.data;
}

export async function inviteUsersIntoChannel({ channelId, memberIds }) {
    const res = await axiosClient.post("/member", { channelId, memberIds });
    return res.data;
}

export async function removeChannelMembership(membershipId) {
    const res = await axiosClient.delete(`/member/${membershipId}`);
    return res.data;
}
