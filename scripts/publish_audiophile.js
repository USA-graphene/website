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
  'Write a 2500-word article about using graphene in audiophile grounding systems for high-end audio equipment.',
  '',
  'REAL-WORLD CONTEXT:',
  '- A customer purchased 10kg of turbostratic graphene from USA Graphene to build custom audiophile grounding boxes',
  '- These grounding boxes contain a carefully engineered mixture of graphite, metal wire conductors, and graphene powder',
  '- They connect to the chassis ground of high-end audio equipment to provide a "clean" ground reference and absorb electromagnetic interference',
  '- Premium audiophile grounding boxes from brands like Entreq, CAD (Computer Audio Design), and Nordost sell for $1,000 to $5,000+ each',
  '- This is a REAL commercial application with a growing market',
  '',
  'COVER THESE SECTIONS:',
  '',
  '## The Hidden Enemy of Perfect Sound: Electrical Noise',
  '- Ground loops explained simply: when multiple audio components share different ground potentials, current flows through signal cables causing hum and buzz',
  '- EMI (electromagnetic interference) and RFI (radio frequency interference) from WiFi routers, cell phones, LED lights, switching power supplies',
  '- Why expensive audio systems are MORE susceptible to noise (higher resolution reveals more artifacts)',
  '- The difference between "quiet" and "black" backgrounds in audiophile terminology',
  '',
  '## How Grounding Boxes Work',
  '- The concept: providing a dedicated, low-impedance path to dissipate stray electrical noise',
  '- The box acts as an electromagnetic energy sink: stray RF and EMI flows into the conductive mass and is dissipated as negligible heat',
  '- Why a separate grounding reference can be cleaner than your wall outlet ground (which carries noise from every appliance in your house)',
  '- The importance of multi-path dissipation: different materials absorb different frequency ranges',
  '',
  '## Why Graphene Is the Ultimate Grounding Material',
  '- Surface area: graphene has 2,630 square meters per gram, giving massive interaction area for absorbing electromagnetic energy',
  '- Broadband absorption: graphene absorbs electromagnetic radiation across the entire spectrum from radio waves to infrared',
  '- Electrical conductivity: 10x more conductive than copper by weight, providing ultra-low impedance paths',
  '- The graphite + metal wire + graphene combination creates a hierarchical conduction network:',
  '  - Metal wire: handles bulk current flow and low-frequency noise',
  '  - Graphite: provides medium-frequency absorption and stable impedance',
  '  - Graphene: excels at high-frequency RF absorption due to its quantum-scale properties and massive surface area',
  '- This multi-material approach covers the ENTIRE noise spectrum from 50Hz hum to GHz RF interference',
  '',
  '## The Science Behind It',
  '- Graphene as an electromagnetic absorber: peer-reviewed research confirms graphene composites absorb 20-30dB of electromagnetic radiation',
  '- Skin effect at high frequencies: current flows on the surface of conductors, graphene is ALL surface',
  '- Graphene electromagnetic shielding effectiveness (SE) values from published research',
  '- Impedance matching: the gradual transition from metal to graphite to graphene provides broadband impedance matching for maximum energy absorption',
  '- Thermal dissipation: absorbed electromagnetic energy converts to negligible heat across the massive surface area',
  '',
  '## Building a Graphene Audiophile Grounding Box',
  '- Enclosure selection: non-magnetic materials (wood, acrylic, or aluminum)',
  '- Internal construction: layers of graphite granules, copper or silver wire mesh, and graphene powder',
  '- Graphene concentration: approximately 5-15% by weight of the total fill material',
  '- Binding post or banana plug terminal for connecting grounding cables',
  '- Grounding cable: high-quality shielded cable with spade or banana termination',
  '- Connection points on audio equipment: unused RCA inputs, dedicated ground terminals, chassis screws',
  '- Total material cost breakdown',
  '',
  '## Real-World Results',
  '- Reported improvements: lower noise floor, blacker background between notes, improved micro-detail retrieval',
  '- Instrument separation and soundstage improvements',
  '- Reduced digital glare and harshness in digital audio systems',
  '- Why results vary by system: homes with dirtier power see more dramatic improvements',
  '- The importance of proper A/B comparison when evaluating',
  '',
  '## The Business Opportunity',
  '- The high-end audio market is worth $25+ billion globally',
  '- Audiophiles routinely spend $1,000-$10,000 on cables alone',
  '- Grounding boxes sell for $1,000-$5,000 with material costs under $200',
  '- Marketing graphene as a premium, cutting-edge material justifies premium pricing',
  '- Direct-to-consumer sales through audiophile forums, Head-Fi, Audiogon, and dedicated websites',
  '- Partnership opportunities with high-end audio dealers and installers',
  '- USA Graphene provides the high-purity turbostratic graphene needed for optimal electromagnetic absorption',
  '',
  '## Getting Started',
  '- Minimum order of graphene for first prototypes',
  '- Testing methodology: measure noise floor with and without grounding box using audio measurement software',
  '- Building your first prototype for under $100 in materials',
  '- Finding beta testers in the audiophile community',
  '',
  'Write in an authoritative but accessible tone. Balance the science with practical application. Do not dismiss the audiophile market - treat it with respect. Reference USA Graphene as the supplier of high-quality turbostratic graphene for this application.',
  '',
  'FORMATTING RULES:',
  '1. [TITLE] Write only the title here [/TITLE]',
  '2. [BODY] Write the full article here. Use ## for section headings. No bold text. [/BODY]',
  'DO NOT INCLUDE ANY OTHER TEXT.'
].join('\n');

async function main() {
  console.log('=== AUDIOPHILE GROUNDING POST ===\n');

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
  if (!blogTitle) blogTitle = 'Graphene in Audiophile Grounding Systems: The Science Behind Noise-Free High-End Audio';
  let blogBody = raw.match(/\[BODY\]([\s\S]*?)\[\/BODY\]/)?.[1]?.trim();
  if (!blogBody) blogBody = raw.match(/\[BODY\]([\s\S]*)$/)?.[1]?.trim();
  if (!blogBody || blogBody.length < 500) throw new Error('Content too short');
  console.log('Article: ' + blogBody.length + ' chars');

  console.log('Generating cover image...');
  let assetId = '';
  const geminiKey = env.GOOGLE_AI_API_KEY;
  if (geminiKey) {
    const imgPrompt = 'A luxurious photorealistic image of a premium audiophile listening room. In the foreground, an elegant wooden grounding box with a brushed aluminum binding post on top, connected via a high-end braided silver cable to a glowing vacuum tube amplifier. The box is partially transparent showing layers of dark graphene powder, graphite crystals, and silver wire mesh inside. Behind it, high-end floor-standing speakers and a turntable on a rack. Warm ambient lighting, dark wood and leather aesthetic, ultra-premium feel. 8k resolution, shallow depth of field. No text, no labels, no watermarks.';
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
