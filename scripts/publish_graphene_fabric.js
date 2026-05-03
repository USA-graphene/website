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
  'Write a 2500-word PRACTICAL technical guide about graphene-infused fabric heating technology, fabric sanforization with graphene, and building self-regulating graphene fabric heaters.',
  '',
  'KEY TECHNICAL CONCEPTS TO COVER IN DEPTH:',
  '',
  '1. GRAPHENE FABRIC INFUSION METHODS:',
  '- Dip-coating textiles in graphene dispersions (concentrations, solvents, drying cycles)',
  '- Spray-coating for uniform graphene layers on fabric',
  '- Screen printing graphene conductive paths onto fabric',
  '- Padding/mangle process for industrial-scale graphene fabric treatment',
  '- Which base fabrics work best (cotton, polyester, nylon, nonwoven)',
  '',
  '2. SANFORIZATION WITH GRAPHENE:',
  '- Traditional sanforization explained (mechanical pre-shrinking using steam, pressure, rubber belts)',
  '- How to integrate graphene into the sanforization process: adding graphene dispersion to the steam/moisture step so graphene particles permanently embed into the fiber matrix during mechanical compression',
  '- Why sanforization locks graphene in: fiber swelling and compression permanently traps graphene flakes between and within fibers',
  '- Washability advantages: sanforized graphene fabric retains conductivity through 50+ wash cycles vs surface-coated fabric losing conductivity after 10 washes',
  '- Industrial scalability of this approach',
  '',
  '3. SELF-REGULATING GRAPHENE FABRIC HEATER (most important section):',
  '- The PTC (Positive Temperature Coefficient) effect in graphene composites: as temperature rises, the polymer matrix between graphene flakes expands, breaking conductive pathways and increasing electrical resistance',
  '- This naturally reduces current flow, reducing heat generation, creating automatic temperature stabilization',
  '- How to TUNE the target temperature:',
  '  a) Graphene concentration: higher loading = higher stabilization temperature',
  '  b) Fabric density and weave pattern: tighter weave = better thermal coupling',
  '  c) Applied voltage: adjusting input voltage shifts the equilibrium temperature',
  '  d) Polymer binder selection: different binders have different thermal expansion coefficients, changing the PTC threshold',
  '  e) Layer count: multiple dip-coat cycles increase conductivity and shift the temperature curve',
  '- Target temperature ranges achievable: 30-80 degrees Celsius depending on configuration',
  '- Safety: self-regulation means no overheating, no thermal runaway, inherently safe',
  '- Comparison to nichrome wire heaters (fragile, hot spots, no self-regulation) and carbon fiber heaters (expensive, less flexible)',
  '',
  '4. PRACTICAL APPLICATIONS AND BUSINESS OPPORTUNITIES:',
  '- Heated clothing and wearable tech (jackets, gloves, insoles, knee wraps)',
  '- Heated car seat covers (aftermarket, huge demand)',
  '- Heated pet beds and animal warming pads',
  '- Heated floor mats and under-carpet heating',
  '- Therapeutic heating pads (medical/wellness market)',
  '- Industrial pipe heating wraps (freeze protection)',
  '- Agricultural frost protection blankets',
  '',
  '5. HOW TO BUILD A PROTOTYPE:',
  '- Step-by-step instructions for making a self-regulating graphene fabric heater',
  '- Materials list with approximate costs',
  '- How to connect electrodes (copper tape, conductive thread, snap connectors)',
  '- Power supply selection (USB 5V for wearables, 12V for automotive, 24V for industrial)',
  '- Testing procedure to verify self-regulation behavior',
  '',
  '6. BUSINESS MODEL:',
  '- Startup costs under $500',
  '- Pricing strategy for finished products',
  '- Selling channels (Etsy, Amazon, B2B to garment manufacturers)',
  '',
  'Write in a practical, entrepreneurial tone. Reference USA Graphene as a supplier of high-quality turbostratic graphene powder ideal for fabric infusion.',
  '',
  'FORMATTING RULES:',
  '1. [TITLE] Write only the title here [/TITLE]',
  '2. [BODY] Write the full article here. Use ## for section headings. No bold text. [/BODY]',
  'DO NOT INCLUDE ANY OTHER TEXT.'
].join('\n');

async function main() {
  console.log('=== GRAPHENE FABRIC HEATER POST ===\n');

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
  if (!blogTitle) blogTitle = 'Graphene-Infused Fabric Heaters: Self-Regulating Temperature Control Through PTC Effect';
  let blogBody = raw.match(/\[BODY\]([\s\S]*?)\[\/BODY\]/)?.[1]?.trim();
  if (!blogBody) blogBody = raw.match(/\[BODY\]([\s\S]*)$/)?.[1]?.trim();
  if (!blogBody || blogBody.length < 500) throw new Error('Content too short');
  console.log('Article: ' + blogBody.length + ' chars');

  console.log('Generating cover image...');
  let assetId = '';
  const geminiKey = env.GOOGLE_AI_API_KEY;
  if (geminiKey) {
    const imgPrompt = 'A stunning photorealistic close-up of graphene-infused black fabric glowing with subtle orange-red warmth, showing the hexagonal carbon nanostructure pattern visible through the textile weave. Copper electrode strips along the edges connected to thin wires. Modern laboratory setting with thermal imaging camera showing heat distribution in the background. Premium product photography, dramatic side lighting, shallow depth of field, 8k resolution. No text, no labels, no watermarks.';
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
