// ═════════════════════════════════════════════════════════════════════════
//   AquaTrack Kenya — mock data
//
//   In production, this entire module is replaced by API calls to the
//   AquaTrack backend (REST + WebSocket). Component code never changes —
//   the shape of the objects below is the API contract.
//
//   Data shapes match the brochure mockups exactly. Names are realistic
//   Kenyan school + swim-club content.
// ═════════════════════════════════════════════════════════════════════════

// Current authenticated parent — in production, comes from auth context
export const currentUser = {
  id: 'user_001',
  name: 'Joyce Kimani',
  email: 'joyce.kimani@example.com',
  swimmers: ['swm_001', 'swm_002'], // family-follow: 2 children
};

// All swimmers in the parent's family-follow
export const swimmers = {
  swm_001: {
    id: 'swm_001',
    name: 'Sarah Kimani',
    school: 'Brookhouse School',
    age: 11,
    isCurrentChild: true, // the one being viewed in Live page header
    avatar: 'SK',
    pbs: {
      '50FR': { time: '32.18', date: '2026-04-27', delta: -1.4 },
      '100FR': { time: '1:11.6', date: '2026-04-27', delta: -2.1 },
      '50BK': { time: '38.94', date: '2026-03-15', delta: -0.6 },
      '100BK': { time: '1:24.3', date: '2026-03-15', delta: -1.8 },
    },
  },
  swm_002: {
    id: 'swm_002',
    name: 'David Kimani',
    school: 'Brookhouse School',
    age: 9,
    isCurrentChild: false,
    avatar: 'DK',
    pbs: {
      '25FR': { time: '18.42', date: '2026-04-12', delta: -0.9 },
      '50FR': { time: '41.80', date: '2026-04-12', delta: -2.3 },
    },
  },
};

// Active gala context
export const currentGala = {
  id: 'gala_2026_04_pipssa_inv',
  name: 'PIPSSA Invitational',
  venue: 'Moi Educational Centre',
  date: '2026-04-27',
  status: 'live', // 'upcoming' | 'live' | 'completed'
  currentHeat: 4,
  totalHeats: 24,
};

// ─── Live race in progress ─────────────────────────────────────────────────
// The race lane data — order is final position once race completes
export const currentRace = {
  id: 'race_4',
  event: 'Girls 11 · 50m Freestyle',
  heatNumber: 4,
  totalHeats: 6,
  status: 'completed', // 'pending' | 'in_progress' | 'completed'
  startedAt: '2026-04-27T09:38:12+03:00',
  completedAt: '2026-04-27T09:38:46+03:00',
  lanes: [
    { lane: 1, swimmerId: 'ext_001', name: 'Farrin Savage', school: 'Sailfish SC', time: '31.42', position: 1, isPB: true, reaction: '0.68' },
    { lane: 3, swimmerId: 'swm_001', name: 'Sarah Kimani',  school: 'Brookhouse',  time: '32.18', position: 2, isPB: true, reaction: '0.71', isCurrentChild: true },
    { lane: 2, swimmerId: 'ext_002', name: 'Amy Ojee',      school: 'Aga Khan',    time: '32.74', position: 3, isPB: false, reaction: '0.74' },
    { lane: 5, swimmerId: 'ext_003', name: 'Sofie Pauwels', school: 'Banda',       time: '33.05', position: 4, isPB: false, reaction: '0.78' },
    { lane: 4, swimmerId: 'ext_004', name: 'Caitlyn Oyaro', school: 'Hillcrest',   time: '33.41', position: 5, isPB: true, reaction: '0.72' },
    { lane: 6, swimmerId: 'ext_005', name: 'Naisula Maina', school: 'Hydra SC',    time: '33.98', position: 6, isPB: false, reaction: '0.81' },
  ],
};

// ─── Live race the user can "watch" (plays out in real time) ───────────────
//   Each lane has a target finish time (seconds). The Live race view runs a
//   clock; lanes still under their finish time are "in the water", the rest
//   are done. In production this is a WebSocket stream of split/finish events.
export const liveRace = {
  id: 'race_4_live',
  event: 'Girls 11 · 50m Freestyle',
  heat: 4,
  totalHeats: 6,
  gala: 'PIPSSA Invitational',
  venue: 'Moi Educational Centre',
  distance: 50,
  videoId: 'vid_001', // race replay, available once the race finishes
  lanes: [
    { lane: 1, name: 'Farrin Savage', school: 'Sailfish SC', finish: 31.42, isPB: true },
    { lane: 2, name: 'Amy Ojee', school: 'Aga Khan', finish: 32.74 },
    { lane: 3, name: 'Sarah Kimani', school: 'Brookhouse', finish: 32.18, isPB: true, isCurrentChild: true },
    { lane: 4, name: 'Caitlyn Oyaro', school: 'Hillcrest', finish: 33.41, isPB: true },
    { lane: 5, name: 'Sofie Pauwels', school: 'Banda', finish: 33.05 },
    { lane: 6, name: 'Naisula Maina', school: 'Hydra SC', finish: 33.98 },
  ],
};

