const fs = require('fs');
const { createClient } = require('@sanity/client');

// Load env
const envStr = fs.readFileSync('.env.local', 'utf8');
const env = {};
for (const line of envStr.split('\n')) {
  const idx = line.indexOf('=');
  if (idx > 0) env[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
}

const sanityClient = createClient({
  projectId: 't9t7is4j',
  dataset: 'production',
  apiVersion: '2023-05-03',
  token: env.SANITY_API_TOKEN,
  useCdn: false,
});

function slugify(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function nowEST() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  }).formatToParts(now);
  const g = (t) => parts.find(p => p.type === t)?.value;
  return `${g('year')}-${g('month')}-${g('day')}T${g('hour')}:${g('minute')}:${g('second')}-04:00`;
}

const SERIES = [
  {
    title: "Graphene-Enhanced Concrete Coatings: A Startup Guide",
    prompt: `Write a 2000-word PRACTICAL business guide about starting a graphene-enhanced concrete coatings business.

Cover these sections:
## What Are Graphene Concrete Coatings
## Why This Business Works (Market Opportunity)  
## What You Need to Get Started (under $500 startup cost breakdown)
## Step-by-Step: Making Your First Graphene Coating
## How to Price Your Product
## Finding Your First Customers (contractors, homeowners, industrial)
## Scaling from Side Hustle to Full Business
## Real-World Performance Data

Make it extremely practical with specific quantities, mixing ratios, pricing strategies, and sales tactics. Write for someone with zero science background who wants to start making money. Include specific dollar amounts for startup costs and potential revenue.

FORMATTING RULES:
1. [TITLE] Write only the title here [/TITLE]
2. [BODY] Write the full article here. Use ## for section headings. No bold text. No markdown headers in the first line. [/BODY]
DO NOT INCLUDE ANY OTHER TEXT.`
  },
  {
    title: "Graphene Conductive Ink for Custom Electronics",
    prompt: `Write a 2000-word PRACTICAL business guide about making and selling graphene conductive ink for custom electronics, art, and maker projects.

Cover these sections:
## What Is Graphene Conductive Ink
## The Booming Market for Conductive Ink
## Startup Costs (under $300 breakdown)
## How to Make Graphene Conductive Ink at Home
## Testing Your Ink Quality
## Products You Can Sell (printed circuits, art prints, educational kits)
## Selling on Etsy, Amazon, and to Schools
## Packaging and Branding Tips
## Scaling Production

Extremely practical with specific recipes, quantities, supplier suggestions, and pricing. Write for a maker/entrepreneur audience. Include dollar amounts.

FORMATTING RULES:
1. [TITLE] Write only the title here [/TITLE]
2. [BODY] Write the full article here. Use ## for section headings. No bold text. [/BODY]
DO NOT INCLUDE ANY OTHER TEXT.`
  },
  {
    title: "Graphene Lubricants and Motor Oil Additives Business",
    prompt: `Write a 2000-word PRACTICAL business guide about creating and selling graphene-infused lubricants and motor oil additives.

Cover these sections:
## Why Graphene Lubricants Are Superior
## Market Size and Opportunity
## Getting Started for Under $400
## How to Mix Graphene Lubricant Additives (step-by-step)
## Quality Testing and Validation
## Pricing Strategy for Maximum Profit
## Targeting Auto Shops, Fleet Managers, and Car Enthusiasts
## Online Sales Channels
## Regulatory Considerations
## Growing Your Brand

Extremely practical. Include mixing ratios, concentration percentages, specific costs, and revenue projections. Target audience: entrepreneurs.

FORMATTING RULES:
1. [TITLE] Write only the title here [/TITLE]
2. [BODY] Write the full article here. Use ## for section headings. No bold text. [/BODY]
DO NOT INCLUDE ANY OTHER TEXT.`
  },
  {
    title: "Graphene Anti-Corrosion Spray for Marine and Industrial Use",
    prompt: `Write a 2000-word PRACTICAL business guide about launching a graphene anti-corrosion spray product business.

Cover these sections:
## The Corrosion Problem (billion-dollar industry)
## Why Graphene Beats Traditional Coatings
## Startup Budget Breakdown (under $500)
## Formulating Your Graphene Anti-Corrosion Spray
## Testing Corrosion Resistance
## Target Markets (boat owners, marinas, industrial facilities, bridges)
## Pricing vs Competition
## B2B Sales Strategy
## Certifications That Open Doors
## From Garage to Manufacturing

Practical with formulations, concentration tips, pricing, sales pitch examples. Written for business-minded people.

FORMATTING RULES:
1. [TITLE] Write only the title here [/TITLE]
2. [BODY] Write the full article here. Use ## for section headings. No bold text. [/BODY]
DO NOT INCLUDE ANY OTHER TEXT.`
  },
  {
    title: "Graphene Heating Panels and Films Business",
    prompt: `Write a 2000-word PRACTICAL business guide about building a business around graphene heating panels and flexible heating films.

Cover these sections:
## How Graphene Heating Works
## Applications That Sell (heated floors, clothing, car seats, pet beds)
## Startup Investment Guide (under $600)
## Building Your First Graphene Heating Panel
## Safety Testing and Standards
## Pricing for Consumer and Commercial Markets
## Selling Direct-to-Consumer vs B2B
## Marketing Strategies That Work
## Partnering with Installers and Contractors
## Future Growth Opportunities

Very practical with wattage calculations, material lists, assembly steps, and revenue models.

FORMATTING RULES:
1. [TITLE] Write only the title here [/TITLE]
2. [BODY] Write the full article here. Use ## for section headings. No bold text. [/BODY]
DO NOT INCLUDE ANY OTHER TEXT.`
  },
  {
    title: "Graphene Water Filtration Business",
    prompt: `Write a 2000-word PRACTICAL business guide about starting a graphene water filtration business.

Cover these sections:
## Why Graphene Filters Are Revolutionary
## The Clean Water Market Opportunity
## Starting for Under $500
## How Graphene Water Filters Work (simple explanation)
## Building Your First Filter Prototype
## Testing Water Quality (simple home test kits)
## Product Lines (household filters, camping filters, emergency kits)
## Selling Online and Locally
## Working with Water Quality Certifications
## Scaling to Commercial Filtration

Practical with materials lists, assembly instructions, pricing, and market entry strategies.

FORMATTING RULES:
1. [TITLE] Write only the title here [/TITLE]
2. [BODY] Write the full article here. Use ## for section headings. No bold text. [/BODY]
DO NOT INCLUDE ANY OTHER TEXT.`
  },
  {
    title: "Graphene-Enhanced 3D Printing Filament Business",
    prompt: `Write a 2000-word PRACTICAL business guide about making and selling graphene-enhanced 3D printing filament.

Cover these sections:
## Why Graphene Filament Is the Next Big Thing
## The 3D Printing Market Explosion
## Startup Costs (under $800 with a filament extruder)
## How to Add Graphene to PLA and PETG Filament
## Quality Control and Diameter Consistency
## Printing Test Pieces and Marketing Samples
## Selling to the 3D Printing Community
## Online Marketplaces and Direct Sales
## Custom Filament Orders for Engineers
## Building a Filament Brand

Very practical with extrusion temperatures, graphene percentages, pricing per spool, and sales channels.

FORMATTING RULES:
1. [TITLE] Write only the title here [/TITLE]
2. [BODY] Write the full article here. Use ## for section headings. No bold text. [/BODY]
DO NOT INCLUDE ANY OTHER TEXT.`
  },
  {
    title: "Graphene Thermal Pads for PC and Electronics Cooling",
    prompt: `Write a 2000-word PRACTICAL business guide about manufacturing and selling graphene thermal pads for electronics cooling.

Cover these sections:
## Why Graphene Thermal Pads Outperform Silicone
## The PC Gaming and Data Center Market
## Getting Started for Under $400
## Making Graphene Thermal Pads (step-by-step process)
## Thermal Conductivity Testing
## Pricing Strategy (premium positioning)
## Selling to Gamers, PC Builders, and IT Departments
## Amazon FBA vs Direct Sales
## Product Photography and Marketing
## Expanding to Server and Industrial Markets

Very practical with thermal conductivity specs, thickness guides, compression data, and profit margins per unit.

FORMATTING RULES:
1. [TITLE] Write only the title here [/TITLE]
2. [BODY] Write the full article here. Use ## for section headings. No bold text. [/BODY]
DO NOT INCLUDE ANY OTHER TEXT.`
  },
  {
    title: "Graphene-Enhanced Paint and Exterior Coatings Business",
    prompt: `Write a 2000-word PRACTICAL business guide about creating and selling graphene-enhanced paint and exterior coatings.

Cover these sections:
## The Magic of Graphene Paint
## Why Builders and Homeowners Will Pay Premium
## Startup Budget (under $500)
## How to Mix Graphene into Commercial Paint
## UV Resistance and Durability Testing
## Product Lines (exterior paint, roof coatings, deck sealants)
## Pricing 3x Above Regular Paint
## Selling to Painting Contractors and Hardware Stores
## Before-and-After Marketing Strategy
## Going Commercial

Practical with mixing ratios, paint base recommendations, coverage rates, and pricing per gallon.

FORMATTING RULES:
1. [TITLE] Write only the title here [/TITLE]
2. [BODY] Write the full article here. Use ## for section headings. No bold text. [/BODY]
DO NOT INCLUDE ANY OTHER TEXT.`
  },
  {
    title: "Graphene Supercapacitor Kits for DIY Energy Storage",
    prompt: `Write a 2000-word PRACTICAL business guide about building and selling graphene supercapacitor kits for the maker and education market.

Cover these sections:
## What Are Graphene Supercapacitors
## The Energy Storage Revolution
## Why Kits Sell (education, makers, hobbyists)
## Startup Costs (under $400)
## Assembling a Graphene Supercapacitor Kit
## What to Include in Each Kit
## Testing and Safety Guidelines
## Pricing for Education vs Consumer Markets
## Selling to Schools, Makerspaces, and Online
## Expanding to Custom Energy Solutions

Very practical with component lists, assembly instructions, capacitance measurements, kit pricing, and sales channels.

FORMATTING RULES:
1. [TITLE] Write only the title here [/TITLE]
2. [BODY] Write the full article here. Use ## for section headings. No bold text. [/BODY]
DO NOT INCLUDE ANY OTHER TEXT.`
  }
];

