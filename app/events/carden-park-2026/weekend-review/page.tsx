// app/events/carden-park-2026/weekend-review/page.tsx

"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const galleryImages = [
  {
    src: "/images/carden-park-2026/beersoutside.jpg",
    alt: "Beers outside after golf",
  },
  {
    src: "/images/carden-park-2026/buggy.jpg",
    alt: "Buggy at Carden Park",
  },
  {
    src: "/images/carden-park-2026/bunker.jpg",
    alt: "Golf action from the bunker",
  },
  {
    src: "/images/carden-park-2026/carts.jpeg",
    alt: "Golf carts at Carden Park",
  },
  {
    src: "/images/carden-park-2026/CheshireScorecard.png",
    alt: "Cheshire scramble scorecard",
  },
  {
    src: "/images/carden-park-2026/dan.jpg",
    alt: "Dan during the Swift Tees weekend",
  },
  {
    src: "/images/carden-park-2026/grouplandscape.jpg",
    alt: "Swift Tees group at Carden Park",
  },
  
  {
    src: "/images/carden-park-2026/lads.JPG",
    alt: "The lads at Carden Park",
  },
  {
    src: "/images/carden-park-2026/leaderboard.png",
    alt: "Carden Park leaderboard",
  },
  {
    src: "/images/carden-park-2026/limbo.JPG",
    alt: "Weekend antics at Carden Park",
  },
  {
    src: "/images/carden-park-2026/meal.jpg",
    alt: "Dinner at Carden Park",
  },
  {
    src: "/images/carden-park-2026/NicklausScorecard.png",
    alt: "Nicklaus Stableford scorecard",
  },
  {
    src: "/images/carden-park-2026/outsidelaugh.jpg",
    alt: "Laughs outside at Carden Park",
  },
  {
    src: "/images/carden-park-2026/smells.jpeg",
    alt: "Post-round laughs outside",
  },
  {
    src: "/images/carden-park-2026/smiles.JPG",
    alt: "Swift Tees smiles",
  },
  {
    src: "/images/carden-park-2026/taz.jpg",
    alt: "Taz at Carden Park",
  },
  {
    src: "/images/carden-park-2026/Teamleaderboard.jpg",
    alt: "Final team leaderboard",
  },
  {
    src: "/images/carden-park-2026/winnerswhites.jpg",
    alt: "White Team champions",
  },
];

const champions = ["Gav", "Wrighty", "Carl", "Adam"];

