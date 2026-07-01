type PageHeaderProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
};

export default function PageHeader({
  title,
  subtitle,
  eyebrow,
}: PageHeaderProps) {
  return (
    <header className="mb-6">
      {eyebrow && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-green-700">
          {eyebrow}
        </p>
      )}

      <h1 className="text-3xl font-black tracking-tight text-green-950 sm:text-4xl">
        {title}
      </h1>

      {subtitle && (
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
          {subtitle}
        </p>
      )}
    </header>
  );
}