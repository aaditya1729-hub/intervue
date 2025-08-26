import { useEffect, useState } from 'react';

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
  return <div style={{fontVariantNumeric:'tabular-nums'}}>⏱ {left}s</div>;
}