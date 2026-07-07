export type CourseHole = {
  hole: number;
  yards: number;
  par: number;
  strokeIndex: number;
};

export type CourseDefinition = {
  id: string;
  name: string;
  shortName: string;
  club: string;
  par: number;
  yards: number;
  holes: CourseHole[];
};

export const COURSES: CourseDefinition[] = [
  {
    id: "cheshire",
    name: "Carden Park - Cheshire",
    shortName: "Cheshire",
    club: "Carden Park",
    par: 72,
    yards: 6824,
    holes: [
      { hole: 1, yards: 170, par: 3, strokeIndex: 17 },
      { hole: 2, yards: 568, par: 5, strokeIndex: 7 },
      { hole: 3, yards: 379, par: 4, strokeIndex: 9 },
      { hole: 4, yards: 371, par: 4, strokeIndex: 15 },
      { hole: 5, yards: 413, par: 4, strokeIndex: 3 },
      { hole: 6, yards: 545, par: 5, strokeIndex: 5 },
      { hole: 7, yards: 434, par: 4, strokeIndex: 13 },
      { hole: 8, yards: 231, par: 3, strokeIndex: 11 },
      { hole: 9, yards: 476, par: 4, strokeIndex: 1 },
      { hole: 10, yards: 356, par: 4, strokeIndex: 16 },
      { hole: 11, yards: 581, par: 5, strokeIndex: 6 },
      { hole: 12, yards: 374, par: 4, strokeIndex: 4 },
      { hole: 13, yards: 360, par: 4, strokeIndex: 8 },
      { hole: 14, yards: 467, par: 5, strokeIndex: 10 },
      { hole: 15, yards: 145, par: 3, strokeIndex: 18 },
      { hole: 16, yards: 402, par: 4, strokeIndex: 2 },
      { hole: 17, yards: 201, par: 3, strokeIndex: 12 },
      { hole: 18, yards: 351, par: 4, strokeIndex: 14 },
    ],
  },
  {
    id: "nicklaus",
    name: "Carden Park - Nicklaus",
    shortName: "Nicklaus",
    club: "Carden Park",
    par: 72,
    yards: 5906,
    holes: [
      { hole: 1, yards: 383, par: 4, strokeIndex: 8 },
      { hole: 2, yards: 285, par: 4, strokeIndex: 18 },
      { hole: 3, yards: 138, par: 3, strokeIndex: 16 },
      { hole: 4, yards: 479, par: 5, strokeIndex: 6 },
      { hole: 5, yards: 373, par: 4, strokeIndex: 10 },
      { hole: 6, yards: 305, par: 4, strokeIndex: 12 },
      { hole: 7, yards: 358, par: 4, strokeIndex: 2 },
      { hole: 8, yards: 120, par: 3, strokeIndex: 14 },
      { hole: 9, yards: 515, par: 5, strokeIndex: 4 },
      { hole: 10, yards: 369, par: 4, strokeIndex: 3 },
      { hole: 11, yards: 387, par: 4, strokeIndex: 5 },
      { hole: 12, yards: 177, par: 3, strokeIndex: 13 },
      { hole: 13, yards: 501, par: 5, strokeIndex: 7 },
      { hole: 14, yards: 287, par: 4, strokeIndex: 15 },
      { hole: 15, yards: 341, par: 4, strokeIndex: 1 },
      { hole: 16, yards: 115, par: 3, strokeIndex: 17 },
      { hole: 17, yards: 317, par: 4, strokeIndex: 11 },
      { hole: 18, yards: 456, par: 5, strokeIndex: 9 },
    ],
  },
  {
    id: "muni",
    name: "Southport Municipal",
    shortName: "Muni",
    club: "Southport Golf Links",
    par: 71,
    yards: 5873,
    holes: [
      { hole: 1, yards: 355, par: 4, strokeIndex: 14 },
      { hole: 2, yards: 366, par: 4, strokeIndex: 4 },
      { hole: 3, yards: 518, par: 5, strokeIndex: 10 },
      { hole: 4, yards: 459, par: 5, strokeIndex: 18 },
      { hole: 5, yards: 327, par: 4, strokeIndex: 8 },
      { hole: 6, yards: 156, par: 3, strokeIndex: 6 },
      { hole: 7, yards: 414, par: 4, strokeIndex: 2 },
      { hole: 8, yards: 141, par: 3, strokeIndex: 16 },
      { hole: 9, yards: 354, par: 4, strokeIndex: 12 },
      { hole: 10, yards: 262, par: 4, strokeIndex: 11 },
      { hole: 11, yards: 274, par: 4, strokeIndex: 13 },
      { hole: 12, yards: 452, par: 5, strokeIndex: 9 },
      { hole: 13, yards: 119, par: 3, strokeIndex: 15 },
      { hole: 14, yards: 416, par: 4, strokeIndex: 5 },
      { hole: 15, yards: 417, par: 4, strokeIndex: 3 },
      { hole: 16, yards: 162, par: 3, strokeIndex: 7 },
      { hole: 17, yards: 415, par: 4, strokeIndex: 1 },
      { hole: 18, yards: 266, par: 4, strokeIndex: 17 },
    ],
  },
];

export function getCourseById(id: string) {
  return COURSES.find((course) => course.id === id);
}