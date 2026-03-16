export const events = [
  {
    id: "rooftop-rose",
    name: "Rooftop Ros\u00e9",
    date: "Saturday, March 15",
    time: "7:00 PM",
    venue: "L.A. Jackson",
    neighborhood: "The Gulch",
    price: 55,
    ageRange: "Ages 25-35",
    spotsLeft: 6,
    dressCode: "Cocktail Attire",
    gradient: "from-black via-black to-gold/30",
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
    description:
      "Join us on one of Nashville\u2019s most iconic rooftops for an evening of ros\u00e9, real conversation, and skyline views. L.A. Jackson\u2019s rooftop sets the perfect backdrop for connection \u2014 with curated wine flights, ambient music, and the kind of energy that only a Nashville sunset can bring.",
    timeline: [
      { time: "7:00 PM", activity: "Arrival & Welcome Ros\u00e9" },
      { time: "7:30 PM", activity: "Guided Icebreaker Round" },
      { time: "8:00 PM", activity: "Curated Wine Flight Tasting" },
      { time: "8:30 PM", activity: "Open Mingle & Rooftop Views" },
      { time: "9:15 PM", activity: "Double Take Matching" },
      { time: "9:30 PM", activity: "Event Wraps" },
    ],
  },
  {
    id: "coffee-hike-radnor",
    name: "Coffee + Hike: Radnor Lake",
    date: "Sunday, March 16",
    time: "8:30 AM",
    venue: "Radnor Lake Trailhead",
    neighborhood: "South Nashville",
    price: 35,
    ageRange: "Ages 25-38",
    spotsLeft: 10,
    dressCode: "Athleisure",
    gradient: "from-black via-black to-black",
    image:
      "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80",
    description:
      "Start your Sunday with cold brew, fresh air, and great company. We\u2019ll pair you with rotating trail partners as you walk the scenic Radnor Lake loop. It\u2019s a low-key, high-connection morning \u2014 because the best conversations happen when you\u2019re side by side, not across a table.",
    timeline: [
      { time: "8:30 AM", activity: "Check-in & Cold Brew" },
      { time: "8:45 AM", activity: "Trail Partner Assignments" },
      { time: "9:00 AM", activity: "Hike Begins \u2014 Partner Rotation Every 15 Min" },
      { time: "10:15 AM", activity: "Trailhead Regroup & Snacks" },
      { time: "10:30 AM", activity: "Double Take Matching" },
      { time: "10:45 AM", activity: "Event Wraps" },
    ],
  },
  {
    id: "candlelight-conversation",
    name: "Candlelight & Conversation",
    date: "Wednesday, March 19",
    time: "7:30 PM",
    venue: "Bastion",
    neighborhood: "Sylvan Park",
    price: 50,
    ageRange: "Ages 28-40",
    spotsLeft: 4,
    dressCode: "Smart Casual",
    gradient: "from-gold via-gold to-sand",
    image:
      "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=800&q=80",
    description:
      "An intimate evening in one of Nashville\u2019s most stunning spaces. Guided by thoughtful conversation prompts, you\u2019ll share stories, laugh, and discover what makes someone truly interesting \u2014 all by candlelight. This isn\u2019t speed dating. It\u2019s slow, intentional connection.",
    timeline: [
      { time: "7:30 PM", activity: "Arrival & Signature Cocktail" },
      { time: "8:00 PM", activity: "Guided Conversation \u2014 Round 1" },
      { time: "8:30 PM", activity: "Table Rotation" },
      { time: "8:45 PM", activity: "Guided Conversation \u2014 Round 2" },
      { time: "9:15 PM", activity: "Open Mingle by Candlelight" },
      { time: "9:45 PM", activity: "Double Take Matching" },
      { time: "10:00 PM", activity: "Event Wraps" },
    ],
  },
  {
    id: "trivia-night",
    name: "Trivia Night: Battle of the Singles",
    date: "Thursday, March 20",
    time: "7:00 PM",
    venue: "5th & Taylor",
    neighborhood: "Germantown",
    price: 45,
    ageRange: "Ages 25-35",
    spotsLeft: 12,
    dressCode: "Casual Chic",
    gradient: "from-black via-gold/40 to-black",
    image:
      "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&q=80",
    description:
      "Team up with strangers. Compete for glory. Connect after. We\u2019ll randomly assign teams, so you\u2019ll be collaborating with new people all night \u2014 over music rounds, Nashville trivia, and a few surprises. Winners get bragging rights (and a free round). Everyone wins at connection.",
    timeline: [
      { time: "7:00 PM", activity: "Arrival & Team Assignments" },
      { time: "7:30 PM", activity: "Round 1: Nashville Trivia" },
      { time: "8:00 PM", activity: "Round 2: Music & Pop Culture" },
      { time: "8:30 PM", activity: "Halftime Mingle Break" },
      { time: "8:45 PM", activity: "Round 3: Wildcard Lightning Round" },
      { time: "9:15 PM", activity: "Winners Announced & Open Mingle" },
      { time: "9:45 PM", activity: "Double Take Matching" },
      { time: "10:00 PM", activity: "Event Wraps" },
    ],
  },
];

