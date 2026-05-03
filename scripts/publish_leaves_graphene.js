const fs = require('fs');
const { createClient } = require('@sanity/client');

const envStr = fs.readFileSync('.env.local', 'utf8');
const env = {};
for (const line of envStr.split('\n')) {
  const idx = line.indexOf('=');
  if (idx > 0) env[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
}

const sanityClient = createClient({
  projectId: 't9t7is4j', dataset: 'production', apiVersion: '2023-05-03',
  token: env.SANITY_API_TOKEN, useCdn: false,
});

function slugify(t) { return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }
function nowEST() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  }).formatToParts(new Date());
  const g = (t) => parts.find(p => p.type === t)?.value;
  return g('year') + '-' + g('month') + '-' + g('day') + 'T' + g('hour') + ':' + g('minute') + ':' + g('second') + '-04:00';
}

const PROMPT = [
  'Write a 2500-word PRACTICAL guide about turning fallen leaves into graphene.',
  '',
  'This is a REAL process. The author (USA Graphene) already produces turbostratic graphene from activated carbon precursors using thermal synthesis (pulsed electrical reactor technology). The insight here is that fallen leaves from your backyard can serve as the carbon precursor feedstock.',
  '',
  'COVER THESE SECTIONS IN DEPTH:',
  '',
  '## From Backyard Waste to Advanced Nanomaterial: The Vision',
  '- Every spring and fall, homeowners deal with tons of leaves',
  '- Leaves are 45-50% carbon by dry weight - they are essentially free carbon feedstock',
  '- The circular economy angle: turning a disposal problem into a premium product worth $50-500 per gram',
  '- Why this matters for sustainability and decentralized graphene production',
  '',
  '## Step 1: Gathering and Preparing Leaf Biomass',
  '- Best leaf types for carbonization (oak, maple, and other hardwood leaves have higher carbon content)',
  '- Washing to remove dirt, insects, and contaminants',
  '- Drying methods: air drying vs oven drying at 100-120C',
  '- Shredding/grinding for uniform particle size',
  '- Storage tips to prevent mold before processing',
  '- Yield expectations: how many bags of leaves produce how much carbon',
  '',
  '## Step 2: Carbonization - Turning Leaves into Biochar',
  '- Pyrolysis explained simply: heating organic matter in the absence of oxygen',
  '- DIY retort methods (sealed metal containers in a fire or kiln)',
  '- Temperature ranges: 400-600C for initial carbonization',
  '- What happens chemically: cellulose and lignin break down, volatile organics escape, carbon skeleton remains',
  '- Yield: approximately 25-30% of dry leaf weight becomes biochar',
  '- Quality indicators: good biochar is black, lightweight, and porous',
  '',
  '## Step 3: Activation - Creating Activated Carbon from Leaf Biochar',
  '- Chemical activation with KOH or ZnCl2 (impregnation, then heating to 700-900C)',
  '- Physical activation with CO2 or steam at 800-1000C',
  '- Why activation matters: it creates the micro and macro porous structure needed for graphene synthesis',
  '- The resulting activated carbon from leaves has excellent surface area (800-1500 m2/g)',
  '- Safety considerations when working with high temperatures and chemicals',
  '',
  '## Step 4: Graphene Synthesis from Leaf-Derived Activated Carbon',
  '- Thermal synthesis / flash Joule heating: passing high electrical current through activated carbon',
  '- The pulsed electrical reactor approach (as used by USA Graphene): rapid heating to 2500-3000C in milliseconds',
  '- At these temperatures, disordered carbon reorganizes into turbostratic graphene layers',
  '- Why turbostratic graphene is ideal: layers are randomly rotated, making them easier to exfoliate and disperse',
  '- The macro-porous structure inherited from the leaf cell walls creates unique graphene morphology',
  '- Characterization: Raman spectroscopy showing the G and 2D bands confirming graphene formation',
  '',
  '## The Science: Why Leaves Make Surprisingly Good Graphene',
  '- Leaf cell walls contain natural lignin and cellulose templates',
  '- During carbonization, these biological structures create a hierarchical pore network',
  '- The natural mineral content (Ca, K, Mg) in leaves can act as catalysts during graphene formation',
  '- Different leaf species produce slightly different graphene qualities and morphologies',
  '- Research citations: multiple peer-reviewed papers confirm leaf-derived graphene quality',
  '',
  '## Quality Comparison: Leaf Graphene vs Commercial Graphene',
  '- Electrical conductivity measurements',
  '- BET surface area comparison',
  '- Heavy metal adsorption capacity (connect to USA Graphene real data: 79% heavy metal removal vs 17% for plain activated carbon)',
  '- Mechanical properties when used as a composite additive',
  '- Cost per gram comparison: leaf-derived vs mined graphite-derived',
  '',
  '## Business Opportunity: The Leaf-to-Graphene Entrepreneur',
  '- Collecting leaves for free from neighbors, landscaping companies, municipalities',
  '- Municipal leaf collection programs as feedstock source (cities PAY to dispose of leaves)',
  '- Potential revenue: graphene powder sells for $50-500/gram depending on quality',
  '- Even lower-quality graphene has applications in concrete additives, coatings, composites',
  '- Partnering with USA Graphene for processing: send your activated carbon for professional graphene conversion',
  '- Creating a local circular economy business',
  '',
  '## Environmental Impact and Sustainability Story',
  '- Diverts organic waste from landfills (leaves in landfills produce methane)',
  '- Carbon-negative process: locks atmospheric carbon into stable graphene structures',
  '- Zero-waste potential: byproducts (bio-oil, syngas) from pyrolysis have their own value',
  '- Marketing advantage: customers increasingly want sustainably sourced materials',
  '',
  '## Getting Started This Spring',
  '- Minimum equipment list and costs',
  '- Safety equipment needed',
  '- First batch walkthrough',
  '- Where to send samples for quality testing',
  '- How to connect with USA Graphene for partnership and processing',
  '',
  'Write in an enthusiastic, practical, entrepreneurial tone. Make the reader feel like they can start this in their backyard. Reference USA Graphene and their pulsed electrical reactor technology as the professional-grade processing partner.',
  '',
  'FORMATTING RULES:',
  '1. [TITLE] Write only the title here [/TITLE]',
  '2. [BODY] Write the full article here. Use ## for section headings. No bold text. [/BODY]',
  'DO NOT INCLUDE ANY OTHER TEXT.'
].join('\n');

