import React from 'react';

export default function TypingLoader() {
  return (
    <div className="typing-loader-bubble">
      <span className="typing-dot"></span>
      <span className="typing-dot"></span>
      <span className="typing-dot"></span>
      <style>{`
        .typing-loader-bubble {
          background: #E6E6FF;
          border-radius: 2em;
          display: inline-flex;
          align-items: center;
          padding: 0.7em 1.2em;
          min-width: 48px;
        }
        .typing-dot {
          display: inline-block;
          width: 10px;
          height: 10px;
          margin: 0 3px;
          background: #bbb;
          border-radius: 50%;
          opacity: 0.7;
          animation: typing-bounce 1.2s infinite both;
        }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typing-bounce {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.7; }
          40% { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  );
}