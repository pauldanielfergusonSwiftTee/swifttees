// app/events/carden-park-2026/weekend-review/page.tsx

import Image from "next/image";
import Link from "next/link";

const galleryImages = [
  {
    src: "/images/carden-park-2026/weekend-1.jpg",
    alt: "Swift Tees at Carden Park",
  },
  {
    src: "/images/carden-park-2026/weekend-2.jpg",
    alt: "Golf at Carden Park",
  },
  {
    src: "/images/carden-park-2026/weekend-3.jpg",
    alt: "Swift Tees weekend",
  },
  {
    src: "/images/carden-park-2026/weekend-4.jpg",
    alt: "Carden Park golf weekend",
  },
  {
    src: "/images/carden-park-2026/weekend-5.jpg",
    alt: "Swift Tees players",
  },
  {
    src: "/images/carden-park-2026/weekend-6.jpg",
    alt: "Swift Tees memories",
  },
];

const weekendMoments = [
  {
    icon: "🦅",
    title: "Eagle Baby!",
    text: "Ian's eagle. Painy's celebration. An instant Swift Tees classic — and somehow nobody recorded it.",
  },
  {
    icon: "🥩",
    title: "The Steak",
    text: "Poor Adam very nearly managed to choke himself to death attempting to inhale approximately half a cow in one mouthful. Thankfully he survived. The steak's reputation didn't.",
  },
  {
    icon: "🚀",
    title: "Longest Drive",
    text: "Paul claimed it with a monster 310-yard effort. Yes, downhill. Yes, helping breeze. No, nobody cares. It still counts.",
  },
  {
    icon: "🎤",
    title: "Carpool Karaoke",
    text: "The playlist was questionable. The singing even more so. The commitment? Absolutely faultless.",
  },
  {
    icon: "👕",
    title: "Fashion Report",
    text: "Taz took best dressed with the green tops. Paul looked like he'd come straight from a shift at Asda. Tight shorts and white ankles completed the look.",
  },
  {
    icon: "💨",
    title: "Atmospheric Conditions",
    text: "Wrighty and Phil produced an environmental incident so severe that even standing outside after the golf wasn't enough.",
  },
];

const champions = ["Gav", "Wrighty", "Carl", "Adam"];

