export default function Header({ title, right }){
  return (
    <div className="header">
      <div className="title">{title}</div>
      <div className="row">{right}</div>
    </div>
  );
}