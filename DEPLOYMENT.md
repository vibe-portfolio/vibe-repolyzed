# Deployment Checklist

Use this checklist to ensure your Repo Chat Assistant is properly configured before going live.

## 📋 Pre-Deployment Checklist

### GitHub Repository Setup

- [ ] Repository created with name: `repo-chat-assistant`
- [ ] Repository description set: "AI-powered chat interface to explore and understand any GitHub repository"
- [ ] Topics added to repository:
  - [ ] `bolt-app`
  - [ ] `react`
  - [ ] `typescript`
  - [ ] `tailwind`
  - [ ] `ai`
  - [ ] `github-api`
  - [ ] `chat`
  - [ ] `code-analysis`
  - [ ] `developer-tools`
  - [ ] `repository-explorer`

### Environment Variables

Configure these in your deployment platform:

- [ ] `VITE_GITHUB_TOKEN` - GitHub Personal Access Token (optional but recommended)
- [ ] `VITE_OPENAI_API_KEY` - OpenAI API Key (if using OpenAI)
- [ ] `VITE_ANTHROPIC_API_KEY` - Anthropic API Key (if using Claude)

### Visual Assets

- [ ] OG image created at correct dimensions (1200x630px) ✅ Already included as SVG
- [ ] OG image placed in `/public/og-image.svg` ✅ Complete
- [ ] Favicon updated (optional)

### Meta Tags & SEO

- [ ] Title tag updated in `index.html` ✅ Complete
- [ ] Meta description added ✅ Complete
- [ ] Open Graph tags configured ✅ Complete
- [ ] Twitter Card tags configured ✅ Complete
- [ ] Deployment URL added to meta tags (after deployment)

### Documentation

- [ ] README.md complete with all sections ✅ Complete
- [ ] LICENSE file added ✅ Complete
- [ ] .env.example created ✅ Complete
- [ ] Setup instructions verified

### Code Quality

- [ ] TypeScript build passes ✅ Complete
- [ ] Production build succeeds ✅ Complete
- [ ] No console errors in development
- [ ] All components render correctly
- [ ] Error handling implemented for all API calls

### Functionality Testing

Test these features before deploying:

- [ ] GitHub URL validation works
- [ ] Repository indexing completes successfully
- [ ] File tree displays correctly
- [ ] Chat interface sends and receives messages
- [ ] AI responses stream properly
- [ ] Code syntax highlighting works
- [ ] Dark/light mode toggle functions
- [ ] Mobile responsive layout works
- [ ] Sidebar collapse/expand works
- [ ] Error messages display appropriately

### API Testing

- [ ] GitHub API token works (test with a repository)
- [ ] AI API key works (send a test message)
- [ ] Rate limiting handled gracefully
- [ ] Network errors caught and displayed

### Post-Deployment

- [ ] Homepage URL set in GitHub repository settings
- [ ] Test full user flow on live site
- [ ] Verify OG image displays in social media previews
- [ ] Check mobile responsiveness on real devices
- [ ] Monitor error logs for any issues
- [ ] Test with multiple repositories

## 🚀 Deployment Platforms

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
# Settings → Environment Variables
```

### Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod

# Add environment variables in Netlify dashboard
# Site settings → Environment variables
```

### GitHub Pages (with GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          VITE_GITHUB_TOKEN: ${{ secrets.VITE_GITHUB_TOKEN }}
          VITE_OPENAI_API_KEY: ${{ secrets.VITE_OPENAI_API_KEY }}

      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## 🔧 Update Meta Tags After Deployment

After deploying, update the OG image URLs in `index.html`:

```html
<meta property="og:image" content="https://your-deployment-url.com/og-image.svg" />
<meta name="twitter:image" content="https://your-deployment-url.com/og-image.svg" />
```

## 📊 Monitoring

After deployment, monitor:

- API usage and costs
- Error rates
- User feedback
- Performance metrics
- Rate limit warnings

## 🎉 You're Ready!

Once all checklist items are complete, your Repo Chat Assistant is ready for production use!
