import { describe, it, expect, beforeEach } from '@jest/globals';
import { UITaskDetector } from '../../src/core/UITaskDetector.js';

/**
 * TDD Test Suite for UI Task Detection
 *
 * These tests are written BEFORE implementation (TDD approach).
 * They define the expected behavior of the UITaskDetector class.
 */
describe('UITaskDetector', () => {
  let detector;

  beforeEach(() => {
    detector = new UITaskDetector();
  });

  describe('Metadata Detection', () => {
    it('should detect task with uiUrl metadata field', async () => {
      const task = {
        id: 'TASK-001',
        title: 'Implement login form',
        uiUrl: 'http://localhost:3000/login'
      };

      const result = await detector.detect(task);

      expect(result.isUITask).toBe(true);
      expect(result.confidence).toBeGreaterThanOrEqual(80);
      expect(result.reasons).toContain('metadata');
      expect(result.url).toBe('http://localhost:3000/login');
    });

    it('should detect task with uiTestRequired flag', async () => {
      const task = {
        id: 'TASK-002',
        title: 'Update dashboard layout',
        uiTestRequired: true
      };

      const result = await detector.detect(task);

      expect(result.isUITask).toBe(true);
      expect(result.confidence).toBe(100);
      expect(result.reasons).toContain('metadata');
    });

    it('should detect task with uiFlows array', async () => {
      const task = {
        id: 'TASK-003',
        title: 'Implement checkout flow',
        uiFlows: ['add-to-cart', 'checkout', 'payment']
      };

      const result = await detector.detect(task);

      expect(result.isUITask).toBe(true);
      expect(result.confidence).toBe(100);
      expect(result.flows).toEqual(['add-to-cart', 'checkout', 'payment']);
    });

    it('should detect task with selectors metadata', async () => {
      const task = {
        id: 'TASK-004',
        title: 'Fix login button',
        selectors: {
          loginButton: '#login-btn',
          emailInput: 'input[type=email]'
        }
      };

      const result = await detector.detect(task);

      expect(result.isUITask).toBe(true);
      expect(result.selectors).toBeDefined();
      expect(result.selectors.loginButton).toBe('#login-btn');
    });

    it('should handle task with multiple UI metadata fields', async () => {
      const task = {
        id: 'TASK-005',
        title: 'Complete user profile',
        uiUrl: 'http://localhost:3000/profile',
        uiTestRequired: true,
        uiFlows: ['edit-profile', 'upload-avatar'],
        selectors: {
          avatarUpload: '#avatar-input'
        }
      };

      const result = await detector.detect(task);

      expect(result.isUITask).toBe(true);
      expect(result.confidence).toBe(100);
      expect(result.url).toBe('http://localhost:3000/profile');
      expect(result.flows).toHaveLength(2);
    });
  });

  describe('File Change Detection', () => {
    it('should detect task modifying React JSX files', async () => {
      const task = {
        id: 'TASK-010',
        title: 'Update component',
        fileChanges: [
          'src/components/LoginForm.jsx',
          'src/components/Button.jsx'
        ]
      };

      const result = await detector.detect(task);

      expect(result.isUITask).toBe(true);
      expect(result.confidence).toBeGreaterThanOrEqual(80);
      expect(result.reasons).toContain('fileChanges');
    });

    it('should detect task modifying TypeScript React files', async () => {
      const task = {
        id: 'TASK-011',
        title: 'Add new feature',
        fileChanges: [
          'src/components/Dashboard.tsx',
          'src/types/user.ts'
        ]
      };

      const result = await detector.detect(task);

      expect(result.isUITask).toBe(true);
      expect(result.fileChangeRatio).toBeGreaterThan(0.5);
    });

    it('should detect task modifying Vue files', async () => {
      const task = {
        id: 'TASK-012',
        title: 'Update Vue component',
        fileChanges: [
          'src/components/UserProfile.vue',
          'src/views/Home.vue'
        ]
      };

      const result = await detector.detect(task);

      expect(result.isUITask).toBe(true);
      expect(result.confidence).toBeGreaterThanOrEqual(80);
    });

    it('should detect task modifying CSS files', async () => {
      const task = {
        id: 'TASK-013',
        title: 'Update button styles',
        fileChanges: [
          'src/styles/button.css',
          'src/styles/theme.scss'
        ]
      };

      const result = await detector.detect(task);

      expect(result.isUITask).toBe(true);
      expect(result.confidence).toBeGreaterThanOrEqual(80);
    });

    it('should detect task modifying HTML files', async () => {
      const task = {
        id: 'TASK-014',
        title: 'Update landing page',
        fileChanges: [
          'public/index.html',
          'src/pages/landing.html'
        ]
      };

      const result = await detector.detect(task);

      expect(result.isUITask).toBe(true);
    });

    it('should calculate UI file ratio correctly', async () => {
      const task = {
        id: 'TASK-015',
        title: 'Mixed changes',
        fileChanges: [
          'src/components/Form.jsx',  // UI
          'src/components/Button.tsx', // UI
          'src/api/users.js',          // Backend
          'src/utils/validation.js'    // Backend
        ]
      };

      const result = await detector.detect(task);

      expect(result.fileChangeRatio).toBe(0.5); // 2 UI files / 4 total files
      expect(result.isUITask).toBe(true); // 50% ratio should trigger detection
    });

    it('should ignore backend files in server directories', async () => {
      const task = {
        id: 'TASK-016',
        title: 'Server-side rendering',
        fileChanges: [
          'server/render.jsx',  // SSR, not UI
          'api/users.js'
        ]
      };

      const result = await detector.detect(task);

      expect(result.isUITask).toBe(false);
      expect(result.confidence).toBeLessThan(50);
    });

    it('should exclude test files from UI detection', async () => {
      const task = {
        id: 'TASK-017',
        title: 'Write unit tests',
        fileChanges: [
          'src/utils/validation.test.js',
          'src/api/users.spec.js'
        ]
      };

      const result = await detector.detect(task);

      expect(result.isUITask).toBe(false);
    });

    it('should detect UI tests in component directories', async () => {
      const task = {
        id: 'TASK-018',
        title: 'Write component tests',
        fileChanges: [
          'src/components/Button.test.jsx',
          'src/components/Form.spec.tsx'
        ]
      };

      const result = await detector.detect(task);

      expect(result.isUITask).toBe(true); // Component tests are UI-related
    });
  });

  describe('Keyword Detection', () => {
    it('should detect task with "UI" in title', async () => {
      const task = {
        id: 'TASK-020',
        title: 'Fix UI rendering bug',
        description: 'The component is not rendering correctly'
      };

      const result = await detector.detect(task);

      expect(result.isUITask).toBe(true);
      expect(result.confidence).toBeGreaterThanOrEqual(70);
      expect(result.reasons).toContain('keywords');
    });

    it('should detect task with "component" keyword', async () => {
      const task = {
        id: 'TASK-021',
        title: 'Create new component for user profile',
        description: 'Add a reusable component'
      };

      const result = await detector.detect(task);

      expect(result.isUITask).toBe(true);
    });

    it('should detect task with "frontend" keyword', async () => {
      const task = {
        id: 'TASK-022',
        title: 'Frontend refactoring',
        description: 'Refactor the frontend code structure'
      };

      const result = await detector.detect(task);

      expect(result.isUITask).toBe(true);
    });

    it('should detect task with multiple UI keywords', async () => {
      const task = {
        id: 'TASK-023',
        title: 'Update button and form styling',
        description: 'Improve the UI components with better CSS'
      };

      const result = await detector.detect(task);

      expect(result.isUITask).toBe(true);
      expect(result.confidence).toBeGreaterThanOrEqual(80);
    });

    it('should weight title keywords higher than description', async () => {
      const taskWithTitleKeyword = {
        id: 'TASK-024',
        title: 'UI improvements',
        description: 'Various updates'
      };

      const taskWithDescriptionKeyword = {
        id: 'TASK-025',
        title: 'Various updates',
        description: 'UI improvements'
      };

      const result1 = await detector.detect(taskWithTitleKeyword);
      const result2 = await detector.detect(taskWithDescriptionKeyword);

      expect(result1.confidence).toBeGreaterThan(result2.confidence);
    });

    it('should detect Playwright/E2E test keywords', async () => {
      const task = {
        id: 'TASK-026',
        title: 'Write Playwright E2E tests',
        description: 'Add visual tests with screenshots'
      };

      const result = await detector.detect(task);

      expect(result.isUITask).toBe(true);
      expect(result.confidence).toBeGreaterThanOrEqual(80);
    });
  });

  describe('False Positive Prevention', () => {
    it('should ignore pure backend tasks', async () => {
      const task = {
        id: 'TASK-030',
        title: 'Implement user authentication API',
        description: 'Create REST API endpoints for user login and registration',
        fileChanges: [
          'src/api/auth.js',
          'src/middleware/jwt.js',
          'src/models/User.js'
        ]
      };

      const result = await detector.detect(task);

      expect(result.isUITask).toBe(false);
      expect(result.confidence).toBeLessThan(50);
    });

    it('should ignore database tasks', async () => {
      const task = {
        id: 'TASK-031',
        title: 'Add database migration for user table',
        description: 'Create SQL migration to add new columns',
        fileChanges: [
          'migrations/001_add_user_columns.sql',
          'src/models/User.js'
        ]
      };

      const result = await detector.detect(task);

      expect(result.isUITask).toBe(false);
    });

    it('should ignore infrastructure tasks', async () => {
      const task = {
        id: 'TASK-032',
        title: 'Setup CI/CD pipeline',
        description: 'Configure GitHub Actions for deployment',
        phase: 'deployment',
        fileChanges: [
          '.github/workflows/deploy.yml',
          'Dockerfile'
        ]
      };

      const result = await detector.detect(task);

      expect(result.isUITask).toBe(false);
    });

    it('should ignore documentation tasks', async () => {
      const task = {
        id: 'TASK-033',
        title: 'Document API endpoints',
        description: 'Add documentation for the REST API',
        fileChanges: [
          'docs/api.md',
          'README.md'
        ]
      };

      const result = await detector.detect(task);

      expect(result.isUITask).toBe(false);
    });

    it('should ignore backend tasks that mention "user" and "interface"', async () => {
      const task = {
        id: 'TASK-034',
        title: 'Implement User interface for database',
        description: 'Create interface for user repository pattern',
        fileChanges: [
          'src/interfaces/IUserRepository.ts',
          'src/repositories/UserRepository.ts'
        ]
      };

      const result = await detector.detect(task);

      expect(result.isUITask).toBe(false);
    });

    it('should exclude email template HTML files', async () => {
      const task = {
        id: 'TASK-035',
        title: 'Update email templates',
        fileChanges: [
          'templates/email/welcome.html',
          'templates/email/reset-password.html'
        ]
      };

      const result = await detector.detect(task);

      expect(result.isUITask).toBe(false);
    });
  });

  describe('Mixed Backend + Frontend Tasks', () => {
    it('should detect mixed task with majority UI changes', async () => {
      const task = {
        id: 'TASK-040',
        title: 'Add user profile feature',
        description: 'Create profile page and API endpoint',
        fileChanges: [
          'src/components/Profile.jsx',
          'src/components/Avatar.jsx',
          'src/styles/profile.css',
          'src/api/profile.js'
        ]
      };

      const result = await detector.detect(task);

      expect(result.isUITask).toBe(true);
      expect(result.fileChangeRatio).toBeGreaterThan(0.5);
    });

    it('should not detect mixed task with minority UI changes', async () => {
      const task = {
        id: 'TASK-041',
        title: 'Refactor authentication system',
        fileChanges: [
          'src/api/auth.js',
          'src/middleware/jwt.js',
          'src/utils/hash.js',
          'src/components/LoginButton.jsx'  // Only 1 UI file
        ]
      };

      const result = await detector.detect(task);

      expect(result.isUITask).toBe(false);
      expect(result.fileChangeRatio).toBeLessThan(0.5);
    });

    it('should suggest verification for borderline cases', async () => {
      const task = {
        id: 'TASK-042',
        title: 'Update user data handling',
        fileChanges: [
          'src/api/users.js',
          'src/components/UserList.jsx'
        ]
      };

      const result = await detector.detect(task);

      expect(result.confidence).toBeGreaterThanOrEqual(50);
      expect(result.confidence).toBeLessThan(80);
      expect(result.suggestion).toBe('possible');
    });
  });

  describe('Confidence Scoring', () => {
    it('should return 100% confidence for explicit metadata', async () => {
      const task = {
        id: 'TASK-050',
        title: 'Build dashboard',
        uiTestRequired: true
      };

      const result = await detector.detect(task);

      expect(result.confidence).toBe(100);
    });

    it('should combine multiple signals for higher confidence', async () => {
      const task = {
        id: 'TASK-051',
        title: 'Create UI component',
        description: 'Build a new form component',
        fileChanges: [
          'src/components/Form.jsx',
          'src/styles/form.css'
        ]
      };

      const result = await detector.detect(task);

      expect(result.confidence).toBeGreaterThanOrEqual(85);
      expect(result.reasons).toContain('keywords');
      expect(result.reasons).toContain('fileChanges');
    });

    it('should return low confidence for ambiguous tasks', async () => {
      const task = {
        id: 'TASK-052',
        title: 'Update validation logic',
        description: 'Refactor validation'
      };

      const result = await detector.detect(task);

      expect(result.confidence).toBeLessThan(50);
      expect(result.isUITask).toBe(false);
    });
  });

  describe('URL Detection', () => {
    it('should use uiUrl from metadata if provided', async () => {
      const task = {
        id: 'TASK-060',
        title: 'Test login',
        uiUrl: 'http://localhost:3000/login'
      };

      const result = await detector.detect(task);

      expect(result.url).toBe('http://localhost:3000/login');
    });

    it('should return null URL if not provided', async () => {
      const task = {
        id: 'TASK-061',
        title: 'Update UI component',
        fileChanges: ['src/components/Button.jsx']
      };

      const result = await detector.detect(task);

      expect(result.isUITask).toBe(true);
      expect(result.url).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle task with no metadata or file changes', async () => {
      const task = {
        id: 'TASK-070',
        title: 'General improvements',
        description: 'Make some updates'
      };

      const result = await detector.detect(task);

      expect(result.isUITask).toBe(false);
      expect(result.confidence).toBeLessThan(50);
    });

    it('should handle empty file changes array', async () => {
      const task = {
        id: 'TASK-071',
        title: 'UI update',
        fileChanges: []
      };

      const result = await detector.detect(task);

      expect(result.fileChangeRatio).toBe(0);
      expect(result.isUITask).toBe(true); // Still detected by keywords
    });

    it('should handle null or undefined fields gracefully', async () => {
      const task = {
        id: 'TASK-072',
        title: 'Update feature',
        description: null,
        fileChanges: undefined
      };

      const result = await detector.detect(task);

      expect(result).toBeDefined();
      expect(result.isUITask).toBe(false);
    });

    it('should handle build config files correctly', async () => {
      const task = {
        id: 'TASK-073',
        title: 'Update webpack config',
        fileChanges: [
          'webpack.config.js',
          'vite.config.js'
        ]
      };

      const result = await detector.detect(task);

      expect(result.isUITask).toBe(false);
    });
  });

  describe('Phase-based Detection', () => {
    it('should boost confidence for design phase with UI keywords', async () => {
      const task = {
        id: 'TASK-080',
        title: 'Design user interface',
        phase: 'design'
      };

      const result = await detector.detect(task);

      expect(result.isUITask).toBe(true);
      expect(result.confidence).toBeGreaterThanOrEqual(70);
    });

    it('should reduce confidence for deployment phase', async () => {
      const task = {
        id: 'TASK-081',
        title: 'Deploy UI changes',
        phase: 'deployment'
      };

      const result = await detector.detect(task);

      // Keywords suggest UI, but deployment phase reduces confidence
      expect(result.confidence).toBeLessThan(80);
    });
  });

  describe('Result Format', () => {
    it('should return properly formatted result object', async () => {
      const task = {
        id: 'TASK-090',
        title: 'Create component',
        uiUrl: 'http://localhost:3000',
        fileChanges: ['src/components/Test.jsx']
      };

      const result = await detector.detect(task);

      expect(result).toHaveProperty('isUITask');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('reasons');
      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('fileChangeRatio');
      expect(typeof result.isUITask).toBe('boolean');
      expect(typeof result.confidence).toBe('number');
      expect(Array.isArray(result.reasons)).toBe(true);
    });
  });
});
