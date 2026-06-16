const { createClient } = require('@sanity/client');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const http = require('http');

const ROOT_DIR = path.resolve(__dirname, '..');

// Load .env.local before reading process.env-backed settings.
const envPath = path.join(ROOT_DIR, '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  for (const k in envConfig) {
    if (process.env[k] === undefined) process.env[k] = envConfig[k];
  }
}

const POSTS_DIR = path.join(ROOT_DIR, 'blog_posts_gemma');
const LOG_FILE = path.join(POSTS_DIR, 'gemma4_blog_creation.log');
const LOCAL_LLM_URL = process.env.GEMMA4_LOCAL_URL || 'http://127.0.0.1:1234/v1/chat/completions';
const LOCAL_LLM_MODEL = process.env.GEMMA4_LOCAL_MODEL || 'google/gemma-4-31b';
const IMAGE_PROVIDER = process.env.IMAGE_PROVIDER || 'google';
const OPENAI_IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1';
const GEMINI_IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || 'nano-banana-pro-preview';
const GEMINI_IMAGE_FALLBACK_MODEL = process.env.GEMINI_IMAGE_FALLBACK_MODEL || 'gemini-3.1-flash-image';
const GEMINI_IMAGE_STYLE = process.env.GEMINI_IMAGE_STYLE || 'infographic';
const SITE_BASE_URL = (process.env.SITE_BASE_URL || 'https://www.usa-graphene.com').replace(/\/$/, '');
const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET || process.env.SANITY_REVALIDATE_SECRET || process.env.SANITY_API_TOKEN || '';
const LINKEDIN_POST_VERSION = process.env.LINKEDIN_VERSION || '202602';
const LINKEDIN_ORGANIZATION_ID = process.env.LINKEDIN_ORGANIZATION_ID || '104011167';

const IMAGE_VISUAL_DIRECTIONS = [
  {
    name: 'macro-materials-lab',
    direction: 'macro editorial laboratory photography: a tangible graphene-coated sample, glassware, subtle liquid reflections, shallow depth of field, premium science magazine cover lighting',
  },
  {
    name: 'molecular-cinematic',
    direction: 'cinematic molecular dynamics scene: amino-acid-like molecules approaching a graphene surface with visible adsorption forces shown as soft light fields, deep contrast, dramatic perspective',
  },
  {
    name: 'environmental-remediation',
    direction: 'environmental remediation concept: graphene-based carbon material capturing organic molecules from clean water or soil pore fluid, elegant natural light, realistic remediation context',
  },
  {
    name: 'abstract-data-visualization',
    direction: 'abstract scientific data visualization: adsorption energy landscape above a graphene lattice, layered translucent surfaces, particles following paths, polished high-end 3D render',
  },
  {
    name: 'microscope-cross-section',
    direction: 'electron-microscope-inspired cross-section: textured pyrogenic carbon/graphene surface with molecular-scale amino acid adsorption, tactile material detail, monochrome graphite with controlled accent colors',
  },
];

