# Contributing to Secure Frontend Console

Thank you for your interest in contributing to this project. This reference implementation demonstrates production-grade security practices for frontend applications.

## Code of Conduct

Be professional, respectful, and constructive in all interactions.

## How to Contribute

### Reporting Issues

**Security Issues**: See [SECURITY.md](./SECURITY.md) for responsible disclosure.

**Other Issues**: Open a GitHub issue with:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node version, browser)

### Suggesting Enhancements

Open a GitHub issue with:
- Use case or problem being solved
- Proposed solution
- Alternatives considered
- Breaking changes (if any)

### Pull Requests

1. **Fork the repository** and create a feature branch
2. **Follow the code style**: This project uses Prettier and ESLint
3. **Write tests**: All new features must include tests
4. **Update documentation**: Update README.md and relevant docs
5. **Sign commits**: Use `git commit -s` for Developer Certificate of Origin
6. **Keep PRs focused**: One feature or fix per PR

## Development Setup

### Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher

### Getting Started

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/secure-frontend-console.git
cd secure-frontend-console

# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Run linting
npm run lint

# Run type checking
npm run typecheck
```

### Project Structure

```
src/
├── app/          # Redux store, router, hooks
├── components/   # Reusable UI components
├── features/     # Domain-specific features
├── domain/       # Pure business logic
├── utils/        # Helper utilities
├── pages/        # Page components
└── test/         # Test configuration
```

## Coding Standards

### TypeScript

- Use strict TypeScript configuration
- Avoid `any` types
- Prefer explicit return types for public functions
- Use meaningful variable names

### React

- Functional components with hooks
- Props should be typed interfaces
- Use React.memo for performance optimization when needed
- Keep components focused and single-purpose

### State Management

- Redux Toolkit for global state
- Local state with useState for component-specific state
- Derived state using selectors

### Validation

- All user inputs must use Zod schemas
- Validation logic in `src/domain/`
- Error messages should be user-friendly

### Testing

- Unit tests for all validation logic
- Component tests for user interactions
- E2E tests for critical workflows
- Aim for >80% code coverage

### Security

- No `dangerouslySetInnerHTML` without explicit justification
- No `eval()` or `Function()` constructors
- All external data must be validated
- Run `npm audit` before submitting PRs

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(validation): add email validation schema
fix(export): correct CSV escaping for special characters
docs(threat-model): update XSS mitigation section
test(calculator): add edge case tests for negative inputs
```

## Testing Guidelines

### Unit Tests

```typescript
describe('validateUserInput', () => {
  it('should reject invalid email format', () => {
    const result = userSchema.safeParse({ email: 'invalid' });
    expect(result.success).toBe(false);
  });
});
```

### Component Tests

```typescript
describe('Modal', () => {
  it('should close when clicking outside', async () => {
    const onClose = vi.fn();
    render(<Modal isOpen onClose={onClose} />);
    
    await userEvent.click(screen.getByTestId('modal-backdrop'));
    expect(onClose).toHaveBeenCalled();
  });
});
```

### E2E Tests

```typescript
test('complete user workflow', async ({ page }) => {
  await page.goto('/');
  await page.fill('[name="email"]', 'user@example.com');
  await page.click('button[type="submit"]');
  await expect(page.locator('.success-message')).toBeVisible();
});
```

## Documentation

### Code Comments

- Comment "why", not "what"
- Document non-obvious security decisions
- Include links to relevant standards or documentation

### README Updates

- Keep architecture diagram current
- Update security decisions section
- Document new environment variables

### Threat Model

- Update when adding new features
- Document new attack vectors
- Explain mitigation strategies

## Review Process

### What We Look For

- **Security**: No new vulnerabilities introduced
- **Tests**: Adequate test coverage
- **Documentation**: Clear and updated
- **Code Quality**: Follows project standards
- **Performance**: No unnecessary re-renders or computations

### CI Checks

All PRs must pass:
- ✅ TypeScript type checking
- ✅ ESLint with no errors
- ✅ Prettier formatting
- ✅ All unit tests
- ✅ E2E tests
- ✅ npm audit (high severity only)

### Approval

- At least one maintainer approval required
- All CI checks must pass
- No unresolved comments

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

Open a GitHub Discussion or Issue for:
- Architecture questions
- Security clarifications
- Feature proposals
- Best practice discussions

## Recognition

Contributors will be recognized in the README and release notes.

Thank you for helping make frontend development more secure!
