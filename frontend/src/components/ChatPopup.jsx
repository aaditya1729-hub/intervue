import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { addMessage } from '../store/chatSlice.js';

export default function ChatPopup({ socket }){
  const dispatch = useDispatch();
  const messages = useSelector(s=>s.chat.messages);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');

  useEffect(()=>{
    if (!socket) return;
    const onMsg = (m) => dispatch(addMessage(m));
    socket.on('chat:message', onMsg);
    return () => socket.off('chat:message', onMsg);
  }, [socket, dispatch]);

  function send(){
    if (!text.trim()) return;
    socket.emit('chat:message', { text });
    setText('');
  }

  return (
    <div style={{position:'fixed', right:20, bottom:20}}>
      {open && (
        <div className="card" style={{width:320, height:360, display:'grid', gridTemplateRows:'1fr auto', gap:8}}>
          <div style={{overflow:'auto', display:'grid', gap:6}}>
            {messages.map((m,i)=> (
              <div key={i} style={{fontSize:14}}>
                <b>{m.from}:</b> {m.text}
              </div>
            ))}
          </div>
          <div className="row">
            <input value={text} onChange={e=>setText(e.target.value)} placeholder="Type a message" style={{flex:1}} />
            <button onClick={send} style={{marginLeft:8}}>Send</button>
          </div>
        </div>
      )}
      <button onClick={()=>setOpen(o=>!o)} style={{background: open?'#374151':'var(--primary)'}}>Chat</button>
    </div>
  );
}