const IMAGE_TOPIC_PROFILES = [
  {
    name: 'environmental-remediation',
    keywords: ['remediation', 'contaminant', 'pollutant', 'adsorption', 'water', 'soil', 'wastewater', 'filtration', 'immobilize', 'amino acid', 'protein', 'pyrogenic carbon'],
    visualStory: 'a real environmental cleanup scene or lab-to-field remediation device where graphitic carbon captures organic molecules from water or soil pore fluid',
    focalSubject: 'a clean, realistic filtration cartridge, graphene-coated membrane, carbon granule bed, or porous carbon surface actively trapping unlabeled molecules',
    setting: 'clear water, soil pore water, laboratory beaker, river test rig, or compact field-testing setup',
    palette: 'fresh water blues, graphite black, clean glass highlights, natural green accents',
  },
  {
    name: 'energy-storage',
    keywords: ['battery', 'batteries', 'supercapacitor', 'anode', 'cathode', 'electrode', 'sodium-ion', 'lithium', 'energy storage', 'charge', 'discharge'],
    visualStory: 'an advanced battery or supercapacitor electrode where graphene architecture guides ion movement and improves charge transport',
    focalSubject: 'layered electrode cross-section, ion pathways, graphene-silicon or graphene-metal composite, or a premium battery cell cutaway',
    setting: 'clean energy lab, polished cell cross-section, or dark technical studio',
    palette: 'electric blue, graphite black, copper, silver, restrained amber highlights',
  },
  {
    name: 'electronics-quantum',
    keywords: ['quantum', 'nanoribbon', 'transistor', 'semiconductor', 'electron', 'carrier mobility', 'topological', 'moire', 'phonon', 'spin', 'device'],
    visualStory: 'a nanoscale electronic or quantum device where graphene structures control waves, carriers, or quantum states',
    focalSubject: 'graphene nanoribbon circuit, moire lattice, nanoscale transistor, wave interference, or cryogenic chip-like device',
    setting: 'cleanroom chip surface, cryogenic stage, or cinematic nanoscale device environment',
    palette: 'deep black, cyan, violet, silver, subtle neon wave accents',
  },
  {
    name: 'sensors-biomedical',
    keywords: ['sensor', 'sensing', 'biosensor', 'wearable', 'pressure', 'strain', 'health', 'medical', 'detection', 'diagnostic', 'skin'],
    visualStory: 'a practical sensor interface where graphene converts a physical, chemical, or biological signal into readable response',
    focalSubject: 'flexible graphene sensor film, wearable patch, microfluidic channel, or transparent sensing surface',
    setting: 'human-scale application, lab-on-chip, soft robotics, or healthcare research bench',
    palette: 'clean whites, graphite, soft cyan, medical teal, restrained magenta signal accents',
  },
  {
    name: 'thermal-structural-composites',
    keywords: ['composite', 'polymer', 'mechanical', 'strength', 'thermal', 'heat', 'conductivity', 'aerospace', 'fabric', 'coating', 'corrosion'],
    visualStory: 'a material cross-section showing graphene reinforcement, heat flow, or protective structure in a real engineered part',
    focalSubject: 'cutaway composite panel, heat-spreading layer, reinforced polymer, coating surface, or aerospace-grade material sample',
    setting: 'materials testing lab, industrial component close-up, or high-end product render',
    palette: 'graphite, steel, warm heat gradients, restrained industrial blue',
  },
  {
    name: 'manufacturing-processing',
    keywords: ['manufacturing', 'production', 'exfoliation', 'synthesis', 'laser', 'plasma', 'microwave', 'process', 'scalable', 'machine', 'reactor'],
    visualStory: 'a process-centered scene where graphite transforms into graphene through controlled energy, flow, or machinery',
    focalSubject: 'reactor chamber, laser conversion zone, exfoliation vessel, plasma flow, or automated production line close-up',
    setting: 'industrial research equipment, pilot-scale system, or dramatic process chamber',
    palette: 'graphite black, stainless steel, blue-white energy, controlled orange process glow',
  },
  {
    name: 'molecular-fundamental-science',
    keywords: ['molecular dynamics', 'simulation', 'free energy', 'adsorption free energy', 'interface', 'chemistry', 'defect', 'dft', 'first-principles', 'atomistic'],
    visualStory: 'a polished atomistic scientific visualization that makes invisible mechanisms visible without looking like a generic lattice wallpaper',
    focalSubject: 'molecules interacting with a textured graphitic surface, energy wells, solvent structure, or force-field motion trails',
    setting: 'cinematic nanoscale environment with depth and selective focus',
    palette: 'graphite, cyan fields, subtle amber highlights, clean molecular colors',
  },
];

fs.mkdirSync(POSTS_DIR, { recursive: true });

