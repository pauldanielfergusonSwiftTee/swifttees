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
    id: "berrington",
    name: "Berrington Hall",
    shortName: "Berrington",
    club: "Berrington Hall Golf Club",
    par: 70,
    yards: 6075,
    holes: [
      { hole: 1, yards: 354, par: 4, strokeIndex: 10 },
      { hole: 2, yards: 303, par: 4, strokeIndex: 18 },
      { hole: 3, yards: 155, par: 3, strokeIndex: 14 },
      { hole: 4, yards: 365, par: 4, strokeIndex: 8 },
      { hole: 5, yards: 513, par: 5, strokeIndex: 4 },
      { hole: 6, yards: 143, par: 3, strokeIndex: 16 },
      { hole: 7, yards: 431, par: 4, strokeIndex: 2 },
      { hole: 8, yards: 363, par: 4, strokeIndex: 6 },
      { hole: 9, yards: 339, par: 4, strokeIndex: 12 },
      { hole: 10, yards: 162, par: 3, strokeIndex: 11 },
      { hole: 11, yards: 391, par: 4, strokeIndex: 5 },
      { hole: 12, yards: 400, par: 4, strokeIndex: 3 },
      { hole: 13, yards: 404, par: 4, strokeIndex: 7 },
      { hole: 14, yards: 471, par: 5, strokeIndex: 15 },
      { hole: 15, yards: 430, par: 4, strokeIndex: 1 },
      { hole: 16, yards: 416, par: 4, strokeIndex: 9 },
      { hole: 17, yards: 165, par: 3, strokeIndex: 13 },
      { hole: 18, yards: 279, par: 4, strokeIndex: 17 },
    ],
  },

  {
    id: "duxbury",
    name: "Duxbury Park",
    shortName: "Duxbury",
    club: "Duxbury Park Golf Club",
    par: 71,
    yards: 6132,
    holes: [
      { hole: 1, yards: 364, par: 4, strokeIndex: 9 },
      { hole: 2, yards: 483, par: 5, strokeIndex: 13 },
      { hole: 3, yards: 176, par: 3, strokeIndex: 11 },
      { hole: 4, yards: 379, par: 4, strokeIndex: 3 },
      { hole: 5, yards: 322, par: 4, strokeIndex: 7 },
      { hole: 6, yards: 504, par: 5, strokeIndex: 1 },
      { hole: 7, yards: 355, par: 4, strokeIndex: 5 },
      { hole: 8, yards: 347, par: 4, strokeIndex: 15 },
      { hole: 9, yards: 144, par: 3, strokeIndex: 17 },
      { hole: 10, yards: 350, par: 4, strokeIndex: 6 },
      { hole: 11, yards: 172, par: 3, strokeIndex: 14 },
      { hole: 12, yards: 387, par: 4, strokeIndex: 2 },
      { hole: 13, yards: 456, par: 5, strokeIndex: 12 },
      { hole: 14, yards: 399, par: 4, strokeIndex: 8 },
      { hole: 15, yards: 181, par: 3, strokeIndex: 16 },
      { hole: 16, yards: 302, par: 4, strokeIndex: 18 },
      { hole: 17, yards: 404, par: 4, strokeIndex: 4 },
      { hole: 18, yards: 407, par: 4, strokeIndex: 10 },
    ],
  },

  {
    id: "formby-hall-old",
    name: "Formby Hall - Old Course",
    shortName: "Formby Hall",
    club: "Formby Hall Golf Resort & Spa",
    par: 72,
    yards: 6416,
    holes: [
      { hole: 1, yards: 342, par: 4, strokeIndex: 10 },
      { hole: 2, yards: 167, par: 3, strokeIndex: 16 },
      { hole: 3, yards: 472, par: 5, strokeIndex: 12 },
      { hole: 4, yards: 339, par: 4, strokeIndex: 4 },
      { hole: 5, yards: 431, par: 4, strokeIndex: 2 },
      { hole: 6, yards: 154, par: 3, strokeIndex: 18 },
      { hole: 7, yards: 488, par: 5, strokeIndex: 14 },
      { hole: 8, yards: 375, par: 4, strokeIndex: 6 },
      { hole: 9, yards: 352, par: 4, strokeIndex: 8 },
      { hole: 10, yards: 294, par: 4, strokeIndex: 13 },
      { hole: 11, yards: 370, par: 4, strokeIndex: 7 },
      { hole: 12, yards: 439, par: 4, strokeIndex: 5 },
      { hole: 13, yards: 188, par: 3, strokeIndex: 17 },
      { hole: 14, yards: 565, par: 5, strokeIndex: 3 },
      { hole: 15, yards: 444, par: 4, strokeIndex: 1 },
      { hole: 16, yards: 139, par: 3, strokeIndex: 15 },
      { hole: 17, yards: 361, par: 4, strokeIndex: 9 },
      { hole: 18, yards: 496, par: 5, strokeIndex: 11 },
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

  {
    id: "worsley-park",
    name: "Marriott Worsley Park",
    shortName: "Worsley Park",
    club: "Marriott Worsley Park Golf Club",
    par: 71,
    yards: 6611,
    holes: [
      { hole: 1, yards: 432, par: 4, strokeIndex: 4 },
      { hole: 2, yards: 371, par: 4, strokeIndex: 14 },
      { hole: 3, yards: 457, par: 4, strokeIndex: 1 },
      { hole: 4, yards: 184, par: 3, strokeIndex: 17 },
      { hole: 5, yards: 551, par: 5, strokeIndex: 9 },
      { hole: 6, yards: 544, par: 5, strokeIndex: 13 },
      { hole: 7, yards: 177, par: 3, strokeIndex: 8 },
      { hole: 8, yards: 422, par: 4, strokeIndex: 3 },
      { hole: 9, yards: 201, par: 3, strokeIndex: 12 },
      { hole: 10, yards: 410, par: 4, strokeIndex: 6 },
      { hole: 11, yards: 200, par: 3, strokeIndex: 11 },
      { hole: 12, yards: 320, par: 4, strokeIndex: 15 },
      { hole: 13, yards: 543, par: 5, strokeIndex: 2 },
      { hole: 14, yards: 162, par: 3, strokeIndex: 16 },
      { hole: 15, yards: 428, par: 4, strokeIndex: 5 },
      { hole: 16, yards: 407, par: 4, strokeIndex: 7 },
      { hole: 17, yards: 287, par: 4, strokeIndex: 18 },
      { hole: 18, yards: 515, par: 5, strokeIndex: 10 },
    ],
  },
];

export function getCourseById(id: string) {
  return COURSES.find((course) => course.id === id);
}