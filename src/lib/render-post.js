// Shared markdown → HTML pipeline for the RSS and JSON Feed endpoints.
// Handles the MDX video posts by swapping <YouTube/> components for plain links.
import MarkdownIt from 'markdown-it';
import sanitizeHtml from 'sanitize-html';

const md = new MarkdownIt({ html: true, linkify: true });

export function renderPostHtml(post, site) {
  let body = post.body ?? '';
  body = body.replace(/^import\s.*$/gm, '');
  body = body.replace(
    /<YouTube\s[^>]*id="([^"]+)"[^>]*\/>/g,
    (_m, id) => `\n\n[Watch on YouTube](https://youtu.be/${id})\n\n`
  );
  let html = md.render(body);
  html = sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'iframe', 'figure', 'figcaption', 'div']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ['src', 'alt', 'width', 'height'],
      iframe: ['src', 'title', 'allowfullscreen', 'loading'],
      div: ['class'],
    },
    allowedIframeHostnames: ['www.youtube.com', 'www.youtube-nocookie.com'],
  });
  // Feed readers need absolute URLs for locally-hosted post images.
  const origin = String(site).replace(/\/+$/, '');
  html = html.replaceAll('src="/images/', `src="${origin}/images/`);
  html = html.replaceAll('href="/images/', `href="${origin}/images/`);
  return html;
}
