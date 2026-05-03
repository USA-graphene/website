function slugify(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const san_slug = "405-second-and-third-harmonic-generation-in-topological-insulator-based-van-der-waals-metamaterials";
const arxiv_title = "Second and Third Harmonic Generation in Topological Insulator-Based van der Waals Metamaterials";

const arxiv_slug_prefix = slugify(arxiv_title).substring(0, 15);
console.log("arxiv prefix:", arxiv_slug_prefix);
console.log("includes:", san_slug.includes(arxiv_slug_prefix));

