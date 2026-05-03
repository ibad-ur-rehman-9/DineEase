DineEase – Complete Design System
A comprehensive, HCI-grounded design specification for the DineEase Restaurant Management System. Every choice below is justified against your course concepts (Fitts's Law, pre-attentive processing, Miller's 7±2, Gestalt principles, WCAG accessibility) so you can defend each decision in your report and viva.

1. Color Palette
Design Rationale
The palette is built around warm, appetite-stimulating tones (suitable for a restaurant context — hospitality research shows warm reds/oranges increase perceived energy and decision speed) balanced with a deep navy for trust and professionalism. Status colors follow universal conventions (red = stop, green = go) to leverage users' existing mental models (Nielsen Heuristic #2: Match between system and real world).

1.1 Brand Colors
Role	Name	HEX	RGB	Usage
Primary	Saffron Red	#D7263D	215, 38, 61	Main CTAs ("Send to Kitchen", "Confirm Payment"), active nav, brand logo
Secondary	Deep Navy	#1B2A41	27, 42, 65	Headers, sidebars, primary text, manager dashboard accents
Accent	Warm Amber	#F4A261	244, 162, 97	Highlights, badges, "in-progress" states, hover glows
1.2 Background Colors
Light Mode (Default — used in well-lit dining areas)

Token	HEX	Usage
bg-base	#FAF7F2	App background (warm off-white, not stark white — reduces eye strain over long shifts)
bg-surface	#FFFFFF	Cards, modals, menu item tiles
bg-subtle	#F1ECE3	Sidebars, table rows (alternating), input backgrounds
bg-overlay	rgba(27, 42, 65, 0.6)	Modal scrim, bottom-sheet backdrop
Dark Mode (For Kitchen Display & low-light environments)

Token	HEX	Usage
bg-base	#0F1721	KDS background (reduces glare in hot kitchen)
bg-surface	#1B2A41	Ticket cards, panels
bg-subtle	#243447	Secondary surfaces, hover states
bg-overlay	rgba(0, 0, 0, 0.7)	Modal scrim
1.3 Text Colors
Light Mode

Token	HEX	Contrast Ratio (on bg-base)	Usage
text-primary	#1B2A41	13.8:1 ✅ AAA	Headings, body text
text-secondary	#5A6473	6.2:1 ✅ AA	Captions, metadata, helper text
text-disabled	#A8AEB8	2.9:1 ⚠ Decorative only	Disabled buttons, inactive items
text-inverse	#FAF7F2	—	Text on dark/colored backgrounds (e.g., on Primary buttons)
Dark Mode

Token	HEX	Usage
text-primary	#F1F5F9	Headings, body
text-secondary	#94A3B8	Captions
text-disabled	#475569	Disabled
1.4 Status Colors (Pre-attentive, Universal)
These colors are designed to be identifiable in <200ms (pre-attentive processing) and used consistently across all screens — directly applying Nielsen Heuristic #4 (Consistency & Standards).

Status	HEX	Light BG Tint	Usage
🟢 Success	#2A9D8F	#E6F4F1	Order ready, payment successful, "Mark Complete"
🔴 Error / Destructive	#D7263D	#FBE9EC	Voids, failed payments, deletion confirms (same as Primary intentionally — high-stakes actions)
🟡 Warning	#F4A261	#FDF1E5	Late tickets, low stock alerts, "Preparing" state
🔵 Info	#3D5A80	#E8EDF4	Notifications, neutral system messages
1.5 Order Status Color Coding (DineEase-specific)
Used on table cards, order chips, and KDS tickets — consistent across all 3 roles:

