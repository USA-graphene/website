const { createClient } = require('next-sanity')
const fs = require('fs')
const path = require('path')

// Manually load env vars from .env.local
try {
    const envPath = path.resolve(process.cwd(), '.env.local')
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8')
        envConfig.split('\n').forEach(line => {
            const [key, value] = line.split('=')
            if (key && value) {
                process.env[key.trim()] = value.trim()
            }
        })
    }
} catch (e) {
    console.error('Error loading .env.local', e)
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 't9t7is4j'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2023-05-03'
const token = process.env.SANITY_API_TOKEN

if (!token) {
    console.error('ERROR: SANITY_API_TOKEN is missing from .env.local')
    process.exit(1)
}

const client = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token: token,
})

function generateKey() {
    return Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10)
}

const postData = {
    title: "Making Magic with Pencil Lead! (A Graphene-Inspired Experiment for Kids)",
    bodyText: `Hey young scientists and curious minds! 👋 Have you ever heard of a superhero material called graphene? It's like the coolest, thinnest, and strongest material ever, made from just one single layer of carbon atoms. Think of it like a super-flat sheet of chicken wire, but so tiny you can't even see it! 

While making pure graphene in a school lab is tricky, we can do a super fun experiment that uses its close cousin: graphite! You know, that dark stuff inside your pencil! Graphite is actually just stacked layers of graphene. And guess what? It conducts electricity! 

Let's build a real, working electrical circuit using nothing but a pencil.

### What You Will Need:
- A very soft, dark pencil (like a 4B, 6B, or an artist's sketching pencil)
- A piece of plain white printer paper
- A small 9-volt battery
- A small LED light bulb (like the ones from a science kit)
- Two wire leads with alligator clips (or just regular wire and some tape)

### The Experiment Steps:
1. **Draw the Circuit Path:** Take your soft pencil and draw a really thick, dark, and heavy shape on your paper. You want to make a thick path that has a gap in the middle, looking sort of like a horseshoe or the letter C. Make sure the graphite shines when you hold it up to the light—the thicker the layer, the better!
2. **Connect the Lightbulb:** Take your tiny LED bulb and bend its two metal legs out slightly to easily sit on the gap of your pencil drawing. Tape each leg securely to the two ends of your "horseshoe." One leg on one side, and one leg on the other. Make sure the metal directly touches the dark pencil mark!
3. **Power it Up!:** Using your alligator clips or tape, connect one wire to the positive end of your battery, and the other wire to the negative end. 
4. **Complete the Circuit:** Touch the other ends of those wires to opposite sides of your pencil drawing, along the thick graphite lines.

*Boom!* If you drew the lines thick enough, you should see the LED light bulb flicker or light up! If it doesn't work right away, try drawing over your lines again to make them thicker, or flip the battery wires (LEDs only let electricity flow in one direction).

### How Does it Work?!
The graphite from your pencil is made out of carbon, just like graphene. When you draw really hard on paper, you're leaving behind millions of tiny, overlapping flakes of graphene. Because of the special way the carbon atoms are arranged, they allow tiny particles called electrons to jump from one flake to the next.

When you connected the battery to the paper, you sent a stream of electrons zooming right through those graphite flakes you drew! They traveled through the dark pencil marking, jumped up the metal leg of the LED to light it up, and raced back through the other pencil line to the battery, completing the circuit! 

By playing with pencil lead today, you just worked with the exact same science that engineers are using to build the next generation of super-fast computers, batteries, and flexible phone screens! Keep exploring!`,
    localImagePath: "/Users/raimis/.gemini/antigravity/brain/c127631b-ab61-4ac3-b8ea-9bfb3d645822/kids_graphene_experiment_1775704128089.png",
    slug: "graphene-fun-kids-pencil-circuit"
}

async function uploadLocalImage(filePath) {
    try {
        console.log("Reading file from: ", filePath)
        const buffer = fs.readFileSync(filePath)

        const asset = await client.assets.upload('image', buffer, {
            filename: path.basename(filePath)
        })
        return asset
    } catch (error) {
        console.error('Error uploading image:', error)
        return null
    }
}

async function createPost() {
    console.log('Starting import...')

    // 1. Upload Image
    console.log('Uploading image...')
    const imageAsset = await uploadLocalImage(postData.localImagePath)

    if (!imageAsset) {
        console.error('Failed to upload image. Aborting.')
        return
    }
    console.log('Image uploaded:', imageAsset._id)

    // 2. Create Post Document
    const doc = {
        _type: 'post',
        title: postData.title,
        slug: { _type: 'slug', current: postData.slug },
        publishedAt: new Date().toISOString(),
        mainImage: {
            _type: 'image',
            asset: {
                _type: 'reference',
                _ref: imageAsset._id
            }
        },
        excerpt: "Have you ever heard of a superhero material called graphene? Learn how you can make a super-fun conductive circuit right at your desk using your pencil!",
        body: postData.bodyText.split('\n\n').map(paragraph => {
            
            // if paragraph is a heading
            if (paragraph.startsWith('### ')) {
                return {
                    _type: 'block',
                    _key: generateKey(),
                    children: [{ 
                        _type: 'span', 
                        _key: generateKey(),
                        text: paragraph.replace('### ', '').trim() 
                    }],
                    markDefs: [],
                    style: 'h3'
                }
            }
            
            return {
                _type: 'block',
                _key: generateKey(),
                children: [{ 
                    _type: 'span', 
                    _key: generateKey(),
                    text: paragraph.trim() 
                }],
                markDefs: [],
                style: 'normal'
            }
        })
    }

    try {
        const result = await client.createOrReplace({
            _id: postData.slug,
            ...doc
        })
        console.log('Post created successfully:', result._id)
    } catch (err) {
        console.error('Error creating post:', err)
    }
}

createPost()
