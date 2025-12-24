# Integration Test Website

A lightweight, hot-reloading test site for stakeholder validation of UI components before production deployment.

## Purpose

This test site allows stakeholders to:
- Preview UI components in isolation
- Interact with components using realistic data
- Validate behavior before production deployment
- Test responsiveness across devices
- Approve visual design and UX flows

## Quick Start

### 1. Install Dependencies

```bash
cd test-site
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

The server will automatically allocate a port (default: 3000-3009 range) and display the URL.

**Port Management Features:**
- **Fixed Port Allocation**: Uses port 3000 by default, with automatic fallback to 3001-3009 if occupied
- **Auto-Cleanup**: Automatically kills stale processes on the assigned port before starting
- **Port Reuse**: Consistently uses the same port for a stable development experience
- **Conflict Resolution**: Automatically finds an available port if the preferred port is in use

Open the displayed URL (typically [http://localhost:3000](http://localhost:3000)) to view the test site.

### 3. Add Your Components

Edit `src/App.jsx` to import and render your components:

```jsx
// Import your component
import { Button } from '../Agent/src/components/Button'

function App() {
  return (
    <div className="demo-section">
      <h2>Button Component Demo</h2>
      <Button onClick={() => alert('Clicked!')}>
        Click Me
      </Button>
    </div>
  )
}
```

## Available Scripts

### `npm run dev`
Starts the development server with:
- **Port management**: Auto-allocates port from 3000-3009 range
- **Hot reload**: Instant updates when you save files
- **Auto-cleanup**: Kills stale processes before starting
- **Graceful shutdown**: Releases port on Ctrl+C

### `npm run dev:simple`
Starts Vite server without port management (uses default Vite behavior).

### `npm run build`
Builds the site for production to the `dist/` folder.

### `npm run preview`
Preview the production build locally before deploying.

### `npm run deploy`
Builds and deploys the site to GitHub Pages.

## Deployment to GitHub Pages

### First-time Setup

1. Create a GitHub repository for your project (if not already done)
2. Enable GitHub Pages in repository settings:
   - Go to Settings → Pages
   - Source: Deploy from a branch
   - Branch: Select `gh-pages` branch
   - Click Save

### Deploy Updates

```bash
npm run deploy
```

This will build the site and push it to the `gh-pages` branch automatically.

Your test site will be available at:
```
https://<your-username>.github.io/<repo-name>/
```

## Sharing with Stakeholders

### Option 1: GitHub Pages (Recommended)
Deploy to GitHub Pages and share the URL. Updates are instant when you run `npm run deploy`.

### Option 2: Local Network
Run `npm run dev` and share your local IP address (find with `ipconfig` on Windows or `ifconfig` on Mac/Linux):
```
http://192.168.1.XXX:3000
```

### Option 3: Tunneling Service
Use a service like ngrok to create a public URL for your local server:
```bash
npx ngrok http 3000
```

## Framework Support

### React (Default)
The template uses Vite + React with hot reload. No additional setup needed.

### Vue
To use Vue instead of React:

1. Replace dependencies in `package.json`:
```json
{
  "dependencies": {
    "vue": "^3.3.4"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^4.5.0",
    "vite": "^5.0.8"
  }
}
```

2. Update `vite.config.js`:
```js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  // ...rest of config
})
```

3. Rename `src/main.jsx` → `src/main.js` and update content:
```js
import { createApp } from 'vue'
import App from './App.vue'
import './index.css'

createApp(App).mount('#app')
```

### Svelte
To use Svelte:

1. Replace dependencies in `package.json`:
```json
{
  "devDependencies": {
    "@sveltejs/vite-plugin-svelte": "^3.0.0",
    "svelte": "^4.2.8",
    "vite": "^5.0.8"
  }
}
```

2. Update `vite.config.js`:
```js
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [svelte()],
  // ...rest of config
})
```

3. Rename files to `.svelte` and update imports.

## Best Practices

### 1. Use Realistic Data
Don't use placeholder text. Use realistic data that stakeholders will recognize:
```jsx
<UserCard
  name="John Smith"
  email="john.smith@company.com"
  role="Product Manager"
/>
```

### 2. Show Multiple States
Demonstrate different component states:
```jsx
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button disabled>Disabled</Button>
```

### 3. Test Edge Cases
Show how components handle edge cases:
```jsx
<UserName name="Really Long Name That Might Wrap" />
<UserName name="" /> {/* Empty state */}
<ErrorMessage>Something went wrong!</ErrorMessage>
```

### 4. Group by Feature
Organize components by feature or user flow:
```jsx
<section className="login-flow">
  <h2>Login Flow</h2>
  <LoginForm />
  <ForgotPassword />
  <SignUpLink />
</section>
```

### 5. Add Annotations
Explain what stakeholders should validate:
```jsx
<div className="demo-section">
  <h2>Shopping Cart</h2>
  <p><strong>Validation Points:</strong></p>
  <ul>
    <li>Items can be added/removed</li>
    <li>Quantity updates recalculate total</li>
    <li>Discount codes apply correctly</li>
  </ul>
  <ShoppingCart items={mockCartItems} />
</div>
```

## Troubleshooting

### Components Not Found
If your components can't be imported:
- Check the import path is correct relative to `test-site/src/`
- Ensure components are exported properly
- Verify file extensions match (.jsx, .tsx, etc.)

### Styles Not Working
- Import component CSS files alongside components
- Check that Tailwind/styled-components are configured if used
- Verify CSS module naming conventions

### Hot Reload Issues
- Save files to trigger reload
- Check terminal for build errors
- Restart dev server: `Ctrl+C` then `npm run dev`

## Tips for Stakeholder Review

1. **Schedule a live demo session** - Walk through components together
2. **Record a video** - Show interactions and flows
3. **Create a checklist** - What needs approval on each component
4. **Collect feedback** - Add a feedback form or use GitHub Issues
5. **Version deployments** - Use git tags to track approved versions

## License

This template is part of the gl-life-claude-zen package and follows the same license as the parent project.
