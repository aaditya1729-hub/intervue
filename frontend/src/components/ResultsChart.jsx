export default function ResultsChart({ options = [], counts = [], highlightIndex = null }){
  const total = counts.reduce((a,b)=>a+b,0) || 1;
  return (
    <div className="grid" style={{gap:10}}>
      {options.map((opt, i) => {
        const c = counts[i] || 0;
        const pct = Math.round((c/total)*100);
        const barStyle = {
          width:`${pct}%`,
          background: i===highlightIndex ? 'var(--primary-hover)' : 'var(--primary)'
        };
        return (
          <div key={i} className="grid" style={{gap:6}}>
            <div className="progress-label">
              <div>{opt}</div>
              <div className="subtle">{c} ({pct}%)</div>
            </div>
            <div className="progress-track">
              <div className="progress-bar" style={barStyle} />
            </div>
          </div>
        );
      })}
    </div>
  );
}