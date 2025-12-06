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

2. Styling & Theme Integration

All components and layouts must fully adhere to the current theme system.

Always use existing theme tokens (colors, spacing, fonts, radii, shadows, etc.) before creating new ones.

When adding new theme values:

Only do so when no existing value fits.

Maintain naming conventions and store them in the central theme configuration (`tailwind.config.cjs` and `src/app.css`).

Ensure the visual and structural consistency of all newly created or updated components.

3. Business Logic Separation

UI components must remain focused on presentation. They should not contain heavy logic, data transformations, or API operations.

Place all business logic inside `src/lib/` or appropriate subfolders such as:

`src/lib/utils/`

`src/lib/api/`

`src/lib/validators/`

Components should consume functions from `src/lib` rather than implementing logic internally.

Keep functions modular, reusable, typed, and minimal.

When dealing with forms use `valibot` package.

4. Localization Requirements

No user-facing text should be hard-coded. All strings must come from localization files.

The project must support at least two locales:

English (UK) – file: en-GB.json

Polish – file: pl-PL.json

Store all localization files inside the `src/lang/` folder.

Organize translations into domain-specific files (e.g., auth.json, dashboard.json, common.json).

Every new translation key must be added to both locales.

All components must use the localization function (e.g., t('auth.loginButton')).

The system must default to English (UK) if a translation key is missing.

5. General Coding Conduct
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