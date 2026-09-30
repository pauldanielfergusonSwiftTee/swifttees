"use client";
import Image from "next/image";
import Link from "next/link";
import { worsleySundayScores as sundayScores, worsleyMondayScores as mondayScores } from "@/lib/history/worsley-park-2026";
import { useEffect, useRef, useState } from "react";
// Save these eight photos in public/images/worsley-park/ using the exact .jpg names below.
const weekendPhotos: { src: string; alt: string }[] = [
  { src: "/images/worsley-park/worsley26-01.jpeg", alt: "Worsley 26" },
  { src: "/images/worsley-park/worsley26-02.jpeg", alt: "Worsley 26" },
  { src: "/images/worsley-park/worsley26-03.jpeg", alt: "Worsley 26" },
  { src: "/images/worsley-park/worsley26-04.jpg", alt: "Worsley 26" },
  { src: "/images/worsley-park/worsley26-05.JPG", alt: "Worsley 26" },
  { src: "/images/worsley-park/worsley26-06.JPG", alt: "The Boys" },
  { src: "/images/worsley-park/worsley26-07.JPG", alt: "Do you do soup in a basket?" },
  { src: "/images/worsley-park/worsley26-08.JPG", alt: "The last ones standing" },
];
const galleryImages = weekendPhotos;
const moments = [
  { icon: "⏳", title: "Hurry up and wait", text: "A slow Sunday, a bit of rain and plenty of time to contemplate the last shot. Three groups called it a day. Swift Tees stayed the course, even if the walk between shots occasionally felt like the quickest part of the round." },
  { icon: "🍽️", title: "Gravy. Straight from the plate.", text: "The carvery went down very well. Carl took that appreciation a stage further by drinking the gravy straight off his plate. A strong endorsement for the kitchen, and a bold new direction for table manners." },
  { icon: "🍺", title: "All drink. No dinner.", text: "John decided the bar was a better use of his evening than tea and kept going until breakfast the next morning. The rest of us enjoyed the food. John remained committed to the liquid side of the hospitality." },
  { icon: "🌙", title: "Last men standing. Just about.", text: "Plenty of early nights left Liam and Stu as the last two out. The time? A fearsome 10:45pm. Less a wild night out, more a respectable bedtime with witnesses. There is photographic evidence." },
  { icon: "🥇", title: "First attempt. Perfect G.", text: "Despite being an avid Guinness drinker, John had never tried to split the G. Naturally, he nailed it on his first attempt. One of the weekend’s cleanest finishes, and conveniently one that did not involve a putter." },
  { icon: "🦜", title: "Parakeets, not birdies", text: "Monday’s green parakeets in the trees provided a welcome bit of wildlife spotting. After Sunday produced just one birdie on the scorecards, it was nice to see some birds enjoying themselves around the course." },
  { icon: "🥣", title: "Soup in a basket", text: "John asking everyone about soup in a basket became another addition to the weekend’s conversation. Some trips leave you discussing the golf. This one also left us discussing how soup might cope with wicker." },
  { icon: "🚗", title: "We going out for a drink?", text: "The golf was finished. The bags were packed. We were in the car going home. John, however, was still asking about going out for a drink. The official competition had ended; his weekend clearly had not." },
];
const holePars = [4, 4, 4, 3, 5, 5, 3, 4, 3, 4, 3, 4, 5, 3, 4, 4, 4, 5];
export default function WorsleyParkWeekendReviewPage() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const closeButton = useRef<HTMLButtonElement | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const isOpen = lightboxIndex !== null;
  function move(direction: number) {
    setLightboxIndex((current) => current === null ? null : (current + direction + galleryImages.length) % galleryImages.length);
  }
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setLightboxIndex(null);
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        const step = event.key === "ArrowLeft" ? -1 : 1;
        setLightboxIndex((current) => current === null ? null : (current + step + galleryImages.length) % galleryImages.length);
      }
      if (event.key === "Tab") {
        const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-review-dialog] button"));
        const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
        event.preventDefault();
        buttons[(current + (event.shiftKey ? -1 : 1) + buttons.length) % buttons.length]?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
      opener.current?.focus();
    };
  }, [isOpen]);
  return (
    <main className="min-h-screen bg-[#f3f1eb] text-slate-950">
      <section className="relative overflow-hidden bg-[#07111f] text-white">
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-[#07111f] to-blue-950" />
        <Image
          src="/images/worsley-park/worsleymain.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/40 to-[#07111f]/95" />
        <div className="relative mx-auto flex min-h-[70vh] max-w-6xl flex-col justify-end px-5 pb-14 pt-28 sm:px-8 lg:px-10 lg:pb-20">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-lime-300">Swift Tees • Worsley Park 2026 • Weekend Review</p>
          <h1 className="mt-6 max-w-5xl text-5xl font-black leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl">Fast Greens.<span className="block text-lime-300">Early Nights.</span></h1>
          <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-200 sm:text-xl">Two days of golf, one very patient Sunday, a proper breakfast and a man who still wanted another drink on the way home. Worsley gave us plenty to take away.</p>
          <p className="mt-8 text-xs font-black uppercase leading-6 tracking-[0.18em] text-white/70">Marriott Worsley Park • 27–28 September 2026 • 36 Holes • 9 Golfers</p>
          <Link href="/events/worsley-park-2026" className="mt-6 w-fit text-sm font-bold text-lime-300 underline underline-offset-4">Back to the Worsley weekend</Link>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
        <div className="grid gap-7 lg:grid-cols-[1.35fr_.65fr]">
          <article className="rounded-[2rem] bg-white p-7 shadow-sm sm:p-10">
            <p className="text-xl leading-9 text-slate-700 sm:text-2xl">Nine mates, three teams and another weekend that gave the group plenty to talk about long after the last putt.</p>
            <p className="mt-6 leading-8 text-slate-600">Worsley was a proper test. The course was tough, the greens were fast and Sunday made everyone work for their points. There were good shots, expensive mistakes and a fair amount of standing around wondering when we could hit the next one.</p>
            <p className="mt-5 leading-8 text-slate-600">Away from the course, the hotel and food were a real highlight. A good carvery, a 10/10 Monday breakfast and the usual conversations that somehow became the weekend’s running jokes. Thanks to everyone for another brilliant trip and for keeping the scores coming in.</p>
          </article>
          <aside className="overflow-hidden rounded-[2rem] bg-[#0b1728] p-7 text-white sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-lime-300">The weekend in numbers</p>
            <div className="mt-6 grid grid-cols-2 gap-5">
              <Stat value="83" label="Paul · champion" />
              <Stat value="211" label="Blues · team points" />
              <Stat value="1" label="Sunday birdie" />
              <Stat value="36" label="Liam · Monday points" />
              <Stat value="10/10" label="Monday breakfast" />
              <Stat value="10:45" label="Sunday · last out" />
            </div>
          </aside>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-5 pb-12 sm:px-8 lg:px-10 lg:pb-16">
        <article className="rounded-[2rem] bg-white p-7 shadow-sm sm:p-10 lg:p-12">
          <Eyebrow>Sunday • Day One</Eyebrow>
          <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">A long round. A strong start.</h2>
          <div className="mt-7 grid gap-8 lg:grid-cols-2">
            <div className="space-y-5 leading-8 text-slate-600">
              <p>Sunday’s scramble came with a bit of rain and a lot of waiting. Slow play tested the patience, three groups quit, and “hurry up and wait” felt like a reasonable description of proceedings. The course and quick greens made sure the golf itself offered little respite.</p>
              <p>Paul’s scramble score of <strong className="text-slate-950">43 Stableford points from a gross 82</strong> set the pace. Liam and Calp, and Carl and Stu, both returned 39, with Ian’s scramble entry on 38. There were useful points on the board, but Worsley was making everyone earn them.</p>
              <p>The day produced just <strong className="text-slate-950">one birdie</strong>: Chris Mc’s scramble entry on the 18th. A good way to finish, and an indication of how difficult the course was playing. Birdies were very much a limited edition.</p>
            </div>
            <div className="space-y-5 leading-8 text-slate-600">
              <p>Paul also picked up nearest the pin on holes 7, 9 and 14, adding six bonus points to his individual tally. Carl claimed nearest the pin on 4 and longest drive on 18. By the end of Sunday, Paul had an <strong className="text-slate-950">eight-point overall lead</strong> to take into Monday.</p>
              <p>Then came the carvery. The food earned plenty of praise, particularly from Carl, who dispensed with the cutlery for the final gravy and drank it straight off his plate. John skipped dinner entirely to stay in the bar. Two very different approaches to the evening meal.</p>
              <p>Despite all that, it was a surprisingly sensible night. Most headed off early, leaving Liam and Stu to close proceedings at 10:45pm. The last men standing were, by most standards, still getting an early night.</p>
            </div>
          </div>
        </article>
      </section>
      <section className="mx-auto max-w-6xl px-5 pb-12 sm:px-8 lg:px-10 lg:pb-16">
        <div className="rounded-[2rem] bg-gradient-to-br from-[#0b1728] via-[#12324a] to-emerald-800 p-8 text-white sm:p-14">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-lime-300">Sunday’s nightlife report</p>
          <p className="mt-6 text-4xl font-black leading-tight tracking-tight sm:text-6xl">Last two in the bar.<span className="block text-lime-300">10:45pm.</span></p>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">Liam and Stu keeping the Swift Tees party alive. Briefly.</p>
        </div>
      </section>
      <section className="bg-[#0b1728] py-14 text-white lg:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[.7fr_1.3fr]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-lime-300">Monday • Day Two</p>
              <h2 className="mt-4 text-5xl font-black tracking-tight sm:text-6xl">Breakfast first.<span className="block text-lime-300">Business next.</span></h2>
              <p className="mt-7 text-lg leading-8 text-slate-300">A 10/10 breakfast. A fresh scorecard. And green parakeets in the trees offering a different sort of birdie watch.</p>
            </div>
            <article className="space-y-5 text-lg leading-8 text-slate-300">
              <p><strong className="text-white">Liam had a great second day</strong>, leading Monday’s Stableford with 36 points from a gross 93. His birdie on the 12th was one of just two on the day, and his round gave the Greens a strong contribution to their team total.</p>
              <p><strong className="text-white">Paul finished one Stableford point behind</strong> on 35, with the day’s lowest gross score of 92 and a birdie on the 10th. Added to Sunday’s 43 points and six bonuses, that made 83 for the weekend and secured the individual title.</p>
              <p><strong className="text-white">Carl played well on the second day</strong> and added another nearest-the-pin win on the 4th to his weekend collection. Alongside Paul and Stu, he finished as part of the winning Blues. <strong className="text-white">Adam’s golf is coming along too</strong>, with 25 Stableford points on Monday and more encouraging progress to take home.</p>
              <p>Chris Mc also returned 25 Stableford points and took nearest the pin on 7. Ian collected nearest the pin on 9 and longest drive on 18, adding four bonus points. With fast greens and plenty of difficult holes, those extras were useful additions to the scorecards.</p>
              <p>The closing holes gave the live commentary plenty of material about repairs, pressure and scorecards best forgotten. The final results, though, were clear: <strong className="text-white">Blues won the team competition with 211 points. Paul was the Worsley Weekend champion with 83.</strong></p>
            </article>
          </div>
          <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-7 sm:p-10">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-lime-300">From the live commentary archive</p>
            <blockquote className="mt-4 text-2xl font-black leading-snug sm:text-3xl">“There are no pictures on the scorecard.”</blockquote>
            <p className="mt-4 leading-7 text-slate-300">Probably for the best after some of those closing holes. Fortunately, the weekend gave us plenty worth remembering elsewhere.</p>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10 lg:py-20">
        <Eyebrow>Off the scorecard</Eyebrow>
        <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">The bits we’ll remember.</h2>
        <div className="mt-9 grid gap-5 md:grid-cols-2">
          {moments.map((moment) => <article key={moment.title} className="rounded-[1.7rem] bg-white p-7 shadow-sm ring-1 ring-slate-200/70"><span aria-hidden="true" className="text-4xl">{moment.icon}</span><h3 className="mt-4 text-2xl font-black">{moment.title}</h3><p className="mt-3 leading-8 text-slate-600">{moment.text}</p></article>)}
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-5 pb-14 sm:px-8 lg:px-10 lg:pb-20">
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-[2rem] bg-blue-950 p-8 text-white sm:p-12">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-300">Worsley 2026 • Team Champions</p>
            <h2 className="mt-4 text-5xl font-black">The Blues.</h2>
            <p className="mt-5 text-7xl font-black tracking-tight text-lime-300">211<span className="ml-2 text-lg">points</span></p>
            <p className="mt-6 text-xl font-black">Carl • Paul • Stu</p>
            <p className="mt-5 leading-8 text-slate-300">Captain Carl, Paul and Stu leave Worsley with the team honours. Two days of points, bonus wins and the occasional difficult hole added up to the winning total.</p>
          </article>
          <article className="rounded-[2rem] bg-emerald-800 p-8 text-white sm:p-12">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-lime-300">Worsley 2026 • Weekend Champion</p>
            <h2 className="mt-4 text-5xl font-black">Paul.</h2>
            <p className="mt-5 text-7xl font-black tracking-tight text-lime-300">83<span className="ml-2 text-lg">points</span></p>
            <p className="mt-6 text-xl font-black">43 Sunday + 6 bonus + 35 Monday</p>
            <p className="mt-5 leading-8 text-emerald-50">A strong opening scramble, three nearest-the-pin wins and a solid Monday secured the individual trophy. A team win as well made it a very good weekend to be wearing blue.</p>
          </article>
        </div>
      </section>
      <section className="bg-white py-14 lg:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
          <Eyebrow>The scorecards</Eyebrow>
          <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Every hole. Both days.</h2>
          <p className="mt-4 leading-8 text-slate-600">Swipe across for all 18 holes. Sunday bonuses belong to the individual winner and are separate from the scramble entry’s Stableford score.</p>
          <Scorecard title="Sunday · Round 1 · Scramble" rows={sundayScores} showBonus={false} />
          <BonusWinners items={["Hole 4 · Nearest pin · Carl", "Hole 7 · Nearest pin · Paul", "Hole 9 · Nearest pin · Paul", "Hole 14 · Nearest pin · Paul", "Hole 18 · Longest drive · Carl"]} />
          <Scorecard title="Monday · Round 2 · Stableford" rows={mondayScores} showBonus />
          <BonusWinners items={["Hole 4 · Nearest pin · Carl", "Hole 7 · Nearest pin · Chris Mc", "Hole 9 · Nearest pin · Ian", "Hole 18 · Longest drive · Ian"]} />
          {galleryImages.length > 0 && <>
          <div className="mt-14"><Eyebrow>The evidence</Eyebrow><h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Weekend gallery.</h2><p className="mt-4 leading-8 text-slate-600">Tap an image to open it. Swipe or use the arrows to move between images.</p></div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {galleryImages.map((photo, index) => <button key={photo.src} type="button" onClick={(event) => { opener.current = event.currentTarget; setLightboxIndex(index); }} aria-label={`Open ${photo.alt}`} className="group overflow-hidden rounded-2xl bg-slate-100 text-left ring-1 ring-slate-200 focus-visible:outline-4 focus-visible:outline-emerald-700"><div className="relative aspect-[4/3]"><Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover transition duration-300 group-hover:scale-[1.02]" /></div><p className="px-5 py-4 text-sm font-bold text-slate-600">{photo.alt} <span aria-hidden="true">↗</span></p></button>)}
          </div>
          </>}
        </div>
      </section>
      <section className="px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Until the next one</Eyebrow>
          <h2 className="mt-4 text-5xl font-black tracking-tight sm:text-6xl">Another one for the group chat.</h2>
          <p className="mt-7 text-lg leading-8 text-slate-600">Good hotel. Great food. Tough golf. Plenty of laughs. From a solitary Sunday birdie to Carl’s gravy technique, Worsley supplied its own collection of stories.</p>
          <p className="mt-5 text-lg leading-8 text-slate-600">These weekends take a bit of organising, but getting everyone together makes it worth it. Another couple of days out of the usual routine, playing golf with mates and coming home with more jokes than we left with.</p>
          <p className="mt-8 text-2xl font-black text-emerald-800">Roll on the next one.</p>
          <p className="mt-3 font-semibold text-slate-600">John would probably prefer it to start tonight.</p>
        </div>
      </section>
      <section className="bg-[#07111f] px-5 py-20 text-center text-white sm:px-8 lg:py-28">
        <p className="mx-auto max-w-5xl text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-7xl">The golf was finished.<span className="mt-2 block text-lime-300">John wasn’t.</span></p>
        <p className="mt-8 text-sm font-black uppercase tracking-[0.24em] text-slate-400">Swift Tees • Worsley Park 2026</p>
      </section>
      {lightboxIndex !== null && <div data-review-dialog role="dialog" aria-modal="true" aria-label="Weekend gallery" className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 p-3 sm:p-6" onClick={() => setLightboxIndex(null)} onTouchStart={(event) => { const touch = event.touches[0]; touchStart.current = touch ? { x: touch.clientX, y: touch.clientY } : null; }} onTouchEnd={(event) => { const start = touchStart.current; const end = event.changedTouches[0]; if (start && end) { const dx = end.clientX - start.x; const dy = end.clientY - start.y; if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? -1 : 1); } touchStart.current = null; }}>
        <button ref={closeButton} type="button" aria-label="Close gallery" onClick={(event) => { event.stopPropagation(); setLightboxIndex(null); }} className="absolute right-4 z-50 h-14 w-14 rounded-full bg-black/70 text-3xl text-white focus-visible:outline-2 focus-visible:outline-lime-300" style={{ top: "max(1rem, calc(env(safe-area-inset-top) + 0.75rem))" }}>×</button>
        <p className="absolute left-4 top-5 z-30 rounded-full bg-black/70 px-4 py-2 text-sm font-bold text-white" aria-live="polite">{lightboxIndex + 1} / {galleryImages.length}</p>
        <button type="button" aria-label="Previous image" onClick={(event) => { event.stopPropagation(); move(-1); }} className="absolute left-3 top-1/2 z-30 h-12 w-12 -translate-y-1/2 rounded-full bg-black/70 text-4xl text-white focus-visible:outline-2 focus-visible:outline-lime-300">‹</button>
        <div className="relative h-[78dvh] w-full max-w-[1500px]" onClick={(event) => event.stopPropagation()}><Image src={galleryImages[lightboxIndex].src} alt={galleryImages[lightboxIndex].alt} fill sizes="100vw" className="object-contain" /></div>
        <button type="button" aria-label="Next image" onClick={(event) => { event.stopPropagation(); move(1); }} className="absolute right-3 top-1/2 z-30 h-12 w-12 -translate-y-1/2 rounded-full bg-black/70 text-4xl text-white focus-visible:outline-2 focus-visible:outline-lime-300">›</button>
        <p className="pointer-events-none absolute bottom-5 left-4 right-4 text-center text-sm font-semibold text-white"><span className="inline-block rounded-full bg-black/70 px-5 py-2">{galleryImages[lightboxIndex].alt}</span></p>
      </div>}
    </main>
  );
}
function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-700">{children}</p>;
}
function Stat({ value, label }: { value: string; label: string }) {
  return <div className="border-t border-white/10 pt-4"><p className="text-3xl font-black tracking-tight text-lime-300">{value}</p><p className="mt-2 text-xs font-bold uppercase leading-5 tracking-wider text-slate-300">{label}</p></div>;
}
function Scorecard({ title, rows, showBonus }: { title: string; rows: { name: string; holes: number[]; gross: number; stableford: number; bonus: number }[]; showBonus: boolean }) {
  return <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200">
    <h3 className="bg-[#0b1728] px-5 py-5 text-xl font-black text-white">{title}</h3>
    <p className="px-5 py-3 text-xs font-semibold text-slate-600">Par 71 · Green: birdie · Blue: par · Boxed: bogey · Double boxed: double bogey or worse</p>
    <div className="overflow-x-auto" tabIndex={0} role="region" aria-label={`${title} scrollable scorecard`}>
      <table className="w-full min-w-[1400px] border-collapse text-center text-sm">
        <caption className="sr-only">{title}: hole scores, gross and points</caption>
        <thead className="bg-slate-100"><tr><th scope="col" className="sticky left-0 z-10 min-w-40 bg-slate-100 px-4 py-4 text-left">Player / entry</th>{holePars.map((par, i) => <th key={i} scope="col" className="min-w-12 border-l border-slate-200 px-2 py-3">{i + 1}<span className="block text-[10px] font-normal text-slate-500">Par {par}</span></th>)}<th scope="col" className="px-3">Out</th><th scope="col" className="px-3">In</th><th scope="col" className="px-3">Gross</th><th scope="col" className="px-3">Stableford</th>{showBonus && <><th scope="col" className="px-3">Bonus</th><th scope="col" className="px-3">Total</th></>}</tr></thead>
        <tbody>{rows.map((row) => <tr key={row.name} className="border-t border-slate-200 even:bg-slate-50"><th scope="row" className="sticky left-0 z-10 bg-white px-4 py-4 text-left font-bold shadow-sm">{row.name}</th>{row.holes.map((score, i) => { const difference = score - holePars[i]; return <td key={i} className="border-l border-slate-100 px-2 py-3"><span className={`inline-flex h-7 w-7 items-center justify-center font-bold ${difference < 0 ? "rounded-full border border-emerald-500 bg-emerald-50 text-emerald-800" : difference === 0 ? "text-blue-800" : difference === 1 ? "border border-slate-500" : "border-[3px] border-double border-slate-500"}`}>{score}</span></td>; })}<td className="px-3 font-bold">{row.holes.slice(0,9).reduce((a,b) => a+b,0)}</td><td className="px-3 font-bold">{row.holes.slice(9).reduce((a,b) => a+b,0)}</td><td className="px-3 font-black">{row.gross}</td><td className="px-3 font-black">{row.stableford}</td>{showBonus && <><td className="bg-amber-50 px-3 font-bold">{row.bonus}</td><td className="bg-[#0b1728] px-3 font-black text-white">{row.stableford + row.bonus}</td></>}</tr>)}</tbody>
      </table>
    </div>
  </div>;
}
function BonusWinners({ items }: { items: string[] }) {
  return <div className="mt-4 rounded-2xl border border-slate-200 p-5"><h4 className="text-xs font-black uppercase tracking-wider text-slate-500">Round bonus winners</h4><ul className="mt-3 grid gap-3 sm:grid-cols-2">{items.map((item) => <li key={item} className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-bold">{item}</li>)}</ul></div>;
}
