# trendradar Branding Guide

## Overview

This guide ensures consistent brand application across all pages and components in the trendradar application.

## Quick Reference

### Brand Name
- **trendradar** (always lowercase)
- Use `gradient-text` class for brand name display
- Font: Orbitron, weight: 800-900

### Official Slogans

1. **Primary**: "Detecting the pulse of music trends"
   - Use for: Hero sections, main marketing
   - Class: `text-h5 font-heading text-primary-300 border-l-4 border-primary pl-20`

2. **Technical**: "Real-time music trend intelligence"
   - Use for: Developer docs, API pages, dashboard
   - Class: `text-h5 font-heading text-secondary`

3. **Product**: "Data-driven music discovery"
   - Use for: Feature pages, submit forms
   - Class: `text-h5 font-heading text-accent`

4. **Visionary**: "The future of music analytics"
   - Use for: Blog, press materials
   - Class: `text-h5 font-heading text-primary-300`

5. **Community**: "By developers, for developers"
   - Use for: Community pages, GitHub
   - Class: `text-h5 font-heading text-success`

## Logo Usage

### Horizontal Layout (Headers, Navigation)
```tsx
<div class="flex items-center gap-16">
  <div class="w-48 h-48 rounded-xl bg-gradient-logo flex items-center justify-center shadow-glow">
    <IconRadar class="size-28 text-background-dark" />
  </div>
  <span class="font-heading font-black text-h5 gradient-text lowercase">
    {SITE_NAME}
  </span>
</div>
```

### Icon Only (Small spaces)
```tsx
<div class="w-64 h-64 rounded-xl bg-gradient-logo flex items-center justify-center shadow-glow">
  <IconRadar class="size-32 text-background-dark" />
</div>
```

## Page Templates

### 1. Hero Page (Landing, Welcome)
```tsx
<main class="flex-1 p-16 lg:p-24">
  {/* Brand Header */}
  <div class="max-w-4xl mb-48">
    <div class="flex items-center gap-16 mb-24">
      {/* Logo Icon */}
      <div class="w-72 h-72 rounded-2xl bg-gradient-logo flex items-center justify-center shadow-glow">
        <IconRadar class="size-40 text-background-dark" />
      </div>
      <div>
        <h1 class="font-heading font-black text-h1 gradient-text lowercase">
          {SITE_NAME}
        </h1>
        <p class="text-foreground-muted text-body-lg">
          {SITE_DESCRIPTION}
        </p>
      </div>
    </div>
    
    {/* Primary Slogan */}
    <p class="text-h5 font-heading text-primary-300 border-l-4 border-primary pl-20">
      "Detecting the pulse of music trends"
    </p>
  </div>
  
  {/* Content */}
</main>
```

### 2. Page with Header (Pricing, Submit)
```tsx
<main class="mx-auto max-w-container px-16 lg:px-24 py-32">
  <div class="text-center mb-48">
    <h1 class="font-heading font-black text-h2 gradient-text mb-16">
      Page Title
    </h1>
    <p class="text-foreground-muted text-body-lg max-w-lg mx-auto">
      Page description
    </p>
    <p class="text-h5 font-heading text-primary-300 mt-16">
      "Context-appropriate slogan"
    </p>
  </div>
  
  {/* Content */}
</main>
```

### 3. Dashboard/Admin Page
```tsx
<main class="flex-1 p-16 lg:p-24">
  {/* Brand Header */}
  <div class="flex items-center gap-16 mb-24">
    <div class="w-48 h-48 rounded-lg bg-gradient-logo flex items-center justify-center shadow-glow">
      <IconRadar class="size-24 text-background-dark" />
    </div>
    <div>
      <h1 class="font-heading font-black text-h2 gradient-text">
        Dashboard
      </h1>
      <p class="text-h5 font-heading text-primary-300 mt-8">
        "Real-time music trend intelligence"
      </p>
    </div>
  </div>
  
  {/* Content */}
</main>
```

### 4. Error Pages (404, 500)
```tsx
<main class="flex-1 p-16 lg:p-24 flex flex-col justify-center items-center min-h-[60vh]">
  <div class="card card-elevated max-w-lg w-full py-48 px-32">
    {/* Brand Logo */}
    <div class="flex justify-center mb-24">
      <div class="w-80 h-80 rounded-2xl bg-gradient-logo flex items-center justify-center shadow-glow">
        <IconRadar class="size-40 text-background-dark" />
      </div>
    </div>
    
    <h1 class="font-heading font-black text-h1 gradient-text mb-16">
      404
    </h1>
    <h2 class="font-heading font-bold text-h3 text-foreground mb-24">
      Signal Lost
    </h2>
    <p class="text-foreground-muted text-body mb-32">
      We couldn't detect that trend.
    </p>
    
    {/* Always include slogan on error pages */}
    <p class="text-h5 font-heading text-primary-300 mb-32">
      "Detecting the pulse of music trends"
    </p>
    
    <a href="/" class="btn-primary">
      Return to {SITE_NAME}
    </a>
  </div>
</main>
```

