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

const postData = {
    title: "Unlocking the Sodium Revolution: The High-Tech Recipes for Graphene Powder in Next-Gen Batteries",
    bodyText: `1. Introduction: The Spark of a Sodium-Powered Future

The global demand for sustainable energy storage is driving the development of alternatives to lithium-ion batteries, with Sodium-Ion Batteries (SIBs) emerging as a promising solution due to sodium's abundance and cost-effectiveness. However, the larger ionic radius of sodium ions (1.02 Å compared to lithium's 0.76 Å) hinders efficient intercalation into traditional graphite anodes, limiting capacity and cycling stability. Graphene, a single layer of carbon atoms in a hexagonal lattice, offers a potential paradigm shift due to its exceptional electrical conductivity, mechanical strength, and large surface area, enabling novel pathways for ion movement and battery performance enhancement. This exploration details graphene production for SIBs, historical context, current state-of-the-art, challenges, and future prospects.

2. A Blast from the Past: Graphene's Journey to Sodium-Ion Batteries

Graphene's theoretical foundations date back to Philip R. Wallace's 1947 work. Its physical isolation was achieved in 2004 by Andre Geim and Konstantin Novoselov at the University of Manchester using mechanical exfoliation (the "Scotch tape method"), earning them the 2010 Nobel Prize in Physics.

Parallel research pathways to graphene-like materials include:

Early Chemical Exfoliation: Investigated since the late 19th century, refining processes to minimize structural damage.
Hummers Method (1958): Developed by William S. Hummers and Richard E. Offeman, this method provided a safer and more efficient route to synthesize graphite oxide (GO) from graphite using potassium permanganate and sodium nitrate in concentrated sulfuric acid. Modified versions remain fundamental for GO synthesis.
Chemical Vapor Deposition (CVD): First reported in 1966 for graphite films, CVD gained traction post-2004 for growing large-area graphene sheets by introducing carbon precursor gases over heated metal substrates (e.g., copper foil).
Epitaxial Growth: Achieved through surface depletion of substrates like silicon carbide (SiC), facilitating high-quality, large-area graphene production.
Sodium-ion battery research began in the 1970s, driven by sodium's abundance and lower cost. However, the larger sodium ion radius (1.02 Å) prevented efficient intercalation into graphite anodes, resulting in low capacities (around 35 mAh/g).

Graphene-based materials were envisioned to overcome this limitation. Initial explorations focused on nanocomposites to leverage graphene's conductivity and structural integrity. Significant breakthroughs include:

Janus Graphene (2021): Developed at Chalmers University of Technology, this design features asymmetric chemical functionalization with molecular spacers that create enlarged interlayer distances, enabling efficient sodium ion intercalation. This led to experimental capacities of 332 mAh/g, rivalling lithium performance in graphite, with full reversibility and exceptional cycling stability.
Nanocellular Graphene (NCG): Produced via liquid metal dealloying, NCG features stacked graphene layers with a controlled nanoscale cellular morphology, offering a large specific surface area, high conductivity, and robust mechanical properties. When used as both an active material and current collector in SIBs, it has shown remarkable improvements in rate capability, lifespan, and resistance to deformation.
The evolution of graphene production is intrinsically linked to the quest for viable sodium-ion storage, with graphene playing a pivotal role in overcoming electrochemical challenges.

3. The Alchemist's Lab: High-Tech Recipes for Graphene Powder

The effectiveness of graphene powder in SIBs depends on enlarged interlayer spacing, defect structures for active sites, and high electrical conductivity. Sophisticated laboratory setups and controlled synthesis protocols are required.

Recipe 1: Liquid-Phase Exfoliation (LPE) with Dispersants – The Scalable Solution

LPE is a cost-effective and scalable method for producing high-quality graphene sheets from graphite, enhanced by dispersants like bacterial cellulose (BC). BC acts as a green dispersant, stabilizer, and carbon precursor, preventing restacking and forming composites.

Ingredients & Steps:

Prepare a bacterial cellulose (BC) solution.
Disperse high-purity graphite powder in the BC solution, potentially with a co-solvent.
Subject the dispersion to intense ultrasonication (e.g., 450 W for 4 hours) using a high-power tip sonicator to exfoliate graphite layers.
Centrifuge the dispersion to separate stable graphene nanosheets from unexfoliated graphite.
Optionally, carbonize the BC/liquid exfoliation graphene (LEGr) composite for advanced SIB anode materials.
Setup:

High-power tip sonicator (≥450 W).
High-speed centrifuge.
Chemical fume hood.
UV-Vis Spectrometer for characterization.
Programmable oven/furnace for carbonization.
Basic lab glassware, pH meter, analytical balances.
Benefits for SIBs: Produces high-quality graphene with fewer defects, preventing restacking and maintaining a large active surface area for sodium ion interaction.

Recipe 2: Reduced Graphene Oxide (rGO) with Enlarged Interlayer Spacing – Tailoring for Sodium

rGO is extensively investigated for SIB anodes, requiring enlarged interlayer spacing and a high density of defect sites for Na+ accommodation and storage. Chemical reduction of Graphene Oxide (GO) is the primary pathway.

Ingredients & Steps (Boric Acid Assisted Example):

Synthesize Graphene Oxide (GO) from graphite, typically using a modified Hummers method.
Disperse GO and introduce boric acid, which forms hydrogen bonds with GO functional groups, enlarging interlayer spacing and aiding reduction.
Reduce the treated GO using agents like hydrazine hydrate, or via thermal annealing, to yield rGO. Boron-functionalized rGO (BF-rGO) has shown exceptional performance.
Setup:

Chemical fume hood for handling strong acids and reducing agents.
Reaction vessels with temperature control (heating mantles, oil baths).
Filtration system (Buchner funnel, vacuum pump).
Drying oven/vacuum oven.
Ultrasonicator.
Centrifuge.
pH meter and analytical balances.
Crucial Characterization Tools: X-ray Diffraction (XRD) for d-spacing (>0.37 nm), Raman Spectroscopy for defects, SEM/TEM for morphology, XPS for elemental composition, BET Surface Area Analyzer for surface area.
Benefits for SIBs: Directly addresses sodium ion size by engineering enlarged interlayer spacing and creating defect-rich structures for enhanced storage.

Recipe 3: Chemical Vapor Deposition (CVD) for 3D Graphene Architectures – Building Blocks of Performance

CVD synthesizes high-quality graphene, enabling the fabrication of 3D architectures that mitigate restacking, offer vast surface areas, and provide robust frameworks for SIBs.

Ingredients & Steps:

Prepare a catalytic substrate (e.g., copper foil, nickel foam).
Place the substrate in a high-vacuum CVD reaction chamber.
Pre-treat the substrate by heating to high temperatures (900-1100 °C) under an inert gas atmosphere (e.g., Argon, Hydrogen).
Introduce carbon precursor gases (e.g., methane, acetylene) to form graphene layers on the substrate.
Cool the chamber slowly under an inert gas flow.
Optional transfer process if the substrate is sacrificial.
Setup:

CVD System: High-temperature furnace (up to 1100 °C), quartz tube/reaction chamber, Gas Delivery System with Mass Flow Controllers (MFCs) for precursor and carrier gases, high-vacuum pump, cooling system.
Gas cabinets and safety systems for flammable and inert gases.
Fume hood.
Advanced Characterization Equipment (XRD, Raman, SEM, TEM, XPS).
Benefits for SIBs: Enables precise engineering of 3D graphene architectures that prevent restacking, offer massive accessible surface areas, and provide robust conductive networks for enhanced sodium ion storage and transport.

Key Considerations Across All Methods for SIB Application:

Interlayer Spacing: Prioritize expanded interlayer spacing (>0.37 nm) for Na+ intercalation.
Defect Engineering: Controlled defects and functional groups create active sites for improved capacity and rate performance.
3D Architectures and Composites: Increase conductivity, mitigate volume changes, and provide robust frameworks.
Doping: Heteroatom doping (N, B) modifies electronic properties and enhances Na+ interaction.
Safety protocols (PPE, fume hoods, chemical handling) and equipment calibration/maintenance are paramount across all methods.

4. Graphene Today: Pushing the Boundaries of Sodium-Ion Storage

Current graphene production for SIBs focuses on engineering materials to overcome sodium ion challenges, enhancing conductivity and structural stability.

Nanocellular Graphene (NCG): Crafted by stacking graphene layers with controlled nanoscale cellular morphology, produced via liquid metal dealloying. NCG exhibits exceptional surface area, tensile strength, and electrical conductivity. When used as an active material and current collector, it delivers high rate capabilities, extended cycle life, and superior resistance to deformation, contributing to cost-effective, safer, and sustainable energy storage.
Janus Graphene: Features asymmetrically functionalized sheets with molecule spacers that create predefined gaps between layers, enabling efficient sodium ion intercalation. This design significantly boosts specific capacities (e.g., to 332 mAh/g) and ensures remarkable cycling stability.
Graphene-Based Nanocomposites: Engineered through various strategies:
Surface Modification and Doping: Fine-tuning electronic properties and creating optimized interaction sites for sodium ions.
Three-Dimensional (3D) Structured Graphene: Creating porous, interconnected frameworks for vast surface areas, preventing restacking, and providing structural support.
Graphene Coatings on Active Materials: Enhancing electrical conductivity and mitigating volume changes during cycling.
Intercalation Layer Stacked Graphene: Designing controlled and expanded interlayer spacing to manage volume expansions and contractions during Na+ insertion/extraction.
Materials from LPE, rGO, CVD, epitaxial growth, and micromechanical cleavage are favored for their high specific surface area, robust structure, tunable porosity, and chemical stability, leading to superior electrical conductivity, facilitated ion diffusion, and enhanced accommodation of volume changes in SIBs.

5. The Double-Edged Sword: Challenges and Controversies in Graphene Production for SIBs

Despite graphene's promise, its widespread adoption in SIBs faces significant challenges and controversies.

Roadblocks Ahead: Challenges

Manufacturing Defects and Structural Control: Producing graphene with atomic precision and macroscopic homogeneity is difficult. NCG, for instance, is prone to cracks, requiring novel processing technologies for homogeneous, crack-free production at scale. Engineering precise structures like Janus graphene adds complexity.
Inefficient Sodium Ion Storage in Standard Graphene: The larger size of sodium ions (1.02 Å) compared to lithium ions (0.76 Å) limits intercalation into standard graphite. Modified graphene structures with expanded interlayer distances are promising but challenging to engineer cost-effectively.
Complexity and Cost of Production Methods: Advanced techniques like CVD and precise rGO functionalization are often complex, energy-intensive, and expensive, hindering economic competitiveness with established technologies.
Balancing Act: High Energy Density vs. Electrode Stability: Achieving high energy density comparable to Li-ion batteries remains a pursuit. Managing the significant volume changes in SIB anodes during Na+ intercalation/de-intercalation to prevent pulverization and maintain electrical contact is a complex engineering challenge.
Scalability and Integration with Existing Manufacturing: Transitioning laboratory innovations to high-volume industrial manufacturing and integrating novel graphene materials into existing battery assembly lines present logistical and engineering hurdles.
The Debate Heats Up: Controversies

Economic Viability vs. Performance Hype: A debate exists regarding the true economic viability of graphene batteries for large-scale applications. Critics argue that current production costs are prohibitively high, questioning if graphene can deliver a compelling cost-performance proposition beyond its "hype."
Environmental Footprint of Production: The energy intensity and use of harsh chemicals in some graphene synthesis methods raise concerns about their environmental impact. Ensuring that the long-term environmental benefits of graphene-enhanced SIBs outweigh the production footprint is crucial, driving focus on sustainable, green synthesis routes.
Reproducibility and Standardization: The diverse production methods yield graphene materials with highly variable properties, making consistent quality and predictable performance challenging. This lack of standardization is a major impediment to industrial adoption where stringent quality control is paramount.
Despite these challenges, ongoing research into novel synthesis routes (e.g., liquid metal dealloying for NCG, liquid ammonia doping for graphene's sodium affinity) is actively addressing these issues to enable more economic, safer, and energy-efficient graphene composites for SIB anodes.

6. Glimpse into Tomorrow: Future Developments in Graphene for SIBs

The future of graphene production for SIBs promises to transform them into potentially superior large-scale energy storage solutions, surpassing some limitations of lithium-ion technology. Innovations will focus on novel graphene structures and scalable, cost-effective manufacturing.

Next-Gen Graphene Architectures: Sculpting for Sodium

Refined Nanocellular Graphene (NCG): Focus on achieving flawless, crack-free NCGs via advanced liquid metal dealloying for higher rate capabilities, extended cycle lives, and superior deformation resistance.
Evolving Janus Graphene: Optimization of molecule spacers and asymmetric functionalization to maximize sodium ion intercalation, aiming for higher specific capacities and ultra-long cycling stability.
Scaling Up Production: From Lab Bench to Industrial Scale

Advanced Electrochemical Exfoliation: Innovations like compressed, permeable reactors will enable continuous, efficient, and large-batch production of graphene nanoplatelets by overcoming electrical contact challenges during expansion.
Green and Sustainable Synthesis: Prioritization of environmentally benign and energy-efficient methods to minimize carbon footprint and reduce reliance on harsh chemicals.
Advanced Graphene-based Nanocomposites: Synergistic Engineering

Synergistic Blends: Development of composites integrating graphene with advanced metal oxides and metal sulfides to achieve ultra-high specific surface areas, exceptional electrical conductivity, and improved energy storage densities.
Enhanced 3D Graphene Frameworks: Optimizing pore size distribution and interconnectedness to prevent restacking and maximize electrolyte contact for superior Na+ storage capacity and cycling stability.
Revolutionizing Current Collectors: Beyond Copper and Aluminum

Large-Scale, Defect-Free Graphene Foils: Production of expansive graphene foils as ultra-efficient current collectors with extraordinary thermal conductivity (ten times higher than copper/aluminum), enhancing battery safety by dissipating heat and mitigating thermal runaway.
Flexible and Customizable Manufacturing: Continuous production of graphene foils in lengths from meters to kilometers with customizable thicknesses, ideal for flexible electronics and next-generation battery designs.
The Impact Multiplier: How Graphene Transforms SIBs

Enhanced Energy Density and Capacity: Novel architectures will boost sodium ion storage capacity, bringing SIBs to parity with or surpassing Li-ion battery performance.
Improved Cycle Life and Stability: Graphene's mechanical properties and role in buffering volume changes will lead to significantly longer battery lifespans and superior stability.
Faster Charging/Discharging Rates: High electrical conductivity and expanded surface area will facilitate ultra-rapid ion and electron transfer, improving power density.
Increased Safety: Stable carbon-based anodes and efficient thermal management from graphene current collectors will enhance safety by reducing the risk of short circuits and thermal runaway.
Cost-Effectiveness and Sustainability: Leveraging sodium's abundance and scalable graphene production will solidify SIBs as a more sustainable and economically viable energy storage solution.
Ongoing research is actively addressing challenges in quality, production complexity, and industrial-scale manufacturing, signaling a robust future for graphene in revolutionizing SIB technology for ubiquitous, safe, and sustainable energy storage.

7. Conclusion: Powering the Planet with Graphene-Enhanced Sodium-Ion Batteries

Sodium-ion batteries (SIBs) are a critical pathway for sustainable energy storage due to sodium's abundance and economic advantage. Graphene is emerging as a pivotal enabler, re-engineered to overcome the historical limitations imposed by sodium ions' larger ionic radius.

The scientific journey has progressed from foundational mechanical exfoliation to intricate engineering of Janus and nanocellular graphene. Sophisticated production methods like liquid-phase exfoliation, tailored reduced graphene oxide (rGO) with enlarged interlayer spacing, and 3D CVD architectures are creating graphene powders with expanded interlayer spacing, abundant active sites, and superior conductivity, precisely addressing the sodium challenge.

Current developments in Nanocellular Graphene and Janus Graphene are redefining SIB performance, pushing capacities to unprecedented levels. However, challenges remain in defect control, economic viability, environmental sustainability, and material reproducibility.

Future innovations in electrochemical exfoliation, advanced nanocomposites, and revolutionary graphene current collectors are poised to elevate SIBs beyond current lithium-ion benchmarks in energy density, cycle life, charging speed, and safety.

The optimal "recipe" for graphene powder in SIBs is a dynamic synthesis of advanced material science, precision engineering, and electrochemical understanding. The continuous pursuit of graphene optimized for sodium's requirements is rapidly bringing high-performance, safe, and sustainable SIBs closer to commercial reality, promising a future powered by graphene-enhanced sodium.`,
    imageUrl: "https://usa-graphene.com/wp-content/uploads/2025/11/Screenshot-2025-11-19-at-7.57.11-PM.png",
    slug: "unlocking-sodium-revolution-graphene-batteries"
}

async function uploadImage(url) {
    try {
        const response = await fetch(url)
        if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`)
        const arrayBuffer = await response.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        const asset = await client.assets.upload('image', buffer, {
            filename: path.basename(url)
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
    const imageAsset = await uploadImage(postData.imageUrl)

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
        excerpt: "The global demand for sustainable energy storage is driving the development of alternatives to lithium-ion batteries, with Sodium-Ion Batteries (SIBs) emerging as a promising solution.",
        body: postData.bodyText.split('\n\n').map(paragraph => ({
            _type: 'block',
            children: [{ _type: 'span', text: paragraph }],
            markDefs: [],
            style: 'normal'
        }))
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
