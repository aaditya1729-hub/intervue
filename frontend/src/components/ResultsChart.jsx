export default function ResultsChart({ options = [], counts = [] }){
  const total = counts.reduce((a,b)=>a+b,0) || 1;
  return (
    <div className="grid" style={{gap:8}}>
      {options.map((opt, i) => {
        const c = counts[i] || 0;
        const pct = Math.round((c/total)*100);
        return (
          <div key={i} className="grid" style={{gap:6}}>
            <div className="row" style={{justifyContent:'space-between'}}>
              <div>{opt}</div>
              <div style={{color:'var(--muted)'}}>{c} ({pct}%)</div>
            </div>
            <div style={{background:'#1f2937', borderRadius:8, overflow:'hidden'}}>
              <div style={{height:10, width:`${pct}%`, background:'var(--primary)'}} />
            </div>
          </div>
        );
      })}
    </div>
  );
}