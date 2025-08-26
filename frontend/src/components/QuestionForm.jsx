import { useState } from 'react';

export default function QuestionForm({ onStart }){
  const [text, setText] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [timeLimit, setTimeLimit] = useState(60);

  function changeOption(i, val){
    const next = options.slice();
    next[i] = val;
    setOptions(next);
  }
  function addOption(){ setOptions([...options, '']); }

  function submit(){
    const opts = options.map(o=>o.trim()).filter(Boolean);
    if (!text.trim() || opts.length < 2) return;
    onStart && onStart({ text: text.trim(), options: opts, timeLimitSeconds: Number(timeLimit) });
  }

  return (
    <div className="card grid">
      <h3>Ask a question</h3>
      <input value={text} onChange={e=>setText(e.target.value)} placeholder="Question text" />
      <div className="grid" style={{gridTemplateColumns:'1fr 1fr', gap:12}}>
        {options.map((o,i)=> (
          <input key={i} value={o} onChange={e=>changeOption(i,e.target.value)} placeholder={`Option ${i+1}`} />
        ))}
      </div>
      <div className="row" style={{justifyContent:'space-between'}}>
        <button onClick={addOption} style={{background:'#374151'}}>+ Add option</button>
        <div className="row">
          <label>Time (s)</label>
          <input type="number" min={10} max={300} value={timeLimit} onChange={e=>setTimeLimit(e.target.value)} style={{width:100}} />
          <button onClick={submit}>Start</button>
        </div>
      </div>
    </div>
  );
}