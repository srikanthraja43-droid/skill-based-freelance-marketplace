import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectUser } from "../features/auth/authSlice";
import { setConversations, setMessages, addMessage, setActiveConversation, setTyping, clearTyping } from "../features/chat/chatSlice";
import { getSocket } from "../socket/socket";
import api from "../api/axios";
import Spinner from "../components/ui/Spinner";
import toast from "react-hot-toast";

export default function MessagesPage() {
  const dispatch = useDispatch();
  const location = useLocation();
  const user = useSelector(selectUser);
  const socket = getSocket();
  const [convs, setConvs] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typing, setTypingState] = useState(false);
  const typingTimer = useRef(null);
  const messagesEnd = useRef(null);

  useEffect(() => {
    api.get("/messages/conversations").then(({ data }) => {
      setConvs(data.data);
      if (location.state?.conversationId) {
        const found = data.data.find(c => c._id === location.state.conversationId);
        if (found) selectConv(found);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on("message_received", (msg) => {
      setMsgs(prev => [...prev, msg]);
      setConvs(prev => prev.map(c => c._id === msg.conversationId ? { ...c, lastMessage: { text: msg.text, timestamp: msg.createdAt } } : c));
    });
    socket.on("user_typing", ({ userId, conversationId }) => { if (activeConv?._id === conversationId) setTypingState(true); });
    socket.on("user_stop_typing", () => setTypingState(false));
    return () => { socket.off("message_received"); socket.off("user_typing"); socket.off("user_stop_typing"); };
  }, [socket, activeConv]);

  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const selectConv = async (conv) => {
    setActiveConv(conv);
    socket?.emit("join_conversation", conv._id);
    try {
      const { data } = await api.get(`/messages/${conv._id}`);
      setMsgs(data.data);
      socket?.emit("mark_read", { conversationId: conv._id });
    } catch { toast.error("Could not load messages"); }
  };

  const sendMsg = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeConv) return;
    setSending(true);
    const receiver = activeConv.participants.find(p => p._id !== user._id);
    if (socket?.connected) {
      socket.emit("send_message", { conversationId: activeConv._id, receiverId: receiver._id, text });
    } else {
      try { const { data } = await api.post(`/messages/${activeConv._id}`, { text, receiverId: receiver._id }); setMsgs(prev => [...prev, data.data]); }
      catch { toast.error("Failed to send"); }
    }
    setText("");
    socket?.emit("stop_typing", { conversationId: activeConv._id });
    setSending(false);
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    if (activeConv && socket) {
      socket.emit("typing", { conversationId: activeConv._id });
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => socket.emit("stop_typing", { conversationId: activeConv._id }), 2000);
    }
  };

  const getOtherParticipant = (conv) => conv.participants?.find(p => p._id !== user?._id);

  return (
    <div className="messages-page">
      <div className="messages-layout">
        {/* Sidebar */}
        <div className="conv-sidebar card">
          <h2 style={{padding:"1rem 1.25rem", borderBottom:"1px solid var(--border)", fontSize:"1.1rem", fontWeight:700}}>Messages</h2>
          {loading ? <Spinner /> : convs.length === 0 ? (
            <div className="empty-state" style={{padding:"2rem"}}><p className="text-secondary">No conversations yet.</p></div>
          ) : convs.map(conv => {
            const other = getOtherParticipant(conv);
            return (
              <div key={conv._id} className={`conv-item ${activeConv?._id === conv._id ? "active" : ""}`} onClick={() => selectConv(conv)}>
                {other?.avatar ? <img src={other.avatar} alt="" className="avatar" /> : <div className="avatar">{other?.name?.[0]}</div>}
                <div className="conv-info">
                  <strong>{other?.name}</strong>
                  <p className="conv-last">{conv.lastMessage?.text || "Start a conversation"}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Chat Window */}
        <div className="chat-window card">
          {!activeConv ? (
            <div className="empty-state" style={{height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center"}}>
              <div style={{fontSize:"3rem", marginBottom:"1rem"}}>💬</div>
              <h3>Select a conversation</h3>
              <p className="text-secondary">Choose a chat from the left to start messaging</p>
            </div>
          ) : (<>
            <div className="chat-header">
              {(() => { const other = getOtherParticipant(activeConv); return (<>
                {other?.avatar ? <img src={other.avatar} alt="" className="avatar" /> : <div className="avatar">{other?.name?.[0]}</div>}
                <div><strong>{other?.name}</strong><span className="badge badge-muted" style={{marginLeft:"0.5rem"}}>{other?.role}</span></div>
              </>); })()}
            </div>
            <div className="chat-messages">
              {msgs.map((msg, i) => (
                <div key={msg._id || i} className={`msg ${msg.senderId?._id === user?._id || msg.senderId === user?._id ? "msg-me" : "msg-other"}`}>
                  <div className="msg-bubble">{msg.text}</div>
                  <div className="msg-time">{new Date(msg.createdAt).toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"})}</div>
                </div>
              ))}
              {typing && <div className="typing-indicator"><span /><span /><span /></div>}
              <div ref={messagesEnd} />
            </div>
            <form className="chat-input-wrap" onSubmit={sendMsg}>
              <input className="form-input chat-input" placeholder="Type a message..." value={text} onChange={handleTyping} />
              <button type="submit" className="btn btn-primary" disabled={!text.trim() || sending}>Send</button>
            </form>
          </>)}
        </div>
      </div>
    </div>
  );
}
