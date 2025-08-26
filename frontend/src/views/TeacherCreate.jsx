import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { createPoll } from '../services/api.js';
import { setPollMeta } from '../store/pollSlice.js';

export default function TeacherCreate(){
  const [title, setTitle] = useState('Class Poll');
  const [timeLimit, setTimeLimit] = useState(60);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  async function onCreate(){
    const res = await createPoll({ title, timeLimitSeconds: Number(timeLimit) });
    dispatch(setPollMeta({ pollId: res.pollId, title: res.title }));
    navigate(`/teacher/${res.pollId}`);
  }

  return (
    <div className="container">
      <div className="card grid" style={{maxWidth:640, margin:'40px auto'}}>
        <h2>Create a new poll</h2>
        <div className="row">
          <label style={{minWidth:140}}>Title</label>
          <input value={title} onChange={e=>setTitle(e.target.value)} />
        </div>
        <div className="row">
          <label style={{minWidth:140}}>Time limit (sec)</label>
          <input type="number" min={10} max={300} value={timeLimit} onChange={e=>setTimeLimit(e.target.value)} />
        </div>
        <div className="row" style={{justifyContent:'flex-end'}}>
          <button onClick={onCreate}>Create Poll</button>
        </div>
      </div>
    </div>
  );
}