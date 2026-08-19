---
name: ThinkQuest Neomorphic
colors:
  surface: '#fdf7ff'
  surface-dim: '#ded4ff'
  surface-bright: '#fdf7ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f7f1ff'
  surface-container: '#f2ebff'
  surface-container-high: '#ece4ff'
  surface-container-highest: '#e7deff'
  on-surface: '#1d0e4e'
  on-surface-variant: '#494454'
  inverse-surface: '#332664'
  inverse-on-surface: '#f5eeff'
  outline: '#7b7486'
  outline-variant: '#cbc3d7'
  surface-tint: '#6d3bd7'
  primary: '#5517be'
  on-primary: '#ffffff'
  primary-container: '#6d3bd7'
  on-primary-container: '#e0d2ff'
  inverse-primary: '#d0bcff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#7afac0'
  on-secondary-container: '#00734e'
  tertiary: '#653e00'
  on-tertiary: '#ffffff'
  tertiary-container: '#855400'
  on-tertiary-container: '#ffd19c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e9ddff'
  primary-fixed-dim: '#d0bcff'
  on-primary-fixed: '#23005c'
  on-primary-fixed-variant: '#5417be'
  secondary-fixed: '#7afac0'
  secondary-fixed-dim: '#5cdda5'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb7'
  tertiary-fixed-dim: '#ffb95e'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#fdf7ff'
  on-background: '#1d0e4e'
  surface-variant: '#e7deff'
  bg-base: '#f6f9ff'
  text-main: '#332664'
  text-muted: '#6b7280'
  shadow-light: rgba(255, 255, 255, 0.9)
  shadow-dark: rgb(200, 206, 221)
  accent-pink: '#ec4899'
  accent-blue: '#3b82f6'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '800'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1100px
  gutter: 24px
  margin-desktop: 48px
  margin-mobile: 24px
  section-gap: 80px
---

## Brand & Style
ThinkQuest is an educational platform designed to feel approachable yet intellectually stimulating. The design style is a sophisticated take on **Neomorphism**, moving away from flat surfaces towards a tactile, physical UI that feels carved from a single slab of material. It evokes a sense of "soft technology"—it’s futuristic but grounded in physical properties.

The UI relies on subtle highlights and shadows rather than heavy color blocks to define hierarchy, creating a calm, low-friction environment conducive to learning and focus. The target audience is students who appreciate a modern, high-quality interface that feels more like a premium application than a traditional, rigid academic portal.

## Colors
The palette is rooted in a soft, cool-toned off-white (`#f6f9ff`) which serves as the canvas for the neomorphic effects. 

- **Primary Purple:** Used sparingly for key actions and brand identity.
- **Semantic Accents:** Green (`#00a572`) signifies readiness/completion, while Amber (`#ca8100`) is reserved for warnings or "coming soon" states.
- **The Neomorphic Core:** The interaction of light and shadow is critical. Highlights are pure white with high opacity, while shadows are a muted, desaturated blue-grey. 
- **Typography:** Deep indigo (`#332664`) provides high legibility for main content, while a neutral grey (`#6b7280`) is used for secondary information.

## Typography
The system uses **Inter** exclusively to maintain a clean, systematic, and highly legible appearance. 

The hierarchy is established through dramatic weight shifts—using Extra Bold (`800`) for primary displays and Bold (`700`) for section headers. Body text remains at a standard weight (`400`) but uses a slightly larger scale (`18px`) for introductory text to ensure a comfortable reading experience. Labels and metadata use uppercase styling with increased letter spacing to differentiate them from prose.

## Layout & Spacing
The layout follows a **fixed-width grid** centered on the screen, maximizing at 1100px to keep line lengths readable for educational content. 

- **The 8px System:** All margins, paddings, and component dimensions are multiples of 8px.
- **Vertical Rhythm:** Large sections are separated by significant whitespace (80px) to prevent the tactile neomorphic elements from feeling cluttered.
- **Adaptive Strategy:** On mobile, margins reduce to 24px and the grid collapses to a single column. Cards transition from fixed heights to fluid containers that maintain their internal 32px padding.

## Elevation & Depth
Depth is not achieved through layering (Z-index) but through **surface deformation**. 

1.  **Extruded (Shadow-Neo):** Used for primary buttons and cards. Created using two shadows: a light shadow (top-left) and a dark shadow (bottom-right). This makes the element appear to pop out of the background.
2.  **Inset (Shadow-Neo-Inset):** Used for icons containers and input fields. The shadows are reversed and placed inside the element, making it appear "pressed" into the surface.
3.  **Active State:** When a button is pressed, it transitions from "Extruded" to "Inset," mimicking a physical mechanical switch.
4.  **Glassmorphism:** The Navigation bar uses an 80% opacity background blur to provide context of the content being scrolled beneath it without breaking the clean aesthetic.

## Shapes
The shape language is extremely organic and soft. 

- **Primary Containers:** Large sections (Hero, Cards) use a 32px (`2rem`) corner radius.
- **Interactive Elements:** Buttons and small chips are fully pill-shaped (rounded-full).
- **Secondary Containers:** Icons and small status boxes use a 16px-24px radius to maintain the "squishy" tactile feel.
- **Consistency:** Never use sharp corners; even small details like status indicators should be circular or heavily rounded.

## Components

### Buttons
- **Primary:** Background matches `bg-base`, uses `shadow-neo`. On hover or click, transitions to `shadow-neo-btn-inset`. Text is bold and sized at `14px`.
- **Ghost/Text:** No background or shadow, uses Primary Purple for text with a weight of 600.

### Cards
- Large white surfaces with 32px padding and `shadow-neo`.
- **Interactive Cards:** Include a subtle top border (`border-t border-white/50`) to simulate a light catch on the top edge of a physical object.

### Chips & Tags
- Used for status (e.g., "Ready", "Registered").
- Background is `bg-base` with `shadow-neo-sm`. Text is `label-sm` weight with high contrast color (Secondary Green or Primary Purple).

### Input Fields / Inset Containers
- Always use `shadow-neo-inset`.
- This creates a clear visual distinction between things you can *click* (extruded) and things you can *fill or look into* (inset).

### Iconography
- Icons are placed inside inset squares or circles.
- Use **Material Symbols Outlined** with a weight of 400. In the Hero section, icons may use a 'Fill' variation to draw more attention.