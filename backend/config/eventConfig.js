/**
 * Central Event Configuration for RVRJCCE Inter-College Event
 * Controls all categories, divisions, events, and validation parameters.
 */

export const INSTITUTION = {
  name: "RVRJCCE",
  fullName: "R.V.R. & J.C. College of Engineering",
  location: "Guntur, Andhra Pradesh",
  accreditation: "Autonomous • NAAC 'A+' Grade • NBA Accredited",
  eventTitle: "Inter-College Sports & Cultural Meet 2026",
  eventTagline: "Where Competition Meets Expression.",
  year: "2026"
};

export const CATEGORIES = {
  SPORTS: {
    id: "sports",
    name: "Sports",
    tagline: "Compete with purpose.",
    accentColor: "#0E2038", // Deep Institutional Navy
    badgeText: "Athletic Arena",
    number: "01",
    description: "High-intensity collegiate sports tournaments testing endurance, tactical precision, and athletic teamwork across dedicated championship facilities."
  },
  CULTURAL: {
    id: "cultural",
    name: "Literary & Cultural",
    tagline: "Expression takes many forms.",
    accentColor: "#9E472A", // Warm Terracotta Ochre
    badgeText: "Creative Stage",
    number: "02",
    description: "A celebration of vocal mastery, choreography, dramatics, fine arts, runway fashion, and literary eloquence representing collegiate talent."
  }
};

export const SPORTS_DIVISIONS = {
  BOYS: {
    id: "boys",
    label: "Boys Division",
    shortLabel: "Boys",
    events: [
      {
        id: "sports-boys-basketball",
        name: "Basketball",
        category: "sports",
        division: "Boys",
        format: "Team (5 + 5 Substitutes)",
        venueType: "Standard Hardcourt Arena",
        duration: "4 Quarters × 10 Mins",
        equipment: "Official FIBA Size 7 Balls provided",
        rules: "Knockout tournament rules apply. Standard FIBA timing and foul regulations. Team jerseys with visible uniform numbers required.",
        shortDescription: "Full-court collegiate tournament testing tactical transitions, perimeter marksmanship, and paint defense.",
        keyAttributes: ["Full Court", "Knockout Bracket", "Team Championship"]
      },
      {
        id: "sports-boys-volleyball",
        name: "Volleyball",
        category: "sports",
        division: "Boys",
        format: "Team (6 + 6 Substitutes)",
        venueType: "Outdoor Clay / Synthetic Court",
        duration: "Best of 3 Sets (Finals: Best of 5)",
        equipment: "Standard tournament net & balls",
        rules: "FIVB standard rules. Libero rotation permitted. Non-marking shoes or sports footwear mandatory.",
        shortDescription: "High-velocity spikes, athletic blocks, and disciplined rally defense in a competitive inter-college bracket.",
        keyAttributes: ["Rally Point System", "Libero Eligible", "Team Championship"]
      },
      {
        id: "sports-boys-table-tennis",
        name: "Table Tennis",
        category: "sports",
        division: "Boys",
        format: "Singles & Doubles",
        venueType: "Indoor Sports Complex",
        duration: "Best of 5 Games (11 points per game)",
        equipment: "ITTF approved 3-star 40+ plastic balls",
        rules: "ITTF rules governing legal service tosses and racket coverings. Players must bring standard rubber paddles.",
        shortDescription: "Fast-reflex indoor table tennis championship featuring sharp backhand counters and offensive spin play.",
        keyAttributes: ["Singles / Doubles", "Indoor Complex", "Individual & Pairs"]
      }
    ]
  },
  GIRLS: {
    id: "girls",
    label: "Girls Division",
    shortLabel: "Girls",
    events: [
      {
        id: "sports-girls-throwball",
        name: "Throwball",
        category: "sports",
        division: "Girls",
        format: "Team (7 + 5 Substitutes)",
        venueType: "Standard Throwball Court",
        duration: "Best of 3 Sets (25 points rally)",
        equipment: "Official Throwball Federation match balls",
        rules: "Two-handed catching and single-handed overhead release within 3 seconds. Crossing service line prohibited.",
        shortDescription: "Dynamic, fast-paced court battle emphasizing spatial awareness, catching agility, and swift offensive throws.",
        keyAttributes: ["7-Player Team", "Rally Scoring", "Team Championship"]
      },
      {
        id: "sports-girls-tennis",
        name: "Tennis",
        category: "sports",
        division: "Girls",
        format: "Singles & Doubles",
        venueType: "Championship Tennis Courts",
        duration: "Pro-set / Best of 3 Sets with tiebreak",
        equipment: "All-court pressurized balls provided",
        rules: "ITF tournament rules. Proper tennis attire and court shoes required. Deuce with advantage play.",
        shortDescription: "Baseline rallies, disciplined serve-and-volley exchanges, and cross-court winners in premier tennis brackets.",
        keyAttributes: ["Singles & Doubles", "Championship Courts", "Individual & Pairs"]
      },
      {
        id: "sports-girls-table-tennis",
        name: "Table Tennis",
        category: "sports",
        division: "Girls",
        format: "Singles & Doubles",
        venueType: "Indoor Sports Complex",
        duration: "Best of 5 Games (11 points per game)",
        equipment: "ITTF approved 3-star 40+ plastic balls",
        rules: "Standard ITTF scoring. Legal 6-inch toss on serves. Uniform sportswear mandatory.",
        shortDescription: "Indoor precision tournament showcasing swift footwork, loop drives, and disciplined defensive chopping.",
        keyAttributes: ["Singles / Doubles", "Indoor Complex", "Individual & Pairs"]
      }
    ]
  }
};

