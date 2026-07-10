import { createSlice } from "@reduxjs/toolkit";
const chatSlice = createSlice({
  name: "chat",
  initialState: { conversations: [], activeConversation: null, messages: [], onlineUsers: [], typingUsers: {} },
  reducers: {
    setConversations: (state, action) => { state.conversations = action.payload; },
    setActiveConversation: (state, action) => { state.activeConversation = action.payload; },
    setMessages: (state, action) => { state.messages = action.payload; },
    addMessage: (state, action) => { state.messages.push(action.payload); },
    setOnlineUsers: (state, action) => { state.onlineUsers = action.payload; },
    setUserOnline: (state, action) => { if (!state.onlineUsers.includes(action.payload)) state.onlineUsers.push(action.payload); },
    setUserOffline: (state, action) => { state.onlineUsers = state.onlineUsers.filter(id => id !== action.payload); },
    setTyping: (state, action) => { state.typingUsers[action.payload.conversationId] = action.payload.userId; },
    clearTyping: (state, action) => { delete state.typingUsers[action.payload]; },
    updateLastMessage: (state, action) => {
      const conv = state.conversations.find(c => c._id === action.payload.conversationId);
      if (conv) conv.lastMessage = action.payload.message;
    },
  },
});
export const { setConversations, setActiveConversation, setMessages, addMessage, setOnlineUsers, setUserOnline, setUserOffline, setTyping, clearTyping, updateLastMessage } = chatSlice.actions;
export default chatSlice.reducer;