function log(message) {
  const line = `[${new Date().toISOString()}] ${message}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + '\n');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const sanityClient = createClient({
  projectId: 't9t7is4j',
  dataset: 'production',
  apiVersion: '2023-05-03',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

function slugify(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function normalizeSourceTitle(title) {
  return String(title || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[^;\s]+;/g, ' ')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function normalizeArxivId(id) {
  if (!id) return '';
  if (id.startsWith('openalex:') || id.startsWith('10.')) {
    return id.trim().toLowerCase();
  }
  return id.split('v')[0].trim();
}

function reconstructAbstract(invertedIndex) {
  if (!invertedIndex) return '';
  try {
    const wordEntries = Object.entries(invertedIndex);
    let maxPos = 0;
    for (const [, positions] of wordEntries) {
      for (const pos of positions) {
        if (pos > maxPos) maxPos = pos;
      }
    }
    const words = new Array(maxPos + 1).fill('');
    for (const [word, positions] of wordEntries) {
      for (const pos of positions) words[pos] = word;
    }
    return words.join(' ').trim();
  } catch {
    return '';
  }
}

function cleanJson(text) {
  if (!text) throw new Error('Local model returned empty response');

  let cleaned = text
    .replace(/<think>[\s\S]*?<\/think>/g, '')
    .replace(/^```[a-zA-Z]*\n?/, '')
    .replace(/\n?```$/, '')
    .trim();

  const candidates = [cleaned];
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    candidates.push(cleaned.slice(start, end + 1));
  }

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch {
      // Try the next candidate before falling back to field extraction.
    }
  }

  const extracted = extractPostFields(cleaned);
  if (extracted.title && extracted.body) {
    return extracted;
  }

  saveRawGemmaResponse(cleaned, 'parse-failure');
  throw new Error('Could not parse local model response as JSON');
}

function parseMarkedArticle(text) {
  if (!text) throw new Error('Local model returned empty response');

  const cleaned = text
    .replace(/<think>[\s\S]*?<\/think>/g, '')
    .replace(/^```[a-zA-Z]*\n?/, '')
    .replace(/\n?```$/, '')
    .trim();

  const title = extractMarkedField(cleaned, 'TITLE');
  const excerpt = extractMarkedField(cleaned, 'EXCERPT');
  const imagePrompt = extractMarkedField(cleaned, 'IMAGE_PROMPT');
  let body = extractMarkedBody(cleaned);

  if (!body && cleaned.includes('## ')) {
    body = cleaned;
  }

  if (!title || !excerpt || !body) {
    try {
      return cleanJson(cleaned);
    } catch {
      saveRawGemmaResponse(cleaned, 'marked-parse-failure');
      throw new Error('Could not parse local model response as marked article');
    }
  }

  const hasConclusion = /(^|\n)##\s+Conclusion\b/i.test(body);
  const hasEndMarker = /\nEND_OF_ARTICLE\s*$/i.test(cleaned);
  const endsCleanly = /[.!?]"?\s*$/.test(body);
  if (!hasConclusion || !hasEndMarker || !endsCleanly) {
    body = body.replace(/\n\n## Conclusion\n\n[\s\S]*$/i, '').trim();
    body += `\n\n## Conclusion\n\nThis research points toward a practical lesson: graphene-based materials are most powerful when their nanoscale properties are connected to a clear engineering problem. The result is not a finished commercial product by itself, but it gives researchers and manufacturers a better map for designing lighter, more sensitive, or more durable systems. Future work still needs testing under real operating conditions, but the direction is promising because it joins materials science with application-driven design.`;
  }

  return { title, excerpt, body, imagePrompt };
}

function extractMarkedField(text, label) {
  const re = new RegExp(`^${label}:\\s*(.+)$`, 'im');
  const match = text.match(re);
  return match ? match[1].trim().replace(/^"|"$/g, '') : '';
}

function extractMarkedBody(text) {
  const match = text.match(/(?:^|\n)BODY:\s*([\s\S]*?)(?:\nEND_OF_ARTICLE\s*$|$)/i);
  return match ? match[1].trim() : '';
}

function saveRawGemmaResponse(text, label) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filePath = path.join(POSTS_DIR, `${stamp}-${label}-gemma-response.txt`);
  fs.writeFileSync(filePath, text);
  log(`Saved raw Gemma response for debugging: ${filePath}`);
  return filePath;
}

