import { defineConfig } from 'vitepress'

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1]
const base = process.env.GITHUB_ACTIONS && repoName ? `/${repoName}/` : '/'

export default defineConfig({
  title: 'ts-zxcvbn',
  description: 'TypeScript port of Dropbox\'s zxcvbn password strength estimator.',
  base,
  lastUpdated: true,
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/' },
      { text: 'API', link: '/api' },
      { text: 'Demo', link: '/demo' },
      { text: 'Performance', link: '/performance' }
    ],
    sidebar: [
      {
        text: 'Documentation',
        items: [
          { text: 'Getting started', link: '/' },
          { text: 'API reference', link: '/api' },
          { text: 'Live demo', link: '/demo' },
          { text: 'Performance', link: '/performance' }
        ]
      }
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/jonime/ts-zxcvbn' }]
  }
})
