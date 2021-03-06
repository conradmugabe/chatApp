import { createSlice } from "@reduxjs/toolkit";
import { apiCallBegan } from "../api";
import { createSelector } from "reselect";
import { socketSendMessage } from "../middleware/socket";

const slice = createSlice({
  name: "chats",

  initialState: { contacts: [], activeChat: {}, chats: {} },

  reducers: {
    addContacts: (chats, action) => {
      chats.contacts = action.payload;
    },
    contactAdded: (chats, action) => {
      const { email, name, picture } = action.payload;

      const contact = { email, name, picture };

      chats.contacts.push(contact);
    },
    activeChatPicked: (chats, action) => {
      const { email, picture, name } = action.payload;

      chats.activeChat = { email, picture, name };
    },
    activeChatRemoved: (chats) => {
      chats.activeChat = {};
    },
    chatSent: (chats, action) => {
      const { message, to, from } = action.payload;

      const messages = chats.chats[to];
      if (messages) {
        messages.push({ message, to, from });
      } else {
        chats.chats[to] = [];
        chats.chats[to].push({ message, to, from });
      }
    },
    chatReceived: (chats, action) => {
      const { message, to, from } = action.payload;

      const messages = chats.chats[from];

      if (messages) {
        messages.push({ message, to, from });
      } else {
        chats.chats[from] = [];
        chats.chats[from].push({ message, to, from });
      }
    },
  },
});

const { contactAdded, addContacts, activeChatPicked, chatSent, chatReceived } =
  slice.actions;

export const sendMessage = (from, to, message) =>
  socketSendMessage({
    from,
    to,
    message,
    onSuccess: chatSent.type,
  });

export const receivedChat = (from, to, message) => ({
  type: chatReceived.type,
  payload: { from, to, message },
});

export const pickChat = (email, picture, name) => ({
  type: activeChatPicked.type,
  payload: { email, picture, name },
});

export const saveContact = (email) =>
  apiCallBegan({
    data: { email },
    url: "/auth/contacts/",
    method: "post",
    onSuccess: contactAdded.type,
  });

export const getAllContacts = () =>
  apiCallBegan({
    url: "/auth/contacts/",
    method: "get",
    onSuccess: addContacts.type,
  });

export const showAllActiveChats = createSelector(
  (state) => state.chats.chats,
  (state) => state.auth.email,
  (state) => state.chats.contacts,
  (chats, email, contacts) => {
    const activeChats = [];
    for (const chat in chats) {
      const lastChat = chats[chat][chats[chat].length - 1];
      if (lastChat.from !== email) {
        const contact = contacts.find(
          (contact) => contact.email === lastChat.from
        );
        activeChats.push({
          ...lastChat,
          ...contact,
        });
      } else {
        const contact = contacts.find(
          (contact) => contact.email === lastChat.to
        );
        activeChats.push({
          ...lastChat,
          ...contact,
        });
      }
    }
    return activeChats;
  }
);

export const showAllContacts = createSelector(
  (state) => state.chats.contacts,
  (contacts) => contacts
);

export const getCurrentChat = createSelector(
  (state) => state.chats.chats,
  (state) => state.chats.activeChat.email,
  (chats, email) => chats[email]
);

export default slice.reducer;
