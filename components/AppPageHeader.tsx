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

  // Event slugs
  "carden-park-2026": "Stu's 50th",
  "mottram-march-2026": "Mottram March 2026",
  "tarporley-april-2025": "Tarporley April 2025",
};

const EXACT_PAGE_LABELS: Record<string, string> = {
  "/events/carden-park-2026": "Stu's 50th",
  "/events/carden-park-2026/live-leaderboard": "Leaderboard",
  "/events/carden-park-2026/live-leaderboard/live-scoring": "Scorecard",
  "/events/carden-park-2026/live-leaderboard/setup": "Tournament Setup",
  "/live-centre": "Leaderboard",
  "/live-scoring-v2": "Scorecard",
  "/setup-v2": "Tournament Setup",
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
};

function formatSegment(segment: string) {
  if (PAGE_LABELS[segment]) {
    return PAGE_LABELS[segment];
  }

  return segment
    .split("-")
    .map((word) => {
      if (/^\d+$/.test(word)) return word;

      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

function getBreadcrumbLabel(
  segment: string,
  href: string,
  isCurrent: boolean
) {
  if (isCurrent && EXACT_PAGE_LABELS[href]) {
    return EXACT_PAGE_LABELS[href];
  }

  return PAGE_LABELS[segment] ?? formatSegment(segment);
}

function getBackRoute(pathname: string) {
  if (BACK_ROUTES[pathname]) {
    return BACK_ROUTES[pathname];
  }

  if (pathname.startsWith("/events/")) {
    const segments = pathname.split("/").filter(Boolean);

    if (segments.length === 2) {
      return {
        href: "/events",
        label: "Events",
      };
    }

    const eventPath = `/${segments.slice(0, 2).join("/")}`;

    return {
      href: eventPath,
      label: PAGE_LABELS[segments[1]] ?? formatSegment(segments[1]),
    };
  }

  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1) {
    return {
      href: "/",
      label: "Home",
    };
  }

  const parentSegments = segments.slice(0, -1);
  const parentPath = `/${parentSegments.join("/")}`;
  const parentSegment = parentSegments[parentSegments.length - 1];

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

  const breadcrumbs = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    const current = index === segments.length - 1;

    return {
      label: getBreadcrumbLabel(segment, href, current),
      href,
      current,
    };
  });

  return (
    <div className="border-b border-slate-200 bg-white md:hidden">
      <div className="mx-auto max-w-4xl px-4 py-2.5">
        <div className="flex items-center justify-between gap-3">
          <Link
            href={backRoute.href}
            className="inline-flex min-h-9 items-center rounded-xl px-2 text-sm font-black text-green-800 transition hover:bg-green-50"
          >
            ← {backRoute.label}
          </Link>

          <Link
            href="/"
            aria-label="Go to home page"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-lg transition hover:bg-green-50"
          >
            🏠
          </Link>
        </div>

        <nav
          aria-label="Breadcrumb"
          className="mt-1 flex min-w-0 items-center gap-1 overflow-hidden px-2 text-[11px] font-bold text-slate-400"
        >
          <Link href="/" className="shrink-0 hover:text-green-800">
            Home
          </Link>

          {breadcrumbs.map((crumb) => (
            <span
              key={crumb.href}
              className="flex min-w-0 items-center gap-1"
            >
              <span className="shrink-0 text-slate-300">›</span>

              {crumb.current ? (
                <span className="truncate text-green-900">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="truncate transition hover:text-green-800"
                >
                  {crumb.label}
                </Link>
              )}
            </span>
          ))}
        </nav>
      </div>
    </div>
  );
}