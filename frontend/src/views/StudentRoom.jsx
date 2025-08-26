import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { connectPoll } from '../services/socket.js';
import { setPollMeta, setProgress, setResults } from '../store/pollSlice.js';
import { setStudentId } from '../store/userSlice.js';
import ResultsChart from '../components/ResultsChart.jsx';
import Timer from '../components/Timer.jsx';
import ChatPopup from '../components/ChatPopup.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Spinner from '../components/Spinner.jsx';

export default function StudentRoom(){
  const { pollId } = useParams();
  const dispatch = useDispatch();
  const { name } = useSelector(s=>s.user);
  const { results } = useSelector(s=>s.poll);
  const [question, setQuestion] = useState(null);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [kicked, setKicked] = useState(false);
  const socketRef = useRef(null);

  useEffect(()=>{
    dispatch(setPollMeta({ pollId }));
    const socket = connectPoll({ pollId, role: 'student', name });
    socketRef.current = socket;
    socket.on('student:registered', ({ studentId }) => dispatch(setStudentId(studentId)));
    socket.on('poll:question_started', (q) => { setQuestion(q); setSubmitted(false); setSelected(null); });
    socket.on('poll:progress', (r) => dispatch(setProgress(r)));
    socket.on('poll:results', (r) => dispatch(setResults(r)));
    socket.on('student:kicked', () => { setKicked(true); socket.disconnect(); });
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
    <div className="container grid" style={{gap:20, maxWidth:720}}>
      <h2>Poll</h2>

      {kicked && (
        <Card><h3>You've been kicked out!</h3><div className="subtle">This session has ended for you.</div></Card>
      )}

      {!kicked && !question && (
        <Card className="grid" style={{display:'grid',placeItems:'center',textAlign:'center',gap:12}}>
          <Spinner />
          <div className="subtle">Wait for the teacher to ask questions...</div>
        </Card>
      )}

      {!kicked && question && (
        <Card className="grid" style={{gap:12}}>
          <div className="row" style={{justifyContent:'space-between'}}>
            <h3>{question.text}</h3>
            <Timer seconds={question.timeLimitSeconds} />
          </div>
          {!submitted ? (
            <div className="grid" style={{gap:10}}>
              {question.options.map((o,i)=> (
                <button key={i} className={`option-button ${selected===i?'selected':''}`} onClick={()=>setSelected(i)}>
                  {o}
                </button>
              ))}
              <div className="row" style={{justifyContent:'flex-end'}}>
                <Button onClick={submit} disabled={selected==null}>Submit</Button>
              </div>
            </div>
          ): (
            <div className="grid" style={{gap:6}}>
              <div className="subtle">You have voted</div>
              {results && <ResultsChart options={question.options} counts={results.counts || []} highlightIndex={selected} />}
            </div>
          )}
        </Card>
      )}

      <ChatPopup socket={socketRef.current} />
    </div>
  );
}