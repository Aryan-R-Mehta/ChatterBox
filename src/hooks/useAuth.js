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

export async function updateProfile(data) {
    const res = await axiosClient.patch("/user/update", data);
    return res.data;
}

export async function logout() {
    const res = await axiosClient.post("/user/logout");
    return res.data;
}