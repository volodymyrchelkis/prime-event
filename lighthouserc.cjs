// Lighthouse CI: speed, accessibility and best practices of the built pages.
// Runs on the static output of `npm run build` (the Vercel adapter puts it there).
module.exports = {
  ci: {
    collect: {
      staticDistDir: '.vercel/output/static',
      url: [
        'http://localhost/',
        'http://localhost/services/',
        'http://localhost/characters/',
        'http://localhost/contacts/',
        'http://localhost/uk/services/',
        'http://localhost/bg/services/',
      ],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9, aggregationMethod: 'median-run' }],
        'categories:accessibility': ['error', { minScore: 1 }],
        'categories:best-practices': ['error', { minScore: 0.95 }],
        // The SEO score counts "noindex" as a failure. The site is hidden from search on purpose
        // until launch (site.indexable), so check the individual SEO audits instead.
        'categories:seo': 'off',
        'document-title': 'error',
        'meta-description': 'error',
        'html-has-lang': 'error',
        hreflang: 'error',
        'link-text': 'error',
        'crawlable-anchors': 'error',
        'robots-txt': 'error',
      },
    },
    upload: { target: 'filesystem', outputDir: 'lighthouse-report' },
  },
};
