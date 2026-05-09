import { Character, StageInput, EncounterResult } from "./types";

// ─── Weather tables ────────────────────────────────────────────────────────────

const WEATHER_BY_SEASON_TERRAIN: Record<string, Record<string, string[]>> = {
  winter: {
    arctic:    ["A howling blizzard claws at every inch of exposed skin.", "Bone-white silence cloaks the wastes; each breath steams in the frozen air.", "Ice fog rolls in, reducing visibility to a dozen feet."],
    forest:    ["Snow-laden branches shed their loads with soft thuds, startling the party.", "Frozen undergrowth crunches underfoot, announcing every step.", "A thin crust of ice on the trail makes footing treacherous."],
    grassland: ["Grey skies press low; a bitter wind strips the last dead grass from the frozen earth.", "Sleet hisses against cloaks and packs, soaking everything through.", "Snowdrifts have buried the road in places; navigation is guesswork."],
    mountain:  ["Gale-force winds threaten to peel travelers from the exposed ridgeline.", "Icicles the size of swords hang from every overhang.", "A fresh snowfall has erased the trail entirely."],
    hill:      ["Freezing fog clings to the hilltops all morning before thinning to a grey haze.", "Patches of black ice lurk on the downhill slopes.", "The wind moans between the bare thorn-bushes like distant pipe-song."],
    coast:     ["Sea-spray freezes on every surface; the salt wind bites deep.", "Storm-grey waves hammer the shore; the roar is ceaseless.", "A skin of ice has formed in the tide-pools overnight."],
    swamp:     ["Ice sheets creak ominously over the boggy channels.", "Frozen reeds rattle in the wind like skeletal fingers.", "Mist hangs low over the ice-locked marsh in the morning cold."],
    desert:    ["Nights were near-freezing; by midday a thin warmth returns but never quite enough.", "A sharp, dry wind scours the dunes, piling sand against every rock.", "The sky is a pale, wintry blue — beautiful and utterly merciless."],
    underdark: ["Cold seeps from the stone; condensation drips from the ceiling in slow, rhythmic taps.", "Subterranean drafts carry the smell of deep ice.", "The temperature is stable but always cold, a reminder of how far below the world lies."],
    urban:     ["Frost flowers bloom on every window pane; the cobblestones are treacherous.", "A thin snow dusts the rooftops; smoke rises from a hundred chimneys.", "Street vendors stamp their feet and pull their scarves tighter."],
    waterborne:["Sleet patters on the deck; every rope is stiff with ice.", "A winter squall forces the crew to furl the sails and ride it out.", "Fog is so thick the shore has vanished; only the compass gives direction."],
    default:   ["The cold is relentless, settling into joints and slowing every step.", "A grey, wintry sky offers no warmth even at midday.", "Wind finds every gap in cloak and armour alike."],
  },
  spring: {
    arctic:    ["A brief thaw has turned the ice to treacherous slush.", "Meltwater floods every low path; the party wades more than walks.", "Snow still clings to the north-facing slopes, but the sun stays up longer now."],
    forest:    ["The forest is alive with birdsong and the drip of snowmelt from high branches.", "Pale green shoots push through last year's leaf-litter.", "Showers arrive without warning, turning the track to mud in minutes."],
    grassland: ["Wildflowers are beginning to pepper the meadows with yellow and violet.", "An unpredictable spring shower drenches the party, then passes in minutes.", "A warm south breeze carries the smell of new earth."],
    mountain:  ["Snowmelt cascades down every gully, turning calm streams to churning torrents.", "The air is clear and cold at altitude, carrying the scent of pine and rain.", "Patches of brilliant sunlight alternate with racing cloud-shadow on the slopes."],
    hill:      ["The hills are green and soggy; each summit offers a wide, cloud-swept view.", "A playful wind keeps the sky moving, never letting clouds settle long.", "Fresh mud clings to boots and ankles by midday."],
    coast:     ["Spring tides run high; the party must time their beach crossing carefully.", "Sea-eagles wheel overhead against scudding white clouds.", "The air tastes of salt and rain and new growth all at once."],
    swamp:     ["The marsh is brimming with snowmelt; every step risks sinking to the knee.", "Frogs set up an enormous chorus from invisible pools.", "Spring flowers bloom startlingly bright against the dark water."],
    desert:    ["A brief desert spring paints the sands with tiny, improbable blooms.", "Warm days already; the party sets out before sunrise to avoid the worst heat.", "A dry, spice-scented wind rolls over the dunes."],
    underdark: ["Spring rains above have increased the drip of water through the cave ceilings.", "Underground streams run fast and murky with surface sediment.", "Pale fungi are fruiting in extravagant clusters."],
    urban:     ["The city is noisy with spring festivals; garlands hang between the eaves.", "Market-day has turned every street into an obstacle course of stalls.", "Warm afternoon rain sends hawkers scrambling for awnings."],
    waterborne:["Fresh spring winds fill the sails; the voyage is swift but gusty.", "A brief squall rolls through and is gone before anyone has time to worry.", "The sea is green and choppy, alive with leaping fish."],
    default:   ["An unpredictable spring day: warm sun, then a cold shower, then sun again.", "Mud is the companion of every step.", "The world feels new and restless."],
  },
  summer: {
    arctic:    ["Even here the sun barely sets; the constant light is disorienting.", "The permafrost has softened the top few inches of ground to mud.", "Clouds of biting insects swarm from the boggy flats."],
    forest:    ["The canopy is thick and green, trapping heat and humidity like a cloak.", "Distant thunder rumbles through the afternoon but the rain never quite arrives.", "Shafts of golden light find gaps in the leaves, dappling the trail."],
    grassland: ["The sun hammers down from a cloudless sky; the grass is already yellowing.", "A hot, shimmering haze blurs the horizon by mid-morning.", "Heat-insects drone ceaselessly in the tall grass on either side."],
    mountain:  ["The air at altitude is mercifully cooler; a relief after the foothills.", "Afternoon thunderheads build over the peaks and break spectacularly by evening.", "Rock lizards sun themselves on every boulder."],
    hill:      ["The hilltop gives a wide view under a brilliant summer sky.", "A gentle breeze keeps the heat manageable; the grass smells wonderful.", "Distant hayfields perfume the air with a honey-sweet warmth."],
    coast:     ["Sea-breeze keeps the heat pleasant near the shore.", "The water is an inviting aquamarine; wading is tempting but time is short.", "Gulls argue raucously over something on the tideline."],
    swamp:     ["The swamp in summer is brutal: heat, humidity, and a solid curtain of insects.", "The water has gone stagnant and green; the smell is memorable.", "Frogs and birds compete to be the loudest thing in the world."],
    desert:    ["The heat is a physical presence pressing down from above and radiating up from below.", "Even shade offers little relief; the air itself seems to scorch the lungs.", "The party rests through the brutal midday hours and travels at dawn and dusk."],
    underdark: ["The underground offers blessed coolness; a relief after the surface heat.", "Bioluminescent mosses glow faintly in the deeper passages.", "Blind fish splash in underground pools."],
    urban:     ["The city bakes; dust rises from the packed-earth plazas.", "The smell of food from every tavern window is distractingly good.", "Children run shrieking through fountain-squares while their parents look on."],
    waterborne:["A steady trade wind fills the sail; the voyage is smooth and warm.", "Flying fish leap alongside the hull in the long summer afternoon.", "The sea is deep blue and almost glassy near evening."],
    default:   ["The sun is merciless and the dust is thick.", "Heat hangs over everything like a warm blanket nobody asked for.", "Even the shadows are warm today."],
  },
  fall: {
    arctic:    ["The first serious blizzard of the year sweeps in from the north.", "Ice is reforming on still ponds overnight; mornings crackle underfoot.", "The tundra has gone grey and brown; winter is reclaiming its territory."],
    forest:    ["The canopy blazes with amber, crimson, and gold; every gust brings a cascade of leaves.", "The forest floor is a soft, damp carpet of fallen leaves.", "Morning mist clings to the low ground until midday."],
    grassland: ["A chill edge to the wind; the sky is a rich autumn blue.", "The long golden grass bends in waves before each gust.", "Flocks of migrating birds fill the sky in long, honking skeins."],
    mountain:  ["The first dusting of snow has appeared on the highest peaks.", "Cold, crystal air makes every distant feature razor-sharp.", "Rockfalls are more frequent as the frost works the cliff-faces."],
    hill:      ["Bracken has gone deep bronze; the hillsides glow in the slanting afternoon light.", "A sharp westerly drives dead leaves past in horizontal streams.", "The smell of wet earth and decay is oddly pleasant."],
    coast:     ["Autumn storms are beginning; white-capped waves surge against the headlands.", "The wind has a real bite now; sailing is wet and exciting.", "A spectacular sunset turns the sea to hammered copper."],
    swamp:     ["The marsh grasses have gone to brown and rust; seed-heads nod in the wind.", "The water is still but black-looking; summer's warmth has drained away.", "Mist rises off the bog at dawn like slow exhaled breath."],
    desert:    ["Autumn is merciful in the desert; the heat has broken and travel is almost pleasant.", "Cool nights allow proper rest for the first time in months.", "The dunes cast long, beautiful shadows in the low autumnal sun."],
    underdark: ["Autumn rains seep through the rock; new rivulets have appeared since last time.", "The cold is returning; the party's breath mists in their lantern-light.", "Mushroom blooms have exploded in the damp passages."],
    urban:     ["Harvest festival banners hang between the buildings; the streets smell of spiced cider.", "Fallen leaves clog the gutters and spin in every doorway-draft.", "Market stalls overflow with squash, root vegetables, and preserved meats."],
    waterborne:["Autumn gales can appear without warning; the captain watches the sky constantly.", "The sea is steel-grey and powerful; the waves have real weight now.", "Rain comes in squalls, each one harder than the last."],
    default:   ["The chill of autumn is unmistakeable now.", "Leaves spiral from the trees in every gust.", "The days are shortening noticeably."],
  },
};

