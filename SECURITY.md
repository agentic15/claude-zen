# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of Agentic15 Claude Zen seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### Please DO NOT:

- Open a public GitHub issue for security vulnerabilities
- Discuss the vulnerability in public forums or social media
- Exploit the vulnerability yourself

### Please DO:

**Report security vulnerabilities to:** security@agentic15.com

Include the following information in your report:

- Type of issue (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

### What to Expect:

- **Acknowledgment**: We will acknowledge receipt of your vulnerability report within 48 hours
- **Updates**: We will send you regular updates about our progress (at least every 5 business days)
- **Assessment**: We will assess the vulnerability and determine its severity
- **Fix**: We will work on a fix and prepare a security advisory
- **Disclosure**: We will coordinate with you on the disclosure timeline
- **Credit**: We will credit you in the security advisory (unless you prefer to remain anonymous)

### Disclosure Timeline:

1. **Day 0**: You report the vulnerability
2. **Day 1-2**: We acknowledge and begin investigation
3. **Day 3-7**: We assess severity and begin developing a fix
4. **Day 7-14**: We test the fix and prepare a patch
5. **Day 14-21**: We release the patch and publish a security advisory
6. **Day 21+**: Public disclosure (coordinated with you)

## Security Best Practices

When using Agentic15 Claude Zen:

### For Users:

1. **Keep Updated**: Always use the latest version of the package
2. **Review Dependencies**: Regularly audit your project dependencies
3. **Secure Credentials**: Never commit API keys, passwords, or secrets to git
4. **Use Environment Variables**: Store sensitive configuration in environment variables
5. **Validate Input**: Always validate user input in your applications
6. **Review Hooks**: Understand what the git hooks are doing before enabling them

### For Contributors:

1. **No Secrets in Code**: Never hardcode credentials or API keys
2. **Input Validation**: Always validate and sanitize user input
3. **Dependencies**: Keep dependencies up to date and review their security
4. **Code Review**: All code must be reviewed before merging
5. **Testing**: Write tests that include security edge cases
6. **Documentation**: Document security considerations in your code

## Known Security Considerations

### Git Hooks

This framework installs git hooks that run automatically. Users should:

- Review hook code before installation
- Understand that hooks execute with their local permissions
- Be cautious when installing hooks from untrusted sources

### Template Files

The framework copies template files to your project. Users should:

- Review templates before using in production
- Customize templates for their security requirements
- Keep templates updated with security patches

### npm Package Execution

When running `npx @agentic15.com/agentic15-claude-zen`:

- The package executes with your local permissions
- Files are created in your filesystem
- npm dependencies are installed

## Security Updates

Security updates are released as:

- **Critical**: Immediate patch release with advisory
- **High**: Patch release within 7 days with advisory
- **Medium**: Patch release within 30 days
- **Low**: Included in next regular release

## Bug Bounty Program

We currently do not have a bug bounty program. However, we deeply appreciate security researchers who responsibly disclose vulnerabilities and will:

- Credit you in our security advisories
- Acknowledge your contribution in release notes
- Add you to our contributors list

## Contact

- **Security Email**: security@agentic15.com
- **General Support**: developers@agentic15.com
- **Website**: https://agentic15.com

## Additional Resources

- [OWASP Top Ten](https://owasp.org/www-project-top-ten/)
- [npm Security Best Practices](https://docs.npmjs.com/packages-and-modules/securing-your-code)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

---

**Copyright 2024-2025 agentic15.com**
Licensed under the Apache License, Version 2.0
