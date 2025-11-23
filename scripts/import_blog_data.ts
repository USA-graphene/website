import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { apiVersion, dataset, projectId } from '../sanity/env'

const client = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token: process.env.SANITY_API_TOKEN, // User needs to provide this or I can try without if public (unlikely for write)
})

const posts = [
    {
        _type: 'post',
        title: "Graphene: The Atom-Thin Marvel Rewriting Medicine's Future",
        slug: { _type: 'slug', current: 'graphene-atom-thin-marvel-medicine' },
        publishedAt: new Date().toISOString(),
        excerpt: "Discover how graphene is revolutionizing the medical field, from healing spines to targeted drug delivery.",
        body: [
            {
                _type: 'block',
                children: [{ _type: 'span', text: 'Graphene is making waves in medicine...' }],
                markDefs: [],
                style: 'normal'
            }
        ]
    },
    {
        _type: 'post',
        title: "Graphene & Cutting-Edge Production Equipment: Unlocking the Future",
        slug: { _type: 'slug', current: 'graphene-production-equipment-future' },
        publishedAt: new Date().toISOString(),
        excerpt: "Learn about the advanced machinery required to produce high-quality graphene at scale.",
        body: [
            {
                _type: 'block',
                children: [{ _type: 'span', text: 'Production is key to graphene adoption...' }],
                markDefs: [],
                style: 'normal'
            }
        ]
    },
    {
        _type: 'post',
        title: "Graphene: The Atomically Thin Material That's Changing Everything",
        slug: { _type: 'slug', current: 'graphene-changing-everything' },
        publishedAt: new Date().toISOString(),
        excerpt: "An overview of how this single layer of carbon atoms is impacting industries from electronics to construction.",
        body: [
            {
                _type: 'block',
                children: [{ _type: 'span', text: 'It started with a piece of tape...' }],
                markDefs: [],
                style: 'normal'
            }
        ]
    },
    {
        _type: 'post',
        title: "Graphene: From Pencil Lead to Powering the Future",
        slug: { _type: 'slug', current: 'graphene-pencil-lead-powering-future' },
        publishedAt: new Date().toISOString(),
        excerpt: "Tracing the journey of graphene from a simple concept to a world-changing material.",
        body: [
            {
                _type: 'block',
                children: [{ _type: 'span', text: 'Graphite has been around for centuries...' }],
                markDefs: [],
                style: 'normal'
            }
        ]
    },
    {
        _type: 'post',
        title: "Unlocking Tomorrow: Why Graphene is the Material of the Future",
        slug: { _type: 'slug', current: 'unlocking-tomorrow-graphene' },
        publishedAt: new Date().toISOString(),
        excerpt: "Why scientists and engineers are calling graphene the 'wonder material' of the 21st century.",
        body: [
            {
                _type: 'block',
                children: [{ _type: 'span', text: 'The properties of graphene are unmatched...' }],
                markDefs: [],
                style: 'normal'
            }
        ]
    },
    {
        _type: 'post',
        title: "Meet Graphene – The Superhero of Materials",
        slug: { _type: 'slug', current: 'meet-graphene-superhero' },
        publishedAt: new Date().toISOString(),
        excerpt: "Stronger than steel, lighter than paper, and more conductive than copper. Meet the superhero of materials.",
        body: [
            {
                _type: 'block',
                children: [{ _type: 'span', text: 'If materials were superheroes, graphene would be Superman...' }],
                markDefs: [],
                style: 'normal'
            }
        ]
    }
]

async function importData() {
    console.log('Importing data...')
    for (const post of posts) {
        try {
            await client.createOrReplace({
                _id: post.slug.current,
                ...post
            })
            console.log(`Created post: ${post.title}`)
        } catch (err) {
            console.error(`Failed to create post: ${post.title}`, err.message)
        }
    }
    console.log('Done!')
}

importData()
