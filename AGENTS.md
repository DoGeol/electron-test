# Codex Project Instructions

## Design guide

Before making UI, UX, styling, layout, or frontend component changes, read and follow:

- `docs/DESIGN.md`

Keep implementations aligned with the Octo Code dark-mode-first visual system unless the user explicitly asks for a different direction.

## UI component rule

For renderer UI, prefer composing screens with shadcn-style UI primitives (for example `Button`, `Input`, `Textarea`, `Label`) and adapt them to the `docs/DESIGN.md` token system.

## Language rule

All menu labels, field labels, button text, helper text, and in-app descriptions must use Korean as the default language.
If a technical term is needed, keep Korean first and optionally add English in parentheses.

## Frontend skills

When working on React or Next.js UI, layout, styling, or component implementation, consult the relevant project skills before designing or coding the change:

- React and Next.js performance patterns: `.agents/skills/vercel-react-best-practices/SKILL.md`
- React component architecture and composition patterns: `.agents/skills/vercel-composition-patterns/SKILL.md`
- Next.js file conventions, RSC boundaries, routing, metadata, image/font optimization, and data patterns: `.agents/skills/next-best-practices/SKILL.md`

Use these skills together with `docs/DESIGN.md` when generating design, layout, or frontend component code.
