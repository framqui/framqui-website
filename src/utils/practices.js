const practicesGlob = import.meta.glob('../content/practices/*.md', { eager: true });

export function getPractices() {
  const articles = Object.entries(practicesGlob).map(([path, mod]) => {
    const slug = path.split('/').pop()?.replace('.md', '') || '';
    const data = mod.frontmatter || {};
    const body = typeof mod.rawContent === 'function' ? mod.rawContent() : '';
    return { slug, data, body };
  }).sort((a, b) => new Date(b.data.date).valueOf() - new Date(a.data.date).valueOf());
  return articles;
}

export function getPracticeBySlug(slug) {
  const key = Object.keys(practicesGlob).find(k => k.endsWith(`/${slug}.md`));
  if (!key) return null;
  const mod = practicesGlob[key];
  const data = mod.frontmatter || {};
  const body = typeof mod.rawContent === 'function' ? mod.rawContent() : '';
  return { slug, data, body };
}
