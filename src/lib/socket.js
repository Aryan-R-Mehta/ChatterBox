import { io } from "socket.io-client";
import { getApiBaseUrl } from "@/config/api";

let sharedSocket;

/** Single shared Socket.IO client for the whole app (browser). */
export const getSharedSocket = () => {
    if (!sharedSocket) {
        sharedSocket = io(getApiBaseUrl(), {
            withCredentials: true,
        });
    }
    return sharedSocket;
};
