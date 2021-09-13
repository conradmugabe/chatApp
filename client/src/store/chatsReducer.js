import { createSlice } from "@reduxjs/toolkit";
import { createSelector } from "reselect";
import io from "socket.io-client";
import { apiCallBegan } from "./api";

const userId = localStorage.getItem("chattie-id");

const socket = io("http://localhost:5000");

const slice = createSlice({
  name: "chats",
  initialState: { allChats: {}, to: "", userId },
  reducers: {
    messageSent: (chats, action) => {
      const from = userId;
      const { to, allChats } = chats;
      const { message } = action.payload;
      const userChats = allChats[to];
      const chat = { message, to, from };

      if (userChats !== undefined) {
        userChats.push(chat);
      } else {
        allChats[to] = [chat];
      }
    },
    loggedIn: (chats, action) => {
      const { username } = action.payload;
      chats.userId = username;
      localStorage.setItem("chattie-id", username);
    },
  },
});

export const { messageSent, loggedIn } = slice.actions;

export const login = (username, password) =>
  apiCallBegan({
    method: "post",
    url: "/api/v1/user/login",
    data: { username, password },
    onSuccess: loggedIn.type,
  });

export const signUp = (username, password) =>
  apiCallBegan({
    method: "post",
    url: "/api/v1/user/createUser",
    data: { username, password },
    onSuccess: loggedIn.type,
  });

export const selectLastChats = createSelector(
  (state) => state.chats.allChats,
  (chats) => {
    let lastChats = [];
    for (const chat in chats) {
      if (chats[chat] !== userId) {
        const length = chats[chat].length;
        lastChats.push(chats[chat][length - 1]);
      }
    }
    return lastChats;
  }
);

export const selectActiveChats = createSelector(
  (state) => state.chats.allChats,
  (state) => state.chats.to,
  (allChats, to) => allChats[to]
);

export const sendMessage = (message) => {
  socket.emit("send-message", { message });
};

export default slice.reducer;
