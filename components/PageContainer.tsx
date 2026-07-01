type PageContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export default function PageContainer({
  children,
  className = "",
}: PageContainerProps) {
  return (
    <main className={`min-h-screen bg-slate-100 text-slate-900 px-4 py-6 pb-28 ${className}`}>
      <div className="mx-auto w-full max-w-5xl">
        {children}
      </div>
    </main>
  );
}