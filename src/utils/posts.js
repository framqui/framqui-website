const postsGlob = import.meta.glob('../content/posts/*.md', { eager: true });

export function getPosts() {
  const articles = Object.entries(postsGlob).map(([path, mod]) => {
    const slug = path.split('/').pop()?.replace('.md', '') || '';
    const data = mod.frontmatter || {};
    const body = typeof mod.rawContent === 'function' ? mod.rawContent() : '';
    return { slug, data, body };
  }).sort((a, b) => new Date(b.data.date).valueOf() - new Date(a.data.date).valueOf());
  return articles;
}

export function getPostBySlug(slug) {
  const key = Object.keys(postsGlob).find(k => k.endsWith(`/${slug}.md`));
  if (!key) return null;
  const mod = postsGlob[key];
  const data = mod.frontmatter || {};
  const body = typeof mod.rawContent === 'function' ? mod.rawContent() : '';
  return { slug, data, body };
}