function pickWeather(season: string, terrain: string, rng: () => number): string {
  const byTerrain = WEATHER_BY_SEASON_TERRAIN[season];
  const arr = byTerrain?.[terrain] ?? byTerrain?.["default"] ?? ["The weather is unremarkable."];
  return arr[Math.floor(rng() * arr.length)];
}

// ─── Trail events (flavor, no mechanical effect) ────────────────────────────

const TRAIL_EVENTS: string[] = [
  "An abandoned campfire, still faintly warm, sits beside the road — whoever left it did so in a hurry.",
  "A milestone of old grey stone, its inscription worn to near-illegibility, marks the edge of an older realm.",
  "A solitary raven follows the party for a mile, watching with unsettling intelligence before departing without a word.",
  "A family of deer stands frozen in the middle of the path, then vanishes into the undergrowth as though they were never there.",
  "Something has dug up the road verge recently — tracks suggest a large boar, and recent ones at that.",
  "The skeleton of a wagon, half-collapsed, sits rust-red in the ditch; the cargo is long gone.",
  "An enormous spiderweb, beaded with morning dew, has been strung between two trees directly across the path.",
  "A cluster of freshly cut stumps surrounds a fine view of the valley below — someone was here very recently.",
  "A crude wooden shrine to a deity none of the party recognises stands at a crossroads, strewn with small offerings.",
  "The corpse of a large crow hangs upside down from a branch by one foot, a folk-charm against evil omens — or so someone believed.",
  "Hoofprints in the mud veer suddenly off the road and do not return; no explanation is visible.",
  "A child's toy — a carved wooden horse — sits in the middle of the path as if set down carefully and then forgotten.",
  "The distant sound of hammering floats over the hills; a new building going up somewhere off the road.",
  "A merchant's wagon comes the other way; its driver tips a hat and exchanges a few words about the road ahead.",
  "An old well stands beside the road; the water is cold and excellent, and someone has left a clean cup on the rim.",
  "A faded bill posted to a tree advertises a reward for a 'large spotted cat' — the poster is months old.",
  "A ring of mushrooms surrounds a dead tree with mathematical precision; the party gives it a wide berth.",
  "The smell of woodsmoke is on the air for half a mile before the source — a charcoal-burner's hut — is spotted.",
];