function extractPostFields(text) {
  const fields = {
    title: extractField(text, 'title'),
    excerpt: extractField(text, 'excerpt') || extractField(text, 'seoDescription') || '',
    body: extractField(text, 'body'),
    imagePrompt: extractField(text, 'imagePrompt') || '',
  };

  if (!fields.body) {
    fields.body = extractBodyFromMarkdown(text);
  }

  if (!fields.title && fields.body) {
    const heading = fields.body.match(/^#\s+(.+)$/m) || fields.body.match(/^##\s+(.+)$/m);
    fields.title = heading ? heading[1].trim() : 'Graphene Research Update';
  }

  if (!fields.excerpt && fields.body) {
    fields.excerpt = fields.body
      .replace(/^#+\s+/gm, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 200);
  }

  return fields;
}

function extractField(text, field) {
  const quoted = new RegExp(`"${field}"\\s*:\\s*"([\\s\\S]*?)"\\s*(?=,\\s*"|\\n?\\s*})`);
  const quotedMatch = text.match(quoted);
  if (quotedMatch) return unescapeJsonish(quotedMatch[1]);

  const markdown = new RegExp(`^#{1,3}\\s*${field}\\s*:?\\s*\\n([\\s\\S]*?)(?=^#{1,3}\\s+\\w|$)`, 'im');
  const markdownMatch = text.match(markdown);
  if (markdownMatch) return markdownMatch[1].trim();

  return '';
}

function extractBodyFromMarkdown(text) {
  const bodyLabel = text.match(/(?:^|\n)(?:body|article|full article)\s*:?\s*\n([\s\S]*)/i);
  if (bodyLabel) return bodyLabel[1].trim();

  if (text.includes('## ')) {
    return text.replace(/^\s*```[a-zA-Z]*\n?/, '').replace(/\n?```\s*$/, '').trim();
  }

  return '';
}

function unescapeJsonish(value) {
  return value
    .replace(/\\"/g, '"')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .trim();
}

function postJson(url, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const postData = JSON.stringify(body);
    const options = {
      hostname: u.hostname,
      port: u.port || 80,
      path: u.pathname + u.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Failed to parse local LLM response JSON: ${e.message}. Raw: ${data}`));
          }
        } else {
          reject(new Error(`Local LLM HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function postToPortableText(body) {
  return body.split(/\n{2,}/).filter(para => para.trim() !== '').flatMap(para => {
    const trimmed = para.trim().replace(/\*\*/g, '');
    const headingMatch = trimmed.match(/^##\s+([^\n]+)(?:\n+([\s\S]+))?$/);
    if (headingMatch) {
      const blocks = [{
        _type: 'block',
        _key: Math.random().toString(36).slice(2, 11),
        style: 'h2',
        children: [{ _type: 'span', text: headingMatch[1].trim(), marks: [] }],
      }];
      const followingText = headingMatch[2]?.trim();
      if (followingText) {
        blocks.push({
          _type: 'block',
          _key: Math.random().toString(36).slice(2, 11),
          style: 'normal',
          children: [{ _type: 'span', text: followingText, marks: [] }],
        });
      }
      return blocks;
    }

    return [{
      _type: 'block',
      _key: Math.random().toString(36).slice(2, 11),
      style: 'normal',
      children: [{ _type: 'span', text: trimmed, marks: [] }],
    }];
  });
}

function saveGeneratedPost({ selected, post, finalTitle, finalSlug }) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const baseName = `${stamp}-${finalSlug}`;
  const jsonPath = path.join(POSTS_DIR, `${baseName}.json`);
  const mdPath = path.join(POSTS_DIR, `${baseName}.md`);

  fs.writeFileSync(jsonPath, JSON.stringify({
    source: selected,
    finalTitle,
    finalSlug,
    post,
  }, null, 2));

  fs.writeFileSync(mdPath, `# ${finalTitle}

SEO title: ${post.title}

SEO description: ${post.excerpt}

Source paper: ${selected.title}

Source ID: ${selected.arxivId}

Authors: ${selected.authors}

${post.body}
`);

  return { jsonPath, mdPath };
}

async function generateArticleWithGemma(selected) {
  const prompt = `You are a senior science journalist and patient technical teacher for usa-graphene.com.
Write a complete, educational 1300-1600 word technical article based on this paper:

Title: ${selected.title}
Abstract: ${selected.abstract}

WRITING RULES:
1. Length: 1300-1600 words. Finish the article completely.
2. No bullet points, no numbered lists, no bolding (**). Use paragraphs and ## H2 headings only.
3. Explain cause and effect. Do not just say graphene improves performance; explain how conductivity, surface area, interfaces, defects, chemistry, or structure affect the result.
4. Begin with a plain-English hook explaining why this research matters to a smart non-specialist.
5. MANDATORY: In the first section, naturally credit the researchers by name: ${selected.authors}. Do not use the label "Research conducted by:".
6. Use this exact body structure with ## headings:
   Opening plain-English hook before the first heading.
   ## The Problem This Research Is Solving
   ## The Key Idea in Plain English
   ## How the Graphene-Based System Works
   ## What the Researchers Found
   ## Why the Result Matters
   ## Limitations and What Still Needs Testing
   ## Real-World Applications
   ## If You Remember One Thing
   ## FAQ
   ## Conclusion
7. The FAQ must include 5 beginner-friendly Q&A pairs written in paragraph form.
8. Be honest about limitations. Do not imply the work is commercially ready unless the abstract clearly says so.
9. Do not return JSON. Return exactly this marked text format:
TITLE: SEO Title
EXCERPT: Short educational SEO summary
IMAGE_PROMPT: A high-end 16:9 scientific cover image prompt for this research. No text, no labels, no watermark.
BODY:
Full article text with ## headings
END_OF_ARTICLE`;

  const body = {
    model: LOCAL_LLM_MODEL,
    messages: [
      {
        role: 'system',
        content: 'You are a professional science writer. Return only the marked article format requested by the user. Do not include markdown fences, thinking tags, commentary, or extra text outside the marked fields.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.8,
    max_tokens: 12000,
  };

  log(`Generating article with ${LOCAL_LLM_MODEL} at ${LOCAL_LLM_URL}`);
  let llmData;
  let lastErr;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      llmData = await postJson(LOCAL_LLM_URL, body);
      lastErr = null;
      break;
    } catch (err) {
      lastErr = err;
      const isReload = /model reloaded/i.test(err.message);
      if (!isReload || attempt === 3) {
        throw err;
      }
      log(`Gemma request hit a model reload on attempt ${attempt}; waiting 5 seconds before retrying`);
      await sleep(5000);
    }
  }

  if (!llmData && lastErr) {
    throw lastErr;
  }
  const rawText = llmData.choices?.[0]?.message?.content || llmData.choices?.[0]?.message?.reasoning_content;
  const post = parseMarkedArticle(rawText);

  if (!post.title || !post.excerpt || !post.body) {
    saveRawGemmaResponse(rawText || JSON.stringify(llmData, null, 2), 'missing-fields');
    throw new Error('Local model JSON is missing title, excerpt, or body');
  }

  const wordCount = post.body.split(/\s+/).filter(Boolean).length;
  if (wordCount < 1000) {
    saveRawGemmaResponse(rawText || JSON.stringify(llmData, null, 2), 'short-article');
    throw new Error(`Gemma article too short after parsing: ${wordCount} words`);
  }

  log(`Gemma article generated: ${wordCount} words`);
  return post;
}

async function generateAndUploadImage({ geminiKey, openaiKey, post, finalSlug }) {
  if (IMAGE_PROVIDER === 'openai' && !openaiKey) {
    log('Skipping image generation because OPENAI_API_KEY is missing');
    return '';
  }

  if (IMAGE_PROVIDER === 'google' && !geminiKey) {
    log('Skipping image generation because GOOGLE_AI_API_KEY / GEMINI_API_KEY is missing');
    return '';
  }

  const imageEvaluation = evaluatePostForImage(post);
  const imagePrompt = buildImagePrompt(post, imageEvaluation);
  log(`Generating cover image with ${IMAGE_PROVIDER} using ${imageEvaluation.profile.name} / ${imageEvaluation.direction.name}`);

  const b64 = IMAGE_PROVIDER === 'openai'
    ? await requestOpenAIImage(openaiKey, imagePrompt)
    : await requestGoogleImage(geminiKey, imagePrompt);

  const seoImageFilename = finalSlug.includes('graphene')
    ? `${finalSlug}.png`
    : `${finalSlug}-graphene.png`;

  const asset = await sanityClient.assets.upload('image', Buffer.from(b64, 'base64'), {
    filename: seoImageFilename,
    contentType: 'image/png',
  });

  log(`Cover image uploaded to Sanity: ${asset._id}`);
  return asset._id;
}

async function requestOpenAIImage(openaiKey, imagePrompt) {
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openaiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: OPENAI_IMAGE_MODEL,
      prompt: imagePrompt,
      size: '1536x1024',
      quality: 'high',
      output_format: 'png',
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`OpenAI image generation failed with ${OPENAI_IMAGE_MODEL}: ${res.status} ${JSON.stringify(data).slice(0, 500)}`);
  }

  const b64 = data.data?.[0]?.b64_json;
  if (!b64) throw new Error('OpenAI image generation returned no base64 image data');
  return b64;
}

async function requestGoogleImage(geminiKey, imagePrompt) {
  let iRes = await requestGeminiImage(geminiKey, GEMINI_IMAGE_MODEL, imagePrompt);

  if (!iRes.ok && GEMINI_IMAGE_FALLBACK_MODEL && GEMINI_IMAGE_FALLBACK_MODEL !== GEMINI_IMAGE_MODEL) {
    const errText = await iRes.text();
    log(`${GEMINI_IMAGE_MODEL} failed (${iRes.status}); falling back to ${GEMINI_IMAGE_FALLBACK_MODEL}: ${errText.slice(0, 200)}`);
    iRes = await requestGeminiImage(geminiKey, GEMINI_IMAGE_FALLBACK_MODEL, imagePrompt);
  }

  if (!iRes.ok) {
    const errText = await iRes.text();
    throw new Error(`Gemini image generation failed with ${GEMINI_IMAGE_MODEL}: ${iRes.status} ${errText.slice(0, 500)}`);
  }

  const iData = await iRes.json();
  const b64 = iData.candidates?.[0]?.content?.parts?.find(part => part.inlineData)?.inlineData?.data;
  if (!b64) throw new Error('Gemini image generation returned no inline image data');
  return b64;
}

function evaluatePostForImage(post) {
  const text = [
    post.title || '',
    post.excerpt || '',
    post.imagePrompt || '',
    (post.body || '').slice(0, 2500),
  ].join(' ').toLowerCase();

  const scoredProfiles = IMAGE_TOPIC_PROFILES.map(profile => {
    const score = profile.keywords.reduce((total, keyword) => {
      const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const matches = text.match(new RegExp(`\\b${escaped}\\b`, 'gi'));
      return total + (matches ? matches.length : 0);
    }, 0);
    return { profile, score };
  }).sort((a, b) => b.score - a.score);

  const profile = scoredProfiles[0].score > 0
    ? scoredProfiles[0].profile
    : IMAGE_TOPIC_PROFILES.find(item => item.name === 'molecular-fundamental-science');

  const direction = chooseDirectionForProfile(profile.name, text);
  const concreteSubject = extractConcreteSubject(post, profile);

  return {
    profile,
    direction,
    concreteSubject,
    matchedScore: scoredProfiles[0].score,
  };
}

function chooseDirectionForProfile(profileName, text) {
  if (profileName === 'environmental-remediation') {
    if (/\b(river|stream|field|soil|environment|remediation|wastewater|water)\b/i.test(text)) {
      return IMAGE_VISUAL_DIRECTIONS.find(item => item.name === 'environmental-remediation');
    }
    return IMAGE_VISUAL_DIRECTIONS.find(item => item.name === 'macro-materials-lab');
  }

  if (profileName === 'energy-storage' || profileName === 'manufacturing-processing' || profileName === 'thermal-structural-composites') {
    return IMAGE_VISUAL_DIRECTIONS.find(item => item.name === 'macro-materials-lab');
  }

  if (profileName === 'electronics-quantum') {
    return IMAGE_VISUAL_DIRECTIONS.find(item => item.name === 'abstract-data-visualization');
  }

  if (profileName === 'sensors-biomedical') {
    return IMAGE_VISUAL_DIRECTIONS.find(item => item.name === 'macro-materials-lab');
  }

  if (profileName === 'molecular-fundamental-science') {
    if (/\b(free energy|energy landscape|simulation|molecular dynamics)\b/i.test(text)) {
      return IMAGE_VISUAL_DIRECTIONS.find(item => item.name === 'abstract-data-visualization');
    }
    return IMAGE_VISUAL_DIRECTIONS.find(item => item.name === 'molecular-cinematic');
  }

  return IMAGE_VISUAL_DIRECTIONS.find(item => item.name === 'molecular-cinematic');
}

function extractConcreteSubject(post, profile) {
  const title = (post.title || '').replace(/\s+/g, ' ').trim();
  const excerpt = (post.excerpt || '').replace(/\s+/g, ' ').trim();
  const source = `${title}. ${excerpt}`.toLowerCase();

  if (profile.name === 'environmental-remediation') {
    if (source.includes('amino')) return 'amino-acid-like organic molecules binding to a graphene or pyrogenic-carbon remediation surface';
    if (source.includes('heavy metal')) return 'heavy-metal-like contaminant particles being captured by a graphene-based filter medium';
    return 'organic contaminants being captured by a graphene-based remediation material';
  }

  if (profile.name === 'energy-storage') return 'ions moving through a graphene-enhanced battery or supercapacitor electrode';
  if (profile.name === 'electronics-quantum') return 'nanoscale electronic waves or carriers moving through a structured graphene device';
  if (profile.name === 'sensors-biomedical') return 'a graphene sensor surface responding to a real physical or chemical signal';
  if (profile.name === 'thermal-structural-composites') return 'a graphene-reinforced material cross-section showing structure, heat flow, or mechanical reinforcement';
  if (profile.name === 'manufacturing-processing') return 'a controlled process converting graphite or carbon feedstock into graphene material';

  return 'molecules interacting with a textured graphene or graphitic carbon surface';
}

function buildImagePrompt(post, imageEvaluation) {
  const basePrompt = post.imagePrompt || `Scientific cover image for ${post.title}.`;
  const { profile, direction, concreteSubject } = imageEvaluation;
  const articleSource = prepareArticleSourceForImage(post);
  const wantsInfographic = GEMINI_IMAGE_STYLE.toLowerCase() === 'infographic';
  const cleanSummary = (post.excerpt || '').replace(/\s+/g, ' ').trim();

  return [
    wantsInfographic
      ? `Create a polished 16:9 science explainer infographic poster for a USA Graphene blog article.`
      : `Create a premium 16:9 editorial science cover image for a USA Graphene blog article.`,
    `Main subject: ${concreteSubject}.`,
    `Topic: ${post.title}.`,
    `What matters scientifically: ${cleanSummary}.`,
    `Visual story: ${profile.visualStory}.`,
    `Scene direction: ${direction.direction}.`,
    `Setting: ${profile.setting}.`,
    `Color direction: ${profile.palette}.`,
    `Use this article as background source material, but do not try to illustrate every detail:\n${articleSource}`,
    `Optional source hint from the writer: ${basePrompt}`,
    wantsInfographic
      ? `Poster composition: build a real infographic layout with a strong headline at the top, one central hero mechanism diagram, and surrounding panels such as big idea, problem, how it works, key findings, why it matters, applications, limitations, and one takeaway. Use charts, arrows, icons, callouts, molecules, and labeled mini-diagrams. The whole poster should feel like a professional research explainer image, not a generic collage.`
      : `Composition: one dominant focal subject, clear depth, premium lighting, realistic materials, strong foreground/background separation, designed like a magazine cover rather than a textbook diagram.`,
    `Accuracy: show graphene or graphitic carbon clearly, and show the actual mechanism or application from the article rather than a generic black honeycomb background.`,
    `Novelty: avoid the usual flat lattice wallpaper. Give this article its own identity through the setting, subject, and mechanism.`,
    wantsInfographic
      ? `Text rules: use short bold clean English headings and short readable captions only. Prefer a few words per label, not long paragraphs. Make the wording look professional and legible. No fake words, gibberish, random symbols, watermarks, logos, or brand markings.`
      : `Strict exclusions: no text, no captions, no labels, no letters, no numbers, no chemical symbols, no watermark, no logo, no UI, no brand markings on equipment.`,
  ].filter(Boolean).join('\n');
}

function prepareArticleSourceForImage(post) {
  const body = (post.body || '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const sections = body
    .split(/\s+##\s+/)
    .map(section => section.trim())
    .filter(Boolean)
    .map(section => section.slice(0, 650));

  const compact = sections.length ? sections.join('\n- ') : body;
  return compact.slice(0, 3500);
}

function requestGeminiImage(geminiKey, model, imagePrompt) {
  return fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: imagePrompt }] }] }),
  });
}

