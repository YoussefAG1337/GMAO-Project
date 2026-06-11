# 🎨 UI/UX Design System & Reference Folder

This directory contains visual designs, mockups, screenshots, style guides, and assets to train and guide UI/UX agents (`frontend-developer` and Antigravity) in producing modern, non-AI-generic user interfaces.

## 📂 Folder Structure
- `/mockups` - Place screenshot files (`.png`, `.jpg`) of target pages, components, dashboards, and mobile layouts here.
- `/assets` - Icons, logos, and custom vectors/illustrations.
- `/styleguides` - Specific style instructions, color palettes, and typography specifications.

## 📏 Styling Directives
Before implementing new interfaces, agents must query this directory for design patterns to ensure they align with the expected non-generic theme:
1. **Interactive Elements**: Use scale transitions on buttons/cards (e.g. `hover:-translate-y-0.5 transition-all`).
2. **Glassmorphism**: Combine subtle borders with backdrop blur effects.
3. **Data Displays**: Ensure tables are responsive, headers have elegant dividing lines, and pagination feels premium.
4. **Theme Adaptability**: Every design reference must be evaluated for both Light and Dark mode behavior.
