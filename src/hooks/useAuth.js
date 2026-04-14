import { axiosClient } from "@/utils/axios";

export async function signup(data) {
    try {
        const response = await axiosClient.post('/auth/signup', data);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Something went wrong" };
    }
}

export async function login(data) {
    try {
        const response = await axiosClient.post('/auth/login', data);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Something went wrong" };
    }
}

export async function getCurrentUser() {
    const res = await axiosClient.get("/user/me");
    return res.data;
}

export async function getAllUserNames() {
    const res = await axiosClient.get("/user/all-users");
    return res.data;
}

export async function getUserChannels() {
    const res = await axiosClient.get("/user/all-channels");
    return res.data;
}

export async function updateProfile(data) {
    const res = await axiosClient.patch("/user/update", data);
    return res.data;
}

export async function logout() {
    localStorage.removeItem("accessToken");
    const res = await axiosClient.post("/user/logout");
    return res.data;
}

export async function createChannel(data) {
    const res = await axiosClient.post("/channel/create", data);
    return res.data;
}

export async function getChannelData(channelId) {
    const res = await axiosClient.get(`/channel/all-data/${channelId}`);
    return res.data;
}

export async function messageSend(data) {
    const res = await axiosClient.post("/message/send", data);
    return res.data;
}

export async function messageEdit(data) {
    const res = await axiosClient.patch("/message/edit", data);
    return res.data;
}

export async function messageDelete(data) {
    const res = await axiosClient.post("/message/delete", data);
    return res.data;
}