## Component Patterns

### Cards
```tsx
// Standard card
<div class="card p-32">
  {/* Content */}
</div>

// Elevated card (with hover effect)
<div class="card card-elevated p-32">
  {/* Content */}
</div>

// Premium/Featured card
<div class="card border-2 border-primary glow-primary p-32">
  {/* Content */}
</div>
```

### Buttons
```tsx
// Primary CTA
<button class="btn-primary">
  Action
</button>

// Secondary
<button class="btn-secondary">
  Secondary Action
</button>

// Ghost (low emphasis)
<button class="btn-ghost">
  Cancel
</button>
```

### Feature Icons
```tsx
<div class="w-48 h-48 rounded-full bg-primary/10 flex items-center justify-center">
  <Icon class="size-24 text-primary" />
</div>
```

## Spacing Standards

- **Page padding**: `p-16 lg:p-24`
- **Section margins**: `mb-48`
- **Card padding**: `p-32`
- **Element gaps**: `gap-16` or `gap-24`
- **Container max-width**: `max-w-container` (1280px)

## Typography Hierarchy

1. **H1**: `font-heading font-black text-h1 gradient-text`
   - Main page titles only

2. **H2**: `font-heading font-black text-h2 gradient-text`
   - Section headings, page titles

3. **H3**: `font-heading font-bold text-h3 text-foreground`
   - Subsections, card titles

4. **H4**: `font-heading font-bold text-h4 text-foreground`
   - Card headers, smaller titles

5. **Body Large**: `text-body-lg text-foreground-muted`
   - Lead paragraphs, descriptions

6. **Body**: `text-body text-foreground-muted`
   - Standard text

## Brand Voice

### Do:
- Use active, confident language
- Be technical but approachable
- Focus on innovation and intelligence
- Include data-driven messaging

### Don't:
- Use passive voice
- Be overly casual or playful
- Use music puns or clichés
- Sound generic or corporate

## Checklist for New Pages

- [ ] Import brand utilities: `import { SITE_NAME, SITE_TAGLINE } from "@/utils/constants.ts";`
- [ ] Import brand icons: `import IconRadar from "@preact-icons/tb/TbRadar";`
- [ ] Add brand logo/header at top of page
- [ ] Use appropriate gradient text for brand name
- [ ] Include context-appropriate slogan
- [ ] Apply consistent padding (`p-16 lg:p-24`)
- [ ] Use `max-w-container` for content width
- [ ] Apply brand colors to charts/data viz
- [ ] Include proper meta tags with Head component
- [ ] Test responsive layout

## Color Reference

```css
/* Primary Brand */
--color-primary: #8B5CF6;      /* Electric Purple */
--color-secondary: #06B6D4;     /* Neon Cyan */
--color-accent: #EC4899;        /* Accent Pink */

/* Backgrounds */
--color-bg: #0F172A;           /* Dark Background */
--color-bg-darker: #050508;     /* Darker Background */
--color-bg-card: rgba(15, 23, 42, 0.6);  /* Card Background */

/* Text */
--color-text: #F8FAFC;         /* Soft White */
--color-text-muted: #94A3B8;    /* Muted Gray */

/* Gradients */
--gradient-primary: linear-gradient(135deg, #8B5CF6 0%, #06B6D4 50%, #EC4899 100%);
--gradient-logo: linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%);
```

## Common Imports

```tsx
// Essential brand imports for every page
import { SITE_NAME, SITE_DESCRIPTION, SITE_TAGLINE } from "@/utils/constants.ts";
import IconRadar from "@preact-icons/tb/TbRadar";
import Head from "@/components/Head.tsx";
```

## Testing Brand Consistency

1. Check all pages have consistent header structure
2. Verify brand name uses `gradient-text` class
3. Confirm appropriate slogan is used for context
4. Test responsive design at all breakpoints
5. Verify color contrast meets WCAG standards
6. Check all buttons use brand classes
7. Ensure cards have consistent styling