export const eventTypes = [
  {
    name: "Rooftop Wine Tastings",
    description: "Sunset views, curated flights, and conversations that matter.",
    price: "From $50",
    gradient: "from-black via-black to-gold/20",
    image:
      "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&q=80",
  },
  {
    name: "Coffee + Hikes",
    description: "Trail conversations with rotating partners at Radnor Lake.",
    price: "From $30",
    gradient: "from-black via-black to-black",
    image:
      "https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=800&q=80",
  },
  {
    name: "Cocktail Masterclasses",
    description: "Mix drinks and chemistry at Nashville\u2019s best bars.",
    price: "From $55",
    gradient: "from-gold via-gold to-sand/60",
    image:
      "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=80",
  },
  {
    name: "VIP Dinner Parties",
    description: "Intimate 16-person chef\u2019s table experiences.",
    price: "From $85",
    gradient: "from-black via-black to-gold/30",
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
  },
  {
    name: "Trivia Nights",
    description: "Team up with strangers. Win together. Connect after.",
    price: "From $40",
    gradient: "from-black via-gold/30 to-black",
    image:
      "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&q=80",
  },
  {
    name: "Candlelight & Conversation",
    description: "Guided conversations in stunning venues.",
    price: "From $45",
    gradient: "from-gold via-black/40 to-gold",
    image:
      "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=800&q=80",
  },
];

export const neighborhoods = [
  {
    name: "Germantown",
    gradient: "from-black to-black",
    image:
      "https://images.unsplash.com/photo-1555992336-03a23c7b20ee?w=600&q=80",
  },
  {
    name: "East Nashville",
    gradient: "from-gold to-gold",
    image:
      "https://images.unsplash.com/photo-1533105079903-3e4f7bbc650a?w=600&q=80",
  },
  {
    name: "The Gulch",
    gradient: "from-black to-black",
    image:
      "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=600&q=80",
  },
  {
    name: "12 South",
    gradient: "from-gold to-sand",
    image:
      "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=600&q=80",
  },
];


export const faqData = [
  {
    question: "What is TR\u00dc Dating Nashville?",
    answer:
      "TR\u00dc is a curated dating events company for Nashville singles aged 25\u201342. We host in-person events \u2014 rooftop tastings, hikes, dinner parties, trivia nights, and more \u2014 designed to help you meet quality people through shared experiences, not swiping.",
  },
  {
    question: "How does the application process work?",
    answer:
      "Submit a short application telling us about yourself. We review every application personally to ensure our events have the right mix of interesting, genuine people. You\u2019ll hear back within 48 hours. Once accepted, you\u2019ll get access to our event calendar and can start booking immediately.",
  },
  {
    question: "How much does it cost?",
    answer:
      "$25/month membership gives you access to all TR\u00dc events and our Double Take matching system. Event tickets are purchased separately and range from $30\u2013$85.",
  },
  {
    question: "What are the events like?",
    answer:
      "Think rooftop wine tastings, morning hikes at Radnor Lake, cocktail masterclasses, candlelit conversation dinners, and trivia nights \u2014 not awkward happy hours. Every event is designed with an icebreaker structure that makes it easy to meet everyone, plus built-in rotation so you\u2019re not stuck in one conversation all night.",
  },
  {
    question: "What should I wear?",
    answer:
      "Each event listing includes a dress code. Generally: cocktail attire for evening events, smart casual for dinners and conversations, and athleisure for hikes. When in doubt, dress like you\u2019re meeting someone you want to impress \u2014 because you might be.",
  },
  {
    question: "What\u2019s Double Take?",
    answer:
      "Double Take is our post-event matching system. After every event, you\u2019ll tell us who caught your eye. If the feeling is mutual, we\u2019ll connect you with a private introduction. No awkward DMs, no uncertainty \u2014 just mutual interest, confirmed.",
  },
  {
    question: "Can I attend events alone?",
    answer:
      "Absolutely \u2014 and most people do. Our events are designed so you\u2019ll meet everyone naturally through guided icebreakers and rotations. You can also bring a friend if that\u2019s more your speed.",
  },
  {
    question: "What\u2019s the age range?",
    answer:
      "Our community is primarily 25\u201342, though individual events may have specific age ranges (listed on each event page). We curate age ranges to ensure everyone at an event is in a similar life stage.",
  },
  {
    question: "How do you keep events balanced?",
    answer:
      "We carefully manage the guest list for every event to maintain a balanced ratio and a great mix of personalities. This is one of the key reasons we have an application process \u2014 so we can be intentional about who\u2019s in the room.",
  },
  {
    question: "Is my information private?",
    answer:
      "Yes. Your application information is kept strictly confidential and is only used to review your application and curate events. We never share your personal information with other members or third parties. Your Double Take selections are also completely private \u2014 matches are only revealed when they\u2019re mutual.",
  },
  {
    question: "Can I get a refund?",
    answer:
      "Tickets are refundable up to 48 hours before an event. Within 48 hours, we can offer a credit toward a future event. No-shows are not eligible for refunds. We understand plans change \u2014 just let us know as early as possible so we can offer your spot to someone on the waitlist.",
  },
  {
    question: "How do I cancel my membership?",
    answer:
      "You can cancel your $25/month membership anytime from your dashboard or by emailing hello@trudating.com. No cancellation fees, no questions asked.",
  },
];
