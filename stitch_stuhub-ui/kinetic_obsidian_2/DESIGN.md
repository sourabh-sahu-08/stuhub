---
name: Kinetic Obsidian
colors:
  surface: '#121414'
  surface-dim: '#121414'
  surface-bright: '#38393a'
  surface-container-lowest: '#0c0f0f'
  surface-container-low: '#1a1c1c'
  surface-container: '#1e2020'
  surface-container-high: '#282a2b'
  surface-container-highest: '#333535'
  on-surface: '#e2e2e2'
  on-surface-variant: '#d7c3ae'
  inverse-surface: '#e2e2e2'
  inverse-on-surface: '#2f3131'
  outline: '#9f8e7a'
  outline-variant: '#524434'
  surface-tint: '#ffb957'
  primary: '#ffc77f'
  on-primary: '#462b00'
  primary-container: '#f5a524'
  on-primary-container: '#643f00'
  inverse-primary: '#835400'
  secondary: '#c6c6cf'
  on-secondary: '#2f3037'
  secondary-container: '#45464e'
  on-secondary-container: '#b4b4bd'
  tertiary: '#9ad9ff'
  on-tertiary: '#003549'
  tertiary-container: '#36c2ff'
  on-tertiary-container: '#004d69'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffddb5'
  primary-fixed-dim: '#ffb957'
  on-primary-fixed: '#2a1800'
  on-primary-fixed-variant: '#643f00'
  secondary-fixed: '#e2e1eb'
  secondary-fixed-dim: '#c6c6cf'
  on-secondary-fixed: '#1a1b22'
  on-secondary-fixed-variant: '#45464e'
  tertiary-fixed: '#c4e7ff'
  tertiary-fixed-dim: '#7bd0ff'
  on-tertiary-fixed: '#001e2c'
  on-tertiary-fixed-variant: '#004c69'
  background: '#121414'
  on-background: '#e2e2e2'
  surface-variant: '#333535'
typography:
  headline-xl:
    fontFamily: Geist
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Geist
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.03em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  headline-xl-mobile:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 32px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  sidebar_width: 280px
  container_max_width: 1280px
  gutter: 24px
  margin_mobile: 16px
  margin_desktop: 40px
  stack_sm: 8px
  stack_md: 16px
  stack_lg: 32px
---

## Brand & Style

The design system embodies a high-performance, precision-oriented aesthetic tailored for technical environments and scholarly productivity. It targets a demographic that values focus, speed, and visual clarity. The emotional response should be one of "calm authority"—a quiet, dark environment where content and data are the primary focus.

The visual style is a blend of **Minimalism** and **Technical Sophistication**. It moves away from traditional depth markers like heavy shadows in favor of structural integrity through precise borders and monochromatic layering. The palette is intentionally somber to reduce eye strain during long sessions, using a singular high-energy accent to denote action and presence.

## Colors

This design system utilizes a "Deep-Space" dark mode hierarchy. 

- **Backgrounds:** The interface uses `#09090B` for the main workspace to maximize contrast with text. The sidebar at `#0F0F12` provides a slight visual separation without requiring a border.
- **Surfaces:** Use `#16161A` for standard containers and `#1C1C21` for elements that require higher visual prominence or interaction (e.g., hover states on list items).
- **Accents:** The primary amber (`#F5A524`) is reserved for critical actions, active states, and focus indicators. Its subtle counterpart (`#2A2112`) is used for large-area highlights behind text or icons to maintain legibility.
- **Feedback:** Semantic colors (Success, Warning, Danger, Info) are slightly desaturated to prevent them from vibrating against the dark background while remaining clearly identifiable.

## Typography

Geist is the exclusive typeface for this design system, chosen for its technical precision and exceptional legibility in dark environments. 

- **Hierarchy:** Headlines use tighter letter-spacing and heavier weights to create a commanding presence. 
- **Casing:** Avoid all-caps for body and primary headings. Reserve uppercase exclusively for small labels (`label-sm`) or section headers in the sidebar to create a distinct metadata layer.
- **Contrast:** Always use `text_primary` for headlines and `text_secondary` for long-form body text to reduce visual vibration.

## Layout & Spacing

The system uses a **Fixed Grid** approach for content areas, centered within the viewport, while the navigation remains anchored.

- **Sidebar:** A wide 280px sidebar provides ample breathing room for navigation labels. Items are grouped logically with 24px of vertical spacing between sections.
- **Content Flow:** Favor open vertical stacks. Use 32px (`stack_lg`) between major sections and 16px (`stack_md`) between related elements.
- **Grid:** A 12-column grid is used for desktop (breakpoints at 768px and 1200px). On mobile, the layout collapses to a single column with 16px side margins.
- **Padding:** Internal container padding should be generous (typically 24px) to maintain the premium, uncrowded feel.

## Elevation & Depth

This design system rejects traditional drop shadows in favor of **Tonal Layering** and **Structural Outlines**.

- **Borders:** Use a 1px solid border (`#27272D`) to define boundaries between surfaces and the background.
- **Stacking:** Depth is indicated by color brightness. The "closer" an object is to the user, the lighter its hex value (e.g., Background `#09090B` -> Surface `#16161A` -> Popover/Elevated `#1C1C21`).
- **Active States:** Instead of a full-block background change, active navigation items or selected states are indicated by a 2px vertical "Kinetic Line" in Primary Amber (`#F5A524`) placed on the leading edge of the element.

## Shapes

The shape language is "Soft-Technical." We use a subtle 0.25rem (`rounded-sm`) radius for standard components like inputs and small buttons to maintain a precise, engineered appearance. Larger containers or cards, when used, may scale up to 0.5rem (`rounded-lg`) to soften the overall composition.

## Components

### Buttons
- **Primary:** Solid `#F5A524` with black text. No shadow.
- **Secondary:** Outline `#27272D` with `#FAFAFA` text. On hover, background shifts to `#16161A`.
- **Ghost:** Transparent background, `#A1A1AA` text. Hover shifts to `#FAFAFA` text.

### Sidebar Navigation
- **Grouping:** 
    - **STUDY:** Home, Attendance, Notes, PYQs, AI Analyzer
    - **CAMPUS:** Events, Announcements
    - **PERSONAL:** Saved, Profile, Settings
- **Active State:** Text changes to `#FAFAFA`, and a 2px wide vertical amber line appears at the far left edge of the sidebar item. No background fill.
- **Inactivity:** Text uses `#71717A`.

### Cards & Rows
- **Avoid Boxes:** Minimize the use of enclosed cards. Instead, use horizontal dividers (`#27272D`) and open-sided rows. 
- **Grouping:** Group related data in rows with a shared `#16161A` background and subtle rounded corners only at the top and bottom of the group.

### Input Fields
- **Style:** Background `#0F0F12`, border `#27272D`. 
- **Focus:** Border changes to `#F5A524` with no outer glow/halo.

### Chips
- **Status:** Small, uppercase labels with a subtle background (`accent_subtle_bg`) and no border. Text color matches the semantic status (e.g., Success green).