// ─── Character anecdotes (keyed by characterClass) ────────────────────────────

const CLASS_MOMENTS: Record<string, string[]> = {
  fighter: [
    "takes point, shield raised slightly even though the road is peaceful — old habits die hard.",
    "drills footwork in the brief rest halts, jabbing at imaginary opponents until someone asks them to stop.",
    "insists on inspecting the campsite perimeter before settling down for the evening.",
    "notices a structural weakness in a roadside watchtower and spends ten minutes explaining exactly how they would assault it.",
  ],
  ranger: [
    "reads the track of a large animal in the soft earth, notes the direction, and files it away without comment.",
    "identifies three edible plants along the roadside and supplements the party's rations without breaking stride.",
    "calls a halt, listens to the birdsong change pitch, then shrugs and waves the party forward — just a hawk.",
    "navigates by star and landmark with quiet confidence, correcting the group's heading twice without making it a thing.",
  ],
  wizard: [
    "jots incomprehensible diagrams in a small journal while somehow managing not to walk into anything.",
    "identifies the ruins visible from the road as the remains of a pre-Spellplague outpost, then delivers a brief lecture to whoever will listen.",
    "argues with a map for twenty minutes before concluding that the map is wrong.",
    "uses a cantrip to light the camp fire and then looks mildly offended when nobody is impressed.",
  ],
  rogue: [
    "scouts half a mile ahead at each junction, returning with casual reports that somehow always include the location of valuables.",
    "picks a lock on an abandoned shed 'just to see if the skill is still there' — it is.",
    "disappears for a worrying ten minutes, then reappears from an entirely different direction with a suspicious lack of explanation.",
    "negotiates a toll reduction at a bridge checkpoint, leaving the guard both lighter in pocket and vaguely uncertain how it happened.",
  ],
  cleric: [
    "stops at a roadside shrine to leave a small offering, tidying the place up while they're at it.",
    "tends to a blister on one party member's heel with practiced efficiency and a mild scold about boot maintenance.",
    "offers a prayer at camp — brief, sincere, and just long enough to be meaningful without being tedious.",
    "notices a nearby farmer looking distressed and spends a quarter-hour listening before the party is allowed to move on.",
  ],
  paladin: [
    "keeps a steady, encouraging commentary going for the whole march, which the party finds either heartening or exhausting depending on the hour.",
    "polishes armour at the midday halt, which would be more impressive if the armour didn't need it after two hours of road-walking.",
    "intervenes when a merchant is being hectored at a checkpoint, and the situation is resolved with remarkable speed.",
    "makes camp prayers notably more martial than usual — apparently this patch of road has a storied history they feel obliged to honour.",
  ],
  bard: [
    "composes a short verse about the landscape that is genuinely quite good, which surprises everyone including the bard.",
    "engages a roadside farmer in twenty minutes of conversation, extracting a surprising amount of local intelligence.",
    "sets a marching rhythm with a lively song that gets the pace up noticeably for the next two hours.",
    "tells a story around the campfire that begins as a joke, becomes unexpectedly sad, and ends with the whole party quietly reflective.",
  ],
  druid: [
    "stops to move a tortoise off the road and onto a nearby patch of grass, then explains the ecological justification at length.",
    "identifies the mood of the woodland through the movements of small animals; the assessment is 'tense but not hostile'.",
    "calls up a brief breeze at the midday halt to cool the party; it arrives smelling of distant rain.",
    "communes with a large oak at the roadside for several minutes; the tree's report, evidently, is uneventful.",
  ],
  barbarian: [
    "insists on carrying the heaviest packs and makes it look entirely effortless, which is both helpful and slightly annoying.",
    "challenges a local at an inn to an arm-wrestling match to settle whether the road ahead is passable — and wins, definitively.",
    "spots something moving in the treeline that turns out to be a deer, but the brief moment of alertness is impressive.",
    "eats an enormous amount at the midday halt, sleeps for exactly twelve minutes, and wakes refreshed.",
  ],
  monk: [
    "meditates at first light for twenty minutes, then outpaces everyone for the next three hours.",
    "balances on a fallen log crossing a stream while carrying two packs, just because the alternative looked inelegant.",
    "notices the uneven cobblestones a hundred yards ahead without apparent reason and steers the party around a concealed drainage grate.",
    "delivers a brief philosophical observation about the journey that is either profound or very dull, depending on the listener's mood.",
  ],
  sorcerer: [
    "accidentally sparks a minor magical effect while gesturing expressively in conversation — nothing catches fire, thankfully.",
    "is the last one ready every morning and the first one complaining by midday, but somehow remains endearing about it.",
    "demonstrates a cantrip for a wide-eyed child near a farmstead, then is surprised by how much it cost in social capital with the parents.",
    "falls asleep in the saddle and somehow does not fall off, which the party decides not to question.",
  ],
  warlock: [
    "murmurs something in a language no one else knows at the dark tree-line, then waves a hand and says it was nothing.",
    "sits apart at camp, writing in a dark-covered journal by the dying firelight, and declines to share the contents.",
    "gives a lengthy explanation of a nearby historical atrocity with the detailed knowledge of someone who was there — though the dates make that impossible.",
    "stares at the sky for a few minutes each night, as if waiting for a signal. None comes. Or none that they mention.",
  ],
  default: [
    "keeps a watchful eye on the road ahead and the tree-line beyond, an old traveller's habit.",
    "offers to share a provision with whoever looks most road-weary — a small gesture, but noted.",
    "studies the landscape as they walk, comparing it mentally to maps they've studied.",
    "takes a turn scouting the next bend before waving the group forward.",
  ],
};

