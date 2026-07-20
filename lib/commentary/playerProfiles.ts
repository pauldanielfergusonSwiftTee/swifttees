export type PersonalityPhraseType =
  | "birdie"
  | "eagle"
  | "par"
  | "bogey"
  | "disaster"
  | "leading"
  | "chasing"
  | "pressure"
  | "comeback"
  | "rare";

export type PlayerProfile = {
  key: string;
  name: string;
  nickname: string;

  traits: string[];
  jokeKeys: string[];

  phrases: Record<PersonalityPhraseType, string[]>;

  runningJokes: string[];
};

export const PLAYER_PROFILES: Record<string, PlayerProfile> = {
  Paul: {
    key: "paul",
    name: "Paul",
    nickname: "The Organiser",

    traits: [
      "organiser",
      "left_handed",
      "improving",
      "analytical",
      "app_builder",
    ],

    jokeKeys: ["organiser", "app_builder", "left_handed"],

    phrases: {
      birdie: [
        "The organiser has plotted another route to birdie.",
        "Left-handed quality from Paul.",
        "Paul's quiet improvement continues.",
        "All that analysis has finally produced the correct answer.",
        "Paul has managed that hole like a particularly successful project.",
      ],

      eagle: [
        "Left-handed magic from Paul. That is enormous.",
        "The organiser has added an eagle to the running order.",
        "Paul has produced a moment worthy of its own app update.",
      ],

      par: [
        "Paul keeps things moving with a controlled par.",
        "No drama from the organiser there.",
        "Paul signs off another tidy hole.",
      ],

      bogey: [
        "Paul will already be analysing where that one got away.",
        "A minor scheduling issue for the organiser.",
        "Paul drops one and the internal review has probably already started.",
      ],

      disaster: [
        "Paul may need to rebuild that hole from the ground up.",
        "That was less tournament organiser and more unresolved support ticket.",
        "Expect a full post-hole review and several proposed improvements.",
      ],

      leading: [
        "The organiser is now leading from the front.",
        "Paul has the tournament running exactly to schedule.",
        "The man who built the leaderboard is currently sitting on top of it.",
      ],

      chasing: [
        "Paul is quietly working his way back into this.",
        "The organiser has started closing the gaps.",
        "Paul is making steady progress while everyone else creates the noise.",
      ],

      pressure: [
        "No pressure for Paul, apart from the fact he built the scoreboard.",
        "Paul has one eye on the shot and another on the live leaderboard.",
        "This is exactly the sort of moment Paul will have analysed all week.",
      ],

      comeback: [
        "Paul has dragged himself right back into the tournament.",
        "The organiser is rewriting the running order.",
        "Paul's quiet improvement is becoming very difficult to ignore.",
      ],

      rare: [
        "Paul may need to create a new Hall of Fame category for that.",
        "Somewhere, another Swift Tees feature request has just appeared.",
        "That could require an emergency commentary-engine release.",
      ],
    },

    runningJokes: [
      "He is probably already updating the Hall of Fame.",
      "Another feature request has entered the backlog.",
      "The organiser will have a spreadsheet for this.",
      "Version three may already be in development.",
      "Everyone else is enjoying the golf. Paul is checking whether realtime updates are working.",
    ],
  },

  Gav: {
    key: "gav",
    name: "Gav",
    nickname: "The Competitive One",

    traits: [
      "competitive",
      "experienced",
      "scorecard_examiner",
      "contender",
    ],

    jokeKeys: ["competitive", "scorecards", "permutations"],

    phrases: {
      birdie: [
        "Gav is not interested in second place.",
        "Competitive mode has been fully activated.",
        "There was never much chance Gav was settling for par.",
        "Gav makes birdie and immediately checks what everyone else scored.",
        "Another strong hole from one of the main contenders.",
      ],

      eagle: [
        "Gav has just landed a serious blow.",
        "That is pure statement golf from Gav.",
        "Gav produces an eagle and the points permutations have changed dramatically.",
      ],

      par: [
        "Gav takes the par, although he will probably feel it was one left out there.",
        "A par for Gav, accepted rather than celebrated.",
        "Gav moves on while conducting a visual audit of the other scorecards.",
      ],

      bogey: [
        "Gav will not enjoy seeing that one on the card.",
        "That bogey has not improved Gav's mood.",
        "Gav gives one back and will be demanding an immediate response.",
      ],

      disaster: [
        "Gav may currently be having a private argument with the golf course.",
        "That hole has seriously tested Gav's competitive patience.",
        "The scorecard examination may become particularly intense after that.",
      ],

      leading: [
        "Gav has exactly what he wants: everyone else chasing him.",
        "The Competitive One has taken control.",
        "Gav leads and has probably already calculated the required winning total.",
      ],

      chasing: [
        "Gav has spotted the target and started the pursuit.",
        "This is exactly when Gav becomes most dangerous.",
        "The gap ahead now has Gav's full and undivided attention.",
      ],

      pressure: [
        "Gav will tell you this is exactly where he wants to be.",
        "Pressure only appears to make Gav more competitive.",
        "Gav has already calculated every possible outcome from here.",
      ],

      comeback: [
        "Gav is forcing his way back into this tournament.",
        "The comeback is on and Gav will believe he should already be leading.",
        "Gav has started applying serious pressure.",
      ],

      rare: [
        "Gav has produced the sort of moment he will mention for several years.",
        "That one has passed the independent scorecard review.",
        "Gav may already be preparing the victory speech.",
      ],
    },

    runningJokes: [
      "He will tell everyone he expected that.",
      "Second place remains an unacceptable administrative error.",
      "The scorecards will still be independently audited.",
      "Gav has already calculated the points required from the remaining holes.",
      "The permutations department is working overtime.",
    ],
  },

  Carl: {
    key: "carl",
    name: "Carl",
    nickname: "The Tinkerer",

    traits: [
      "tinkerer",
      "equipment",
      "new_clubs",
      "swing_thoughts",
    ],

    jokeKeys: ["equipment", "fitting", "new_clubs"],

    phrases: {
      birdie: [
        "Carl's latest swing thought appears to be working.",
        "Another equipment adjustment may finally have paid off.",
        "Whatever Carl changed this week, he should probably keep it.",
        "The Tinkerer has found a winning formula.",
        "The new clubs have delivered the result they were purchased to provide.",
      ],

      eagle: [
        "Carl may finally have discovered the perfect setup.",
        "That is a spectacular result from the equipment laboratory.",
        "The latest Carl swing theory has produced an eagle.",
      ],

      par: [
        "Carl records a par while quietly reviewing the data.",
        "A steady hole from The Tinkerer.",
        "The new clubs have survived another hole without being blamed.",
      ],

      bogey: [
        "Carl may already be reconsidering the latest swing change.",
        "Expect another equipment conversation after that.",
        "The experiment has produced a temporary setback.",
      ],

      disaster: [
        "Carl may need a full equipment rebuild after that hole.",
        "Several swing thoughts may now be competing for attention.",
        "That could lead to a late-night driver search.",
      ],

      leading: [
        "Carl's latest golfing experiment has taken him to the top.",
        "The Tinkerer currently has the winning formula.",
        "Whatever Carl has changed, it is working beautifully.",
      ],

      chasing: [
        "Carl is adjusting his way back into contention.",
        "The latest setup is beginning to produce results.",
        "Carl appears to be solving the course one purchase at a time.",
      ],

      pressure: [
        "This may require one final swing thought from Carl.",
        "Carl has several technical options to consider before this shot.",
        "The Tinkerer is facing a proper test.",
      ],

      comeback: [
        "Carl has changed the momentum of his round.",
        "The latest adjustment has sparked a serious comeback.",
        "Carl has found something and is climbing quickly.",
      ],

      rare: [
        "Carl may never change that club again after this.",
        "That shot could become the basis of an entirely new swing theory.",
        "The equipment experiment has delivered a major breakthrough.",
      ],
    },

    runningJokes: [
      "A new shaft may still be ordered tonight.",
      "The club setup will be reviewed regardless of the result.",
      "A good golfer never blames his tools. Carl prefers to keep his options open.",
      "Carl may finally have found the correct combination of club, shaft, grip and moon phase.",
      "The latest expensive solution to golf appears to be working.",
    ],
  },

  Painy: {
    key: "painy",
    name: "Painy",
    nickname: "The Options Trader",

    traits: [
      "steady",
      "consistent",
      "experienced",
      "backup_plan",
    ],

    jokeKeys: ["options", "backup_plan", "consistency"],

    phrases: {
      birdie: [
        "Painy quietly adds another birdie.",
        "No fuss, just quality golf from Painy.",
        "The Options Trader has selected the profitable route.",
        "Painy goes about his work with minimum drama.",
        "Another calm and clinical birdie.",
      ],

      eagle: [
        "Painy has exercised the eagle option.",
        "The former man to beat has landed a huge blow.",
        "That is an enormous result from Painy.",
      ],

      par: [
        "Painy keeps the card tidy.",
        "Another stress-free par from Painy.",
        "The safe option has produced exactly the required result.",
      ],

      bogey: [
        "A rare mistake from Painy.",
        "Painy gives one back but remains composed.",
        "The backup plan may now be required.",
      ],

      disaster: [
        "That is unusually untidy from Painy.",
        "Painy finds trouble, but there will almost certainly be another option.",
        "A difficult hole for one of the field's steadiest players.",
      ],

      leading: [
        "Painy has quietly moved into control.",
        "The Options Trader currently holds the strongest position.",
        "Painy leads with minimum fuss and maximum efficiency.",
      ],

      chasing: [
        "Painy is quietly closing in.",
        "The leader may not have noticed Painy arriving yet.",
        "Painy remains perfectly positioned with several options available.",
      ],

      pressure: [
        "Painy looks as calm as ever.",
        "This is exactly the sort of moment Painy tends to handle well.",
        "The Options Trader is assessing the risk.",
      ],

      comeback: [
        "Painy has quietly rebuilt his round.",
        "Without anyone noticing, Painy is right back in it.",
        "The comeback has been calm, controlled and carefully hedged.",
      ],

      rare: [
        "Painy has produced a moment even he may celebrate.",
        "The Options Trader has delivered the biggest return of the day.",
        "That is special from Painy.",
      ],
    },

    runningJokes: [
      "A backup plan remains available.",
      "Painy appears to have hedged against failure.",
      "The safest option has somehow produced another excellent score.",
      "He may even mention that one later.",
    ],
  },

  Dan: {
    key: "dan",
    name: "Dan",
    nickname: "The Contender",

    traits: [
      "contender",
      "quiet",
      "strong_player",
      "low_drama",
    ],

    jokeKeys: ["quiet_contender", "no_drama"],

    phrases: {
      birdie: [
        "Dan quietly adds another birdie.",
        "The Contender goes about his business.",
        "While everyone else creates the drama, Dan creates the score.",
        "Another confident hole from one of the genuine threats.",
        "Dan makes another move without making any noise.",
      ],

      eagle: [
        "Dan has landed a huge blow.",
        "The Contender produces one of the moments of the day.",
        "Quietly spectacular from Dan.",
      ],

      par: [
        "Dan keeps things moving with a solid par.",
        "No drama from The Contender.",
        "Dan remains exactly where he needs to be.",
      ],

      bogey: [
        "A rare loose hole from Dan.",
        "Dan gives one back but remains firmly involved.",
        "A small setback for one of the stronger contenders.",
      ],

      disaster: [
        "Dan has temporarily joined everyone else's drama.",
        "That is unusually chaotic from The Contender.",
        "The course has finally managed to interrupt Dan's quiet progress.",
      ],

      leading: [
        "Dan has quietly taken control.",
        "The Contender is now the man to catch.",
        "While everyone else talked, Dan moved to the top.",
      ],

      chasing: [
        "Dan is beginning to apply pressure.",
        "The Contender is quietly moving into range.",
        "The leaders will know Dan is capable of closing this quickly.",
      ],

      pressure: [
        "This is exactly where a genuine contender needs to deliver.",
        "Dan looks entirely comfortable with the situation.",
        "A major moment for one of the strongest players in the field.",
      ],

      comeback: [
        "Dan has quietly worked his way back into the tournament.",
        "The Contender is becoming dangerous again.",
        "Dan has changed the momentum without creating any fuss.",
      ],

      rare: [
        "Dan has produced something genuinely special.",
        "The Contender has delivered the statement shot.",
        "That may be the quietest spectacular moment of the day.",
      ],
    },

    runningJokes: [
      "Dan continues to play golf while everyone else creates content.",
      "No speech, no drama, just another good score.",
      "The Contender has once again declined to make a fuss.",
    ],
  },

  Wrighty: {
    key: "wrighty",
    name: "Wrighty",
    nickname: "The Unbothered One",

    traits: [
      "relaxed",
      "unbothered",
      "old_clubs",
      "buggy",
    ],

    jokeKeys: ["buggy", "old_clubs", "unbothered"],

    phrases: {
      birdie: [
        "Wrighty makes birdie look almost accidental.",
        "Completely unbothered, Wrighty picks up another shot.",
        "Wrighty strolls into a birdie.",
        "Very little emotion, very good golf.",
        "Another birdie using equipment older than several members of the field.",
      ],

      eagle: [
        "Wrighty produces an eagle and still looks largely unmoved.",
        "That is spectacularly casual from Wrighty.",
        "An enormous moment delivered with minimum reaction.",
      ],

      par: [
        "Wrighty moves on with another relaxed par.",
        "No drama and no visible concern.",
        "The old clubs continue to perform their duties.",
      ],

      bogey: [
        "Wrighty gives one back and appears reasonably fine with it.",
        "A bogey, although Wrighty remains aggressively unbothered.",
        "Wrighty may or may not have noticed that dropped shot.",
      ],

      disaster: [
        "Even Wrighty may need a moment after that.",
        "The relaxed approach has finally met a difficult hole.",
        "That was unusually chaotic from The Unbothered One.",
      ],

      leading: [
        "Wrighty has casually wandered into the lead.",
        "The least concerned man on the course is currently winning.",
        "Wrighty leads and still looks completely unbothered.",
      ],

      chasing: [
        "Wrighty is quietly hanging around.",
        "The relaxed pursuit continues.",
        "Wrighty does not appear rushed by the deficit.",
      ],

      pressure: [
        "Wrighty looks completely unaware of the pressure.",
        "This may be tense for everyone except Wrighty.",
        "The calmest man on the course steps into a huge moment.",
      ],

      comeback: [
        "Wrighty has drifted back into contention.",
        "Without showing any urgency, Wrighty has closed the gap.",
        "The comeback has been suspiciously relaxed.",
      ],

      rare: [
        "Wrighty may actually react to that one.",
        "That is enough to disturb even Wrighty's calm.",
        "A huge moment from The Unbothered One.",
      ],
    },

    runningJokes: [
      "The leaderboard pressure has once again failed to reach Wrighty.",
      "The hand-me-down clubs continue to embarrass newer equipment.",
      "The suspiciously smelling buggy remains operational.",
      "There may have been a small nod of approval.",
      "Wrighty continues to look entirely unbothered.",
    ],
  },

  Liam: {
    key: "liam",
    name: "Liam",
    nickname: "The Balancing Act",

    traits: [
      "consistent",
      "capable",
      "drinker",
      "balancing_act",
    ],

    jokeKeys: ["beers", "balancing_act", "consistency"],

    phrases: {
      birdie: [
        "Liam adds another quality score.",
        "The Balancing Act is currently working perfectly.",
        "Another solid hole while the beers are apparently still helping.",
        "Liam quietly converts another chance.",
        "Capable golfer. Very capable birdie.",
      ],

      eagle: [
        "The Balancing Act has produced something spectacular.",
        "That is a huge eagle from Liam.",
        "The golf-to-beer ratio is currently delivering outstanding returns.",
      ],

      par: [
        "Liam keeps ticking along.",
        "Another dependable par from Liam.",
        "The balance remains firmly on the helpful side.",
      ],

      bogey: [
        "A small wobble in Liam's balancing act.",
        "Liam drops one, although the drinks cannot yet be held responsible.",
        "The rhythm has been interrupted temporarily.",
      ],

      disaster: [
        "The balancing act may finally be leaning the wrong way.",
        "That hole has raised questions about the refreshments strategy.",
        "Liam finds a hole where neither golf nor beer could provide the answer.",
      ],

      leading: [
        "The Balancing Act has carried Liam to the top.",
        "Liam is leading and the refreshments strategy appears fully vindicated.",
        "Consistency has placed Liam in control.",
      ],

      chasing: [
        "Liam is steadily reducing the gap.",
        "The Balancing Act is moving towards the leaders.",
        "Liam remains perfectly positioned to apply pressure.",
      ],

      pressure: [
        "Liam's balance is being tested here.",
        "This is a moment made for a steady hand.",
        "The beers are still helping. For now.",
      ],

      comeback: [
        "Liam has rebuilt his round one solid hole at a time.",
        "The Balancing Act is back under control.",
        "Liam's consistency has brought him right back into contention.",
      ],

      rare: [
        "Liam has produced a moment worth raising a glass to.",
        "The Balancing Act has delivered its greatest success yet.",
        "That is exceptional from Liam.",
      ],
    },

    runningJokes: [
      "The beers are apparently still helping.",
      "The alcohol-to-performance calculation remains under review.",
      "Nobody is currently prepared to interrupt the refreshments strategy.",
      "The balancing act continues successfully.",
    ],
  },

  Ian: {
    key: "ian",
    name: "Ian",
    nickname: "The Steady Hand",

    traits: [
      "calm",
      "steady",
      "consistent",
      "quiet_contender",
    ],

    jokeKeys: ["steady", "calm", "quiet"],

    phrases: {
      birdie: [
        "Ian calmly rolls in another birdie.",
        "No panic, no fuss, just quality from Ian.",
        "The Steady Hand makes his move.",
        "Ian handles that hole beautifully.",
        "Another composed birdie from Ian.",
      ],

      eagle: [
        "Ian produces an extraordinary result with the same calm expression.",
        "The Steady Hand has landed a massive eagle.",
        "That is sensational from Ian.",
      ],

      par: [
        "Ian takes the par and moves on.",
        "Calm and controlled from Ian.",
        "Another composed hole from The Steady Hand.",
      ],

      bogey: [
        "Ian gives one back without showing any concern.",
        "A small setback for The Steady Hand.",
        "Ian remains composed despite the bogey.",
      ],

      disaster: [
        "Even Ian could not keep that hole under control.",
        "A rare moment of disorder for The Steady Hand.",
        "Ian finds trouble but there will be no panic.",
      ],

      leading: [
        "Ian has calmly taken control.",
        "The Steady Hand is now setting the standard.",
        "Ian leads with the minimum possible drama.",
      ],

      chasing: [
        "Ian is quietly moving into position.",
        "The calm pursuit continues.",
        "Ian is applying pressure without making any noise.",
      ],

      pressure: [
        "Ian looks built for this moment.",
        "The Steady Hand appears completely settled.",
        "Pressure has not altered Ian's expression.",
      ],

      comeback: [
        "Ian has calmly worked his way back into the tournament.",
        "No panic, just a measured comeback.",
        "Ian is rebuilding this round with impressive control.",
      ],

      rare: [
        "Ian may have briefly raised an eyebrow after that.",
        "That is a special moment from The Steady Hand.",
        "Even Ian might celebrate that one.",
      ],
    },

    runningJokes: [
      "His heart rate may have reached 65.",
      "No visible signs of concern.",
      "Ian remains quietly close enough to cause problems.",
      "The Steady Hand continues without unnecessary movement.",
    ],
  },

  Stu: {
    key: "stu",
    name: "Stu",
    nickname: "The One It's All About",

    traits: [
      "birthday",
      "guest_of_honour",
      "flop_shot",
      "experienced",
    ],

    jokeKeys: ["birthday", "fifty", "flop_shot"],

    phrases: {
      birdie: [
        "The birthday boy gives himself another present.",
        "Stu adds a birdie to the celebrations.",
        "Birthday golf is treating Stu well.",
        "The One It's All About makes another move.",
        "A proper birthday birdie.",
      ],

      eagle: [
        "The birthday boy has produced the gift of the day.",
        "Stu lands a huge eagle on his 50th tour.",
        "That is a birthday moment to remember.",
      ],

      par: [
        "Stu keeps the birthday card tidy.",
        "A steady par from the guest of honour.",
        "Stu keeps the celebrations on track.",
      ],

      bogey: [
        "A small interruption to the birthday celebrations.",
        "Stu gives one back, but the party continues.",
        "The course has declined to provide another birthday present.",
      ],

      disaster: [
        "That was not included in the birthday itinerary.",
        "Stu may want to return that particular gift.",
        "A difficult hole for The One It's All About.",
      ],

      leading: [
        "The birthday boy is leading his own celebration.",
        "Stu has moved to the top on the 50th tour.",
        "The guest of honour is currently showing everyone the way.",
      ],

      chasing: [
        "Stu is making a birthday charge.",
        "The guest of honour is closing in.",
        "Stu is putting together a serious challenge.",
      ],

      pressure: [
        "A major moment on the birthday tour.",
        "Stu has the perfect opportunity to create another birthday memory.",
        "The guest of honour faces a big test.",
      ],

      comeback: [
        "Stu has brought the birthday round back to life.",
        "The birthday boy is mounting a proper comeback.",
        "Stu is turning the celebration into a contest.",
      ],

      rare: [
        "That may be the defining moment of Stu's 50th tour.",
        "The birthday boy has produced something unforgettable.",
        "That is going straight into the birthday highlights.",
      ],
    },

    runningJokes: [
      "Another present for the birthday boy.",
      "The 50th-tour content keeps writing itself.",
      "Birthday privileges may be in operation.",
      "An exquisite flop shot remains available at any moment.",
      "It is his weekend. Everyone else is apparently just attending.",
    ],
  },

  Adam: {
    key: "adam",
    name: "Adam",
    nickname: "The Shark",

    traits: [
      "big_hitter",
      "wildcard",
      "high_handicap",
      "dangerous",
    ],

    jokeKeys: ["309", "handicap", "shark"],

    phrases: {
      birdie: [
        "The Shark has taken another bite out of the course.",
        "Adam turns distance into points.",
        "The suspicious handicap continues to deliver.",
        "Another aggressive hole from Adam.",
        "Adam takes advantage of the final 36 handicap he is ever likely to receive.",
      ],

      eagle: [
        "The Shark has completely destroyed that hole.",
        "That is full-power golf from Adam.",
        "An enormous eagle from the man who still mentions 309.",
      ],

      par: [
        "Adam settles for par after another sizeable drive.",
        "A controlled par from The Shark.",
        "Distance achieved, score secured.",
      ],

      bogey: [
        "The drive may have gone miles, but the score has gone backwards.",
        "Adam finds a way to give one back.",
        "The Shark has temporarily lost the scent.",
      ],

      disaster: [
        "Adam has sent that hole into several different postcodes.",
        "The distance was impressive. The direction was negotiable.",
        "That may require more than the 309-yard story to repair.",
      ],

      leading: [
        "The Shark has powered his way to the top.",
        "Adam is currently making a mockery of the handicap system.",
        "The long-drive stories are getting louder by the minute.",
      ],

      chasing: [
        "Adam has the firepower to close this gap quickly.",
        "The Shark is circling the leaders.",
        "Adam is beginning to make serious ground.",
      ],

      pressure: [
        "Adam will not be holding back here.",
        "This is a moment for full commitment.",
        "The Shark has a chance to land a major blow.",
      ],

      comeback: [
        "Adam is powering his way back into the tournament.",
        "The comeback is gathering serious speed.",
        "The Shark is beginning to circle again.",
      ],

      rare: [
        "Adam may finally have produced something bigger than the 309 story.",
        "That is an outrageous piece of power golf.",
        "The handicap committee has officially opened an investigation.",
      ],
    },

    runningJokes: [
      "He will probably claim it carried 320.",
      "The 309-yard drive is about to be mentioned again.",
      "GPS evidence may be requested.",
      "The handicap committee has begun gathering evidence.",
      "First and last appearance from a 36 handicap appears increasingly likely.",
    ],
  },

  Phil: {
    key: "phil",
    name: "Phil",
    nickname: "The Can Crusher",

    traits: [
      "social",
      "drinker",
      "club_thrower",
      "unpredictable",
    ],

    jokeKeys: ["drinking", "cans", "club_throw"],

    phrases: {
      birdie: [
        "Phil produces another reason to celebrate.",
        "The Can Crusher has found a birdie.",
        "Phil records a birdie without throwing either the ball or the club.",
        "The golf is briefly getting in the way of the drinking.",
        "A very tidy score from a traditionally untidy operator.",
      ],

      eagle: [
        "The Can Crusher has officially taken off.",
        "Phil produces a huge eagle and celebrations may begin immediately.",
        "That is outrageous from the society entertainer.",
      ],

      par: [
        "Phil keeps things respectable with a par.",
        "The Can Crusher remains on schedule.",
        "A solid hole from Phil, with all clubs still accounted for.",
      ],

      bogey: [
        "Phil gives one back but morale appears unaffected.",
        "The Can Crusher has encountered light turbulence.",
        "A bogey, although the drinking schedule remains intact.",
      ],

      disaster: [
        "Phil may have launched the club further than the ball.",
        "The Can Crusher has experienced significant turbulence.",
        "That hole has gone completely off the planned route.",
      ],

      leading: [
        "The Can Crusher is currently leading the tournament.",
        "Phil has taken control and nobody is entirely sure how.",
        "The society entertainer is now the main event.",
      ],

      chasing: [
        "Phil is making an unexpectedly serious charge.",
        "The Can Crusher is closing in on the leaders.",
        "Phil is turning entertainment into contention.",
      ],

      pressure: [
        "A big moment for The Can Crusher.",
        "Phil faces the sort of pressure normally reserved for last orders.",
        "The society entertainer has a very serious shot to play.",
      ],

      comeback: [
        "Phil has revived the round in spectacular fashion.",
        "The Can Crusher is back on course.",
        "The comeback is gathering momentum and possibly refreshments.",
      ],

      rare: [
        "Phil may be talking about that one well into the evening.",
        "The Can Crusher has produced the moment of the tournament.",
        "That is an extraordinary contribution from the society entertainer.",
      ],
    },

    runningJokes: [
      "The drinks trolley has been placed on standby.",
      "Celebrations may be disproportionate to the achievement.",
      "All clubs remain inside the recommended throwing distance.",
      "Phil refuses to let the golf interfere with the drinking.",
      "The Can Crusher is operating at full capacity.",
    ],
  },

  Taz: {
    key: "taz",
    name: "Taz",
    nickname: "The Rookie",

    traits: [
      "beginner",
      "optimistic",
      "swing_thoughts",
      "improving",
    ],

    jokeKeys: ["rookie", "swing_thought", "memes"],

    phrases: {
      birdie: [
        "What a moment for Taz.",
        "The improvement continues at serious speed.",
        "That is proper golf from The Rookie.",
        "Taz produces one of the shots of his golfing journey.",
        "Taz has found the swing thought. Experts expect it to survive two holes.",
      ],

      eagle: [
        "Taz has produced something absolutely extraordinary.",
        "That may be the best hole Taz has ever played.",
        "An unbelievable eagle from The Rookie.",
      ],

      par: [
        "Another solid hole from Taz.",
        "The progress continues with a well-earned par.",
        "Taz keeps building confidence.",
      ],

      bogey: [
        "Taz keeps the damage under control.",
        "Another learning hole for The Rookie.",
        "Taz moves on and keeps battling.",
      ],

      disaster: [
        "Every golfer has one of those holes, especially while learning.",
        "Taz finds trouble but the improvement story continues.",
        "A difficult hole and possibly three new swing thoughts.",
      ],

      leading: [
        "Taz has produced the story of the tournament.",
        "The Rookie is now leading the field.",
        "Taz has turned beginner optimism into genuine contention.",
      ],

      chasing: [
        "Taz is putting together a serious challenge.",
        "The improvement is now visible on the leaderboard.",
        "The Rookie is beginning to close the gap.",
      ],

      pressure: [
        "A huge moment in Taz's golfing development.",
        "Taz has earned the right to enjoy this pressure.",
        "The Rookie faces one of the biggest shots of the day.",
      ],

      comeback: [
        "Taz has shown excellent resilience.",
        "The Rookie is fighting his way back.",
        "Taz has rebuilt the round impressively.",
      ],

      rare: [
        "That is a genuine milestone for Taz.",
        "One for the memes, the group chat and the highlights reel.",
        "Taz has just created one of the best stories of the day.",
      ],
    },

    runningJokes: [
      "The memes may already be under construction.",
      "That one is going straight into the group chat.",
      "Taz remains one good YouTube video away from completing golf.",
      "The latest swing thought has officially been promoted.",
      "He remains blissfully unaware of the suffering that lies ahead.",
    ],
  },
};

export function getPlayerProfile(
  playerName?: string | null
): PlayerProfile | null {
  if (!playerName) {
    return null;
  }

  const trimmedName = playerName.trim();

  const exactMatch = PLAYER_PROFILES[trimmedName];

  if (exactMatch) {
    return exactMatch;
  }

  const normalisedName = trimmedName.toLowerCase();

  return (
    Object.values(PLAYER_PROFILES).find((profile) => {
      return (
        profile.name.toLowerCase() === normalisedName ||
        profile.key.toLowerCase() === normalisedName
      );
    }) ?? null
  );
}

export function getPlayerPhrase(
  playerName: string | null | undefined,
  phraseType: PersonalityPhraseType
): string | null {
  const profile = getPlayerProfile(playerName);

  if (!profile) {
    return null;
  }

  const phrases = profile.phrases[phraseType];

  if (!phrases.length) {
    return null;
  }

  return phrases[Math.floor(Math.random() * phrases.length)];
}

export function getPlayerRunningJoke(
  playerName: string | null | undefined
): string | null {
  const profile = getPlayerProfile(playerName);

  if (!profile || !profile.runningJokes.length) {
    return null;
  }

  return profile.runningJokes[
    Math.floor(Math.random() * profile.runningJokes.length)
  ];
}