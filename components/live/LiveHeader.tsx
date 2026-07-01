type LiveHeaderProps = {
  event: string;
  round: string;
  currentHole: number;
};

export default function LiveHeader({
  event,
  round,
  currentHole,
}: LiveHeaderProps) {
  return (
    <div className="rounded-3xl bg-green-950 p-6 text-white shadow-lg">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-green-300">
        🔥 Live Weekend
      </p>

      <h1 className="mt-2 text-3xl font-black">
        {event}
      </h1>

      <div className="mt-4 flex items-center gap-3">
        <span className="rounded-full bg-green-700 px-3 py-1 text-sm font-bold">
          {round}
        </span>

        <span className="rounded-full bg-white/10 px-3 py-1 text-sm">
          Hole {currentHole} of 18
        </span>
      </div>
    </div>
  );
}