// ─── Event leaderboards ─────────────────────────────────────────────────────
export const eventLeaderboards = [
  {
    eventId: 'evt_g11_50fr',
    title: 'Girls 11 · 50m Freestyle',
    eventType: 'final',
    isComplete: true,
    rankings: [
      { position: 1, name: 'Farrin Savage', school: 'Sailfish SC',     age: 11, time: '31.42', isPB: true },
      { position: 2, name: 'Sarah Kimani',  school: 'Brookhouse',      age: 11, time: '32.18', isPB: true, isCurrentChild: true },
      { position: 3, name: 'Amy Ojee',      school: 'Aga Khan',        age: 11, time: '32.74', isPB: false },
      { position: 4, name: 'Sofie Pauwels', school: 'Banda',           age: 11, time: '33.05', isPB: false },
      { position: 5, name: 'Caitlyn Oyaro', school: 'Hillcrest',       age: 11, time: '33.41', isPB: true },
      { position: 6, name: 'Naisula Maina', school: 'Hydra SC',        age: 11, time: '33.98', isPB: false },
    ],
  },
  {
    eventId: 'evt_g11_100fr',
    title: 'Girls 11 · 100m Freestyle',
    eventType: 'final',
    isComplete: true,
    rankings: [
      { position: 1, name: 'Farrin Savage', school: 'Sailfish SC',     age: 11, time: '1:08.42', isPB: false },
      { position: 2, name: 'Sarah Kimani',  school: 'Brookhouse',      age: 11, time: '1:11.6',  isPB: true, isCurrentChild: true },
      { position: 3, name: 'Sofie Pauwels', school: 'Banda',           age: 11, time: '1:13.18', isPB: true },
      { position: 4, name: 'Amy Ojee',      school: 'Aga Khan',        age: 11, time: '1:14.82', isPB: false },
    ],
  },
  {
    eventId: 'evt_g11_50bk',
    title: 'Girls 11 · 50m Backstroke',
    eventType: 'final',
    isComplete: false,
    rankings: [],
  },
];

// ─── School / team standings ───────────────────────────────────────────────
export const schoolStandings = [
  { rank: 1, name: 'Brookhouse School',     points: 428, change: 0,  isOurSchool: true },
  { rank: 2, name: 'Hillcrest International', points: 391, change: 1 },
  { rank: 3, name: 'Aga Khan Academy',       points: 364, change: -1 },
  { rank: 4, name: 'Banda School',           points: 312, change: 2 },
  { rank: 5, name: 'Peponi School',          points: 298, change: 0 },
  { rank: 6, name: 'Braeburn Garden Estate', points: 264, change: -2 },
  { rank: 7, name: 'St Christopher\'s',      points: 241, change: 1 },
  { rank: 8, name: 'Sailfish SC',            points: 218, change: -1 },
];

// ─── School competition history (drill-down from School standings) ─────────
//   getSchoolCompetitions(schoolName) returns the galas a school has competed
//   in this season, each with the school's placement, points earned, and a
//   breakdown of notable individual results. In production this is
//   `GET /schools/:id/competitions`.
const SEASON_GALAS = [
  { id: 'g_pipssa', name: 'PIPSSA Invitational', date: '2026-04-27', venue: 'Moi Educational Centre' },
  { id: 'g_kcaa', name: 'KCAA County Gala', date: '2026-03-15', venue: 'Aga Khan Sports Complex' },
  { id: 'g_champs', name: 'Kenya Aquatics Champs', date: '2026-02-08', venue: 'Kasarani Aquatics Centre' },
  { id: 'g_ncaa', name: 'NCAA Regional Meet', date: '2026-01-25', venue: 'Nairobi Academy Pool' },
];

