'use client';
import { useState } from 'react';
import { useSocket } from '../context/SocketProvider';
import classes from './page.module.css'

export default function Page() {
  const { sendMessage, messages } = useSocket();
  const [message, setMessage] = useState('');
  return (
    <div>
      <div>
        <input
          className={classes["chat-input"]}
          placeholder="Message..."
          onChange={e => setMessage(e.target.value)}
        />
        <button
          className={classes["button"]}
          onClick={e => sendMessage(message)}
        >Send</button>
      </div>
      <div>
        <h1>All messages will appear here.</h1>
        <ul>
          {messages.map((msg, index) => (
            <li key={index}>{msg}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
