"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const PAGE_LABELS: Record<string, string> = {
  events: "Events",
  more: "More",
  "match-centre": "Match Centre",
  "live-centre": "Leaderboard",
  "live-scoring-v2": "Scorecard",
  "setup-v2": "Tournament Setup",
  "overall-leaderboard": "Overall Leaderboard",
  "hall-of-fame": "Hall of Fame",
  "past-events": "Past Events",
  "live-leaderboard": "Leaderboard",
  "live-scoring": "Scorecard",
  setup: "Tournament Setup",
  players: "Players",
  teams: "Teams",
  results: "Results",
  gallery: "Gallery",
  photos: "Photos",
  "register-interest": "Register Interest",

  // Event names
  "carden-park-2026": "Stu's 50th",
  "mottram-march-2026": "Mottram March 2026",
  "tarporley-april-2025": "Tarporley April 2025",
};

const EXACT_PAGE_LABELS: Record<string, string> = {
  "/events/carden-park-2026": "Stu's 50th",
  "/events/carden-park-2026/live-leaderboard": "Leaderboard",
  "/events/carden-park-2026/live-leaderboard/live-scoring": "Scorecard",
  "/events/carden-park-2026/live-leaderboard/setup":
    "Tournament Setup",

  "/live-centre": "Leaderboard",
  "/live-scoring-v2": "Scorecard",
  "/setup-v2": "Tournament Setup",
  "/overall-leaderboard": "Overall Leaderboard",
  "/hall-of-fame": "Hall of Fame",
  "/register-interest": "Register Interest",
};

const BACK_ROUTES: Record<
  string,
  {
    href: string;
    label: string;
  }
> = {
  "/events": {
    href: "/",
    label: "Home",
  },

  "/more": {
    href: "/",
    label: "Home",
  },

  "/match-centre": {
    href: "/",
    label: "Home",
  },

  "/live-centre": {
    href: "/",
    label: "Home",
  },

  "/live-scoring-v2": {
    href: "/live-centre",
    label: "Leaderboard",
  },

  "/setup-v2": {
    href: "/more",
    label: "More",
  },

  "/overall-leaderboard": {
    href: "/more",
    label: "More",
  },

  "/hall-of-fame": {
    href: "/more",
    label: "More",
  },

  "/register-interest": {
    href: "/",
    label: "Home",
  },
};

function formatSegment(segment: string) {
  if (PAGE_LABELS[segment]) {
    return PAGE_LABELS[segment];
  }

  return decodeURIComponent(segment)
    .split("-")
    .map((word) => {
      if (/^\d+$/.test(word)) {
        return word;
      }

      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

function getPageLabel(
  segment: string,
  href: string
) {
  return (
    EXACT_PAGE_LABELS[href] ??
    PAGE_LABELS[segment] ??
    formatSegment(segment)
  );
}

function getBackRoute(pathname: string) {
  if (BACK_ROUTES[pathname]) {
    return BACK_ROUTES[pathname];
  }

  const segments = pathname.split("/").filter(Boolean);

  if (
    pathname.startsWith("/events/") &&
    segments.length === 2
  ) {
    return {
      href: "/events",
      label: "Events",
    };
  }

  if (
    pathname.startsWith("/events/") &&
    segments.length > 2
  ) {
    const eventPath = `/${segments
      .slice(0, 2)
      .join("/")}`;

    return {
      href: eventPath,
      label:
        EXACT_PAGE_LABELS[eventPath] ??
        PAGE_LABELS[segments[1]] ??
        formatSegment(segments[1]),
    };
  }

  if (segments.length <= 1) {
    return {
      href: "/",
      label: "Home",
    };
  }

  const parentSegments = segments.slice(0, -1);
  const parentPath = `/${parentSegments.join("/")}`;
  const parentSegment =
    parentSegments[parentSegments.length - 1];

  return {
    href: parentPath,
    label:
      EXACT_PAGE_LABELS[parentPath] ??
      PAGE_LABELS[parentSegment] ??
      formatSegment(parentSegment),
  };
}

export default function AppPageHeader() {
  const pathname = usePathname();

  if (!pathname || pathname === "/") {
    return null;
  }

  const segments = pathname.split("/").filter(Boolean);
  const backRoute = getBackRoute(pathname);

  const breadcrumbs = segments.map(
    (segment, index) => {
      const href = `/${segments
        .slice(0, index + 1)
        .join("/")}`;

      return {
        href,
        label: getPageLabel(segment, href),
        current: index === segments.length - 1,
      };
    }
  );

  return (
    <header className="sticky top-0 z-[80] border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-md [@media(min-width:1200px)]:hidden">
      <div className="mx-auto max-w-6xl px-4 py-2">
        <div className="flex items-center justify-between gap-3">
          <Link
            href={backRoute.href}
            className="inline-flex min-h-9 min-w-0 items-center rounded-xl px-2 text-sm font-black text-green-800 transition hover:bg-green-50"
          >
            <span className="mr-1 shrink-0">←</span>

            <span className="truncate">
              {backRoute.label}
            </span>
          </Link>

          <Link
            href="/"
            aria-label="Go to home page"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg transition hover:bg-green-50"
          >
            🏠
          </Link>
        </div>

        <nav
          aria-label="Breadcrumb"
          className="mt-1 overflow-x-auto px-2 pb-0.5 scrollbar-none"
        >
          <div className="flex min-w-max items-center gap-1 text-[11px] font-bold text-slate-400">
            <Link
              href="/"
              className="shrink-0 transition hover:text-green-800"
            >
              Home
            </Link>

            {breadcrumbs.map((crumb) => (
              <span
                key={crumb.href}
                className="flex shrink-0 items-center gap-1"
              >
                <span className="text-slate-300">
                  ›
                </span>

                {crumb.current ? (
                  <span
                    className="max-w-[180px] truncate text-green-900"
                    aria-current="page"
                  >
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="max-w-[160px] truncate transition hover:text-green-800"
                  >
                    {crumb.label}
                  </Link>
                )}
              </span>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}