const EVENT_POOL = [
  'Girls 11 · 50m Freestyle',
  'Boys 9 · 50m Freestyle',
  'Girls 11 · 100m Freestyle',
  'Boys 13 · 100m Backstroke',
  'Mixed · 4×50m Freestyle Relay',
];

// Explicit, richer history for our school (includes the followed swimmers)
const BROOKHOUSE_COMPETITIONS = [
  {
    ...SEASON_GALAS[0],
    placement: 1,
    schoolsCount: 8,
    points: 142,
    results: [
      { event: 'Girls 11 · 50m Freestyle', swimmer: 'Sarah Kimani', time: '32.18', place: 2, isPB: true },
      { event: 'Girls 11 · 100m Freestyle', swimmer: 'Sarah Kimani', time: '1:11.6', place: 2, isPB: true },
      { event: 'Boys 9 · 50m Freestyle', swimmer: 'David Kimani', time: '41.80', place: 4, isPB: true },
      { event: 'Mixed · 4×50m Freestyle Relay', swimmer: 'Brookhouse A', time: '2:18.4', place: 1 },
    ],
  },
  {
    ...SEASON_GALAS[1],
    placement: 2,
    schoolsCount: 6,
    points: 118,
    results: [
      { event: 'Girls 11 · 50m Backstroke', swimmer: 'Sarah Kimani', time: '38.94', place: 3, isPB: true },
      { event: 'Boys 9 · 25m Freestyle', swimmer: 'David Kimani', time: '18.42', place: 3, isPB: true },
      { event: 'Girls 13 · 100m Medley', swimmer: 'Wanjiru Maina', time: '1:21.0', place: 2 },
    ],
  },
  {
    ...SEASON_GALAS[2],
    placement: 1,
    schoolsCount: 12,
    points: 168,
    results: [
      { event: 'Girls 11 · 50m Freestyle', swimmer: 'Sarah Kimani', time: '33.02', place: 1, isPB: false },
      { event: 'Girls 13 · 200m Freestyle', swimmer: 'Wanjiru Maina', time: '2:34.1', place: 2 },
      { event: 'Mixed · 4×50m Freestyle Relay', swimmer: 'Brookhouse A', time: '2:20.1', place: 2 },
    ],
  },
];

const NAME_POOL = ['Aisha N.', 'Liam O.', 'Tara K.', 'Brian O.', 'Zoe W.', 'Adam K.', 'Maya P.', 'Noah G.'];

function generateCompetitions(schoolName, baseRank) {
  // Deterministic-ish variation so each school reads differently but stably
  const seed = schoolName.length;
  return SEASON_GALAS.slice(0, 3).map((gala, gi) => {
    const placement = Math.max(1, ((baseRank + gi + seed) % 7) + 1);
    const schoolsCount = 6 + ((seed + gi) % 7);
    const points = 90 + ((seed * 7 + gi * 23) % 80);
    const results = EVENT_POOL.slice(0, 3).map((event, ri) => {
      const place = ((seed + gi + ri) % 6) + 1;
      const secs = 31 + ((seed + ri * 3 + gi * 2) % 9) + ri * 5;
      return {
        event,
        swimmer: NAME_POOL[(seed + gi * 2 + ri) % NAME_POOL.length],
        time: `${secs}.${String((seed * 3 + ri) % 100).padStart(2, '0')}`,
        place,
        isPB: (seed + ri + gi) % 4 === 0,
      };
    });
    return { ...gala, placement, schoolsCount, points, results };
  });
}

export function getSchoolCompetitions(schoolName) {
  if (schoolName === 'Brookhouse School') return BROOKHOUSE_COMPETITIONS;
  const ranked = schoolStandings.find((s) => s.name === schoolName);
  return generateCompetitions(schoolName, ranked ? ranked.rank : 4);
}

// ─── Season rankings (across all galas this year) ─────────────────────────
export const seasonRankings = [
  {
    eventId: 'evt_season_g11_50fr',
    title: 'Girls 11 · 50m Freestyle · Season',
    rankings: [
      { position: 1, name: 'Farrin Savage',  school: 'Sailfish SC', time: '31.42', galas: 7 },
      { position: 2, name: 'Sarah Kimani',   school: 'Brookhouse',  time: '32.18', galas: 6, isCurrentChild: true },
      { position: 3, name: 'Aaliya Karim',   school: 'Aga Khan',    time: '32.45', galas: 5 },
      { position: 4, name: 'Amy Ojee',       school: 'Aga Khan',    time: '32.74', galas: 7 },
      { position: 5, name: 'Tara Kimotho',   school: 'Hillcrest',   time: '33.10', galas: 6 },
    ],
  },
];