export default function CardenParkWeekendReviewPage() {
  return (
    <main className="min-h-screen bg-[#f3f1eb] text-slate-950">
      {/* HERO */}
      <section className="relative overflow-hidden bg-[#07111f] text-white">
        <div className="absolute inset-0">
          <Image
            src="/images/carden-park-2026/hero.jpg"
            alt="Carden Park"
            fill
            priority
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#07111f]/35 via-[#07111f]/70 to-[#07111f]" />
        </div>

        <div className="relative mx-auto flex min-h-[72vh] max-w-6xl flex-col justify-end px-5 pb-12 pt-28 sm:px-8 sm:pb-16 lg:px-10">
          <div className="mb-5 flex flex-wrap items-center gap-3 text-xs font-black uppercase tracking-[0.24em] text-lime-300">
            <span>Swift Tees</span>
            <span className="h-1 w-1 rounded-full bg-white/40" />
            <span>Carden Park 2026</span>
            <span className="h-1 w-1 rounded-full bg-white/40" />
            <span>Weekend Review</span>
          </div>

          <h1 className="max-w-5xl text-5xl font-black leading-[0.93] tracking-tight sm:text-6xl lg:text-8xl">
            Another Classic
            <span className="block text-lime-300">in the Books.</span>
          </h1>

          <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-200 sm:text-xl">
            Great golf. Questionable golf. Plenty of laughs. The odd disaster.
            And enough stories to keep the WhatsApp group going until the next trip.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/full-scorecard"
              className="rounded-full bg-lime-300 px-6 py-3 text-sm font-black text-slate-950 transition hover:bg-lime-200"
            >
              View Full Scorecards
            </Link>

            <Link
              href="/events"
              className="rounded-full border border-white/25 bg-white/5 px-6 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/10"
            >
              ← All Events
            </Link>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[1.35fr_.65fr]">
          <article className="rounded-[2rem] bg-white p-7 shadow-sm sm:p-10">
            <p className="text-xl leading-9 text-slate-700 sm:text-2xl">
              Another Swift Tees weekend has come and gone, and once again
              Carden Park delivered everything we&apos;ve come to expect.
            </p>

            <p className="mt-6 leading-8 text-slate-600">
              A huge thank you to everyone for making it another brilliant
              weekend, and to everyone who helped with scoring throughout.
            </p>

            <p className="mt-5 leading-8 text-slate-600">
              This also marked the first full tournament using the new{" "}
              <strong className="text-slate-950">Swift Tees app</strong>. Live
              scoring, live leaderboards and instant updates became a genuine
              part of the weekend and added another layer to the competition.
            </p>

            <p className="mt-5 leading-8 text-slate-600">
              This is only the start. Proper handicaps, richer live commentary,
              automatic group updates, season-long rankings and hopefully some
              decent prize pots are all on the horizon.
            </p>
          </article>

          <aside className="rounded-[2rem] bg-[#0b1728] p-7 text-white shadow-sm sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-lime-300">
              Carden Park 2026
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Stat value="2" label="Days" />
              <Stat value="12" label="Players" />
              <Stat value="36" label="Holes" />
              <Stat value="∞" label="Stories" />
            </div>

            <div className="mt-6 border-t border-white/10 pt-6">
              <p className="text-sm leading-6 text-slate-300">
                The golf was competitive.
                <br />
                The fashion less so.
              </p>
            </div>
          </aside>
        </div>
      </section>

      {/* DAY ONE */}
      <section className="mx-auto max-w-6xl px-5 pb-12 sm:px-8 lg:px-10 lg:pb-16">
        <div className="grid overflow-hidden rounded-[2rem] bg-white shadow-sm lg:grid-cols-2">
          <div className="relative min-h-[360px] lg:min-h-full">
            <Image
              src="/images/carden-park-2026/day-one.jpg"
              alt="Day one at Carden Park"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            <div className="absolute bottom-5 left-5 right-5">
              <span className="inline-flex rounded-full bg-white/95 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-950">
                Day One
              </span>
            </div>
          </div>

          <article className="p-7 sm:p-10 lg:p-12">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-700">
              Saturday
            </p>

            <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
              White Team Strike First
            </h2>

            <p className="mt-7 leading-8 text-slate-600">
              Despite an early panic over whether there would be enough buggies,
              everything was soon sorted and Carden Park was ready for another
              Swift Tees classic.
            </p>

            <p className="mt-5 leading-8 text-slate-600">
              From the opening few holes it became obvious this wasn&apos;t
              going to be a one-sided contest. Every time one team threatened
              to pull away, another score came in to drag them straight back.
            </p>

            <p className="mt-5 leading-8 text-slate-600">
              <strong className="text-slate-950">Wrighty and Carl</strong>{" "}
              immediately set the pace for White Team, while{" "}
              <strong className="text-slate-950">Stu and Liam</strong> produced
              a superb round to finish second.
            </p>

            <p className="mt-5 leading-8 text-slate-600">
              <strong className="text-slate-950">Dan and Phil</strong> quietly
              put together an excellent scramble of their own, while{" "}
              <strong className="text-slate-950">Paul and Taz</strong> did
              enough to keep themselves firmly in contention heading into Monday.
            </p>

            <blockquote className="mt-8 border-l-4 border-lime-400 pl-5">
              <p className="text-3xl font-black italic tracking-tight text-slate-950">
                “EAGLE BABY!”
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-500">
                Ian & Painy
              </p>
            </blockquote>

            <p className="mt-6 leading-8 text-slate-600">
              Ian&apos;s eagle was undoubtedly the golfing moment of the
              weekend. The only disappointment? Nobody managed to capture it on
              camera. The celebration will probably be remembered longer than
              the shot itself.
            </p>
          </article>
        </div>
      </section>

      {/* FULL WIDTH PHOTO */}
      <section className="mx-auto max-w-6xl px-5 pb-12 sm:px-8 lg:px-10 lg:pb-16">
        <div className="relative min-h-[420px] overflow-hidden rounded-[2rem] bg-slate-900 shadow-sm">
          <Image
            src="/images/carden-park-2026/feature-wide.jpg"
            alt="Swift Tees Carden Park weekend"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/25 to-transparent" />

          <div className="absolute inset-0 flex max-w-xl items-end p-7 sm:p-10">
            <p className="text-3xl font-black leading-tight text-white sm:text-4xl">
              Every time one team threatened to pull away, somebody else dragged
              them straight back.
            </p>
          </div>
        </div>
      </section>

      {/* DAY TWO */}
      <section className="bg-[#0b1728] py-14 text-white lg:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[.7fr_1.3fr]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-lime-300">
                Monday
              </p>

              <h2 className="mt-3 text-5xl font-black tracking-tight sm:text-6xl">
                Everything
                <span className="block text-lime-300">Changes.</span>
              </h2>

              <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
                <p className="text-2xl font-black leading-snug">
                  Some players found another gear overnight.
                </p>
                <p className="mt-3 text-2xl font-black leading-snug text-lime-300">
                  Others found another beer.
                </p>
              </div>
            </div>

            <article className="space-y-5 text-lg leading-8 text-slate-300">
              <p>
                Wrighty began Monday sitting proudly at the top of the
                individual leaderboard, but with only a handful of Stableford
                points separating the leading players, everyone knew one good
                run could change everything.
              </p>

              <p>
                <strong className="text-white">Carl</strong>, after what appeared
                to be an excellent night&apos;s sleep, simply carried on where
                he&apos;d left off. Calm, consistent and relentlessly scoring,
                he became one of the biggest reasons White Team stayed in control.
              </p>

              <p>
                <strong className="text-white">Gav</strong>... after what
                appeared to be rather less sleep... somehow still produced when
                it mattered. Rumours he spent the night sleeping in a hedge
                remain unconfirmed, although nobody has completely ruled it out.
              </p>

              <p>
                As predicted before the weekend,{" "}
                <strong className="text-white">Liam&apos;s beers</strong>{" "}
                gradually went from helping to hindering. By Monday, teeing off
                with a putter probably wasn&apos;t the ideal preparation for a
                charge up the leaderboard.
              </p>
            </article>
          </div>

          {/* THE COMEBACK */}
          <div className="mt-12 rounded-[2rem] bg-white p-7 text-slate-950 sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[.55fr_1.45fr] lg:items-center">
              <div>
                <p className="text-7xl font-black tracking-tight text-emerald-700">
                  -8
                </p>
                <p className="mt-1 text-sm font-black uppercase tracking-[0.18em] text-slate-500">
                  Starting deficit
                </p>
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700">
                  The Charge
                </p>

                <h3 className="mt-2 text-3xl font-black sm:text-4xl">
                  Paul hunts down the overnight lead
                </h3>

                <p className="mt-5 leading-8 text-slate-600">
                  Starting Monday eight points behind overnight leader Wrighty,
                  Paul slowly chipped away at the deficit. Hole after hole,
                  point after point, the gap disappeared until he eventually
                  completed the comeback and moved into first place during the
                  closing stages.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <StoryCard
              title="The Late Charge"
              text="Stu and Adam both produced excellent runs of Stableford points over the closing stretch, climbing the standings and keeping pressure on those around them."
            />

            <StoryCard
              title="The Shots"
              text="Stu launched one on the 15th with one of the biggest drives of the weekend, while Wrighty's tee shot across the water and safely onto the 17th green earned its place in the highlights."
            />
          </div>
        </div>
      </section>

      {/* WEEKEND MOMENTS */}
      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10 lg:py-20">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-700">
            Away From The Leaderboard
          </p>

          <h2 className="mt-3 text-5xl font-black tracking-tight">
            Weekend Highlights
          </h2>

          <p className="mt-4 text-lg leading-8 text-slate-600">
            Because no Swift Tees weekend is ever remembered purely for the golf.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {weekendMoments.map((moment) => (
            <div
              key={moment.title}
              className="rounded-[1.7rem] bg-white p-7 shadow-sm ring-1 ring-slate-200/70"
            >
              <div className="text-4xl">{moment.icon}</div>
              <h3 className="mt-5 text-2xl font-black">{moment.title}</h3>
              <p className="mt-3 leading-7 text-slate-600">{moment.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CHAMPIONS */}
      <section className="mx-auto max-w-6xl px-5 pb-14 sm:px-8 lg:px-10 lg:pb-20">
        <div className="overflow-hidden rounded-[2rem] bg-[#07111f] text-white">
          <div className="grid lg:grid-cols-[1.1fr_.9fr]">
            <div className="p-8 sm:p-12 lg:p-14">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-300">
                2026 Team Champions
              </p>

              <h2 className="mt-3 text-5xl font-black tracking-tight">
                White Team
              </h2>

              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
                Pre-weekend predictions weren&apos;t far away, but when the
                final putt dropped there was only one team celebrating.
              </p>

              <p className="mt-5 max-w-xl leading-8 text-slate-300">
                An outstanding opening scramble combined with consistent
                Stableford scoring across Monday proved enough to take a
                thoroughly deserved victory.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {champions.map((name) => (
                  <div
                    key={name}
                    className="rounded-2xl bg-white/10 px-4 py-5 text-center"
                  >
                    <div className="text-2xl">🏆</div>
                    <div className="mt-2 font-black">{name}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative min-h-[360px]">
              <Image
                src="/images/carden-park-2026/champions.jpg"
                alt="White Team champions"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* PLAYER'S PLAYER */}
      <section className="mx-auto max-w-6xl px-5 pb-14 sm:px-8 lg:px-10 lg:pb-20">
        <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
          <div className="relative min-h-[420px] overflow-hidden rounded-[2rem] bg-slate-200">
            <Image
              src="/images/carden-park-2026/taz.jpg"
              alt="Taz - Players Player"
              fill
              className="object-cover"
            />
          </div>

          <div className="rounded-[2rem] bg-emerald-800 p-8 text-white sm:p-12">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-lime-300">
              Player&apos;s Player
            </p>

            <div className="mt-4 flex items-end gap-4">
              <span className="text-5xl">🏆</span>
              <h2 className="text-5xl font-black">Taz</h2>
            </div>

            <p className="mt-7 text-lg leading-8 text-emerald-50">
              Taking up golf isn&apos;t easy.
            </p>

            <p className="mt-4 text-lg leading-8 text-emerald-50">
              Taking up golf surrounded by eleven people all offering completely
              different advice after every shot is even harder.
            </p>

            <p className="mt-4 text-lg leading-8 text-emerald-50">
              Taz never let his head drop. He stayed calm, kept smiling,
              improved throughout the weekend and embraced every part of the
              experience.
            </p>

            <p className="mt-6 font-black text-lime-300">
              A thoroughly deserved Player&apos;s Player.
            </p>

            <div className="mt-8 border-t border-white/15 pt-6">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-200">
                Close Second
              </p>
              <p className="mt-2 leading-7 text-emerald-50">
                Phil, whose excellent golf throughout the weekend — particularly
                in the scramble alongside Dan — earned plenty of praise from the
                group.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section className="bg-white py-14 lg:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-700">
                Photos
              </p>
              <h2 className="mt-2 text-5xl font-black tracking-tight">
                Weekend Gallery
              </h2>
            </div>

            <p className="max-w-md text-sm leading-6 text-slate-500">
              Replace the image paths below with your favourite photos from the
              weekend.
            </p>
          </div>

          <div className="mt-10 grid auto-rows-[220px] grid-cols-2 gap-3 md:grid-cols-4">
            {galleryImages.map((image, index) => {
              const specialClasses =
                index === 0
                  ? "col-span-2 row-span-2"
                  : index === 3
                    ? "col-span-2"
                    : "";

              return (
                <div
                  key={image.src}
                  className={`group relative overflow-hidden rounded-2xl bg-slate-200 ${specialClasses}`}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* LOOKING AHEAD */}
      <section className="mx-auto max-w-4xl px-5 py-16 text-center sm:px-8 lg:py-24">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-700">
          Looking Ahead
        </p>

        <h2 className="mt-4 text-5xl font-black tracking-tight sm:text-6xl">
          Roll on the next one.
        </h2>

        <div className="mx-auto mt-8 max-w-3xl space-y-5 text-lg leading-8 text-slate-600">
          <p>
            If this weekend proved one thing, it&apos;s that the competition is
            getting stronger every year.
          </p>

          <p>
            Live scoring, proper handicaps, season-long rankings, richer
            commentary and bigger prize pots are all now within reach.
          </p>

          <p>
            Whether this tournament was decided by golfing ability or alcohol
            consumption will remain a topic of fierce debate.
          </p>

          <p>
            Some will argue the handicaps need changing.
            <br />
            Others will argue certain players simply need to sober up.
          </p>

          <p className="font-semibold text-slate-900">
            Another brilliant Swift Tees weekend.
            <br />
            Quite possibly the best one yet.
          </p>
        </div>
      </section>

      {/* FINAL QUOTE */}
      <section className="bg-[#07111f] px-5 py-20 text-center text-white sm:px-8 lg:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto mb-7 h-1 w-16 rounded-full bg-lime-300" />

          <p className="text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-7xl">
            The scores will be forgotten.
            <span className="mt-2 block text-lime-300">
              The stories won&apos;t.
            </span>
          </p>

          <p className="mt-8 text-sm font-black uppercase tracking-[0.28em] text-slate-400">
            Swift Tees • Carden Park 2026
          </p>
        </div>
      </section>
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-white/8 p-5">
      <div className="text-3xl font-black text-lime-300">{value}</div>
      <div className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </div>
    </div>
  );
}

function StoryCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[1.7rem] border border-white/10 bg-white/5 p-7">
      <h3 className="text-2xl font-black text-white">{title}</h3>
      <p className="mt-3 leading-7 text-slate-300">{text}</p>
    </div>
  );
}