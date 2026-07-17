import Link from "next/link";
import Image from "next/image";
import PageContainer from "@/components/PageContainer";

const attendees = [
  "Paul",
  "Gav",
  "John W",
  "Painy",
  "Liam",
  "Calp",
  "Alistair",
  "Dan",
  "Rick",
  "Chris Mc",
  "Chris",
  "Ian",
];

const photos = [
  "/images/mottram-march-2026/photo-1.png",
  "/images/mottram-march-2026/photo-2.jpeg",
  "/images/mottram-march-2026/photo-3.jpeg",
  "/images/mottram-march-2026/photo-5.png",
  "/images/mottram-march-2026/photo-6.png",
];

export default function MottramHallMarch2026Page() {
  return (
    <PageContainer className="bg-slate-100 text-slate-900">
      <Link
        href="/events"
        className="mb-4 inline-flex text-sm font-black text-green-700"
      >
        ← Back to Events
      </Link>

      <section className="rounded-3xl bg-green-950 p-5 text-white shadow-lg">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-green-300">
          Past Event
        </p>

        <h1 className="mt-2 text-3xl font-black tracking-tight">
          Mottram Hall
        </h1>

        <p className="mt-1 text-sm font-bold text-green-100">
          March 2026
        </p>
      </section>

      <section className="mt-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-2xl font-black text-green-950">
            🏌️ Players
          </h2>

          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-800">
            {attendees.length} Players
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {attendees.map((player) => (
            <div
              key={player}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-center text-sm font-black text-green-950 transition hover:bg-green-50"
            >
              {player}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-2xl font-black text-green-950">
            📸 Weekend Gallery
          </h2>

          <span className="text-sm font-bold text-slate-500">
            {photos.length} Photos
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {photos.map((photo, index) => (
            <Link
              key={photo}
              href={photo}
              target="_blank"
              className={`relative overflow-hidden rounded-2xl bg-slate-200 shadow-sm ${
                index === 0 ? "col-span-2 aspect-[16/10]" : "aspect-square"
              }`}
            >
              <Image
                src={photo}
                alt={`Mottram Hall ${index + 1}`}
                fill
                sizes={
                  index === 0
                    ? "(max-width:768px) 100vw, 768px"
                    : "(max-width:768px) 50vw, 384px"
                }
                className="object-cover transition duration-300 hover:scale-105"
              />
            </Link>
          ))}
        </div>
      </section>
    </PageContainer>
  );
}