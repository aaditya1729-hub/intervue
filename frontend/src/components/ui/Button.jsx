export default function Button({ children, variant='solid', ...props }){
  const cls = variant==='ghost' ? 'button ghost' : 'button';
  return (
    <button className={cls} {...props}>{children}</button>
  );
}