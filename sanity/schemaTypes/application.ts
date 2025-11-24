import { defineType, defineField } from "sanity";

export default defineType({
    name: "application",
    title: "Application / Use Case",
    type: "document",
    fields: [
        defineField({
            name: "title",
            title: "Application Title",
            type: "string",
            validation: (Rule) => Rule.required(),
        }),

        defineField({
            name: "slug",
            title: "Slug",
            type: "slug",
            options: { source: "title", maxLength: 96 },
            validation: (Rule) => Rule.required(),
        }),

        defineField({
            name: "heroImage",
            title: "Hero Image",
            type: "image",
            options: { hotspot: true },
        }),

        defineField({
            name: "tagline",
            title: "One-Sentence Outcome",
            type: "string",
            description: "e.g. “Increase tire life by 30–50% with graphene-reinforced rubber.”",
        }),

        defineField({
            name: "industries",
            title: "Industries",
            type: "array",
            of: [{ type: "string" }],
        }),

        defineField({
            name: "benefits",
            title: "Key Benefits",
            type: "array",
            of: [{ type: "string" }],
        }),

        defineField({
            name: "downloads",
            title: "Downloads & Resources",
            type: "array",
            of: [
                {
                    type: "file",
                    options: { accept: ".pdf" },
                    fields: [
                        {
                            name: "description",
                            type: "string",
                            title: "Description",
                        },
                    ],
                },
            ],
        }),

        defineField({
            name: "recommendedProducts",
            title: "Recommended Products",
            type: "array",
            of: [{ type: "reference", to: [{ type: "product" }] }],
        }),

        defineField({
            name: "body",
            title: "Detailed Content",
            type: "array",
            of: [{ type: "block" }],
        }),

        defineField({
            name: "seoTitle",
            title: "SEO Title",
            type: "string",
        }),
        defineField({
            name: "seoDescription",
            title: "SEO Description",
            type: "text",
            rows: 3,
        }),
    ],
    preview: {
        select: { title: "title", subtitle: "tagline", media: "heroImage" },
    },
});
