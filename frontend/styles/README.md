# Styles

Global styles and theme configuration for SimuLab UI.

## Structure

```
styles/
├── globals.css        # Global styles and resets
├── variables.css      # CSS custom properties (theme colors, spacing, etc.)
├── themes/            # Theme configuration
│   ├── light.css      # Light theme
│   └── dark.css       # Dark theme (future)
└── tailwind/          # Tailwind CSS customization
    └── config.ts      # Tailwind config (in tailwind.config.ts at root)
```

## Styling Approach

**Primary**: Tailwind CSS utility classes
- Use Tailwind for component styling
- Define custom utilities in `tailwind.config.ts` as needed
- Avoid component-specific CSS files when possible

**Secondary**: CSS Modules (when needed)
- For complex component-specific styles
- Named `ComponentName.module.css`
- Located next to component file

**Theme**: CSS Custom Properties
- Define in `styles/variables.css`
- Use Tailwind `theme` config for consistency
- Colors, spacing, fonts, etc.

## Global Styles

`globals.css` includes:
- CSS resets and normalizations
- Root-level styling
- Default typography
- Layout utilities

## Customization

Edit `tailwind.config.ts` to customize:
- Color palette
- Typography (fonts, sizes)
- Spacing scale
- Breakpoints
- Plugins

## Best Practices

- Use Tailwind utilities over custom CSS
- Keep utility classes in components clean
- Extract repeated patterns as Tailwind components
- Use CSS variables for theme values
