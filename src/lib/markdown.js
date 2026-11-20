import matter from 'gray-matter';

export function readMarkdown(filePath, raw) {
  const slug = filePath.split('/').pop()?.replace(/\.md$/, '') || '';
  const { data, content } = matter(String(raw));
  return { slug, data, body: content };
}
