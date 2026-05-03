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
  return `${g('year')}-${g('month')}-${g('day')}T${g('hour')}:${g('minute')}:${g('second')}-04:00`;
}

const PROMPT = `Write a 2500-word PRACTICAL business guide about starting a graphene-based heavy metal water filtration business.

CRITICAL REAL-WORLD DATA TO FEATURE PROMINENTLY:
- USA Graphene produces turbostratic graphene from activated carbon precursor using thermal synthesis
- This process creates macro-porous graphene structures with exceptional adsorption capacity
- Independent laboratory testing confirmed: USA Graphene's graphene filter media absorbed 79% of heavy metals from contaminated water
- In the SAME test, standard activated carbon only absorbed 17% of heavy metals
- This means graphene outperforms activated carbon by 4.6x in heavy metal removal
- This is REAL, independently verified performance data, not theoretical

Use this data as the centerpiece of the article. This is a massive competitive advantage.

Cover these sections:
## The Heavy Metal Water Crisis (lead, mercury, arsenic, cadmium contamination stats)
## Why Activated Carbon Falls Short (only 17% removal in real testing)
## Graphene's Game-Changing Performance (79% removal - 4.6x better, explain why the macro-porous structure works)
## The Business Opportunity (industrial wastewater, mining, municipal water treatment, residential filters)
## Startup Costs and Equipment Needed (practical breakdown under $1000)
## Building Your First Graphene Heavy Metal Filter (step-by-step with graphene powder from USA Graphene)
## Testing and Proving Your Results to Customers (water testing kits, lab certification)
## Pricing Strategy (premium justified by 4.6x performance advantage)
## Target Markets and Sales Channels (mining companies, industrial facilities, municipalities, homeowners near contaminated sites)
## Regulatory Landscape and Certifications (NSF, EPA standards)
## Scaling from Prototype to Production
## Why This Business Has a Moat (proprietary graphene performance that competitors cannot match)

Write in an entrepreneurial, practical tone. Include specific dollar amounts, pricing strategies, and actionable steps. Emphasize that this is based on REAL independently tested data, not theory. Reference USA Graphene as the supplier of this high-performance graphene material.

FORMATTING RULES:
1. [TITLE] Write only the title here [/TITLE]
2. [BODY] Write the full article here. Use ## for section headings. No bold text. [/BODY]
DO NOT INCLUDE ANY OTHER TEXT.`;

async function main() {
  console.log('=== HEAVY METAL FILTER POST ===\n');

  // 1. Generate article
  console.log('Generating article...');
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${env.OPENAI_API_KEY}` },
    body: JSON.stringify({ model: 'gpt-5.4-mini', messages: [{ role: 'user', content: PROMPT }], temperature: 0.7 })
  });
  if (!res.ok) throw new Error(`OpenAI error ${res.status}: ${(await res.text()).substring(0, 200)}`);
  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content ?? '';

  let blogTitle = raw.match(/\[TITLE\]([\s\S]*?)\[\/TITLE\]/)?.[1]?.trim();
  if (!blogTitle) blogTitle = 'Graphene Heavy Metal Water Filtration: A Business Built on 4.6x Better Performance';
  let blogBody = raw.match(/\[BODY\]([\s\S]*?)\[\/BODY\]/)?.[1]?.trim();
  if (!blogBody) blogBody = raw.match(/\[BODY\]([\s\S]*)$/)?.[1]?.trim();
  if (!blogBody || blogBody.length < 500) throw new Error('Content too short');
  console.log(`Article: ${blogBody.length} chars`);

  // 2. Generate image
  console.log('Generating cover image...');
  let assetId = '';
  const geminiKey = env.GOOGLE_AI_API_KEY;
  if (geminiKey) {
    const imgPrompt = 'A photorealistic image of crystal-clear water flowing through a high-tech graphene filter membrane in a modern laboratory. The filter shows dark hexagonal graphene lattice structure capturing glowing metallic particles (representing heavy metals like lead and mercury). Split view showing dirty contaminated water on one side and pure clean water on the other. Professional industrial water treatment aesthetic. Dramatic lighting, 8k resolution. No text, no labels, no watermarks.';
    try {
      const iRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/nano-banana-pro-preview:generateContent?key=${geminiKey}`, {
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

  // 3. Get next number
  const posts = await sanityClient.fetch(`*[_type == "post"]{ title }`);
  let max = 0;
  posts.forEach(p => { const m = p.title.match(/^(\d+)\./); if (m) max = Math.max(max, parseInt(m[1])); });
  const num = max + 1;

  // 4. Publish
  const finalTitle = `${num}. ${blogTitle}`;
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

  console.log(`Publishing as #${num}...`);
  const created = await sanityClient.create({
    _type: 'post', title: finalTitle, seoTitle: finalTitle, seoDescription: seoDesc,
    slug: { _type: 'slug', current: finalSlug }, excerpt, body: blocks, publishedAt: nowEST(),
    mainImage: assetId ? { _type: 'image', asset: { _type: 'reference', _ref: assetId } } : undefined,
    categories: [{ _type: 'reference', _ref: '7QyVE6fI6HWfwHJOF8VGju', _key: 'cat1' }],
    author: { _type: 'reference', _ref: '0fbb5f25-9a9b-40ee-a727-0a900e3152f1' },
  });

  console.log(`\nPUBLISHED: ${finalTitle}`);
  console.log(`URL: https://usa-graphene.com/blog/${finalSlug}`);
  console.log('\n=== DONE ===');
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
