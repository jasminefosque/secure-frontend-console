# Security Notes

## Overview

This document provides technical security details for developers working on or deploying the Secure Frontend Console. It complements the threat model with implementation-specific security guidance.

## Input Validation

### Validation Strategy

All user inputs are validated using **Zod schemas** before being processed or stored. This provides:

- Type safety at runtime
- Declarative validation rules
- Automatic TypeScript type inference
- Composable validation logic

### Validation Boundaries

```
User Input → Zod Schema → Redux State → localStorage
     ↑                                       ↓
     └────────── Validation on Read ─────────┘
```

**Key Principle**: Data is validated at both ingress (user input) and egress (reading from storage).

### Example Validation Schema

```typescript
// src/domain/validation/userInput.schema.ts
import { z } from 'zod';

export const emailSchema = z
  .string()
  .email('Invalid email format')
  .max(255, 'Email too long');

export const amountSchema = z
  .number()
  .positive('Amount must be positive')
  .max(1000000, 'Amount exceeds maximum');

export const userFormSchema = z.object({
  email: emailSchema,
  amount: amountSchema,
  notes: z.string().max(500, 'Notes too long').optional(),
});
```

### Validation Best Practices

1. **Always validate at boundaries**: User input, localStorage reads, external data
2. **Fail securely**: Invalid data causes rejection, not silent coercion
3. **Use explicit schemas**: No `.passthrough()` that allows unknown fields
4. **Test validation**: Unit tests for valid and invalid inputs
5. **User-friendly errors**: Clear error messages for validation failures

## XSS Prevention

### React's Built-in Protection

React automatically escapes values rendered in JSX:

```tsx
// ✅ Safe: React escapes automatically
<div>{userInput}</div>

// ❌ Dangerous: Bypasses React's protection
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

### Rules

1. **Never use `dangerouslySetInnerHTML`** unless absolutely necessary
2. **If you must use it**: Sanitize with a library like DOMPurify
3. **Validate all inputs**: Even though React escapes, validate data integrity
4. **No `eval()` or `Function()`**: Never execute user-provided strings as code

### Tested Scenarios

- Script tags in text inputs → Escaped by React
- Event handlers in attributes → Validated and rejected
- HTML entities → Rendered as text
- Unicode exploits → Validated character ranges

## State Management Security

### Redux Toolkit

We use Redux Toolkit which provides:

- **Immutability**: Via Immer, preventing accidental mutations
- **Type safety**: Full TypeScript support
- **Predictable state**: Reducers are pure functions
- **DevTools integration**: For debugging (disabled in production)

### State Security Principles

1. **Validate before dispatch**: All actions validate data before updating state
2. **No sensitive data**: Never store passwords, tokens, or secrets in state
3. **Derived state**: Calculate values, don't store duplicates
4. **Single source of truth**: State is the only source, not DOM or localStorage

### Example Secure Action

```typescript
// ✅ Good: Validates before updating state
const addItem = (state, action: PayloadAction<unknown>) => {
  const result = itemSchema.safeParse(action.payload);
  if (!result.success) {
    console.error('Invalid item data:', result.error);
    return; // State unchanged
  }
  state.items.push(result.data);
};

// ❌ Bad: Trusts payload without validation
const addItemBad = (state, action: PayloadAction<Item>) => {
  state.items.push(action.payload);
};
```

## Storage Security

### localStorage Usage

**Scope**: This application uses localStorage for client-side persistence only.

**Security Considerations**:

1. **Origin-bound**: Data accessible only by same origin (protocol + domain + port)
2. **Not encrypted**: Data stored in plain text
3. **User-accessible**: Users can view/edit via DevTools
4. **Size-limited**: ~5-10MB per origin
5. **Persistent**: Survives browser restarts

### Storage Best Practices

```typescript
// ✅ Good: Validate on read
export const loadState = (): AppState | undefined => {
  try {
    const serialized = localStorage.getItem('appState');
    if (!serialized) return undefined;
    
    const parsed = JSON.parse(serialized);
    const result = appStateSchema.safeParse(parsed);
    
    if (!result.success) {
      console.error('Invalid stored state:', result.error);
      return undefined;
    }
    
    return result.data;
  } catch (error) {
    console.error('Failed to load state:', error);
    return undefined;
  }
};

// ✅ Good: Handle errors gracefully
export const saveState = (state: AppState): void => {
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem('appState', serialized);
  } catch (error) {
    // QuotaExceededError or other failures
    console.error('Failed to save state:', error);
    // Could notify user or clear old data
  }
};
```

### What NOT to Store

- ❌ API keys or tokens
- ❌ Passwords or credentials
- ❌ Personal Identifiable Information (PII)
- ❌ Payment information
- ❌ Sensitive business data

### What IS Safe to Store

- ✅ User preferences (theme, language)
- ✅ Non-sensitive form data
- ✅ UI state (collapsed panels, etc.)
- ✅ Cached non-sensitive data

## Dependency Management

### Supply Chain Security

Our dependency security strategy:

1. **Minimal dependencies**: Only include necessary packages
2. **Lock files**: `package-lock.json` committed to version control
3. **Automated scanning**: Dependabot checks for vulnerabilities
4. **CI enforcement**: npm audit fails CI on high-severity issues
5. **Regular updates**: Review and update dependencies monthly

### Dependency Hygiene

```bash
# Audit dependencies
npm audit

# Fix automatically (if safe)
npm audit fix

# Check for outdated packages
npm outdated

