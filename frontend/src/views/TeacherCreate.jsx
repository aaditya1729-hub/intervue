import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { createPoll } from '../services/api.js';
import { setPollMeta } from '../store/pollSlice.js';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Header from '../components/ui/Header.jsx';

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
      <Header title="Create a new poll" />
      <Card>
        <div className="grid" style={{gap:14}}>
          <div className="grid" style={{gap:6}}>
            <label>Title</label>
            <Input value={title} onChange={e=>setTitle(e.target.value)} />
          </div>
          <div className="grid" style={{gap:6}}>
            <label>Time limit (seconds)</label>
            <Input type="number" min={10} max={300} value={timeLimit} onChange={e=>setTimeLimit(e.target.value)} />
          </div>
          <div className="row" style={{justifyContent:'flex-end'}}>
            <Button onClick={onCreate}>Create Poll</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}