function pickCharacterMoment(character: Character, rng: () => number): string {
  const key = character.characterClass?.toLowerCase() ?? "default";
  const arr = CLASS_MOMENTS[key] ?? CLASS_MOMENTS["default"];
  const moment = arr[Math.floor(rng() * arr.length)];
  const name = character.name || "The traveler";
  return `${name} ${moment}`;
}

// ─── Camp / rest scenes ────────────────────────────────────────────────────────

const CAMP_OPENINGS: string[] = [
  "As the light fails, the party sets camp in the shelter of",
  "Evening finds the group making camp beneath",
  "With the sun low and legs aching, camp is pitched beside",
  "The group halts for the night at",
];

const CAMP_LOCATIONS_BY_TERRAIN: Record<string, string[]> = {
  forest:    ["a broad oak with roots like buttresses", "a mossy hollow where the wind cannot reach", "a ring of silver birches"],
  grassland: ["a low rise with a view of the road in both directions", "a ditch that cuts the wind", "a cluster of hawthorn bushes"],
  mountain:  ["the lee of a granite outcrop", "a shallow cave barely big enough for the party", "a wide ledge above the scree"],
  hill:      ["a dip between two rises, hidden from the road", "a stand of wind-sculpted hawthorns", "an old shepherd's wall"],
  coast:     ["the shelter of a sea-stack", "a cave above the tide-line", "a break in the dunes where the wind can be heard but not felt"],
  swamp:     ["a hummock of higher ground barely wide enough for everyone", "a copse of twisted willows", "a flat rock above the water-level"],
  arctic:    ["a ring of ice boulders", "a snow-trench dug with shield and boot", "the only wind-break for a mile in any direction"],
  desert:    ["a sandstone outcrop that holds the day's warmth", "a dried riverbed that offers some shelter from the night wind", "a scraggly acacia with enough shade for an optimist"],
  underdark: ["a wide alcove away from the main passage", "a natural pillar-room that muffles the sounds of the deeper dark", "the junction of two tunnels, defensible from both sides"],
  urban:     ["a wayfarers' inn — a narrow bed and a warm meal are worth the coin", "a stable that smells better than expected", "the common room of a roadside tavern"],
  waterborne:["the mid-deck under an oilskin awning", "the cabin below decks while the watch takes the wheel", "the shelter of the hull during the night anchor"],
  default:   ["the best available cover", "the side of the road", "a flat piece of ground"],
};

