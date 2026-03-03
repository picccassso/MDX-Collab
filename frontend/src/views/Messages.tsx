const conversations = [
  { initials: "JK", name: "Jamie Kim", preview: "Are you interested in the project?", time: "2h", tone: "av-red" },
  { initials: "SR", name: "Sofia Reyes", preview: "I liked your portfolio", time: "5h", tone: "av-mid" },
  { initials: "TP", name: "Tom Park", preview: "Let me know when you are free", time: "1d", tone: "av-slate" },
  { initials: "SL", name: "Signal Lost Team", preview: "Jamie: lets sync Thursday", time: "3h", tone: "av-muted" },
];

export default function Messages() {
  return (
    <div className="page-view">
      <div className="topbar">
        <div className="topbar-title">
          <span>Messages</span>
        </div>
      </div>

      <div className="chat-layout">
        <aside className="chat-sidebar">
          <div className="chat-sidebar-title">Conversations</div>
          <div className="chat-ai-badge">
            <div className="shield" style={{ width: 26, height: 30 }}>
              <div className="shield-text" style={{ fontSize: 11 }}>AI</div>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Collab AI</div>
              <div style={{ fontSize: 10.5, color: "var(--muted2)" }}>Ask me anything</div>
            </div>
          </div>

          <div className="chat-divider">Direct Messages</div>
          {conversations.map((conversation) => (
            <div className="chat-item" key={conversation.name}>
              <div className={`avatar ${conversation.tone}`} style={{ width: 28, height: 28, fontSize: 9 }}>
                {conversation.initials}
              </div>
              <div className="chat-item-info">
                <div className="chat-item-name">{conversation.name}</div>
                <div className="chat-item-preview">{conversation.preview}</div>
              </div>
              <div className="chat-item-time">{conversation.time}</div>
            </div>
          ))}
        </aside>

        <section className="chat-main">
          <div className="chat-topbar">
            <div className="shield" style={{ width: 26, height: 30 }}>
              <div className="shield-text" style={{ fontSize: 11 }}>AI</div>
            </div>
            <div>
              <div className="chat-partner-name">Collab AI Assistant</div>
              <div className="chat-partner-status">Always online</div>
            </div>
          </div>

          <div className="chat-messages">
            <div className="msg">
              <div className="shield" style={{ width: 24, height: 28 }}>
                <div className="shield-text" style={{ fontSize: 10 }}>AI</div>
              </div>
              <div>
                <div className="msg-bubble">
                  Messaging UI is included from the mockup. Backend messaging is not implemented in this project.
                </div>
                <div className="msg-time">just now</div>
              </div>
            </div>
            <div className="msg own">
              <div className="avatar av-red" style={{ width: 26, height: 26, fontSize: 9 }}>ME</div>
              <div>
                <div className="msg-bubble">Show me game dev collaborators.</div>
                <div className="msg-time">just now</div>
              </div>
            </div>
          </div>

          <div className="chat-input-bar">
            <div className="chat-placeholder">Messaging input is a visual placeholder in this build.</div>
          </div>
        </section>
      </div>
    </div>
  );
}