Order State	Color	HEX	HCI Justification
Free / Available	Neutral Gray	#94A3B8	Low arousal — no action needed
Seated (No order)	Info Blue	#3D5A80	Calm, attention without urgency
Order Placed	Amber	#F4A261	Moderate arousal — work in progress
Ready to Serve	Success Green	#2A9D8F	Positive, "go" signal for waiter
Bill Requested	Primary Red	#D7263D	High urgency — close the loop
Late / Overdue	Pulsing Red	#D7263D (animated)	Demands immediate attention
1.6 Borders & Dividers
Token	HEX	Usage
border-default	#E5E0D6	Card borders, dividers
border-strong	#1B2A41	Focused inputs, active selections
border-focus	#D7263D	Keyboard focus ring (3px, accessibility)
2. Typography
Design Rationale
Two fonts only (one display, one UI) — simplifies the system and improves rendering performance on tablet POS hardware.
Inter for UI: optimized for screens, excellent legibility at small sizes, native tabular numerals for prices and bills.
Plus Jakarta Sans for headings: modern, friendly, slightly rounded — matches the hospitality tone.
Limited to 3 visible sizes per screen as stated in your proposal (Title / Body / Caption) — applying Miller's 7±2 to typography itself.
2.1 Font Families
Family	Stack	Usage
Display	'Plus Jakarta Sans', 'Inter', system-ui, sans-serif	Page titles, dashboard headlines, brand wordmark
Body	'Inter', 'Segoe UI', system-ui, sans-serif	All UI text, buttons, labels, body copy
Mono	'JetBrains Mono', 'Menlo', 'Courier New', monospace	Order IDs, prices, table numbers, timers (tabular alignment)
2.2 Type Scale
Based on a 1.25 modular scale (Major Third) — proven to create clear visual hierarchy without overwhelming users.

Token	Size (px / rem)	Line Height	Letter Spacing	Usage
display-lg	40px / 2.5rem	48px (1.2)	-0.02em	Hero numbers (Manager KPIs, "Rs. 1,24,500")
display-md	32px / 2rem	40px (1.25)	-0.02em	Page titles (Dashboard, Reports)
h1	28px / 1.75rem	36px (1.3)	-0.01em	Screen titles
h2	24px / 1.5rem	32px (1.33)	-0.01em	Section headers, modal titles
h3	20px / 1.25rem	28px (1.4)	0	Card titles, group headers
body-lg	16px / 1rem	24px (1.5)	0	Primary body, button labels (Fitts-friendly)
body	14px / 0.875rem	22px (1.57)	0	Default UI text, table rows
caption	12px / 0.75rem	18px (1.5)	0.01em	Metadata, timestamps, helper text
overline	11px / 0.6875rem	16px (1.45)	0.08em UPPER	Section labels ("ORDER STATUS"), eyebrows
Minimum tap-target text: Interactive text never goes below body (14px) — keeps buttons readable on tablets at arm's length.

2.3 Font Weights
Limited palette — easier to maintain consistency.

