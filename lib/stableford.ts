export function calculateStablefordPoints(
  grossScore: number,
  par: number,
  strokeIndex: number,
  handicap: number
) {
  if (!grossScore || grossScore <= 0) return 0;

  const playingHandicap = Math.round(handicap);

  const baseShots = Math.floor(playingHandicap / 18);
  const extraShots = playingHandicap % 18;

  const shotsReceived =
    baseShots + (strokeIndex <= extraShots ? 1 : 0);

  const netScore = grossScore - shotsReceived;
  const scoreVsPar = netScore - par;

  if (scoreVsPar <= -3) return 5;
  if (scoreVsPar === -2) return 4;
  if (scoreVsPar === -1) return 3;
  if (scoreVsPar === 0) return 2;
  if (scoreVsPar === 1) return 1;

  return 0;
}