const CAMP_MEAL_LINES: string[] = [
  "Dinner is simple but warm — the kind of meal that tastes better for having earned it.",
  "Someone produces a small cured sausage and a hard cheese that nobody knew existed until this moment, and earns the undying gratitude of the group.",
  "Trail rations. Again. Eaten without complaint but also without enthusiasm.",
  "A lucky bit of foraging earlier in the day means tonight's stew has actual flavour.",
  "The fire refuses to draw properly; dinner is smoky but hot, which is the important thing.",
  "The last of a good loaf of bread is shared out — after today, it's hardtack and dried meat.",
];

const WATCH_LINES: string[] = [
  "The watch passes uneventfully; the only sounds are wind, insects, and distant animals going about their business.",
  "Whoever takes the middle watch has an exciting few minutes when an owl lands nearby, then a very boring three hours after that.",
  "The night is still. Too still. But nothing comes of it, and by morning everyone has half-forgotten the feeling.",
  "The fire burns low by midnight and must be fed; the person on watch takes the opportunity for a few extra minutes of warmth.",
  "An animal — probably a fox, probably — circles the camp twice in the third hour. The watch notes it and moves on.",
];

// ─── Pace-specific mid-journey lines ──────────────────────────────────────────

const PACE_LINES: Record<string, string[]> = {
  fast: [
    "The pace is punishing. Conversation dies to grunts and hand-signals by mid-morning.",
    "Breaks are brutally short — just long enough to drain a water-skin and shift a pack-strap.",
    "By afternoon, the only thought in anyone's head is the next milestone.",
    "Every incline costs more than it should at this speed; descents feel like gifts.",
  ],
  normal: [
    "The rhythm of travel settles in after the first hour — one foot in front of the other, steady and sustainable.",
    "The midday halt is an unhurried affair; bread, water, and a chance to check the map.",
    "Conversation flows easily between landmarks; the miles pass in anecdote and argument.",
    "The pace is comfortable enough that the landscape can actually be enjoyed.",
  ],
  slow: [
    "The slow pace allows for proper observation — every track, every skyline, every sound is noted.",
    "The party scouts each section thoroughly; the road holds no surprises for careful eyes.",
    "There is time for foraging, for rest, for conversation that goes somewhere.",
    "The landscape reveals more at this pace than at a forced march — small details accumulate into knowledge.",
  ],
};