// ─── Race videos (per swimmer, per gala) ──────────────────────────────────
export const videos = [
  {
    id: 'vid_001',
    swimmerId: 'swm_001',
    title: '50m Freestyle',
    galaName: 'PIPSSA Invitational',
    eventDate: '2026-04-27T09:38:00+03:00',
    duration: 32,
    thumbnailGradient: 'from-cyan-deep via-cyan to-ink',
    stats: {
      time: '32.18',
      position: 2,
      totalSwimmers: 8,
      reaction: '0.71',
      isPB: true,
      pbDelta: -1.4,
    },
    cameraAngle: 'Camera 2 · Finish',
    isLatest: true,
  },
  {
    id: 'vid_002',
    swimmerId: 'swm_001',
    title: '100m Freestyle',
    galaName: 'PIPSSA Invitational',
    eventDate: '2026-04-27T10:18:00+03:00',
    duration: 73,
    thumbnailGradient: 'from-ink via-cyan-deep to-cyan',
    stats: {
      time: '1:11.6',
      position: 2,
      totalSwimmers: 8,
      reaction: '0.74',
      isPB: true,
      pbDelta: -2.1,
    },
    cameraAngle: 'Camera 1 · Overhead',
    isLatest: false,
  },
  {
    id: 'vid_003',
    swimmerId: 'swm_001',
    title: '50m Backstroke',
    galaName: 'KCAA County Gala',
    eventDate: '2026-03-15T11:24:00+03:00',
    duration: 41,
    thumbnailGradient: 'from-cyan via-cyan-deep to-ink',
    stats: {
      time: '38.94',
      position: 3,
      totalSwimmers: 8,
      reaction: '0.79',
      isPB: true,
      pbDelta: -0.6,
    },
    cameraAngle: 'Camera 2 · Finish',
    isLatest: false,
  },
  {
    id: 'vid_004',
    swimmerId: 'swm_001',
    title: '100m Backstroke',
    galaName: 'KCAA County Gala',
    eventDate: '2026-03-15T11:51:00+03:00',
    duration: 84,
    thumbnailGradient: 'from-ink via-cyan to-cyan-deep',
    stats: {
      time: '1:24.3',
      position: 4,
      totalSwimmers: 8,
      reaction: '0.82',
      isPB: false,
      pbDelta: 0.4,
    },
    cameraAngle: 'Camera 1 · Overhead',
    isLatest: false,
  },
  {
    id: 'vid_005',
    swimmerId: 'swm_001',
    title: '50m Freestyle',
    galaName: 'Term 1 Internal',
    eventDate: '2026-02-20T14:18:00+03:00',
    duration: 33,
    thumbnailGradient: 'from-cyan-deep via-ink to-cyan',
    stats: {
      time: '33.58',
      position: 1,
      totalSwimmers: 6,
      reaction: '0.69',
      isPB: false,
      pbDelta: 0.2,
    },
    cameraAngle: 'Camera 2 · Finish',
    isLatest: false,
  },
];

// ─── PB history for charts ─────────────────────────────────────────────────
export const pbHistory = {
  '50FR': [
    { gala: 'Aug \'25', time: 35.20 },
    { gala: 'Sep \'25', time: 34.32 },
    { gala: 'Oct \'25', time: 33.45 },
    { gala: 'Nov \'25', time: 33.20 },
    { gala: 'Mar \'26', time: 33.58 },
    { gala: 'Apr \'26', time: 32.18 },
  ],
};

// ═════════════════════════════════════════════════════════════════════════
//   ONBOARDING DATA — schools and searchable swimmer roster
//
//   In production this comes from `GET /schools` and
//   `GET /schools/:id/swimmers` endpoints, both paginated. Schools opt in
//   when they sign their service contract; swimmers are imported from the
//   school's heat-sheet PDF or entered manually.
// ═════════════════════════════════════════════════════════════════════════