export default function CardenParkWeekendReviewPage() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const showPrevious = () => {
    setLightboxIndex((current) => {
      if (current === null) return null;
      return current === 0 ? galleryImages.length - 1 : current - 1;
    });
  };

  const showNext = () => {
    setLightboxIndex((current) => {
      if (current === null) return null;
      return current === galleryImages.length - 1 ? 0 : current + 1;
    });
  };

  useEffect(() => {
    if (lightboxIndex === null) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeLightbox();
      } else if (event.key === "ArrowLeft") {
        showPrevious();
      } else if (event.key === "ArrowRight") {
        showNext();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxIndex]);

  return (
    <main className="min-h-screen bg-[#f3f1eb] text-slate-950">
      {/* HERO */}
      <section className="relative overflow-hidden bg-[#07111f] text-white">
        <div className="absolute inset-0 overflow-hidden">
          <video
  autoPlay
  muted
  loop
  playsInline
  preload="auto"
  disablePictureInPicture
  className="absolute inset-0 h-full w-full object-cover"
>
  <source
    src="/videos/carden-park-2026/hero-drone.mp4"
    type="video/mp4"
  />
</video>

          <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/45 to-[#07111f]" />
        </div>

        <div className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-end px-5 pb-12 pt-28 sm:px-8 sm:pb-16 lg:px-10">
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
            Some great golf. Some questionable golf. Plenty of laughs. The odd disaster.
            And enough stories to keep the WhatsApp group going until the next trip.
          </p>

          <div className="mt-8 text-xs font-black uppercase tracking-[0.2em] text-white/70">
            Carden Park • Cheshire • July 26th- 27th 2026 • 36 Holes • 12 Golfers
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[1.35fr_.65fr]">
          <article className="rounded-[2rem] bg-white p-7 shadow-sm sm:p-10">
            <p className="text-xl leading-9 text-slate-700 sm:text-2xl">
              Another Swift Tees weekend has come and gone, and once again
              the weekend delivered everything we&apos;ve come to expect.
            </p>

            <p className="mt-6 leading-8 text-slate-600">
              A huge thank you to everyone for making it another brilliant weekend,
              and to everyone who helped with scoring throughout. 
            </p>

            <p className="mt-5 leading-8 text-slate-600">
              This also marked the first full tournament using the new{" "}
              <strong className="text-slate-950">Swift Tees app</strong>.
              Live scoring, live leaderboards and instant updates became a genuine
              part of the weekend and hopefully added another layer to the weekends.
            </p>

            <p className="mt-5 leading-8 text-slate-600">
              Am hopefully look at building in proper handicaps, richer live commentary,
              automatic WhatsApp updates, season-long rankings and hopefully some more
              decent features.
            </p>

            
          </article>

         <aside className="overflow-hidden rounded-[2rem] bg-[#0b1728] text-white shadow-sm">
  {/* HEADER */}
  <div className="p-7 pb-5 sm:p-8 sm:pb-5">
    <p className="text-xs font-black uppercase tracking-[0.24em] text-lime-300">
      Weekend by the Numbers
    </p>

    <h3 className="mt-2 text-2xl font-black tracking-tight">
      Carden Park 2026
    </h3>
  </div>

  {/* WEEKEND TOTALS */}
<div className="grid grid-cols-2 border-y border-white/10 sm:grid-cols-3">
  <WeekendStat
    value="1"
    label="Eagle"
    sublabel="EAGLE BABY!"
    icon="🦅"
  />

  <WeekendStat
    value="9"
    label="Birdies"
    sublabel="Across the weekend"
    icon="🐦"
  />

  <WeekendStat
    value="67"
    label="Pars"
    sublabel="Across the weekend"
    icon="⛳"
  />

  <WeekendStat
    value="103"
    label="Bogeys"
    sublabel="Things got harder..."
    icon="😬"
  />

  <WeekendStat
    value="62"
    label="Double Bogeys"
    sublabel="Things got much harder"
    icon="💀"
  />

  <WeekendStat
    value="40"
    label="Triple Bogeys"
    sublabel="We'll leave it there"
    icon="🫣"
  />
</div>

  {/* QUICK FACTS */}

</aside>
        </div>
      </section>

      {/* DAY ONE */}
      <section className="mx-auto max-w-6xl px-5 pb-12 sm:px-8 lg:px-10 lg:pb-16">
        <div className="grid overflow-hidden rounded-[2rem] bg-white shadow-sm lg:grid-cols-2">
          <div className="relative min-h-[380px] lg:min-h-full">
            <Image
              src="/images/carden-park-2026/buggy.jpg"
              alt="Buggy at Carden Park"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            <div className="absolute bottom-5 left-5">
              <span className="inline-flex rounded-full bg-white/95 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-950">
                Day One
              </span>
            </div>
          </div>

          <article className="p-7 sm:p-10 lg:p-12">
            <p className="mb-3 text-2xl font-black uppercase tracking-[0.18em] text-emerald-700 sm:text-3xl">
  Sunday • Day One
</p>




            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
              White Team Strike First
            </h1>

            <p className="mt-7 leading-8 text-slate-600">
              Despite an early panic over whether there would be any buggies,
              everything was soon sorted and Carden Park was ready for another
              Swift Tees classic.
            </p>

            <p className="mt-5 leading-8 text-slate-600">
              From the opening few holes it became obvious this wasn&apos;t going
              to be a one-sided contest. Every time one team threatened to pull
              away, another score came in to drag them straight back.
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
              enough to give themselves a chance heading into Monday.
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
              Painy and Ian&apos;s eagle was undoubtedly the golfing moment of the weekend.
              The only disappointment? Nobody managed to capture it on camera.
              The celebration will probably be remembered longer than the shot itself.
            </p>
          </article>
        </div>
      </section>

      {/* FEATURE QUOTE */}
<section className="mx-auto max-w-6xl px-5 pb-12 sm:px-8 lg:px-10 lg:pb-16">
  <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0b1728] via-[#12324a] to-[#0f6b52] p-10 text-white shadow-xl sm:p-14 lg:p-20">

    <p className="text-xs font-black uppercase tracking-[0.28em] text-lime-300">
      THE STORY OF THE WEEKEND
    </p>

    <div className="mt-8 max-w-4xl">
      <span className="text-7xl font-black leading-none text-lime-300 opacity-40">
        “
      </span>

      <h2 className="mt-2 text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
        Every time one team threatened to pull away...
        <br />
        somebody else dragged them straight back.
      </h2>

      <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-200">
        For two days the leaderboard swung constantly. Every birdie,
        every bonus hole and every Stableford point mattered, making this
        one of the closest and most entertaining Swift Tees weekends yet.
      </p>
    </div>

   

  </div>
</section>

      {/* DAY TWO */}
      <section className="bg-[#0b1728] py-14 text-white lg:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[.7fr_1.3fr]">
            <div>
              <p className="mb-3 text-2xl font-black uppercase tracking-[0.18em] text-emerald-700 sm:text-3xl">
  Monday • Day Two
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
                Wrighty began Monday sitting proudly at the top of the individual
                leaderboard, but with only a handful of Stableford points separating
                the leading players, everyone knew one good run could change everything.
              </p>

              <p>
                <strong className="text-white">Carl</strong>, after what appeared
                to be an excellent night&apos;s sleep, simply carried on where
                he&apos;d left off. The Whites were consistent and relentlessly scoring.
            
              </p>

              <p>
                <strong className="text-white">Gav</strong>... after what appeared
                to be rather less sleep... turned up looking like the White Team’s biggest threat might actually be the sleeping arrangements. But somehow still produced when it mattered.
                
              </p>

              <p>
                As predicted before the weekend,{" "}
                <strong className="text-white">Liam&apos;s beers</strong>{" "}
                gradually went from helping to hindering. By Monday, teeing off
                with a putter probably wasn&apos;t the best way to set a strong scorecard.
              </p>
            </article>
          </div>

          {/* ACTION IMAGE */}
          <div className="relative mt-10 min-h-[420px] overflow-hidden rounded-[2rem]">
            <Image
  src="/images/carden-park-2026/outsidelaugh.jpg"
  alt="Swift Tees at Carden Park"
  fill
  className="object-cover"
/>
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent" />

            <div className="absolute bottom-0 left-0 max-w-2xl p-7 sm:p-10">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-lime-300">
                The Final Round
              </p>
              <p className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
                The leaderboard never stopped moving.
              </p>
            </div>
          </div>

          {/* PAUL COMEBACK */}
          <div className="mt-8 rounded-[2rem] bg-white p-7 text-slate-950 sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[.55fr_1.45fr] lg:items-center">
              <div>
                <p className="text-7xl font-black tracking-tight text-emerald-700">
                  -10
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
                  Starting Monday ten points behind overnight leader Wrighty,
                  Paul slowly chipped away at the deficit. Hole after hole, the gap slwolyl disappeared until he eventually completed
                  the comeback and moved into first place during the closing stages.
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
              title="Memorable Shots"
              text="Stu launched one on the 15th with one of the best drives of the weekend, while Wrighty's great tee shot across the water and safely onto the 17th green earned its place in the highlights."
            />
          </div>
        </div>
      </section>

      {/* WEEKEND HIGHLIGHTS */}
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

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
  <HighlightWithImage
    image="/images/carden-park-2026/meal.jpg"
    icon="🦅"
    title="Eagle Baby!"
    text="The first huge golfing moment of the weekend belonged to Ian & Painy. Ian produced a superb eagle in the scramble before the now legendary cry of 'EAGLE BABY!' rang around Carden Park. Somehow, nobody recorded it."
  />

  <HighlightWithImage
    image="/images/carden-park-2026/smells.jpeg"
    icon="💨"
    title="Atmospheric Conditions"
    text="Wrighty and Phil both produced environmental incidents so severe that even sitting outside wasn't enough. Several staff members were seen to physically leave."
  />
</div>

<div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
  <MomentCard
    icon="🥩"
    title="The Shit Steak"
   text="The now infamous 'Shit Steak' had already earned its name. Adam then decided the best approach was apparently to spend as little time eating it as possible, attempting to inhale it in one mouthful and very nearly bringing the weekend to a dramatic halt. Thankfully, Adam survived. Nobody has forgiven the steak. Especially not Liam"
/>

  <MomentCard
    icon="🚀"
    title="Longest Drive"
    text="Paul claimed it with a monster 309-yard effort. Downhill? Yes. Helping wind? Yes. Counts? Absolutely. Strong competition from a few players coming close too."
  />

  <MomentCard
    icon="🎤"
    title="Carpool Karaoke"
    text="The playlist was questionable. The singing even more so. The commitment was faultless. As was the drinking."
  />

  <MomentCard
    icon="👕"
    title="Fashion Report"
    text="Credit where it's due, everyone made the effort to turn up in their team colours and there were some surprisingly strong looks on display. Taz probably took best dressed with the green tops, while Paul appeared to have come straight from a shift at Asda. Throw in an alarming number of tight shorts, a couple of bright white ankles and some extremely confident belts, and it was another exceptionally strong weekend for Swift Tees."
/>
</div>
      </section>

      {/* CHAMPIONS */}
<section className="mx-auto max-w-6xl px-5 pb-14 sm:px-8 lg:px-10 lg:pb-20">
  <div className="overflow-hidden rounded-[2rem] bg-[#07111f] text-white shadow-lg">
    <div className="p-8 sm:p-12 lg:p-14">
      <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-300">
        2026 Team Champions
      </p>

      <h2 className="mt-3 text-5xl font-black tracking-tight">
        White Team
      </h2>

      <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
        Pre-weekend predictions weren&apos;t far away, but when the
        final putt dropped there was only one team celebrating.
      </p>

      <p className="mt-5 max-w-3xl leading-8 text-slate-300">
        A superb opening scramble gave White Team the platform,
        and their consistency across Monday&apos;s Stableford meant
        the chasing teams could never quite reel them back in.
        A thoroughly deserved victory after two days of strong golf.
      </p>

      {/* WINNERS PHOTO - FULL IMAGE */}
      <div className="mt-8 overflow-hidden rounded-[1.5rem] bg-black/20">
        <Image
          src="/images/carden-park-2026/winnerswhites.jpg"
          alt="White Team champions at Carden Park"
          width={1600}
          height={1200}
          sizes="(max-width: 768px) 100vw, 1100px"
          className="h-auto w-full"
        />
      </div>

      {/* NAMES */}
<div className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 rounded-2xl bg-white/10 px-5 py-4 text-center">
  <span className="font-black text-white">🏆 Gav</span>
  <span className="text-lime-300">•</span>

  <span className="font-black text-white">🏆 Wrighty</span>
  <span className="text-lime-300">•</span>

  <span className="font-black text-white">🏆 Carl</span>
  <span className="text-lime-300">•</span>

  <span className="font-black text-white">🏆 Adam</span>
</div>
    </div>
  </div>
</section>

      {/* PLAYER'S PLAYER */}
      <section className="mx-auto max-w-6xl px-5 pb-14 sm:px-8 lg:px-10 lg:pb-20">
        <div className="grid gap-6 lg:grid-cols-[.85fr_1.15fr]">
          <div className="relative min-h-[440px] overflow-hidden rounded-[2rem] bg-slate-200">
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
              improved throughout the weekend and embraced every part of the experience.
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
                in the scramble alongside Dan — earned plenty of praise from the group.
              </p>
            </div>
          </div>
        </div>
      </section>

      

      {/* LOOKING AHEAD */}
<section className="px-5 py-16 sm:px-8 lg:py-24">
  <div className="mx-auto max-w-4xl text-center">
    <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-700">
      Looking Ahead
    </p>

    <h2 className="mt-4 text-5xl font-black tracking-tight text-slate-950 sm:text-6xl">
      Roll on the next one.
    </h2>

    <div className="mx-auto mt-8 h-1 w-14 rounded-full bg-emerald-700" />

    <div className="mx-auto mt-8 max-w-3xl space-y-5 text-lg leading-8 text-slate-600">
      <p>
        If this weekend proved one thing, it&apos;s that the competition is
        getting stronger every year.
      </p>

      <p>
        Proper handicaps, season-long rankings and better commentary
        are all now within reach.
      </p>

      <p>
        Whether this tournament was decided by golfing ability...
        <br />
        <span className="font-bold text-slate-900">
          ...or alcohol consumption...
        </span>
        <br />
        will remain a topic of fierce debate.
      </p>

      <div className="mx-auto my-8 max-w-xl rounded-[1.75rem] bg-white px-6 py-7 shadow-sm ring-1 ring-slate-200/70">
        <p className="font-semibold text-slate-700">
          Some will argue the handicaps need changing.
        </p>

        <p className="mt-2 font-semibold text-slate-700">
          Others will argue certain players simply need to sober up.
        </p>
      </div>

      <p className="text-xl font-black text-slate-950">
        Another brilliant Swift Tees weekend.
        <br />
        <span className="text-emerald-700">
          Quite possibly the best one yet.
        </span>
      </p>
    </div>
  </div>
</section>

     
{/* GALLERY */}
      <section className="bg-white py-14 lg:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-700">
                The Evidence
              </p>

              <h2 className="mt-2 text-5xl font-black tracking-tight">
                Weekend Gallery
              </h2>

              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
                Golf, winners, scorecards and several moments that probably
                shouldn&apos;t have been photographed.
              </p>
            </div>

            <p className="text-sm font-bold text-slate-400">
              Tap any image to view full screen
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {galleryImages.map((image, index) => {
              const isWide =
                image.src.includes("Scorecard") ||
                image.src.includes("leaderboard") ||
                image.src.includes("grouplandscape");

              return (
                <button
                  key={image.src}
                  type="button"
                  onClick={() => setLightboxIndex(index)}
                  className={`group relative overflow-hidden rounded-2xl bg-slate-200 text-left shadow-sm ring-1 ring-slate-200/70 ${
                    isWide ? "col-span-2 aspect-[16/9]" : "aspect-square"
                  }`}
                  aria-label={`Open ${image.alt}`}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className={`transition duration-500 group-hover:scale-[1.02] ${
                      isWide ? "object-contain bg-slate-100" : "object-cover"
                    }`}
                  />

                  <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />

                  <div className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/65 text-sm text-white backdrop-blur">
                    ⤢
                  </div>
                </button>
              );
            })}
          </div>
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


      {/* FULL-SCREEN LIGHTBOX */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 p-3 backdrop-blur-sm sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Weekend photo viewer"
          onClick={closeLightbox}
          onTouchStart={(event) => {
            touchStartX.current = event.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(event) => {
            if (touchStartX.current === null) return;

            const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
            const distance = endX - touchStartX.current;

            if (Math.abs(distance) > 60) {
              if (distance > 0) {
                showPrevious();
              } else {
                showNext();
              }
            }

            touchStartX.current = null;
          }}
        >
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              closeLightbox();
            }}
            aria-label="Close gallery"
            className="absolute right-4 top-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-3xl font-light text-white backdrop-blur transition hover:bg-white/20 sm:right-6 sm:top-6"
          >
            ×
          </button>

          <div className="absolute left-4 top-5 z-30 rounded-full bg-white/10 px-4 py-2 text-xs font-black tracking-wider text-white backdrop-blur sm:left-6 sm:top-6">
            {lightboxIndex + 1} / {galleryImages.length}
          </div>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              showPrevious();
            }}
            aria-label="Previous image"
            className="absolute left-3 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-4xl font-light text-white backdrop-blur transition hover:bg-white/20 sm:left-6 sm:h-14 sm:w-14"
          >
            ‹
          </button>

          <div
            className="relative h-[82vh] w-full max-w-[1500px]"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={galleryImages[lightboxIndex].src}
              alt={galleryImages[lightboxIndex].alt}
              fill
              priority
              sizes="100vw"
              className="object-contain"
            />
          </div>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              showNext();
            }}
            aria-label="Next image"
            className="absolute right-3 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-4xl font-light text-white backdrop-blur transition hover:bg-white/20 sm:right-6 sm:h-14 sm:w-14"
          >
            ›
          </button>

          <div className="pointer-events-none absolute bottom-5 left-1/2 z-30 w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 text-center">
            <span className="inline-block rounded-full bg-black/65 px-5 py-2 text-sm font-semibold text-white backdrop-blur">
              {galleryImages[lightboxIndex].alt}
            </span>
          </div>
        </div>
      )}
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-5">
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

