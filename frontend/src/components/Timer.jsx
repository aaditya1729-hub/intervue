import { useEffect, useState } from 'react';

function fmt(sec){
  const m = Math.floor(sec/60).toString().padStart(2,'0');
  const s = Math.floor(sec%60).toString().padStart(2,'0');
  return `${m}:${s}`;
}

export default function Timer({ seconds, onEnd }){
  const [left, setLeft] = useState(seconds);
  useEffect(()=>{
    setLeft(seconds);
    const t = setInterval(()=>{
      setLeft(prev => {
        if (prev <= 1){
          clearInterval(t);
          onEnd && onEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [seconds, onEnd]);
  return <div style={{fontVariantNumeric:'tabular-nums',fontWeight:600}}>{fmt(left)}</div>;
}