# Update dependencies
npm update
```

### CI Integration

```yaml
# .github/workflows/ci.yml
- name: Security Audit
  run: npm audit --audit-level=high
```

### Evaluating New Dependencies

Before adding a new dependency:

1. ✅ Check npm weekly downloads
2. ✅ Review GitHub stars and activity
3. ✅ Check for known vulnerabilities
4. ✅ Review source code for suspicious patterns
5. ✅ Prefer well-maintained libraries
6. ✅ Consider bundle size impact

## TypeScript Security

### Strict Configuration

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Security Benefits

- **Type safety**: Prevents type confusion vulnerabilities
- **Null safety**: Eliminates null/undefined errors
- **No `any`**: Forces explicit typing
- **Dead code detection**: Identifies unused variables

### Type Assertions Safety

```typescript
// ❌ Dangerous: Bypasses type checking
const data = JSON.parse(input) as UserData;

// ✅ Safe: Runtime validation
const parsed = JSON.parse(input);
const result = userDataSchema.safeParse(parsed);
if (result.success) {
  const data: UserData = result.data;
}
```

## Testing for Security

### Security Test Categories

1. **Input Validation Tests**: Test all validation schemas
2. **XSS Prevention Tests**: Verify escaping behavior
3. **Error Handling Tests**: Ensure graceful degradation
4. **State Security Tests**: Validate state mutations
5. **E2E Security Tests**: Full workflow validation

### Example Security Tests

```typescript
// Input validation test
describe('Email Validation', () => {
  it('should reject XSS attempts', () => {
    const result = emailSchema.safeParse('<script>alert("xss")</script>');
    expect(result.success).toBe(false);
  });
  
  it('should reject SQL injection patterns', () => {
    const result = emailSchema.safeParse("admin'--@example.com");
    expect(result.success).toBe(false);
  });
});

// Storage security test
describe('State Persistence', () => {
  it('should handle corrupted localStorage gracefully', () => {
    localStorage.setItem('appState', 'invalid json');
    const state = loadState();
    expect(state).toBeUndefined();
  });
});
```

## Logging and Observability

### Structured Logging

We implement structured logging for security observability:

```typescript
// src/utils/logger.ts
export const logger = {
  info: (event: string, data?: Record<string, unknown>) => {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      event,
      ...data,
    }));
  },
  
  error: (event: string, error: Error, data?: Record<string, unknown>) => {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      event,
      error: error.message,
      stack: error.stack,
      ...data,
    }));
  },
};
```

### What to Log

- ✅ User actions (save, export, delete)
- ✅ Validation failures (for monitoring)
- ✅ Error conditions
- ✅ State changes (high-level)

### What NOT to Log

- ❌ Sensitive user data
- ❌ Complete state objects (may contain PII)
- ❌ Credentials (don't exist in this app)
- ❌ Raw user inputs (log validation results instead)

## Production Deployment Security

### Build Process

```bash
# Production build
npm run build

# Verify build output
ls -la dist/

# Check for secrets in build
grep -r "password\|secret\|key" dist/ || echo "No secrets found"
```

### Deployment Checklist

- [ ] HTTPS enabled
- [ ] CSP headers configured
- [ ] HSTS enabled
- [ ] Subresource Integrity (SRI) for CDN resources
- [ ] X-Content-Type-Options: nosniff
- [ ] X-Frame-Options: DENY or SAMEORIGIN
- [ ] Referrer-Policy configured
- [ ] Remove source maps (or protect them)
- [ ] Disable React DevTools in production
- [ ] Configure error reporting (e.g., Sentry)
- [ ] Set up log aggregation

### Example Security Headers

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none';
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

## Incident Response

### Detection

Monitor for:
- Unusual error rates
- Validation failure spikes
- localStorage corruption patterns
- Unexpected state transitions

### Response Steps

1. **Identify**: Determine scope and impact
2. **Contain**: Remove vulnerable code if identified
3. **Eradicate**: Deploy fix
4. **Recover**: Verify fix in production
5. **Lessons Learned**: Update threat model and tests

### Security Contact

See [SECURITY.md](../SECURITY.md) for vulnerability reporting.

## Security Maintenance

### Regular Tasks

**Weekly**:
- Review Dependabot alerts
- Monitor CI security checks

**Monthly**:
- Run `npm audit` locally
- Review and update dependencies
- Check for new security advisories

**Quarterly**:
- Review and update threat model
- Security testing sprint
- Dependency cleanup

**Annually**:
- Major dependency upgrades
- Security architecture review
- Penetration testing (if applicable)

## Additional Resources

### OWASP Resources
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/)

### React Security
- [React Security Best Practices](https://react.dev/learn/security)
- [Avoiding XSS in React](https://react.dev/reference/react-dom/components/common#dangerously-setting-the-inner-html)

### TypeScript Security
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

### Tools
- [npm audit](https://docs.npmjs.com/cli/v10/commands/npm-audit)
- [Dependabot](https://github.com/dependabot)
- [Snyk](https://snyk.io/)

## Conclusion

Security is not a feature, it's a process. This reference implementation demonstrates:

- **Defense in depth**: Multiple layers of protection
- **Secure by design**: Security considered from the start
- **Fail securely**: Graceful handling of errors
- **Principle of least privilege**: Minimal permissions and access
- **Open security**: Transparent about limitations and scope

Remember: This is a frontend-only application. Many security concerns (authentication, authorization, data privacy) require backend systems and are out of scope for this reference implementation.
