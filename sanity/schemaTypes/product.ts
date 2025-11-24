import { defineType, defineField } from "sanity";

export default defineType({
    name: "product",
    title: "Product",
    type: "document",
    fields: [
        defineField({
            name: "title",
            title: "Product Name",
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
            name: "productType",
            title: "Product Type",
            type: "string",
            options: {
                list: [
                    { title: "Graphene Flakes / Powder", value: "graphene" },
                    { title: "Graphene Production Machine", value: "machine" },
                    { title: "Other", value: "other" },
                ],
                layout: "radio",
            },
            validation: (Rule) => Rule.required(),
        }),

        defineField({
            name: "shortDescription",
            title: "Short Description",
            type: "text",
            rows: 3,
            description: "1–2 sentences that sell the product. Shown in cards & meta.",
        }),

        defineField({
            name: "heroImage",
            title: "Hero Image",
            type: "image",
            options: { hotspot: true },
        }),

        defineField({
            name: "gallery",
            title: "Gallery Images",
            type: "array",
            of: [{ type: "image", options: { hotspot: true } }],
        }),

        defineField({
            name: "price",
            title: "Price",
            type: "number",
            description: "Base price (e.g. 200 for $200). Leave empty if ‘request a quote’.",
        }),

        defineField({
            name: "unit",
            title: "Unit",
            type: "string",
            description: "e.g. 100 g, 1 kg, 1 machine",
        }),

        defineField({
            name: "downloads",
            title: "Downloads & Test Results",
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
            name: "primaryCtaType",
            title: "Primary CTA Type",
            type: "string",
            options: {
                list: [
                    { title: "Buy Now", value: "buy" },
                    { title: "Request Quote", value: "quote" },
                    { title: "Book Demo / Call", value: "demo" },
                ],
                layout: "radio",
            },
            initialValue: "quote",
        }),

        defineField({
            name: "primaryCtaLabel",
            title: "Primary CTA Label",
            type: "string",
            description: "Text on the button, e.g. “Request Quote”",
        }),

        defineField({
            name: "primaryCtaUrl",
            title: "Primary CTA URL",
            type: "url",
            description: "Link to checkout, contact form, or Calendly.",
        }),

        defineField({
            name: "featureBullets",
            title: "Key Benefits (Bullets)",
            type: "array",
            of: [{ type: "string" }],
            validation: (Rule) => Rule.min(3).max(8),
        }),

        defineField({
            name: "techSpecs",
            title: "Technical Specs",
            type: "array",
            of: [
                {
                    type: "object",
                    fields: [
                        { name: "label", title: "Label", type: "string" },
                        { name: "value", title: "Value", type: "string" },
                    ],
                },
            ],
        }),

        defineField({
            name: "body",
            title: "Detailed Description",
            type: "array",
            of: [{ type: "block" }],
        }),

        // Simple SEO block
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

        defineField({
            name: "sortOrder",
            title: "Sort Order",
            type: "number",
            description: "Lower = appears earlier in listings.",
        }),
    ],
    preview: {
        select: {
            title: "title",
            subtitle: "productType",
            media: "heroImage",
        },
    },
});
