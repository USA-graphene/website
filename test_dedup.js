function slugify(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const arxivTitles = [
  "Second harmonic generation and third harmonic generation in topological insulator-based van der Waals metamaterials",
  "Chern number reversal and emergent superconductivity in rhombohedral graphene induced by in-plane magnetic fields",
  "Topological phase transitions in twisted bilayer graphene/hBN from interlayer coupling and substrate potentials"
];

const existingSlugs = [
  "409-second-and-third-harmonic-generation-in-topological-insulator-based-van-der-waals-metamaterials",
  "406-chern-number-reversal-and-emergent-superconductivity-in-rhombohedral-graphene-induced-by-in-plane-magnetic-fields",
  "407-topological-phase-transitions-in-twisted-bilayer-graphene-hbn-from-interlayer-coupling-and-substrate-potentials"
];

for (const title of arxivTitles) {
  const arxivWords = slugify(title).split('-').filter(w => w.length > 3).slice(0, 2);
  const isDuplicate = existingSlugs.some(s => arxivWords.every(w => s.includes(w)));
  console.log("Title:", title);
  console.log("Words:", arxivWords);
  console.log("Is Duplicate:", isDuplicate);
}
