---
name: Kinetic Obsidian
colors:
  surface: '#121414'
  surface-dim: '#121414'
  surface-bright: '#383939'
  surface-container-lowest: '#0d0e0f'
  surface-container-low: '#1b1c1c'
  surface-container: '#1f2020'
  surface-container-high: '#292a2a'
  surface-container-highest: '#343535'
  on-surface: '#e3e2e2'
  on-surface-variant: '#d9c3ad'
  inverse-surface: '#e3e2e2'
  inverse-on-surface: '#303031'
  outline: '#a18d7a'
  outline-variant: '#534434'
  surface-tint: '#ffb964'
  primary: '#ffc98e'
  on-primary: '#482a00'
  primary-container: '#ffa31a'
  on-primary-container: '#683f00'
  inverse-primary: '#875300'
  secondary: '#c8c6c5'
  on-secondary: '#313030'
  secondary-container: '#474746'
  on-secondary-container: '#b7b5b4'
  tertiary: '#d5d3d2'
  on-tertiary: '#303030'
  tertiary-container: '#b9b7b7'
  on-tertiary-container: '#494848'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffddba'
  primary-fixed-dim: '#ffb964'
  on-primary-fixed: '#2b1700'
  on-primary-fixed-variant: '#663e00'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1b1b1b'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#e4e2e1'
  tertiary-fixed-dim: '#c8c6c5'
  on-tertiary-fixed: '#1b1c1c'
  on-tertiary-fixed-variant: '#474746'
  background: '#121414'
  on-background: '#e3e2e2'
  surface-variant: '#343535'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: '0'
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: '0'
  body-sm:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: '0'
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style

This design system establishes a high-performance "Student Operating System" aesthetic. The brand personality is authoritative, technical, and focused, catering to students who view their academic life as a mission-critical operation. 

The visual style is a fusion of **Modern Minimalism** and **Technical Futurism**. It utilizes a "Void" philosophy—using pure black (#000000) as a canvas to eliminate peripheral distraction and allow the high-contrast Primary Orange and crisp white typography to command immediate attention. The interface avoids soft aesthetics like gradients or glassmorphism in favor of structural clarity, sharp execution, and a strict color ratio (75/15/10) that ensures the UI feels like a precision tool rather than a generic app.

## Colors

The color palette is strictly functional. The **Primary Orange (#FFA31A)** is used exclusively for interactive elements, primary calls to action, and critical status indicators. 

- **The Void:** Use pure `#000000` for the main application background to maximize OLED contrast and reduce eye strain during late-night study sessions.
- **Layering:** Use `#1B1B1B` for structural sidebars or secondary regions, and `#292929` for floating cards or interactive surfaces.
- **Hierarchy:** Primary text is always pure white for maximum legibility. Use `#A3A3A3` for secondary information to create a clear visual "step down" in importance.
- **Borders:** Use `#333333` for structural divisions. Borders should be thin (1px) and crisp.

## Typography

The typography system relies on **Geist** for its precision and neutral, technical character. It provides a highly legible, modern feel that suits the "Operating System" metaphor.

For technical data, timestamps, grades, and metadata, **JetBrains Mono** is used to inject a "coder" aesthetic, reinforcing the feeling of a powerful, organized tool. 

- **Tracking:** Headlines use a slight negative letter spacing to feel tighter and more impactful.
- **Alignment:** Stick to rigid grid alignments; avoid excessive centering. Text should feel anchored to the layout.

## Layout & Spacing

The layout follows a **Fluid Grid** model with strict 4px / 8px increments. 

- **Desktop:** A 12-column system with 24px gutters. Use large outer margins (40px) to give the "Void" background space to breathe.
- **Tablet:** 8-column system with 16px gutters.
- **Mobile:** 4-column system with 16px margins. 
- **Rhythm:** Vertical rhythm is crucial. Modules (like a calendar widget and a task list) should be separated by consistent `2xl` (48px) spacing, while elements within a card use `md` (16px) or `sm` (8px) spacing.

## Elevation & Depth

This design system rejects traditional shadows and blurs. Depth is communicated strictly through **Tonal Layers** and **Subtle Outlines**.

1. **Level 0 (Floor):** Pure Black `#000000`. This is the base for the entire OS.
2. **Level 1 (Structural):** Secondary Gray `#1B1B1B`. Used for sidebars, top navigation bars, and footer areas. No borders needed when adjacent to Level 0.
3. **Level 2 (Cards/Modules):** Elevated Surface `#292929`. All content cards live here.
4. **Outlines:** Use a 1px border of `#333333` on all Level 2 elements to define their edges against the Level 1 surfaces. 

**Interactive Elevation:** On hover, a card should not rise or cast a shadow. Instead, its border color should change from `#333333` to `#808080`, or its background color should subtly shift.

## Shapes

The shape language is **"Modern Geometric."** We use a medium border radius (`roundedness: 2`) to prevent the UI from feeling too aggressive or "Brutalist," while maintaining enough structure to feel like a professional tool.

- **Standard Elements:** Buttons, Input fields, and small Chips use 0.5rem (8px).
- **Containers:** Large cards and main content areas use 1rem (16px).
- **Strictness:** Do not use full-round "pill" shapes for buttons; keep them consistently 8px to maintain the technical, structured aesthetic.

## Components

### Buttons
- **Primary:** Background `#FFA31A`, Text `#000000`, Semi-bold. Hover: `#FFB347`.
- **Secondary:** Background `#292929`, Border 1px `#333333`, Text `#FFFFFF`.
- **Ghost:** No background, Text `#FFA31A`. Used for low-priority actions within a container.

### Input Fields
- **Default:** Background `#1B1B1B`, Border 1px `#333333`, Text `#FFFFFF`. 
- **Focus:** Border color shifts to `#FFA31A`. No "glow" or outer shadow.
- **Label:** Use `label-sm` (JetBrains Mono) in `#808080` positioned above the field.

### Cards
- Always use `#292929` background.
- 1px border of `#333333`.
- Internal padding: `24px` (lg).

### Chips / Tags
- Small, compact containers.
- Background `#1B1B1B`, Border 1px `#333333`, Text `#A3A3A3` using `label-sm`.
- Status indicators (Success/Error) use a small 8px solid circle next to the label.

### Lists
- Use horizontal separators of 1px `#333333`.
- Item background should transition to `#1B1B1B` on hover to indicate interactivity.

### Progress Bars
- Track: `#1B1B1B`.
- Fill: `#FFA31A`.
- Height: 4px or 8px depending on context. No rounded ends (keep them square or 2px radius).