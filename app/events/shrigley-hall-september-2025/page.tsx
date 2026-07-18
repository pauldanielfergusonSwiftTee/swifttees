import Link from "next/link";
import PageContainer from "@/components/PageContainer";
import ImageGallery from "@/components/ImageGallery";

const attendees = [
  "Chris Mc",
  "Liam",
  "Wrighty",
  "Stu",
  "Gav",
  "John W",
  "Calp",
  "Paul",
 
];

const photos = [
  {
    src: "/images/shrigley-25/shrigley-5.png",
    alt: "Shrigley Hall golf weekend photo 5",
  },
  {
    src: "/images/shrigley-25/shrigley-1.jpeg",
    alt: "Shrigley Hall golf weekend photo 1",
  },
  {
    src: "/images/shrigley-25/shrigley-2.jpeg",
    alt: "Shrigley Hall golf weekend photo 2",
  },
  {
    src: "/images/shrigley-25/shrigley-3.png",
    alt: "Shrigley Hall golf weekend photo 3",
  },
  {
    src: "/images/shrigley-25/shrigley-4.png",
    alt: "Shrigley Hall golf weekend photo 4",
  },
  
];

export default function ShrigleyHallSeptember2025Page() {
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
          Shrigley Hall
        </h1>

        <p className="mt-1 text-sm font-bold text-green-100">
          September 2025
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

       <div className="flex flex-wrap gap-2">
  {attendees.map((player) => (
    <div
      key={player}
      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-bold text-slate-800 transition hover:bg-green-50"
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

       
       <ImageGallery images={photos} />

      </section>
    </PageContainer>
  );
}