export const schools = [
  { id: 'brookhouse',      name: 'Brookhouse School',          location: 'Karen, Nairobi',     swimmers: 18 },
  { id: 'hillcrest',       name: 'Hillcrest International',    location: 'Karen, Nairobi',     swimmers: 16 },
  { id: 'aga-khan-nbo',    name: 'Aga Khan Academy',           location: 'Parklands, Nairobi', swimmers: 14 },
  { id: 'banda',           name: 'Banda School',               location: 'Lang\'ata, Nairobi', swimmers: 12 },
  { id: 'peponi',          name: 'Peponi School',              location: 'Ruiru',              swimmers: 11 },
  { id: 'braeburn-garden', name: 'Braeburn Garden Estate',     location: 'Thigiri, Nairobi',   swimmers: 13 },
  { id: 'isk',             name: 'International School of Kenya', location: 'Kitisuru, Nairobi', swimmers: 17 },
  { id: 'st-christophers', name: 'St Christopher\'s School',   location: 'Karen, Nairobi',     swimmers: 10 },
  { id: 'gems-cambridge',  name: 'GEMS Cambridge',             location: 'Karen, Nairobi',     swimmers: 9 },
  { id: 'kenton-college',  name: 'Kenton College',             location: 'Kileleshwa, Nairobi',swimmers: 11 },
  { id: 'sailfish',        name: 'Sailfish Swimming Club',     location: 'Westlands, Nairobi', swimmers: 22 },
  { id: 'hydra-sc',        name: 'Hydra Swim Club',            location: 'Karen, Nairobi',     swimmers: 15 },
  { id: 'mombasa-aquatics', name:'Mombasa Aquatics Club',      location: 'Nyali, Mombasa',     swimmers: 12 },
  { id: 'other',           name: 'Other / Add manually',       location: '',                   swimmers: 0 },
];

