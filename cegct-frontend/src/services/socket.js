import { io } from "socket.io-client";
import { API_ORIGIN } from "./api";

export const socket = io(API_ORIGIN, {
  autoConnect: false,
  auth: (callback) => callback({ token: localStorage.getItem("cegct_token") }),
});


