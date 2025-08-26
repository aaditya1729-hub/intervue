export default function Spinner(){
  return (
    <div style={{display:'inline-block',width:28,height:28,border:'3px solid #e5e7eb',borderTopColor:'var(--primary)',borderRadius:'50%',animation:'spin 1s linear infinite'}} />
  );
}

// Inject a simple keyframes rule once
if (typeof document !== 'undefined' && !document.getElementById('spin-style')){
  const style = document.createElement('style');
  style.id = 'spin-style';
  style.textContent = '@keyframes spin{to{transform:rotate(360deg)}}';
  document.head.appendChild(style);
}