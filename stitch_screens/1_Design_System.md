# Apex Intelligence Design Language

This document contains the guidelines and design specifications for the **Premium CRM Design System** (ID: `6471126900680939660`).

---

## Brand & Style

The design system is engineered for a premium, enterprise-grade CRM environment. It prioritizes clarity, efficiency, and a sense of high-performance reliability. The brand personality is "The Sophisticated Architect"—quietly powerful, meticulously organized, and technologically advanced.

The aesthetic blends **Minimalism** with **Modern Corporate** sensibilities, drawing inspiration from high-end SaaS leaders. It utilizes expansive whitespace, precise alignment, and a curated selection of "high-signal" visual cues. The user interface aims to evoke a feeling of "ordered calm" amidst complex data, ensuring that the most critical information is always the most accessible.

**Key Visual Principles:**
- **Clarity over Decoration:** Every border, shadow, and color shift must serve a functional purpose in the information hierarchy.
- **Precision:** Use of subtle micro-interactions to provide immediate feedback without distracting the user.
- **Glassmorphism:** Reserved specifically for persistent navigation and overlay elements to maintain context of the underlying workspace.

---

## Design System Tokens & Configuration

### Typography Settings
- **Display XL**: Font: `Inter`, Size: `60px`, Weight: `700`, Line Height: `72px`, Letter Spacing: `-0.02em`
- **Display LG**: Font: `Inter`, Size: `48px`, Weight: `700`, Line Height: `60px`, Letter Spacing: `-0.02em`
- **Headline LG**: Font: `Inter`, Size: `36px`, Weight: `600`, Line Height: `44px`, Letter Spacing: `-0.02em`
- **Headline LG Mobile**: Font: `Inter`, Size: `30px`, Weight: `600`, Line Height: `38px`, Letter Spacing: `-0.01em`
- **Headline MD**: Font: `Inter`, Size: `24px`, Weight: `600`, Line Height: `32px`, Letter Spacing: `-0.01em`
- **Body LG**: Font: `Inter`, Size: `18px`, Weight: `400`, Line Height: `28px`
- **Body MD**: Font: `Inter`, Size: `16px`, Weight: `400`, Line Height: `24px`
- **Body SM**: Font: `Inter`, Size: `14px`, Weight: `400`, Line Height: `20px`
- **Label MD**: Font: `Inter`, Size: `14px`, Weight: `500`, Line Height: `20px`, Letter Spacing: `0.01em`
- **Label SM**: Font: `Inter`, Size: `12px`, Weight: `600`, Line Height: `16px`, Letter Spacing: `0.03em`

### Corner Roundness
- **sm**: `0.25rem` (4px)
- **DEFAULT**: `0.5rem` (8px)
- **md**: `0.75rem` (12px)
- **lg**: `1rem` (16px)
- **xl**: `1.5rem` (24px)
- **full**: `9999px`

### Spacing & Grid System (8px Grid)
- **xs**: `4px`
- **sm**: `8px`
- **base**: `8px`
- **md**: `16px`
- **lg**: `24px`
- **xl**: `32px`
- **2xl**: `48px`
- **3xl**: `64px`
- **gutter**: `24px`
- **margin-mobile**: `16px`
- **margin-desktop**: `40px`

### Color Palette (Named Colors)

#### Primary & Secondary Interactive Colors
- **primary**: `#004ac6`
- **primary_container**: `#2563eb` (Override Primary: `#2563eb`)
- **on_primary**: `#ffffff`
- **on_primary_container**: `#eeefff`
- **primary_fixed**: `#dbe1ff`
- **primary_fixed_dim**: `#b4c5ff`
- **secondary**: `#4b41e1`
- **secondary_container**: `#645efb`
- **on_secondary**: `#ffffff`
- **on_secondary_container**: `#fffbff`
- **secondary_fixed**: `#e2dfff`
- **secondary_fixed_dim**: `#c3c0ff`

