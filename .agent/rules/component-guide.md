---
trigger: always_on
---

1. Component Usage & Modification

Before creating a new component, always review existing components in `src/components/ui/` to determine if one can be reused, extended, or adapted.

When extending an existing component:

Prefer adding optional props, variants, or slots instead of altering default behavior.

When modifying an existing component:

Search and analyze all usages of that component across the project.

Ensure changes remain backward compatible or update dependent files accordingly.

Document the reason why modification was necessary and why alternatives were insufficient.

Do not create duplicate components when a similar one already exists.


2. General Coding Conduct
Code Quality

Follow existing project linting and formatting rules (ESLint, Prettier, etc.).

Write clear, self-documenting code.

Use comments only where essential for complex logic.

Prefer TypeScript types and interfaces for clarity and safety.

File & Folder Structure

Respect the existing project architecture.

Do not create new directories without a clear structural justification.

Place new features, utilities, or modules in the correct domain folder.

Testing

Add or update tests for every new function in src/lib/.

Ensure that modified components remain fully testable.