Weight	Value	Usage
regular	400	Body text, descriptions
medium	500	Emphasized body, labels, secondary buttons
semibold	600	Buttons, navigation, table headers
bold	700	Headings, KPIs, prices in bills
2.4 Special Typography Rules
Use Case	Treatment	Rationale
Prices (Rs. 850)	JetBrains Mono, semibold, tabular-nums	Aligned decimal points across rows
Order IDs (#142)	JetBrains Mono, medium	Quick visual scanning, avoids ambiguity (0/O, 1/l)
Timers (03:24)	JetBrains Mono, bold, color-shift on overdue	Stable width as digits change
Table numbers (T-05)	Plus Jakarta Sans, bold, display-md size	Highly visible from a distance
3. Spacing System
Design Rationale
A 4px base unit with a geometric (1.5×) progression balances precision with rapid scanning. The scale is intentionally narrow (8 steps) so designers don't waste cognitive effort choosing between near-identical values — applying Hick's Law to the design process itself.

3.1 Spacing Scale
Token	Value	rem	Usage
space-0	0px	0	Resets
space-1 (xxs)	2px	0.125rem	Hairline gaps, icon nudges
space-2 (xs)	4px	0.25rem	Icon-to-text spacing, tight grid
space-3 (sm)	8px	0.5rem	Inline element gaps, badge padding
space-4 (md)	12px	0.75rem	Form field internal padding, chip padding
space-5 (base)	16px	1rem	Default — card padding, gap between paragraphs
space-6 (lg)	24px	1.5rem	Section spacing within a card, list-item separation
space-7 (xl)	32px	2rem	Major section gaps, modal padding
space-8 (2xl)	48px	3rem	Page-level section breaks, hero spacing
space-9 (3xl)	64px	4rem	Empty-state vertical centering, splash layouts
space-10 (4xl)	96px	6rem	Reserved for large dashboards / wide screens
3.2 Touch Target Rules (Fitts's Law)
Direct application from your proposal — every interactive element must meet WCAG 2.5.5 Level AAA and your stated 44dp rule:

Element Type	Minimum Size	Recommended	Reasoning
Primary buttons (Send to Kitchen, Pay)	48 × 48 px	56 × 56 px	High-frequency, high-stakes — large for speed
Secondary buttons	44 × 44 px	48 × 48 px	WCAG AAA compliant
Icon buttons	44 × 44 px	48 × 48 px	Tap target ≠ icon size (icon stays 24px)
List/menu items	48px height	56px height	Comfortable for repeated tapping
Numeric keypad keys	64 × 64 px	72 × 72 px	Login PIN — speed + accuracy critical
Spacing between targets	8px min	12px	Prevents mis-taps (Fitts's Law: distance + size)
3.3 Layout Spacing (Per-Page Defaults)
Context	Padding	Gap Between Elements
Page container	24px (mobile), 32px (tablet)	—
Card	16px–24px	12px (internal items)
Modal / Bottom sheet	24px	16px (sections)
Form fields	12px vertical, 16px horizontal	16px (between fields)
Table cells	12px vertical, 16px horizontal	—
Button internal	12px vertical, 24px horizontal	8px (icon ↔ label)
Sidebar nav items	12px vertical, 16px horizontal	4px (between items)
3.4 Border Radius Scale
Consistent rounding reinforces the friendly hospitality tone:

Token	Value	Usage
radius-none	0px	Dividers, rules
radius-sm	4px	Inputs, small chips
radius-md	8px	Buttons, badges, status pills
radius-lg	12px	Cards, menu item tiles
radius-xl	16px	Modals, bottom sheets
radius-2xl	24px	KPI cards, hero panels
radius-full	9999px	Avatars, FABs, pill buttons
3.5 Elevation / Shadows
Used sparingly — flat design with depth only where it aids hierarchy:

Token	Value	Usage
shadow-none	none	Default surfaces
shadow-sm	0 1px 2px rgba(27, 42, 65, 0.06)	Cards at rest
shadow-md	0 4px 8px rgba(27, 42, 65, 0.08)	Cards on hover, dropdowns
shadow-lg	0 12px 24px rgba(27, 42, 65, 0.12)	Modals, bottom sheets
shadow-focus	0 0 0 3px rgba(215, 38, 61, 0.35)	Focus rings (keyboard accessibility)
Quick-Reference Cheat Sheet (For Your Figma File)
PRIMARY      #D7263D    Saffron Red       — CTAs, brand
SECONDARY    #1B2A41    Deep Navy         — text, headers
ACCENT       #F4A261    Warm Amber        — highlights, in-progress

SUCCESS      #2A9D8F    | WARNING  #F4A261
ERROR        #D7263D    | INFO     #3D5A80

BG (Light):  #FAF7F2 → #FFFFFF → #F1ECE3
TEXT:        #1B2A41 → #5A6473 → #A8AEB8

FONTS:       Plus Jakarta Sans (display) + Inter (UI) + JetBrains Mono (numerals)
SCALE:       40 / 32 / 28 / 24 / 20 / 16 / 14 / 12
WEIGHTS:     400 / 500 / 600 / 700

SPACING (4px base): 0 · 2 · 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64
RADIUS:      4 · 8 · 12 · 16 · 24 · full
TAP TARGET:  44px min, 48–56px recommended
HCI Concepts Applied in This Design System
Decision	HCI Principle Applied
Limited 3 visible font sizes per screen	Miller's 7±2 (reduced cognitive load)
Universal status colors (red/amber/green)	Nielsen #2 — Match real world / Pre-attentive processing
48–56px touch targets	Fitts's Law (target size ↑ → time ↓)
Same Primary Red for CTA + destructive	Intentional: high-stakes actions get high-attention color
Warm off-white instead of pure white	Reduces eye fatigue over long shifts (Human Factors)
Dark mode for KDS only	Context-aware design (kitchen lighting conditions)
Consistent radius/spacing tokens	Nielsen #4 — Consistency & Standards
8px minimum gap between tap targets	Fitts's Law (prevents mis-taps from neighboring targets)
Tabular numerals for prices/timers	Pre-attentive scanning of numeric columns