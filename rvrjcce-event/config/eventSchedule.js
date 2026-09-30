/**
 * Event Scheduling, Venues, and Team Size Specifications
 * Colorido 2K26 - RVR & JC College of Engineering
 */

export const EVENT_DETAILS = {
  // Sports - Boys
  "Basketball": {
    category: "Sports",
    division: "Boys",
    type: "Team Participation",
    isTeam: true,
    minMembers: 5,
    maxMembers: 10,
    defaultMembers: 5,
    venue: "RVRJC Hardcourt Arena 1",
    schedule: "2026-02-26 (09:00)",
    rules: "Knockout tournament. Standard FIBA timing and foul regulations. 5 on court + substitutes."
  },
  "Volleyball": {
    category: "Sports",
    division: "Boys",
    type: "Team Participation",
    isTeam: true,
    minMembers: 6,
    maxMembers: 12,
    defaultMembers: 6,
    venue: "RVRJC Outdoor Clay / Synthetic Court",
    schedule: "2026-02-26 (10:30)",
    rules: "FIVB standard rules. Best of 3 sets. 6 on court + libero rotation permitted."
  },
  "Table Tennis": {
    category: "Sports",
    division: "Boys",
    type: "Individual / Pairs",
    isTeam: false,
    minMembers: 1,
    maxMembers: 2,
    defaultMembers: 1,
    venue: "RVRJC Indoor Sports Complex",
    schedule: "2026-02-26 (11:00)",
    rules: "ITTF 11-point sets, best of 5. Bring standard rubber paddles."
  },

  // Sports - Girls
  "Throwball": {
    category: "Sports",
    division: "Girls",
    type: "Team Participation",
    isTeam: true,
    minMembers: 7,
    maxMembers: 12,
    defaultMembers: 7,
    venue: "RVRJC Standard Throwball Court",
    schedule: "2026-02-26 (09:30)",
    rules: "Two-handed catching and single-handed overhead release within 3 seconds. 7 on court."
  },
  "Tennis": {
    category: "Sports",
    division: "Girls",
    type: "Individual / Pairs",
    isTeam: false,
    minMembers: 1,
    maxMembers: 2,
    defaultMembers: 1,
    venue: "RVRJC Championship Tennis Courts",
    schedule: "2026-02-26 (11:00)",
    rules: "ITF tournament rules. Proper tennis attire and court shoes required."
  },

  // Cultural Events
  "Fine Arts": {
    category: "Literary & Cultural",
    division: "Cultural / Open",
    type: "Individual Participation",
    isTeam: false,
    minMembers: 1,
    maxMembers: 1,
    defaultMembers: 1,
    venue: "Chowdavaram Seminar Hall B",
    schedule: "2026-02-26 (10:00)",
    rules: "Drawing sheets provided. Bring personal paints, charcoals, and brushes."
  },
  "Music & Band — Solo": {
    category: "Literary & Cultural",
    division: "Cultural / Open",
    type: "Individual Participation",
    isTeam: false,
    minMembers: 1,
    maxMembers: 1,
    defaultMembers: 1,
    venue: "Silver Jubilee Auditorium",
    schedule: "2026-02-26 (14:00)",
    rules: "5 minutes stage time. Sound system provided. Bring personal instruments."
  },
  "Music & Band — Group": {
    category: "Literary & Cultural",
    division: "Cultural / Open",
    type: "Team Participation",
    isTeam: true,
    minMembers: 3,
    maxMembers: 8,
    defaultMembers: 5,
    venue: "Silver Jubilee Auditorium",
    schedule: "2026-02-26 (17:30)",
    rules: "10 minutes (+ setup). Drum kit provided. Battle of the bands format."
  },
  "Dance — Solo": {
    category: "Literary & Cultural",
    division: "Cultural / Open",
    type: "Individual Participation",
    isTeam: false,
    minMembers: 1,
    maxMembers: 1,
    defaultMembers: 1,
    venue: "RVRJC Open Air Theatre (OAT)",
    schedule: "2026-02-26 (15:00)",
    rules: "4 minutes max. Classical, Folk, or Western freestyle."
  },
  "Classical / Folk Solo": {
    category: "Literary & Cultural",
    division: "Cultural / Open",
    type: "Individual Participation",
    isTeam: false,
    minMembers: 1,
    maxMembers: 1,
    defaultMembers: 1,
    venue: "RVRJC Open Air Theatre (OAT)",
    schedule: "2026-02-26 (15:00)",
    rules: "4 minutes max. Traditional costume and live/recorded accompaniment."
  },
  "Dance — Group": {
    category: "Literary & Cultural",
    division: "Cultural / Open",
    type: "Team Participation",
    isTeam: true,
    minMembers: 4,
    maxMembers: 16,
    defaultMembers: 5,
    venue: "RVRJC Open Air Theatre (OAT)",
    schedule: "2026-02-26 (18:00)",
    rules: "8 minutes max. Submit high-definition audio track 2 hours prior."
  },
  "Western Group Dance": {
    category: "Literary & Cultural",
    division: "Cultural / Open",
    type: "Team Participation",
    isTeam: true,
    minMembers: 4,
    maxMembers: 16,
    defaultMembers: 5,
    venue: "RVRJC Open Air Theatre (OAT)",
    schedule: "2026-02-26 (18:00)",
    rules: "8 minutes max. Synchronized choreography, energy, and costumes evaluated."
  },
  "Choreoday — Theme Based": {
    category: "Literary & Cultural",
    division: "Cultural / Open",
    type: "Team Participation",
    isTeam: true,
    minMembers: 8,
    maxMembers: 25,
    defaultMembers: 12,
    venue: "RVRJC Open Air Theatre (OAT)",
    schedule: "2026-02-27 (18:30)",
    rules: "10-14 minutes theatrical production with narrative theme and props."
  },
  "Dramatics": {
    category: "Literary & Cultural",
    division: "Cultural / Open",
    type: "Team Participation",
    isTeam: true,
    minMembers: 3,
    maxMembers: 12,
    defaultMembers: 5,
    venue: "Silver Jubilee Auditorium",
    schedule: "2026-02-27 (14:00)",
    rules: "One-act play (20 min) or street play (12 min). Script submitted to jury."
  },
  "Fashion Show": {
    category: "Literary & Cultural",
    division: "Cultural / Open",
    type: "Team Participation",
    isTeam: true,
    minMembers: 6,
    maxMembers: 18,
    defaultMembers: 8,
    venue: "RVRJC Open Air Theatre (OAT)",
    schedule: "2026-02-27 (19:30)",
    rules: "Runway showcase on sustainable handlooms or ethno-futurism."
  },
  "Tekraft Events": {
    category: "Literary & Cultural",
    division: "Cultural / Open",
    type: "Individual / Pairs",
    isTeam: false,
    minMembers: 1,
    maxMembers: 2,
    defaultMembers: 1,
    venue: "Decennial Block Computer Lab 3",
    schedule: "2026-02-26 (13:00)",
    rules: "3 hours live prototyping, short film, or digital motion graphics."
  },
  "Literary": {
    category: "Literary & Cultural",
    division: "Cultural / Open",
    type: "Individual / Pairs",
    isTeam: false,
    minMembers: 1,
    maxMembers: 3,
    defaultMembers: 1,
    venue: "Main Seminar Hall 1",
    schedule: "2026-02-26 (11:30)",
    rules: "Parliamentary debate, elocution, creative writing, or quiz."
  }
};

export function getEventDetails(eventName) {
  if (!eventName) {
    return {
      category: "General",
      division: "Open",
      type: "Individual Participation",
      isTeam: false,
      minMembers: 1,
      maxMembers: 1,
      defaultMembers: 1,
      venue: "RVRJC Campus Arena",
      schedule: "2026-02-26 (10:00)",
      rules: "Standard university competition guidelines apply."
    };
  }

  // Exact match
  if (EVENT_DETAILS[eventName]) return EVENT_DETAILS[eventName];

  // Partial match
  const lower = eventName.toLowerCase();
  for (const [key, val] of Object.entries(EVENT_DETAILS)) {
    if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) {
      return val;
    }
  }

  return {
    category: "General",
    division: "Open",
    type: "Individual Participation",
    isTeam: false,
    minMembers: 1,
    maxMembers: 1,
    defaultMembers: 1,
    venue: "RVRJC Main Campus",
    schedule: "2026-02-26 (10:00)",
    rules: "Standard university competition guidelines apply."
  };
}