function pickPaceLine(pace: string, rng: () => number): string {
  const arr = PACE_LINES[pace] ?? PACE_LINES["normal"];
  return arr[Math.floor(rng() * arr.length)];
}

// ─── Encounter narrative lines ─────────────────────────────────────────────────

function encounterLines(encounter: EncounterResult): string {
  const lines: string[] = [];
  if (encounter.dayRoll.triggered) {
    lines.push(`A daytime threat materialises: ${encounter.dayRoll.monsterCount} ${encounter.dayRoll.monsterName} block the way forward. The situation requires immediate attention.`);
  }
  if (encounter.nightRoll.triggered) {
    lines.push(`Under cover of darkness, ${encounter.nightRoll.monsterCount} ${encounter.nightRoll.monsterName} are drawn to the camp. The watch raises the alarm.`);
  }
  return lines.join("\n\n");
}

// ─── Main export ────────────────────────────────────────────────────────────────

export interface NarrativeOptions {
  /** A seedable rng function; if omitted Math.random is used. */
  rng?: () => number;
  /** Formatted arrival date string, e.g. "23 Kythorn 1491 DR". */
  endDateFormatted?: string;
}

export function generateNarrative(
  stage: StageInput,
  characters: Character[],
  encounter?: EncounterResult,
  options?: NarrativeOptions
): string {
  const rng = options?.rng ?? Math.random;

  const partyList =
    characters.length === 0
      ? "a lone traveler"
      : characters
          .map((c) => `${c.name || "Unknown"} the ${c.species || "wanderer"} ${c.characterClass || ""}`.trim())
          .join(", ");

  // Opening: departure
  const TIME_OPENINGS: Record<string, string> = {
    morning:   "At first light, with dew still on the grass,",
    afternoon: "Under a high sun, with the morning's chill long gone,",
    evening:   "As the shadows lengthened toward evening,",
    night:     "After a brief rest, beneath a canopy of stars,",
  };
  const departure = TIME_OPENINGS[stage.startTimeOfDay] ?? "Setting out,";

  // Weather
  const weather = pickWeather(stage.season, stage.terrain, rng);

  // Pace observation
  const paceObs = pickPaceLine(stage.pace, rng);

  // Trail event (roughly 50% chance)
  const trailEvent = rng() > 0.5
    ? TRAIL_EVENTS[Math.floor(rng() * TRAIL_EVENTS.length)]
    : "";

  // Character moment (1-2 characters if present)
  const charMoments: string[] = [];
  if (characters.length > 0) {
    const c1 = characters[Math.floor(rng() * characters.length)];
    charMoments.push(pickCharacterMoment(c1, rng));
    if (characters.length > 1 && rng() > 0.4) {
      const otherChars = characters.filter((c) => c.id !== c1.id);
      if (otherChars.length > 0) {
        const c2 = otherChars[Math.floor(rng() * otherChars.length)];
        charMoments.push(pickCharacterMoment(c2, rng));
      }
    }
  }

  // Camp scene
  const campOpening = CAMP_OPENINGS[Math.floor(rng() * CAMP_OPENINGS.length)];
  const campLocArr = CAMP_LOCATIONS_BY_TERRAIN[stage.terrain] ?? CAMP_LOCATIONS_BY_TERRAIN["default"];
  const campLoc = campLocArr[Math.floor(rng() * campLocArr.length)];
  const campMeal = CAMP_MEAL_LINES[Math.floor(rng() * CAMP_MEAL_LINES.length)];
  const watch    = WATCH_LINES[Math.floor(rng() * WATCH_LINES.length)];

  // Encounter section
  const encSection = encounter ? encounterLines(encounter) : "";

  // Arrival note
  const arrivalNote = options?.endDateFormatted
    ? `The stage ends ${options.endDateFormatted}.`
    : "";

  // Assemble
  const sections: string[] = [
    `**${stage.startLocation} → ${stage.endLocation}**`,
    "",
    `${departure} ${partyList} depart from ${stage.startLocation}, bound for ${stage.endLocation} — ${stage.distanceMiles} miles distant.`,
    "",
    weather,
    "",
    paceObs,
  ];

  if (trailEvent) {
    sections.push("", trailEvent);
  }

  if (charMoments.length > 0) {
    sections.push("");
    sections.push(...charMoments);
  }

  if (encSection) {
    sections.push("", encSection);
  }

  sections.push(
    "",
    `${campOpening} ${campLoc}. ${campMeal} ${watch}`,
  );

  if (arrivalNote) {
    sections.push("", arrivalNote);
  }

  return sections.join("\n");
}