async function getNextNumber() {
  const posts = await sanityClient.fetch(`*[_type == "post"]{ title }`);
  let max = 0;
  posts.forEach(p => {
    const m = p.title.match(/^(\d+)\./);
    if (m) max = Math.max(max, parseInt(m[1]));
  });
  return max + 1;
}

async function generateArticle(prompt) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-5.4-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    })
  });
  if (!res.ok) throw new Error(`OpenAI error ${res.status}: ${(await res.text()).substring(0, 200)}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

async function generateImage(title) {
  const geminiKey = env.GOOGLE_AI_API_KEY;
  if (!geminiKey) return '';
  
  const imgPrompt = `A vibrant, professional product photography style image showing practical graphene application: ${title}. Show hands working with graphene materials, laboratory or workshop setting, real-world business context. Modern, clean, entrepreneurial aesthetic. High contrast, warm lighting, 8k resolution. Absolutely no text, no labels, no watermarks.`;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/nano-banana-pro-preview:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: imgPrompt }] }] })
    });
    if (!res.ok) { console.warn(`  Image gen failed: ${res.status}`); return ''; }
    const data = await res.json();
    const parts = data.candidates?.[0]?.content?.parts || [];
    for (const p of parts) {
      if (p.inlineData?.data) {
        const asset = await sanityClient.assets.upload('image', Buffer.from(p.inlineData.data, 'base64'), { filename: 'cover.png' });
        return asset._id;
      }
    }
  } catch (e) { console.warn(`  Image error: ${e.message}`); }
  return '';
}

async function publishPost(num, blogTitle, blogBody, assetId) {
  const finalTitle = `${num}. ${blogTitle}`;
  const finalSlug = slugify(finalTitle);
  const excerpt = blogBody.substring(0, 200).replace(/\n/g, ' ').replace(/#+\s*/g, '').trim() + '...';
  const seoDesc = blogBody.substring(0, 160).replace(/\n/g, ' ').replace(/#+\s*/g, '').trim() + '...';

  const blocks = blogBody.split('\n\n').filter(p => p.trim() !== '').map(p => {
    let style = 'normal';
    let text = p.trim();
    if (text.startsWith('### ')) { style = 'h3'; text = text.replace(/^###\s+/, ''); }
    else if (text.startsWith('## ')) { style = 'h2'; text = text.replace(/^##\s+/, ''); }
    else if (text.startsWith('# ')) { style = 'h2'; text = text.replace(/^#\s+/, ''); }
    return {
      _type: 'block', _key: Math.random().toString(36).slice(2, 11),
      style, children: [{ _type: 'span', text, marks: [] }]
    };
  });

  const doc = {
    _type: 'post',
    title: finalTitle,
    seoTitle: finalTitle,
    seoDescription: seoDesc,
    slug: { _type: 'slug', current: finalSlug },
    excerpt,
    body: blocks,
    publishedAt: nowEST(),
    mainImage: assetId ? { _type: 'image', asset: { _type: 'reference', _ref: assetId } } : undefined,
    categories: [{ _type: 'reference', _ref: '7QyVE6fI6HWfwHJOF8VGju', _key: 'cat1' }],
    author: { _type: 'reference', _ref: '0fbb5f25-9a9b-40ee-a727-0a900e3152f1' },
  };

  return await sanityClient.create(doc);
}

async function main() {
  console.log('=== GRAPHENE MONEY SERIES PUBLISHER ===\n');
  const startIdx = parseInt(process.env.START_IDX || '0');
  const endIdx = parseInt(process.env.END_IDX || '10');
  
  for (let i = startIdx; i < endIdx && i < SERIES.length; i++) {
    const s = SERIES[i];
    console.log(`\n[${i + 1}/10] ${s.title}`);
    
    // 1. Generate article
    console.log('  Generating article...');
    const raw = await generateArticle(s.prompt);
    
    let blogTitle = raw.match(/\[TITLE\]([\s\S]*?)\[\/TITLE\]/)?.[1]?.trim();
    if (!blogTitle) blogTitle = raw.match(/\[TITLE\]([\s\S]*)$/)?.[1]?.trim() || s.title;
    
    let blogBody = raw.match(/\[BODY\]([\s\S]*?)\[\/BODY\]/)?.[1]?.trim();
    if (!blogBody) blogBody = raw.match(/\[BODY\]([\s\S]*)$/)?.[1]?.trim();
    
    if (!blogBody || blogBody.length < 500) {
      console.error(`  SKIPPED: Content too short (${raw.length} chars)`);
      continue;
    }
    console.log(`  Article: ${blogBody.length} chars`);

    // 2. Generate image
    console.log('  Generating cover image...');
    const assetId = await generateImage(blogTitle);
    console.log(assetId ? '  Image uploaded!' : '  No image (will publish without)');

    // 3. Get next number atomically
    const num = await getNextNumber();
    
    // 4. Publish
    console.log(`  Publishing as #${num}...`);
    const created = await publishPost(num, blogTitle, blogBody, assetId);
    console.log(`  PUBLISHED: ${num}. ${blogTitle}`);
    console.log(`  URL: https://usa-graphene.com/blog/${slugify(`${num}. ${blogTitle}`)}`);
    
    // Small delay between posts
    await new Promise(r => setTimeout(r, 2000));
  }
  
  console.log('\n=== DONE ===');
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
