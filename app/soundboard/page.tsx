"use client";

const sounds = [
  {
    label: "Eagle Baby!",
    emoji: "⛳",
    file: "/sounds/eaglebaby.mp3",
  },
  {
    label: "The Snore",
    emoji: "👏",
    file: "/sounds/snore.mp3",
  },
  {
    label: "Absolute disaster",
    emoji: "💥",
    file: "/sounds/disaster.mp3",
  },
  {
    label: "Air horn",
    emoji: "📣",
    file: "/sounds/air-horn.mp3",
  },
];

export default function SoundboardPage() {
  function playSound(file: string) {
    const audio = new Audio(file);
    audio.play().catch((error) => {
      console.error("Unable to play sound:", error);
    });
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 pb-28 pt-6 text-slate-900">
      <div className="mx-auto max-w-lg">
        <header className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-700">
            Swift Tees
          </p>

          <h1 className="mt-1 text-3xl font-black">
            Soundboard
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Choose wisely. Volume up.
          </p>
        </header>

        <section className="grid grid-cols-2 gap-3">
          {sounds.map((sound) => (
            <button
              key={sound.file}
              type="button"
              onClick={() => playSound(sound.file)}
              className="flex min-h-32 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm transition active:scale-95 active:bg-green-50"
            >
              <span className="text-4xl">{sound.emoji}</span>

              <span className="mt-3 text-sm font-extrabold">
                {sound.label}
              </span>
            </button>
          ))}
        </section>
      </div>
    </main>
  );
}