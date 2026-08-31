"use client";

const sounds = [
  {
    label: "Eagle Baby!",
    emoji: "⛳",
    file: "/sounds/eaglebaby.mp3",
  },
  {
    label: "The Snore",
    emoji: "😴",
    file: "/sounds/snore.mp3",
  },
  
  {
    label: "Windows Error",
    emoji: "💻",
    file: "/sounds/windows-error.mp3",
  },
  {
    label: "Circus Time",
    emoji: "🎪",
    file: "/sounds/circus-sting.mp3",
  },
  {
    label: "Baby Crying",
    emoji: "👶",
    file: "/sounds/baby-crying.mp3",
  },
  {
    label: "Sarcastic Clap",
    emoji: "👏",
    file: "/sounds/sarcastic-clap.mp3",
  },
  {
    label: "Tiny Violin",
    emoji: "🎻",
    file: "/sounds/tiny-violin.mp3",
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
    <main className="min-h-screen bg-slate-100 px-4 pb-32 pt-6 text-slate-900">
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
              className="flex min-h-32 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm transition hover:border-green-300 hover:shadow-md active:scale-95 active:bg-green-50"
            >
              <span className="text-4xl">
                {sound.emoji}
              </span>

              <span className="mt-3 text-sm font-extrabold text-slate-900">
                {sound.label}
              </span>
            </button>
          ))}
        </section>

        <div className="mt-6 rounded-2xl bg-green-950 px-4 py-3 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-green-300">
            Swift Tees Soundboard
          </p>

          <p className="mt-1 text-sm font-semibold text-white">
            Best deployed immediately after somebody&apos;s
            worst shot of the day.
          </p>
        </div>
      </div>
    </main>
  );
}