function buildLinkedInCommentary({ post, finalTitle, publicUrl }) {
  const cleanTitle = finalTitle.replace(/^\d+\.\s*/, '');
  const excerpt = (post.excerpt || '')
    .replace(/\s+/g, ' ')
    .trim();

  return [
    cleanTitle,
    '',
    excerpt,
    '',
    `Read the full article: ${publicUrl}`,
    '',
    '#Graphene #Nanotechnology #MaterialsScience #AdvancedMaterials #USAGraphene',
  ].join('\n').trim();
}

async function postToLinkedIn({ post, finalTitle, finalSlug }) {
  const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;

  if (!accessToken) {
    log('Skipping LinkedIn post because LINKEDIN_ACCESS_TOKEN is missing');
    return;
  }

  const publicUrl = `https://www.usa-graphene.com/blog/${finalSlug}/`;
  const author = `urn:li:organization:${LINKEDIN_ORGANIZATION_ID}`;
  const commentary = buildLinkedInCommentary({ post, finalTitle, publicUrl });
  const cleanTitle = finalTitle.replace(/^\d+\.\s*/, '');

  log(`Publishing LinkedIn post for organization ${LINKEDIN_ORGANIZATION_ID}`);

  const res = await fetch('https://api.linkedin.com/rest/posts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Linkedin-Version': LINKEDIN_POST_VERSION,
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify({
      author,
      commentary,
      visibility: 'PUBLIC',
      distribution: {
        feedDistribution: 'MAIN_FEED',
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
      content: {
        article: {
          source: publicUrl,
          title: cleanTitle,
          description: post.excerpt || cleanTitle,
        },
      },
      lifecycleState: 'PUBLISHED',
      isReshareDisabledByAuthor: false,
    }),
  });

  const linkedInPostId = res.headers.get('x-restli-id');

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`LinkedIn API failed: ${res.status} ${errText.slice(0, 500)}`);
  }

  log(`LinkedIn SUCCESS: ${linkedInPostId || 'post created'}`);
}

