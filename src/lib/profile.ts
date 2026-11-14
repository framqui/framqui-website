import { getCollection, getEntry } from "astro:content";

type Locale = "es" | "en";
type Text = { es: string; en: string };

export async function loadProfile() {
  const profileEntry = await getEntry("profile", "copy");
  if (!profileEntry) throw new Error("Falta el contenido del perfil");

  const [interests, experience, stack] = await Promise.all([
    getCollection("interests"),
    getCollection("experience"),
    getCollection("stack"),
  ]);

  const byOrder = <T extends { data: { order: number } }>(entries: T[]) =>
    [...entries].sort((a, b) => a.data.order - b.data.order);

  return {
    profile: profileEntry.data,
    interests: byOrder(interests),
    experience: byOrder(experience),
    stack: byOrder(stack),
  };
}

type ProfileContent = Awaited<ReturnType<typeof loadProfile>>;

function assign(messages: Record<Locale, Record<string, unknown>>, path: string[], value: Text) {
  for (const locale of ["es", "en"] as const) {
    let cursor = messages[locale];
    for (const key of path.slice(0, -1)) {
      const next = cursor[key];
      if (!next || typeof next !== "object") cursor[key] = {};
      cursor = cursor[key] as Record<string, unknown>;
    }
    cursor[path[path.length - 1]] = value[locale];
  }
}

export function profileMessages(content: ProfileContent) {
  const messages: Record<Locale, Record<string, unknown>> = { es: {}, en: {} };
  const { profile } = content;

  const fields: Array<[string, Text]> = [
    ["role", profile.role],
    ["years", profile.years],
    ["location", profile.location],
    ["aboutTitle", profile.aboutTitle],
    ["caption", profile.caption],
    ["siteTitle", profile.siteTitle],
    ["siteBody", profile.siteBody],
    ["interestsTitle", profile.interestsTitle],
    ["experienceTitle", profile.experienceTitle],
    ["stackTitle", profile.stackTitle],
    ["stackIntro", profile.stackIntro],
  ];

  for (const [key, value] of fields) assign(messages, ["profile", key], value);
  profile.bio.forEach((paragraph, index) => assign(messages, ["profile", "bio", String(index)], paragraph));
  for (const interest of profile.sidebarInterests) {
    assign(messages, ["profile", "sidebar", interest.id], interest);
  }

  for (const entry of content.interests) {
    assign(messages, ["interests", entry.id, "title"], entry.data.title);
    assign(messages, ["interests", entry.id, "description"], entry.data.description);
  }

  for (const entry of content.experience) {
    assign(messages, ["experience", entry.id, "role"], entry.data.role);
    assign(messages, ["experience", entry.id, "period"], entry.data.period);
    assign(messages, ["experience", entry.id, "description"], entry.data.description);
    assign(messages, ["experience", entry.id, "sectionTitle"], entry.data.sectionTitle);
    assign(messages, ["experience", entry.id, "linkText"], entry.data.linkText);
    for (const item of entry.data.items) {
      assign(messages, ["experience", entry.id, "items", item.id], item);
    }
  }

  for (const group of content.stack) {
    assign(messages, ["techGroups", group.id], group.data.title);
    for (const item of group.data.items) {
      if (typeof item.name !== "string" && item.id) {
        assign(messages, ["stackItems", group.id, item.id], item.name);
      }
    }
  }

  return messages;
}

export function techIcons(stack: ProfileContent["stack"]) {
  const icons = new Map<string, { icon: string; color?: string }>();
  for (const group of stack) {
    for (const item of group.data.items) {
      const id = item.id ?? (typeof item.name === "string" ? item.name : undefined);
      if (!id) throw new Error(`Falta el id de una tecnología en ${group.id}`);
      icons.set(id, { icon: item.icon, color: item.color });
    }
  }
  return icons;
}
