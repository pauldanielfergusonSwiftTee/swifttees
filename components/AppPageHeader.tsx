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
      <div className="mx-auto flex min-h-12 max-w-6xl items-center gap-3 px-4 py-2">
        <Link
          href={backRoute.href}
          className="inline-flex shrink-0 items-center rounded-lg px-1.5 py-1 text-sm font-black text-green-800 transition hover:bg-green-50"
        >
          <span className="mr-1">←</span>

          <span className="max-w-[110px] truncate">
            {backRoute.label}
          </span>
        </Link>

        <div className="h-5 w-px shrink-0 bg-slate-200" />

        <nav
          aria-label="Breadcrumb"
          className="min-w-0 flex-1 overflow-x-auto scrollbar-none"
        >
          <div className="flex min-w-max items-center gap-1.5 text-xs font-bold text-slate-400">
            {breadcrumbs.map((crumb, index) => (
              <span
                key={crumb.href}
                className="flex shrink-0 items-center gap-1.5"
              >
                {index > 0 && (
                  <span className="text-slate-300">›</span>
                )}

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
                    className="max-w-[150px] truncate transition hover:text-green-800"
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