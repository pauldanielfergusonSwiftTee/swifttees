const STORAGE_KEY = "swift-tees-offline-score-queue";

export type OfflineScoreQueueItem = {
  id: string;

  eventSlug: string;
  roundNumber: number;
  groupNumber: number;
  holeNumber: number;

  rowsToSave: any[];
  rowsToDelete: any[];

  bonusWinner?: any | null;

  tournament: any;

  createdAt: string;
};

function isBrowser() {
  return typeof window !== "undefined";
}

function makeQueueId({
  eventSlug,
  roundNumber,
  groupNumber,
  holeNumber,
}: {
  eventSlug: string;
  roundNumber: number;
  groupNumber: number;
  holeNumber: number;
}) {
  return [
    eventSlug,
    roundNumber,
    groupNumber,
    holeNumber,
  ].join(":");
}

export function getOfflineScoreQueue(): OfflineScoreQueueItem[] {
  if (!isBrowser()) return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) return [];

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error(
      "Could not read offline score queue:",
      error
    );

    return [];
  }
}

function saveOfflineScoreQueue(
  queue: OfflineScoreQueueItem[]
) {
  if (!isBrowser()) return;

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(queue)
  );
}

export function queueOfflineHoleSave({
  eventSlug,
  roundNumber,
  groupNumber,
  holeNumber,
  rowsToSave,
  rowsToDelete,
  bonusWinner,
  tournament,
}: Omit<
  OfflineScoreQueueItem,
  "id" | "createdAt"
>) {
  const id = makeQueueId({
    eventSlug,
    roundNumber,
    groupNumber,
    holeNumber,
  });

  const queue = getOfflineScoreQueue();

  const item: OfflineScoreQueueItem = {
    id,

    eventSlug,
    roundNumber,
    groupNumber,
    holeNumber,

    rowsToSave,
    rowsToDelete,

    bonusWinner: bonusWinner ?? null,

    tournament,

    createdAt: new Date().toISOString(),
  };

  /*
   * If this phone edits the same event / round /
   * group / hole again while offline, replace the
   * old queued version with the newest one.
   */
  const existingIndex = queue.findIndex(
    (queuedItem) => queuedItem.id === id
  );

  if (existingIndex >= 0) {
    queue[existingIndex] = item;
  } else {
    queue.push(item);
  }

  saveOfflineScoreQueue(queue);

  return item;
}

export function removeOfflineQueueItem(
  id: string
) {
  const queue = getOfflineScoreQueue().filter(
    (item) => item.id !== id
  );

  saveOfflineScoreQueue(queue);

  return queue;
}

export function getOfflineQueueCount() {
  return getOfflineScoreQueue().length;
}

export function clearOfflineScoreQueue() {
  if (!isBrowser()) return;

  window.localStorage.removeItem(
    STORAGE_KEY
  );
}