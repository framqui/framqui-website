import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const text = z.object({
  es: z.string(),
  en: z.string(),
});

const profile = defineCollection({
  loader: glob({ base: "./src/content/profile", pattern: "copy.yaml" }),
  schema: z.object({
    role: text,
    years: text,
    location: text,
    aboutTitle: text,
    caption: text,
    bio: z.array(text.extend({ html: z.boolean() })),
    siteTitle: text,
    siteBody: text.extend({ html: z.boolean() }),
    interestsTitle: text,
    experienceTitle: text,
    stackTitle: text,
    stackIntro: text,
    sidebarInterests: z.array(text.extend({ id: z.string() })),
    core: z.array(z.object({
      name: z.string(),
      icons: z.array(z.string()),
    })),
  }),
});

const interests = defineCollection({
  loader: glob({ base: "./src/content/interests", pattern: "*.yaml" }),
  schema: z.object({
    order: z.number(),
    title: text,
    description: text,
  }),
});

const experience = defineCollection({
  loader: glob({ base: "./src/content/experience", pattern: "*.yaml" }),
  schema: z.object({
    order: z.number(),
    company: z.string(),
    linkUrl: z.string(),
    role: text,
    period: text,
    description: text,
    sectionTitle: text,
    linkText: text,
    items: z.array(text.extend({ id: z.string() })),
  }),
});

const stack = defineCollection({
  loader: glob({ base: "./src/content/stack", pattern: "*.yaml" }),
  schema: z.object({
    order: z.number(),
    explore: z.boolean(),
    title: text,
    items: z.array(z.object({
      id: z.string().optional(),
      name: z.union([z.string(), text]),
      icon: z.string(),
      color: z.string().optional(),
    })),
  }),
});

export const collections = { profile, interests, experience, stack };