// Searchable swimmer roster — about 70 swimmers across 13 schools.
// In production this is `GET /schools/:id/swimmers?search=...`
export const swimmerDatabase = [
  // Brookhouse
  { id: 'swm_001', name: 'Sarah Kimani',     schoolId: 'brookhouse',     age: 11 },
  { id: 'swm_002', name: 'David Kimani',     schoolId: 'brookhouse',     age: 9  },
  { id: 'swm_b1',  name: 'Aaliya Karim',     schoolId: 'brookhouse',     age: 12 },
  { id: 'swm_b2',  name: 'Liam O\'Brien',    schoolId: 'brookhouse',     age: 10 },
  { id: 'swm_b3',  name: 'Wanjiru Maina',    schoolId: 'brookhouse',     age: 13 },
  { id: 'swm_b4',  name: 'Adam Khan',        schoolId: 'brookhouse',     age: 8  },
  { id: 'swm_b5',  name: 'Tessa Mwangi',     schoolId: 'brookhouse',     age: 14 },
  { id: 'swm_b6',  name: 'Brian Otieno',     schoolId: 'brookhouse',     age: 11 },
  // Hillcrest
  { id: 'swm_h1',  name: 'Caitlyn Oyaro',    schoolId: 'hillcrest',      age: 11 },
  { id: 'swm_h2',  name: 'Tara Kimotho',     schoolId: 'hillcrest',      age: 12 },
  { id: 'swm_h3',  name: 'James Wachira',    schoolId: 'hillcrest',      age: 10 },
  { id: 'swm_h4',  name: 'Naledi Mwamba',    schoolId: 'hillcrest',      age: 13 },
  { id: 'swm_h5',  name: 'Akinyi Odhiambo',  schoolId: 'hillcrest',      age: 9  },
  { id: 'swm_h6',  name: 'Daniel Patel',     schoolId: 'hillcrest',      age: 14 },
  { id: 'swm_h7',  name: 'Sophie Karanja',   schoolId: 'hillcrest',      age: 12 },
  // Aga Khan
  { id: 'swm_a1',  name: 'Amy Ojee',         schoolId: 'aga-khan-nbo',   age: 11 },
  { id: 'swm_a2',  name: 'Zayd Hussein',     schoolId: 'aga-khan-nbo',   age: 13 },
  { id: 'swm_a3',  name: 'Imani Wanjiru',    schoolId: 'aga-khan-nbo',   age: 9  },
  { id: 'swm_a4',  name: 'Ali Rashid',       schoolId: 'aga-khan-nbo',   age: 12 },
  { id: 'swm_a5',  name: 'Mariam Saleh',     schoolId: 'aga-khan-nbo',   age: 10 },
  { id: 'swm_a6',  name: 'Yusuf Ahmed',      schoolId: 'aga-khan-nbo',   age: 14 },
  // Banda
  { id: 'swm_bn1', name: 'Sofie Pauwels',    schoolId: 'banda',          age: 11 },
  { id: 'swm_bn2', name: 'Henry Mutua',      schoolId: 'banda',          age: 13 },
  { id: 'swm_bn3', name: 'Lola Achieng',     schoolId: 'banda',          age: 10 },
  { id: 'swm_bn4', name: 'Max Johnson',      schoolId: 'banda',          age: 8  },
  { id: 'swm_bn5', name: 'Nimo Hassan',      schoolId: 'banda',          age: 12 },
  // Peponi
  { id: 'swm_p1',  name: 'Olivia Smith',     schoolId: 'peponi',         age: 11 },
  { id: 'swm_p2',  name: 'Mwende Kamau',     schoolId: 'peponi',         age: 9  },
  { id: 'swm_p3',  name: 'Theo Ndegwa',      schoolId: 'peponi',         age: 13 },
  { id: 'swm_p4',  name: 'Zuri Wanyama',     schoolId: 'peponi',         age: 12 },
  // Braeburn Garden
  { id: 'swm_bg1', name: 'Cherono Chebet',   schoolId: 'braeburn-garden', age: 12 },
  { id: 'swm_bg2', name: 'Ryan Kariuki',     schoolId: 'braeburn-garden', age: 10 },
  { id: 'swm_bg3', name: 'Aisha Diaby',      schoolId: 'braeburn-garden', age: 14 },
  { id: 'swm_bg4', name: 'Leon Kipchoge',    schoolId: 'braeburn-garden', age: 11 },
  // ISK
  { id: 'swm_i1',  name: 'Ethan Williams',   schoolId: 'isk',            age: 13 },
  { id: 'swm_i2',  name: 'Maya Olufemi',     schoolId: 'isk',            age: 11 },
  { id: 'swm_i3',  name: 'Aiden Brooks',     schoolId: 'isk',            age: 9  },
  { id: 'swm_i4',  name: 'Zoe Wafula',       schoolId: 'isk',            age: 12 },
  { id: 'swm_i5',  name: 'Felix Cherono',    schoolId: 'isk',            age: 14 },
  // St Christopher's
  { id: 'swm_sc1', name: 'Hannah Njeri',     schoolId: 'st-christophers', age: 10 },
  { id: 'swm_sc2', name: 'Lucas Kiprop',     schoolId: 'st-christophers', age: 13 },
  { id: 'swm_sc3', name: 'Tasha Wanjiku',    schoolId: 'st-christophers', age: 11 },
  // GEMS Cambridge
  { id: 'swm_g1',  name: 'Aarav Patel',      schoolId: 'gems-cambridge', age: 12 },
  { id: 'swm_g2',  name: 'Priya Sharma',     schoolId: 'gems-cambridge', age: 9  },
  { id: 'swm_g3',  name: 'Marcus Owino',     schoolId: 'gems-cambridge', age: 13 },
  // Kenton College
  { id: 'swm_k1',  name: 'Charlie Knight',   schoolId: 'kenton-college', age: 10 },
  { id: 'swm_k2',  name: 'Elena Stewart',    schoolId: 'kenton-college', age: 12 },
  { id: 'swm_k3',  name: 'Jasmin Cherop',    schoolId: 'kenton-college', age: 11 },
  // Sailfish SC
  { id: 'swm_sf1', name: 'Farrin Savage',    schoolId: 'sailfish',       age: 11 },
  { id: 'swm_sf2', name: 'Trevor Macharia',  schoolId: 'sailfish',       age: 14 },
  { id: 'swm_sf3', name: 'Nyota Akoth',      schoolId: 'sailfish',       age: 10 },
  { id: 'swm_sf4', name: 'Diana Wairimu',    schoolId: 'sailfish',       age: 12 },
  { id: 'swm_sf5', name: 'Calvin Atieno',    schoolId: 'sailfish',       age: 13 },
  // Hydra SC
  { id: 'swm_hy1', name: 'Naisula Maina',    schoolId: 'hydra-sc',       age: 11 },
  { id: 'swm_hy2', name: 'Owen Kibet',       schoolId: 'hydra-sc',       age: 13 },
  { id: 'swm_hy3', name: 'Ayan Mohamed',     schoolId: 'hydra-sc',       age: 9  },
  // Mombasa Aquatics
  { id: 'swm_m1',  name: 'Pendo Mwangeka',   schoolId: 'mombasa-aquatics', age: 12 },
  { id: 'swm_m2',  name: 'Hamza Said',       schoolId: 'mombasa-aquatics', age: 14 },
  { id: 'swm_m3',  name: 'Latifa Omar',      schoolId: 'mombasa-aquatics', age: 11 },
];
