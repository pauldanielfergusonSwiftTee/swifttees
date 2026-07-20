export type PlayerProfile = {
  key: string;

  name: string;

  traits: string[];

  jokeKeys: string[];
};

export const PLAYER_PROFILES: Record<string, PlayerProfile> = {
  Paul: {
    key: "paul",
    name: "Paul",
    traits: ["organiser", "left_handed"],
    jokeKeys: ["organiser"],
  },

  Gav: {
    key: "gav",
    name: "Gav",
    traits: ["competitive"],
    jokeKeys: [],
  },

  Carl: {
    key: "carl",
    name: "Carl",
    traits: ["tinkerer"],
    jokeKeys: ["equipment"],
  },

  Painy: {
    key: "painy",
    name: "Painy",
    traits: ["steady"],
    jokeKeys: [],
  },

  Dan: {
    key: "dan",
    name: "Dan",
    traits: ["long_hitter"],
    jokeKeys: [],
  },

  Wrighty: {
    key: "wrighty",
    name: "Wrighty",
    traits: ["relaxed"],
    jokeKeys: ["trousers"],
  },

  Liam: {
    key: "liam",
    name: "Liam",
    traits: ["consistent"],
    jokeKeys: [],
  },

  Ian: {
    key: "ian",
    name: "Ian",
    traits: ["calm"],
    jokeKeys: [],
  },

  Stu: {
    key: "stu",
    name: "Stu",
    traits: ["birthday"],
    jokeKeys: ["birthday"],
  },

  Adam: {
    key: "adam",
    name: "Adam",
    traits: ["big_hitter"],
    jokeKeys: ["309"],
  },

  Phil: {
    key: "phil",
    name: "Phil",
    traits: ["social"],
    jokeKeys: ["flight22"],
  },

  Taz: {
    key: "taz",
    name: "Taz",
    traits: ["beginner"],
    jokeKeys: ["memes"],
  },
};