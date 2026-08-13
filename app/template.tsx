export default function Template({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="page-transition flex flex-1 flex-col">
      <div className="page-transition-bar" aria-hidden />
      {children}
    </div>
  );
}