function MomentCard({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[1.7rem] bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
      <div className="text-4xl">{icon}</div>
      <h3 className="mt-4 text-xl font-black">{title}</h3>
      <p className="mt-3 leading-7 text-slate-600">{text}</p>
    </div>
  );
}

function HighlightWithImage({
  image,
  icon,
  title,
  text,
}: {
  image: string;
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-slate-200/70">
      <div className="relative h-[310px]">
        <Image src={image} alt={title} fill className="object-cover" />
      </div>

      <div className="p-7">
        <div className="text-4xl">{icon}</div>
        <h3 className="mt-4 text-3xl font-black">{title}</h3>
        <p className="mt-3 leading-7 text-slate-600">{text}</p>
      </div>
    </div>
  );
}

function WeekendStat({
  value,
  suffix,
  label,
  sublabel,
  icon,
}: {
  value: string;
  suffix?: string;
  label: string;
  sublabel: string;
  icon: string;
}) {
  return (
    <div className="relative border-b border-r border-white/10 p-5 last:border-r-0 sm:p-6">
      <span className="absolute right-4 top-4 text-xl opacity-70">
        {icon}
      </span>

      <div className="flex items-end gap-1">
        <span className="text-4xl font-black tracking-tight text-lime-300">
          {value}
        </span>

        {suffix && (
          <span className="mb-1 text-sm font-black text-lime-300">
            {suffix}
          </span>
        )}
      </div>

      <p className="mt-2 text-xs font-black uppercase tracking-[0.12em] text-white">
        {label}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {sublabel}
      </p>
    </div>
  );
}

