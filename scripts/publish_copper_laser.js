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
  'Write a 2500-word PRACTICAL technical article about graphene-coated copper powder for laser sintering and additive manufacturing.',
  '',
  'CRITICAL REAL-WORLD CONTEXT:',
  '- A company purchased graphene from USA Graphene specifically to coat copper particles for use in laser sintering (Selective Laser Melting / SLM)',
  '- THE PROBLEM: Pure copper is one of the most reflective metals at near-infrared wavelengths (1064nm Nd:YAG and 1070nm fiber lasers). Copper reflects over 95% of laser energy at these wavelengths. This means the laser bounces off the copper powder instead of melting it.',
  '- This makes copper nearly impossible to process with standard industrial lasers',
  '- THE SOLUTION: Coating copper particles with a thin graphene layer dramatically increases laser absorption. Graphene absorbs 2.3% of light per atomic layer across all wavelengths, and a multi-layer graphene coating turns the shiny reflective copper surface into a dark, laser-absorbing surface.',
  '- This is a REAL commercial application happening right now with USA Graphene material',
  '',
  'COVER THESE SECTIONS:',
  '',
  '## The Copper Problem in Laser Additive Manufacturing',
  '- Why everyone wants to 3D print copper (best electrical and thermal conductor)',
  '- Applications: heat exchangers, EV motor windings, rocket engine cooling channels, RF waveguides, electrical busbars',
  '- The reflectivity wall: copper reflects 95%+ of 1064nm laser light',
  '- What happens when you try: unstable melt pools, balling, porosity, incomplete fusion, wasted laser power',
  '- Current workarounds and why they fail (green lasers are expensive, copper alloys sacrifice conductivity)',
  '',
  '## How Graphene Solves the Reflectivity Problem',
  '- Graphene absorbs 2.3% of light per layer across the entire spectrum (from UV to IR)',
  '- A few-layer graphene coating (5-10 layers) absorbs 10-20% of incident laser energy - a massive improvement',
  '- The coating converts reflective copper from 95% reflection to approximately 75-80% reflection, effectively doubling or tripling the absorbed energy',
  '- Graphene is only nanometers thick so it does not contaminate the copper or alter its electrical/thermal properties',
  '- At sintering temperatures (1085C for copper), the graphene either burns off cleanly or dissolves into the copper matrix at trace levels',
  '- The result: pure copper parts with full conductivity, printed on standard fiber laser systems',
  '',
  '## The Coating Process: How to Apply Graphene to Copper Powder',
  '- Wet mixing method: dispersing graphene in ethanol or isopropanol, adding copper powder, ultrasonication, then vacuum drying',
  '- Dry mixing: planetary ball milling graphene with copper powder at low energy to avoid particle deformation',
  '- Spray drying: atomizing graphene-copper suspension for uniform coating at scale',
  '- Graphene concentration: typically 0.1-1.0 wt% graphene relative to copper',
  '- Quality control: SEM imaging to verify uniform coating, color change from pink/orange to dark gray/black',
  '- Powder flowability testing: ensuring coated powder still flows properly in the printer',
  '',
  '## Performance Results',
  '- Laser absorption improvement: from 5% to 20-25% at 1064nm',
  '- Density of printed parts: achieving 98%+ relative density (vs 85-90% with uncoated copper)',
  '- Electrical conductivity retention: 95-98% IACS (International Annealed Copper Standard)',
  '- Thermal conductivity: 380-395 W/mK (near pure copper at 401 W/mK)',
  '- Surface roughness improvement',
  '- Reduced laser power requirements: can use standard 200-400W fiber lasers instead of expensive 1kW+ systems',
  '',
  '## Business Opportunity',
  '- The copper AM market is projected to grow massively with EV, aerospace, and electronics demand',
  '- Graphene-coated copper powder commands premium pricing ($200-500/kg vs $50-80/kg for standard copper powder)',
  '- Startup approach: buy copper powder and USA Graphene material, coat it, sell to AM service bureaus',
  '- Target customers: aerospace contractors, EV manufacturers, electronics companies, AM service providers',
  '- Competitive advantage: most competitors use expensive green lasers or copper alloys, graphene coating works with existing standard laser hardware',
  '',
  '## Getting Started',
  '- Equipment needed for small-scale coating operation',
  '- Sourcing copper powder (particle size 15-45 microns for SLM)',
  '- Sourcing graphene from USA Graphene (turbostratic graphene is ideal due to easy dispersion)',
  '- Setting up quality testing',
  '- First customer acquisition strategy',
  '',
  'Write in a practical, technical-but-accessible tone. Emphasize that this is a REAL commercial application already happening with USA Graphene material. This article should attract additive manufacturing companies, aerospace engineers, and EV manufacturers.',
  '',
  'FORMATTING RULES:',
  '1. [TITLE] Write only the title here [/TITLE]',
  '2. [BODY] Write the full article here. Use ## for section headings. No bold text. [/BODY]',
  'DO NOT INCLUDE ANY OTHER TEXT.'
].join('\n');

async function main() {
  console.log('=== GRAPHENE-COATED COPPER POST ===\n');

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
  if (!blogTitle) blogTitle = 'Graphene-Coated Copper Powder for Laser Sintering: Solving the Reflectivity Problem in Metal 3D Printing';
  let blogBody = raw.match(/\[BODY\]([\s\S]*?)\[\/BODY\]/)?.[1]?.trim();
  if (!blogBody) blogBody = raw.match(/\[BODY\]([\s\S]*)$/)?.[1]?.trim();
  if (!blogBody || blogBody.length < 500) throw new Error('Content too short');
  console.log('Article: ' + blogBody.length + ' chars');

  console.log('Generating cover image...');
  let assetId = '';
  const geminiKey = env.GOOGLE_AI_API_KEY;
  if (geminiKey) {
    const imgPrompt = 'A dramatic photorealistic split image showing copper metal powder particles under a high-powered laser beam in a 3D printer. Left side shows shiny reflective copper particles bouncing the laser light away with visible reflection beams. Right side shows dark graphene-coated copper particles absorbing the laser energy and glowing orange as they fuse together into a solid copper part. Industrial metal 3D printing chamber with blue protective atmosphere. Cinematic lighting, metallic textures, 8k resolution. No text, no labels, no watermarks.';
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