async function main() {
  console.log('=== LEAVES TO GRAPHENE POST ===\n');

  console.log('Generating article...');
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + env.OPENAI_API_KEY },
    body: JSON.stringify({ model: 'gpt-5.4-mini', messages: [{ role: 'user', content: PROMPT }], temperature: 0.7 })
  });
  if (!res.ok) throw new Error('OpenAI error ' + res.status + ': ' + (await res.text()).substring(0, 200));
  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content ?? '';

  let blogTitle = raw.match(/\[TITLE\]([\s\S]*?)\[\/TITLE\]/)?.[1]?.trim();
  if (!blogTitle) blogTitle = 'From Fallen Leaves to Graphene: How to Turn Your Backyard Waste into a Premium Nanomaterial';
  let blogBody = raw.match(/\[BODY\]([\s\S]*?)\[\/BODY\]/)?.[1]?.trim();
  if (!blogBody) blogBody = raw.match(/\[BODY\]([\s\S]*)$/)?.[1]?.trim();
  if (!blogBody || blogBody.length < 500) throw new Error('Content too short');
  console.log('Article: ' + blogBody.length + ' chars');

  console.log('Generating cover image...');
  let assetId = '';
  const geminiKey = env.GOOGLE_AI_API_KEY;
  if (geminiKey) {
    const imgPrompt = 'A stunning split-composition photorealistic image: on the left side, a pile of colorful autumn fallen leaves (red, orange, yellow maple and oak leaves) on green grass. On the right side, the same material transformed into shimmering dark graphene powder in a glass laboratory beaker, with visible hexagonal molecular structure floating above it as a holographic overlay. An arrow or gradient transition connects the two sides showing the transformation journey. Warm autumn sunlight on the left, cool laboratory blue light on the right. 8k resolution, dramatic cinematic lighting. No text, no labels, no watermarks.';
    try {
      const iRes = await fetch('https://generativelanguage.googleapis.com/v1beta/models/nano-banana-pro-preview:generateContent?key=' + geminiKey, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: imgPrompt }] }] })
      });
      if (iRes.ok) {
        const iData = await iRes.json();
        for (const p of (iData.candidates?.[0]?.content?.parts || [])) {
          if (p.inlineData?.data) {
            const asset = await sanityClient.assets.upload('image', Buffer.from(p.inlineData.data, 'base64'), { filename: 'cover.png' });
            assetId = asset._id;
            break;
          }
        }
      }
    } catch (e) { console.warn('Image error:', e.message); }
  }
  console.log(assetId ? 'Image uploaded!' : 'No image');

  const posts = await sanityClient.fetch('*[_type == "post"]{ title }');
  let max = 0;
  posts.forEach(p => { const m = p.title.match(/^(\d+)\./); if (m) max = Math.max(max, parseInt(m[1])); });
  const num = max + 1;

  const finalTitle = num + '. ' + blogTitle;
  const finalSlug = slugify(finalTitle);
  const excerpt = blogBody.substring(0, 200).replace(/\n/g, ' ').replace(/#+\s*/g, '').trim() + '...';
  const seoDesc = blogBody.substring(0, 160).replace(/\n/g, ' ').replace(/#+\s*/g, '').trim() + '...';
  const blocks = blogBody.split('\n\n').filter(p => p.trim()).map(p => {
    let style = 'normal', text = p.trim();
    if (text.startsWith('### ')) { style = 'h3'; text = text.replace(/^###\s+/, ''); }
    else if (text.startsWith('## ')) { style = 'h2'; text = text.replace(/^##\s+/, ''); }
    else if (text.startsWith('# ')) { style = 'h2'; text = text.replace(/^#\s+/, ''); }
    return { _type: 'block', _key: Math.random().toString(36).slice(2, 11), style, children: [{ _type: 'span', text, marks: [] }] };
  });

  console.log('Publishing as #' + num + '...');
  await sanityClient.create({
    _type: 'post', title: finalTitle, seoTitle: finalTitle, seoDescription: seoDesc,
    slug: { _type: 'slug', current: finalSlug }, excerpt, body: blocks, publishedAt: nowEST(),
    mainImage: assetId ? { _type: 'image', asset: { _type: 'reference', _ref: assetId } } : undefined,
    categories: [{ _type: 'reference', _ref: '7QyVE6fI6HWfwHJOF8VGju', _key: 'cat1' }],
    author: { _type: 'reference', _ref: '0fbb5f25-9a9b-40ee-a727-0a900e3152f1' },
  });

  console.log('\nPUBLISHED: ' + finalTitle);
  console.log('URL: https://usa-graphene.com/blog/' + finalSlug);
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
