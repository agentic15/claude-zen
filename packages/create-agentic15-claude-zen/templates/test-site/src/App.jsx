import { useState } from 'react'
import './App.css'
// Import your components from Agent/src here
// Example: import { YourComponent } from '../../Agent/src/components/YourComponent'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Integration Test Site</h1>
        <p>Component Preview for Stakeholder Validation</p>
      </header>

      <main className="app-main">
        <section className="demo-section">
          <h2>Your Components Go Here</h2>
          <p className="demo-description">
            Import your UI components from <code>../Agent/src/components/</code> and render them below
            for stakeholder testing and validation.
          </p>

          <div className="component-placeholder">
            <p>👆 Replace this section with your component</p>
            <code>{'<YourComponent prop1="value" onEvent={handleEvent} />'}</code>
          </div>
        </section>

        <section className="instructions">
          <h2>How to Add Your Components</h2>
          <ol>
            <li>Copy your component from <code>Agent/src/components/</code> to <code>test-site/src/components/</code></li>
            <li>Import it: <code>import &#123; YourComponent &#125; from './components/YourComponent'</code></li>
            <li>OR import directly: <code>import &#123; YourComponent &#125; from '../../Agent/src/components/YourComponent'</code></li>
            <li>Render it in the demo section above with realistic props</li>
            <li>Add event handlers to demonstrate interactivity</li>
            <li>Run <code>npm run dev</code> to test locally at http://localhost:3000</li>
            <li>Deploy with <code>npm run deploy</code> to share with stakeholders via GitHub Pages</li>
          </ol>

          <h3>Example: GitHub Auth Login Component</h3>
          <pre className="code-example">{`// 1. Copy your login component
cp ../Agent/src/components/GitHubLogin.jsx src/components/

// 2. Import and use it
import { GitHubLogin } from './components/GitHubLogin'

function App() {
  const handleLogin = (user) => {
    console.log('User logged in:', user)
  }

  return (
    <div>
      <GitHubLogin onLogin={handleLogin} />
    </div>
  )
}`}</pre>
        </section>

        <section className="component-list">
          <h2>Quick Start</h2>
          <ul>
            <li>📦 Install dependencies: <code>npm install</code></li>
            <li>🚀 Start dev server: <code>npm run dev</code></li>
            <li>🌍 Deploy to GitHub Pages: <code>npm run deploy</code></li>
            <li>📝 Edit <code>src/App.jsx</code> to add your components</li>
          </ul>
        </section>
      </main>

      <footer className="app-footer">
        <p>Built with Vite + React for fast hot reload</p>
      </footer>
    </div>
  )
}

export default App