#### Surfaces & Layout Backgrounds
- **background**: `#f8f9ff`
- **on_background**: `#0b1c30`
- **surface**: `#f8f9ff`
- **surface_bright**: `#f8f9ff`
- **surface_dim**: `#cbdbf5`
- **surface_variant**: `#d3e4fe`
- **on_surface**: `#0b1c30`
- **on_surface_variant**: `#434655`
- **surface_tint**: `#0053db`
- **surface_container**: `#e5eeff`
- **surface_container_high**: `#dce9ff`
- **surface_container_highest**: `#d3e4fe`
- **surface_container_low**: `#eff4ff`
- **surface_container_lowest**: `#ffffff`

#### Accents & Semantic Tones
- **tertiary**: `#943700`
- **tertiary_container**: `#bc4800`
- **on_tertiary**: `#ffffff`
- **on_tertiary_container**: `#ffede6`
- **tertiary_fixed**: `#ffdbcd`
- **tertiary_fixed_dim**: `#ffb596`
- **error**: `#ba1a1a`
- **error_container**: `#ffdad6`
- **on_error**: `#ffffff`
- **on_error_container**: `#93000a`
- **outline**: `#737686`
- **outline_variant**: `#c3c6d7`

---

## Layout & Spacing

This design system is built on a strict **8px linear grid**. All dimensions, padding, and margins must be multiples of 8 to ensure mathematical harmony across the interface.

- **Grid Model:** A 12-column fluid grid for desktop with a maximum container width of 1440px. On mobile, the system collapses to a single-column layout with 16px side margins.
- **Spacing Rhythm:** Vertical spacing between sections should lean towards the larger end of the scale (`2xl` or `3xl`) to maintain the "premium" airy feel.
- **Component Padding:** Internal component padding typically uses `sm` (8px) for tight elements like chips and `md` (16px) for standard inputs and buttons.

---

## Elevation & Depth

Hierarchy is established through a combination of **Tonal Layers** and **Ambient Shadows**.

- **Surface Levels:** The base background is `#F8FAFC`. Primary cards and content containers sit on a pure white `#FFFFFF` surface.
- **Shadows:** Use extra-diffused, low-opacity shadows. A "Standard" shadow uses a 12px blur with 4% black opacity and a 2px vertical offset. "Hover" states increase blur to 20px and opacity to 8% to create a "lifting" effect.
- **Glassmorphism:** Top navigation bars and sidebars use a backdrop blur of 12px and a semi-transparent background (`rgba(255, 255, 255, 0.8)`). This keeps the user grounded in their current view even while navigating menus.
- **Outlines:** Use subtle 1px borders (`#E2E8F0`) for all card elements to define boundaries without relying solely on shadows.

---

## Shapes

The shape language is modern and approachable, utilizing a **Rounded** (8px to 16px) corner radius.

- **Base Radius:** 8px (`0.5rem`) for standard components like buttons and input fields.
- **Large Radius:** 16px (`1rem`) for primary content cards and modals to create a softer, more sophisticated look.
- **Pill:** Used exclusively for status badges (Chips) and search bars to distinguish them from actionable buttons.

---

## Components

- **Buttons:** Primary buttons use a solid `#2563EB` fill with white text. Secondary buttons use a white background with a 1px border. All buttons have a height of 40px (Standard) or 48px (Large) to ensure a comfortable hit area.
- **Input Fields:** Use a subtle `#F1F5F9` background and an 8px radius. On focus, the border transitions to Primary Blue with a soft blue outer glow.
- **Cards:** White background, 16px radius, and a 1px border. No heavy shadows unless the card is being "dragged" or is a floating modal.
- **Chips/Badges:** Small, pill-shaped elements with low-opacity background tints (e.g., Success green at 10% opacity with 100% opacity text).
- **Iconography:** Use **Lucide-style** stroke icons with a consistent 1.5px or 2px stroke width. Icons should always be centered within a 24px bounding box for consistent alignment with text.
- **Lists:** Data tables and lists should use alternating row highlights or subtle separators. Row height should be 56px to accommodate `body-sm` text and associated actions comfortably.
