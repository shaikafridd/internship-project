import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Messages = () => {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'User';
  const [activeChatId, setActiveChatId] = useState('1');
  const [msgText, setMsgText] = useState('');

  const initialChats = [
    {
      id: '1',
      sender: 'Sarah Jenkins (TechNova)',
      role: 'Recruiter',
      avatar: '👩‍💼',
      time: '10:30 AM',
      unread: true,
      messages: [
        { id: '1a', sender: 'Sarah', text: `Hi ${firstName}, we reviewed your application for the Frontend Developer role and were really impressed with your portfolio!`, time: '10:28 AM' },
        { id: '1b', sender: 'Sarah', text: 'Are you available for a brief introductory call tomorrow at 11:00 AM IST?', time: '10:30 AM' }
      ]
    },
    {
      id: '2',
      sender: 'David Vance (PixelPerfect)',
      role: 'Design Manager',
      avatar: '👨‍🎨',
      time: 'Yesterday',
      unread: false,
      messages: [
        { id: '2a', sender: 'David', text: `Hi ${firstName}, congratulations! You have been shortlisted for the UI/UX Designer role interview.`, time: 'Yesterday' },
        { id: '2b', sender: 'David', text: 'Please review the case study task and let us know when you can present it.', time: 'Yesterday' }
      ]
    },
    {
      id: '3',
      sender: 'Hiring Team (CodeCraft Labs)',
      role: 'Human Resources',
      avatar: '🏢',
      time: '2 days ago',
      unread: false,
      messages: [
        { id: '3a', sender: 'System', text: 'Thank you for applying to the Web Developer role. We will update you on the next steps shortly.', time: '2 days ago' }
      ]
    }
  ];

  const [chats, setChats] = useState(initialChats);

  useEffect(() => {
    setChats(initialChats);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const activeChat = chats.find(c => c.id === activeChatId) || chats[0];

  const handleSend = (e) => {
    e.preventDefault();
    if (!msgText.trim()) return;

    setChats(prev => prev.map(chat => {
      if (chat.id === activeChatId) {
        return {
          ...chat,
          messages: [
            ...chat.messages,
            {
              id: Math.random().toString(),
              sender: 'Me',
              text: msgText.trim(),
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]
        };
      }
      return chat;
    }));

    setMsgText('');
  };

  return (
    <div className="messages-wrapper animate-fade-in">
      <div className="messages-layout glass-panel">
        
        {/* Left Chats List Sidebar */}
        <div className="chats-sidebar">
          <div className="sidebar-header">
            <h3>Messages</h3>
            <span className="badge badge-primary">3 Unread</span>
          </div>

          <div className="chats-list">
            {chats.map((chat) => (
              <div 
                key={chat.id} 
                className={`chat-item-row ${chat.id === activeChatId ? 'active' : ''}`}
                onClick={() => setActiveChatId(chat.id)}
              >
                <div className="chat-avatar">{chat.avatar}</div>
                <div className="chat-summary">
                  <div className="row-top">
                    <h4>{chat.sender}</h4>
                    <span className="time">{chat.time}</span>
                  </div>
                  <div className="row-bottom">
                    <p className="last-msg">{chat.messages[chat.messages.length - 1]?.text}</p>
                    {chat.unread && <span className="unread-dot"></span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Active Chat Workspace */}
        <div className="chat-workspace">
          <div className="chat-header">
            <div className="header-left">
              <div className="chat-avatar">{activeChat.avatar}</div>
              <div>
                <h4>{activeChat.sender}</h4>
                <span className="role">{activeChat.role}</span>
              </div>
            </div>
            <button className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.8rem' }}>View Job</button>
          </div>

          <div className="messages-box">
            {activeChat.messages.map((msg) => {
              const isMe = msg.sender === 'Me';

              return (
                <div key={msg.id} className={`message-bubble-row ${isMe ? 'msg-me' : 'msg-them'}`}>
                  <div className="bubble">
                    <p>{msg.text}</p>
                    <span className="bubble-time">{msg.time}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <form onSubmit={handleSend} className="chat-input-bar">
            <input 
              type="text" 
              className="form-control" 
              placeholder="Type your message..." 
              value={msgText}
              onChange={(e) => setMsgText(e.target.value)}
            />
            <button type="submit" className="btn btn-primary send-msg-btn">Send</button>
          </form>
        </div>

      </div>

      <style>{`
        .messages-layout {
          display: grid;
          grid-template-columns: 320px 1fr;
          height: calc(100vh - var(--navbar-height) - 100px);
          overflow: hidden;
          background-color: white;
        }

        /* Sidebar Chats */
        .chats-sidebar {
          border-right: 1px solid hsl(var(--border-color));
          display: flex;
          flex-direction: column;
        }

        .chats-sidebar .sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid hsl(var(--border-color));
        }

        .chats-sidebar .sidebar-header h3 {
          font-size: 1.05rem;
        }

        .chats-list {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        .chat-item-row {
          display: flex;
          gap: 12px;
          padding: 16px 20px;
          cursor: pointer;
          border-bottom: 1px solid hsl(var(--border-color) / 0.5);
          transition: var(--transition-fast);
          align-items: center;
        }

        .chat-item-row:hover {
          background-color: #f8fafc;
        }

        .chat-item-row.active {
          background-color: hsl(var(--primary) / 0.05);
        }

        .chat-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .chat-summary {
          flex: 1;
          min-width: 0;
        }

        .chat-summary .row-top {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 4px;
        }

        .chat-summary .row-top h4 {
          font-size: 0.85rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .chat-summary .row-top .time {
          font-size: 0.7rem;
          color: hsl(var(--text-muted));
        }

        .chat-summary .row-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .chat-summary .last-msg {
          font-size: 0.75rem;
          color: hsl(var(--text-secondary));
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex: 1;
          margin-right: 10px;
        }

        .unread-dot {
          width: 8px;
          height: 8px;
          background-color: hsl(var(--primary));
          border-radius: 50%;
        }

        /* Workspace Chat */
        .chat-workspace {
          display: flex;
          flex-direction: column;
          background-color: #f8fafc;
        }

        .chat-workspace .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          background-color: white;
          border-bottom: 1px solid hsl(var(--border-color));
        }

        .header-left {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .header-left h4 {
          font-size: 0.9rem;
        }

        .header-left .role {
          font-size: 0.75rem;
          color: hsl(var(--text-muted));
        }

        .messages-box {
          flex: 1;
          padding: 24px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .message-bubble-row {
          display: flex;
          width: 100%;
        }

        .message-bubble-row.msg-me {
          justify-content: flex-end;
        }

        .message-bubble-row.msg-them {
          justify-content: flex-start;
        }

        .bubble {
          max-width: 70%;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 0.85rem;
          line-height: 1.45;
          position: relative;
        }

        .msg-me .bubble {
          background-color: hsl(var(--primary));
          color: white;
          border-bottom-right-radius: 2px;
        }

        .msg-them .bubble {
          background-color: white;
          color: hsl(var(--text-primary));
          border-bottom-left-radius: 2px;
          border: 1px solid hsl(var(--border-color));
        }

        .bubble-time {
          display: block;
          font-size: 0.65rem;
          text-align: right;
          margin-top: 4px;
          color: inherit;
          opacity: 0.7;
        }

        .chat-input-bar {
          display: flex;
          gap: 12px;
          padding: 16px 24px;
          background-color: white;
          border-top: 1px solid hsl(var(--border-color));
        }

        .send-msg-btn {
          padding: 10px 20px;
        }

        @media (max-width: 768px) {
          .messages-layout {
            grid-template-columns: 1fr;
          }
          .chats-sidebar {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default Messages;
