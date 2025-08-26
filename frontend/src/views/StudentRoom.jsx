import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { connectPoll } from '../services/socket.js';
import { setPollMeta, setProgress, setResults } from '../store/pollSlice.js';
import { setStudentId } from '../store/userSlice.js';
import ResultsChart from '../components/ResultsChart.jsx';
import Timer from '../components/Timer.jsx';
import ChatPopup from '../components/ChatPopup.jsx';

export default function StudentRoom(){
  const { pollId } = useParams();
  const dispatch = useDispatch();
  const { name } = useSelector(s=>s.user);
  const { results } = useSelector(s=>s.poll);
  const [question, setQuestion] = useState(null);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const socketRef = useRef(null);

  useEffect(()=>{
    dispatch(setPollMeta({ pollId }));
    const socket = connectPoll({ pollId, role: 'student', name });
    socketRef.current = socket;
    socket.on('student:registered', ({ studentId }) => dispatch(setStudentId(studentId)));
    socket.on('poll:question_started', (q) => { setQuestion(q); setSubmitted(false); setSelected(null); });
    socket.on('poll:progress', (r) => dispatch(setProgress(r)));
    socket.on('poll:results', (r) => dispatch(setResults(r)));
    return () => socket.disconnect();
  }, [pollId, dispatch, name]);

  function submit(){
    if (selected==null || !question) return;
    socketRef.current.emit('student:answer', { questionId: question.id, optionIndex: selected }, (res)=>{
      if (!res?.ok) alert(res?.error || 'Failed to submit');
      else setSubmitted(true);
    });
  }

  return (
    <div className="container grid" style={{gap:20}}>
      <h2>Poll • {pollId}</h2>

      {!question && (
        <div className="card" style={{color:'var(--muted)'}}>Waiting for teacher to start a question…</div>
      )}

      {question && (
        <div className="card grid" style={{gap:12}}>
          <div className="row" style={{justifyContent:'space-between'}}>
            <h3>{question.text}</h3>
            <Timer seconds={question.timeLimitSeconds} />
          </div>
          {!submitted ? (
            <div className="grid" style={{gap:10}}>
              {question.options.map((o,i)=> (
                <label key={i} className="row" style={{gap:10}}>
                  <input type="radio" name="opt" checked={selected===i} onChange={()=>setSelected(i)} />
                  <div>{o}</div>
                </label>
              ))}
              <div className="row" style={{justifyContent:'flex-end'}}>
                <button onClick={submit} disabled={selected==null}>Submit</button>
              </div>
            </div>
          ): (
            <div>
              <div style={{marginBottom:10}}>Thanks! Here are live results:</div>
              {results && <ResultsChart options={question.options} counts={results.counts || []} />}
            </div>
          )}
        </div>
      )}

      <ChatPopup socket={socketRef.current} />
    </div>
  );
}