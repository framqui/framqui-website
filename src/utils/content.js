function parseArticles(glob) {
  const articles = Object.entries(glob).map(([path, mod]) => {
    const slug = path.split('/').pop()?.replace('.md', '') || '';
    const data = mod.frontmatter || {};
    const body = typeof mod.rawContent === 'function' ? mod.rawContent() : '';
    return { slug, data, body };
  });
  return articles.sort((a, b) => new Date(b.data.date).valueOf() - new Date(a.data.date).valueOf());
}

function findBySlug(glob, slug) {
  const key = Object.keys(glob).find((k) => k.endsWith(`/${slug}.md`));
  if (!key) return null;
  const mod = glob[key];
  const data = mod.frontmatter || {};
  const body = typeof mod.rawContent === 'function' ? mod.rawContent() : '';
  return { slug, data, body };
}

const postsGlob = import.meta.glob('../content/posts/*.md', { eager: true });
const practicesGlob = import.meta.glob('../content/practices/*.md', { eager: true });

export const posts = {
  loadAll: () => parseArticles(postsGlob),
  loadBySlug: (slug) => findBySlug(postsGlob, slug),
};

export const practices = {
  loadAll: () => parseArticles(practicesGlob),
  loadBySlug: (slug) => findBySlug(practicesGlob, slug),
};
