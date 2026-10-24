---
name: ListoApp Design System
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#45464d'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#4059aa'
  on-secondary: '#ffffff'
  secondary-container: '#8fa7fe'
  on-secondary-container: '#1d3989'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#271901'
  on-tertiary-container: '#98805d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#dce1ff'
  secondary-fixed-dim: '#b6c4ff'
  on-secondary-fixed: '#00164e'
  on-secondary-fixed-variant: '#264191'
  tertiary-fixed: '#fcdeb5'
  tertiary-fixed-dim: '#dec29a'
  on-tertiary-fixed: '#271901'
  on-tertiary-fixed-variant: '#574425'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

This design system establishes a mobile-first, high-trust environment for quote generation and home services management. The visual framework blends professional reliability with energetic clarity, utilizing a clean, modern aesthetic characterized by generous touch targets, ambient depth, and an optimistic color palette that builds immediate consumer confidence.

## Colors

The color palette leverages authoritative deep slate and navy tones for structural elements, anchored by a vibrant gold accent to highlight calls-to-action and active quote metrics. Functional states utilize crisp emerald greens for successful estimations, while an immaculate neutral background scale ensures maximum legibility outdoors on mobile screens.

## Typography

Typography is optimized for rapid scannability during on-site quotations. We employ a single geometric sans-serif family with carefully calibrated weights to differentiate between dense pricing specifications and clear, actionable headings.

## Layout & Spacing

The layout utilizes a fluid grid system designed primarily for mobile viewports, scaling up gracefully to tablet and desktop interfaces for field technicians and admin dashboards. 

- **Mobile Viewports (Default):** 4-column fluid layout with 16px outer margins and 16px gutters to maximize touch target accuracy.
- **Tablet & Desktop:** Expands into an 8-to-12 column grid with capped container widths and consistent 24px structural padding. Elements stack vertically on mobile and reflow into structured card grids on larger displays.

## Elevation & Depth

Depth is conveyed through soft, ambient shadows layered over clean tonal surfaces. Rather than stark borders, cards and floating action bars use diffused, low-opacity shadows tinted with the primary deep blue to create a welcoming, tactile hierarchy. Floating quotation summaries and bottom sheets sit on the highest elevation layer to ensure immediate focus.

## Shapes

The design system employs a friendly, highly approachable rounded shape language. Generous radii soften the technical nature of window measurements and pricing data, making the quotation process feel accessible and modern.

## Components

- **Buttons:** Full-width primary actions on mobile, featuring the vibrant yellow/gold accent for immediate conversion focus. Secondary actions use subtle ghost or tonal fills.
- **Chips:** Pill-shaped filter and option selectors for quick window dimension presets, glass types, and service add-ons.
- **Lists:** Clean separation lines with generous vertical padding to display itemized quotation line items without crowding.
- **Checkboxes & Radio Buttons:** Custom-styled toggles with high-contrast active states for selecting material grades and installation packages.
- **Input Fields:** Large, thumb-friendly touch targets with floating labels and inline validation for measurements, addresses, and customer details.
- **Cards:** Surface-container tiers featuring soft shadows and rounded corners to group distinct room estimates and service packages.
- **Additional Components:** Floating price summary bars, step-by-step progress indicators for the quotation flow, and interactive before-and-after preview modules.