export const CULTURAL_EVENTS = [
  {
    id: "cultural-fine-arts",
    number: "01",
    name: "Fine Arts",
    category: "cultural",
    division: "Cultural / Open",
    subCategory: "Visual Arts",
    format: "Individual Competition",
    duration: "2.5 Hours",
    disciplines: ["Spot Painting", "Sketching & Charcoal", "Clay Modeling", "Poster Art"],
    shortDescription: "A test of visual imagination, composition, and brush technique responding to live thematic prompts.",
    guidelines: "Drawing sheets and basic clay provided. Artists must bring personal brushes, paints, charcoals, and sculpting implements."
  },
  {
    id: "cultural-music-band",
    number: "02",
    name: "Music & Band",
    category: "cultural",
    division: "Cultural / Open",
    subCategory: "Vocal & Instrumental",
    subEvents: ["Solo", "Group"],
    format: "Solo (Vocals/Instrumental) / Band (3-8 Members)",
    duration: "Solo: 5 Mins | Group: 10 Mins (+ setup)",
    disciplines: ["Indian Classical Vocal", "Western Solo", "Eastern Classical Instrumental", "Battle of the Bands"],
    shortDescription: "Vocal harmonies and instrumental dexterity spanning classical ragas, contemporary acoustic sets, and full rock bands.",
    guidelines: "Drum kit and stage sound system provided. Performers bring personal guitars, keyboards, violins, and brass instruments."
  },
  {
    id: "cultural-dance",
    number: "03",
    name: "Dance",
    category: "cultural",
    division: "Cultural / Open",
    subCategory: "Performing Arts",
    subEvents: ["Solo", "Group"],
    format: "Solo (4 Mins) / Group (6-16 Members, 8 Mins)",
    duration: "4 - 8 Minutes",
    disciplines: ["Classical (Kuchipudi/Bharatanatyam)", "Folk Dance", "Western Freestyle", "Hip-Hop Choreography"],
    shortDescription: "Rhythmic expression celebrating Indian classical heritage, folk traditions, and high-energy contemporary crew dance.",
    guidelines: "Audio track in high-definition MP3 must be submitted to audio console 2 hours prior to stage call. Safe props permitted."
  },
  {
    id: "cultural-choreoday",
    number: "04",
    name: "Choreoday",
    category: "cultural",
    division: "Cultural / Open",
    subCategory: "Thematic Stage Production",
    subEvents: ["Theme Based"],
    format: "Large Ensemble (12-25 Performers)",
    duration: "10 - 14 Minutes",
    disciplines: ["Thematic Narrative", "Social Relevance", "Historical Epic", "Experimental Movement"],
    shortDescription: "Flagship theatrical choreography where student troupes weave storytelling, cinematic music, and synchronized movement around a central social or cultural theme.",
    guidelines: "Original narrative synopsis required at reporting. Maximum 3 minutes for stage preparation and prop placement."
  },
  {
    id: "cultural-dramatics",
    number: "05",
    name: "Dramatics",
    category: "cultural",
    division: "Cultural / Open",
    subCategory: "Theatre & Street Play",
    format: "One-Act Play (Up to 12 actors) / Street Play / Monologue",
    duration: "One-Act: 20 Mins | Street Play: 12 Mins | Mono: 4 Mins",
    disciplines: ["One-Act Stage Play", "Nukkad Natak (Street Play)", "Dramatic Monologue", "Mime"],
    shortDescription: "A showcase of raw stage presence, vocal projection, comedic timing, and emotional resonance exploring contemporary social issues.",
    guidelines: "Original scripts or credited adaptations accepted. Script copy must be handed to jury during technical briefing."
  },
  {
    id: "cultural-fashion-show",
    number: "06",
    name: "Fashion Show",
    category: "cultural",
    division: "Cultural / Open",
    subCategory: "Runway & Styling",
    format: "Team Ensemble (10-18 Models + Stylists)",
    duration: "10 - 12 Minutes on runway",
    disciplines: ["Ethno-Futurism", "Sustainable Handlooms", "Avante-Garde Conceptual", "Heritage Textiles of India"],
    shortDescription: "An editorial runway event exploring sustainable fashion, traditional weaves of Andhra Pradesh, and avant-garde campus styling.",
    guidelines: "No vulgarity or inappropriate costume designs permitted. Emphasis placed on theme coherence, choreography, and garment craft."
  },
  {
    id: "cultural-tekraft",
    number: "07",
    name: "Tekraft Events",
    category: "cultural",
    division: "Cultural / Open",
    subCategory: "Creative Tech & Craft",
    format: "Individual or Pairs",
    duration: "3 Hours / Scheduled Submissions",
    disciplines: ["Digital Motion Graphics", "Short Film / Reel Craft", "Creative UI/UX Prototype", "Generative Graphic Design"],
    shortDescription: "Where engineering skill meets digital aesthetics: technical art, cinematic storytelling, and multimedia creative craft.",
    guidelines: "Assets created during competition hours. Hardware/laptops must be brought by participants. Prompts disclosed at start."
  },
  {
    id: "cultural-literary",
    number: "08",
    name: "Literary",
    category: "cultural",
    division: "Cultural / Open",
    subCategory: "Oratory & Wordcraft",
    format: "Individual / Parliamentary Debate Teams (2-3)",
    duration: "Various rounds (Debate: 4 Mins per speaker)",
    disciplines: ["Parliamentary Debate", "Elocution", "Creative Writing (English/Telugu)", "General & Literary Quiz"],
    shortDescription: "Intellectual sparring, eloquent oratory, persuasive argumentation, and nuanced creative prose across multilingual disciplines.",
    guidelines: "Topics for extempore and debate announced with 10-minute prep time. Clean collegiate discourse and rebuttal rules observed."
  }
];

// Helper to retrieve flat registration event list based on category & division selection
export function getAvailableEvents(category, division) {
  if (category === "sports") {
    if (division === "Boys") {
      return SPORTS_DIVISIONS.BOYS.events.map(e => e.name);
    } else if (division === "Girls") {
      return SPORTS_DIVISIONS.GIRLS.events.map(e => e.name);
    }
    return [
      ...SPORTS_DIVISIONS.BOYS.events.map(e => `${e.name} (Boys)`),
      ...SPORTS_DIVISIONS.GIRLS.events.map(e => `${e.name} (Girls)`)
    ];
  } else if (category === "cultural" || category === "Literary & Cultural") {
    return [
      "Fine Arts",
      "Music & Band — Solo",
      "Music & Band — Group",
      "Dance — Solo",
      "Dance — Group",
      "Choreoday — Theme Based",
      "Dramatics",
      "Fashion Show",
      "Tekraft Events",
      "Literary"
    ];
  }
  return [];
}