async function revalidatePublishedPaths(finalSlug) {
  if (!REVALIDATE_SECRET) {
    log('Skipping site revalidation because REVALIDATE_SECRET / SANITY_REVALIDATE_SECRET is missing');
    return;
  }

  const endpoint = `${SITE_BASE_URL}/api/revalidate/`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-revalidate-secret': REVALIDATE_SECRET,
    },
    body: JSON.stringify({ slug: finalSlug }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Site revalidation failed: ${res.status} ${errText.slice(0, 500)}`);
  }

  log(`Site cache revalidated for /blog and /blog/${finalSlug}`);
}

async function fetchOpenAlexWithRetry(url, attempts = 4) {
  let lastError = null;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'USA-Graphene-Bot/1.2 (mailto:info@usa-graphene.com)' },
      });

      if (res.ok) return res;

      const retryable = res.status === 429 || res.status >= 500;
      lastError = new Error(`OpenAlex failed: ${res.status}`);
      if (!retryable || attempt === attempts) throw lastError;
    } catch (err) {
      lastError = err;
      if (attempt === attempts) throw err;
    }

    const waitMs = Math.min(30000, 3000 * 2 ** (attempt - 1));
    log(`OpenAlex request failed on attempt ${attempt}; retrying in ${Math.round(waitMs / 1000)} seconds`);
    await sleep(waitMs);
  }

  throw lastError || new Error('OpenAlex failed');
}

async function testCron() {
  const geminiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  log('Starting Gemma 4 local blog automation');

  try {
    const existingPosts = await sanityClient.fetch(`*[_type == "post" && defined(title)]{ arxivId, title }`);
    const arxivIdSet = new Set(existingPosts.filter(p => p.arxivId).map(p => normalizeArxivId(p.arxivId)));
    const titleSet = new Set(existingPosts.map(p => p.title.replace(/^\d+\.\s*/, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()));
    const sourceTitleSet = new Set();
    for (const filePath of fs.readdirSync(POSTS_DIR).filter(name => name.endsWith('.json')).map(name => path.join(POSTS_DIR, name))) {
      try {
        const saved = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const normalized = normalizeSourceTitle(saved?.source?.title);
        if (normalized) sourceTitleSet.add(normalized);
      } catch {
        // Ignore malformed local archives.
      }
    }

    log(`Found ${arxivIdSet.size} existing source IDs, ${titleSet.size} titles in Sanity, and ${sourceTitleSet.size} archived source titles`);

    let selected = null;
    const oaUrl = 'https://api.openalex.org/works?filter=title.search:graphene&sort=publication_date:desc&per-page=30';
    log('Fetching source papers from OpenAlex');
    const oaRes = await fetchOpenAlexWithRetry(oaUrl);

    const oaData = await oaRes.json();
    const papers = oaData.results || [];
    for (const paper of papers) {
      const rawId = paper.id?.replace('https://openalex.org/', 'openalex:') || paper.doi?.replace('https://doi.org/', '');
      if (!rawId) continue;

      const normalizedId = normalizeArxivId(rawId);
      const abstractText = reconstructAbstract(paper.abstract_inverted_index);
      const rawTitle = paper.title?.trim() || 'Untitled Graphene Research';
      const normalizedTitle = rawTitle.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
      const normalizedSourceTitle = normalizeSourceTitle(rawTitle);

      if (normalizedId && !arxivIdSet.has(normalizedId) && !titleSet.has(normalizedTitle) && !sourceTitleSet.has(normalizedSourceTitle) && abstractText.length > 200) {
        selected = {
          arxivId: rawId,
          title: rawTitle,
          abstract: abstractText,
          authors: (paper.authorships || []).map(a => a.author?.display_name).filter(Boolean).join(', ') || 'Graphene Research Team',
        };
        log(`Selected source paper: ${selected.arxivId} / ${selected.title}`);
        break;
      }
    }

    if (!selected) throw new Error('No new graphene papers found');

    const post = await generateArticleWithGemma(selected);

    let maxNumber = 0;
    const allPosts = await sanityClient.fetch(`*[_type == "post"]{ title }`);
    allPosts.forEach(item => {
      const m = item.title.match(/^(\d+)\./);
      if (m) maxNumber = Math.max(maxNumber, parseInt(m[1], 10));
    });

    const finalTitle = `${maxNumber + 1}. ${post.title}`;
    const finalSlug = slugify(finalTitle);
    const saved = saveGeneratedPost({ selected, post, finalTitle, finalSlug });
    log(`Saved generated article: ${saved.mdPath}`);

    const assetId = await generateAndUploadImage({ geminiKey, openaiKey, post, finalSlug });

    log(`Publishing to Sanity: ${finalTitle}`);
    await sanityClient.create({
      _type: 'post',
      arxivId: selected.arxivId,
      sourceTitle: selected.title,
      title: finalTitle,
      seoTitle: post.title,
      seoDescription: post.excerpt,
      slug: { _type: 'slug', current: finalSlug },
      excerpt: post.excerpt,
      body: postToPortableText(post.body),
      publishedAt: new Date().toISOString(),
      mainImage: assetId ? { _type: 'image', asset: { _ref: assetId } } : undefined,
      author: { _type: 'reference', _ref: '0fbb5f25-9a9b-40ee-a727-0a900e3152f1' },
      categories: [{ _type: 'reference', _ref: '7QyVE6fI6HWfwHJOF8VGju', _key: 'cat1' }],
    });

    log(`SUCCESS: https://usa-graphene.com/blog/${finalSlug}`);

    try {
      await revalidatePublishedPaths(finalSlug);
    } catch (revalidateErr) {
      log(`Revalidation FAILED: ${revalidateErr.message}`);
    }

    try {
      await postToLinkedIn({ post, finalTitle, finalSlug });
    } catch (linkedInErr) {
      log(`LinkedIn FAILED: ${linkedInErr.message}`);
    }
  } catch (err) {
    log(`FAILED: ${err.message}`);
    process.exitCode = 1;
  }
}

testCron();
