PAGE 1 — Splash / Login
Purpose: Authenticate staff securely and route them to the correct role-based dashboard with minimum friction (target: < 5 seconds from app open to dashboard).

Layout Structure: Single full-screen centered layout — DineEase logo top-center, large numeric PIN pad in the middle, biometric fingerprint icon below, restaurant branch name + date/time at the bottom.

Key Components:

DineEase logo + tagline
4-digit PIN input field (masked dots)
Numeric keypad (0–9, clear, backspace)
"Use Fingerprint" secondary button
Branch selector dropdown (top-right, for multi-branch staff)
Footer with version number and connection status indicator
Interactive Elements:

Tap numeric keys to enter PIN
Tap fingerprint icon to trigger biometric auth
Tap "Forgot PIN?" → opens manager-assist modal
Switch branch via dropdown (if multi-branch user)
Navigation:

From: App launch / logout action
To: Auto-redirects to Waiter, Kitchen, or Manager dashboard based on role; if multi-role → Role Selection screen
Content:

Heading: "Welcome to DineEase"
Sub-text: "Enter your 4-digit PIN to continue"
Branch name (e.g., "Karachi – Clifton Branch")
Live clock + current shift label ("Evening Shift")
States:

Empty: PIN dots empty, keypad active
Loading: Spinner overlay on PIN pad after 4th digit entered
Error: Shake animation + red text "Incorrect PIN. 2 attempts remaining."
Locked: After 5 failed attempts → "Account locked. Contact manager." with lock icon
Offline: Yellow banner top: "Working offline — orders will sync when online"
PAGE 2 — Role Selection (Fallback)
Purpose: Allow users with multiple assigned roles (e.g., a Manager who also waits tables) to choose which interface to enter.

Layout Structure: Centered vertical stack — greeting at top, three large role cards arranged horizontally (or vertically on mobile), logout link at bottom.

Key Components:

Greeting header with user name + avatar
3 role cards (Waiter / Kitchen / Manager) — each with icon, role name, one-line description
"Remember my choice" checkbox
Logout text link
Interactive Elements:

Tap a role card → navigate to that dashboard
Toggle "Remember my choice" to skip this screen next login
Tap logout to return to Login screen
Navigation:

From: Login (only if user has > 1 role)
To: Selected role's dashboard
Content:

"Hello, Mustafa 👋"
"Which role are you working as today?"
Card 1: 🧑‍🍳 Waiter — "Take orders & manage tables"
Card 2: 👨‍🍳 Kitchen — "View & prepare incoming tickets"
Card 3: 📊 Manager — "Monitor restaurant performance"
States:

Default: All cards active
Disabled: Roles not assigned to user are greyed out with tooltip "Not assigned to this role"
Loading: Brief skeleton on card tap before navigation
PAGE 3 — Waiter: Table Map
Purpose: Give waiters a real-time visual overview of the entire floor so they can identify free tables, monitor order progress, and tap directly into any table to act.

Layout Structure: Top app bar (branch + waiter name + notifications) → left sidebar with section filters (Indoor / Outdoor / Private) → main canvas with draggable/zoomable table layout → right slide-out panel for table details.

Key Components:

Top app bar with notification bell + profile avatar
Section filter sidebar (Indoor, Outdoor, Bar, Private Room)
Floor map canvas with table shapes (round/square)
Color-coded status legend (Free, Seated, Ordered, Bill Requested, Needs Cleaning)
Floating "+ New Walk-in Order" button (bottom-right)
Right detail panel (opens on table tap)
Interactive Elements:

Tap table → opens detail panel with options (Seat Guests / View Order / Request Bill / Mark Cleaning Done)
Pinch to zoom, drag to pan map
Filter by section in sidebar
Tap notification bell → ticket-ready alerts dropdown
Long-press table → quick-action radial menu
Navigation:

From: Login → Waiter Dashboard (this is the waiter's home)
To: Order Builder (on "Seat Guests" or "View Order"), Bill & Payment (on "Request Bill")
Content:

Each table shows: Table number, seat count icon, current status, elapsed time since last action, assigned waiter initials
Legend with 5 color chips: 🟢 Free, 🟡 Seated, 🟠 Ordered, 🔴 Bill Pending, ⚫ Cleaning
Sample tables: "T-01 (4 seats) – Free", "T-05 (2 seats) – Ordered • 12 min"
States:

Loading: Skeleton table shapes while floor plan loads
Empty: "No tables configured. Contact manager." with setup CTA
All occupied: Banner top: "All tables occupied — 3 parties on waitlist"
Connection lost: Yellow toast "Reconnecting… last update 30s ago"
PAGE 4 — Waiter: Order Builder
Purpose: Let waiters quickly build, modify, and send an order to the kitchen with minimum taps (target: < 30 seconds for a 4-item order).

Layout Structure: Two-column split — left (60%) menu grid with category tabs and search, right (40%) sticky order summary panel with running total and "Send to Kitchen" CTA. Top bar shows table number and guest count.

Key Components:

Top bar: Table # + guests + "Back to Map" link
Search bar + category tabs (Starters, Mains, Drinks, Desserts, Specials)
Filter chips (Veg, Spicy, Bestseller, In Stock)
Menu item cards (photo, name, price, "Add" button, out-of-stock badge)
Right panel: ordered items list with qty steppers, modifier notes, subtotal, tax, total
Primary CTA: "Send to Kitchen" (large, fixed bottom of right panel)
Secondary actions: "Save as Draft", "Add Note", "Apply Discount"
Interactive Elements:

Tap "+" on a menu card → opens modifier bottom sheet (Page 5)
Search/filter menu items
Adjust quantity with +/- steppers in summary
Swipe-left on an order item → "Delete" with undo toast
Tap discount → manager PIN modal
Tap "Send to Kitchen" → confirmation toast + return to Table Map
Navigation:

From: Table Map (tap empty/seated table)
To: Modifier sheet (Page 5), Bill & Payment (Page 6), back to Table Map
Content:

Menu items with photos (e.g., "Chicken Biryani – Rs. 850")
Order summary: itemized list with qty, modifiers, line total
Tax line (e.g., "GST 13%"), grand total
Empty state text: "No items added yet. Tap a dish to start."
States:

Empty order: Right panel shows illustration + "Add items from the menu"
Loading: Skeleton cards while menu loads
Out of stock: Item card greyed with "Sold out today" badge, Add button disabled
Sending: Button shows spinner "Sending…" → success toast "Order #142 sent to kitchen ✓"
Error: Red toast "Failed to send. Tap to retry."
PAGE 5 — Waiter: Menu Item / Modifier Sheet
Purpose: Allow detailed customization of a dish (size, add-ons, spice level, special notes) without leaving the order context.

Layout Structure: Bottom sheet sliding up from Order Builder, covering ~75% of screen height. Hero image at top, scrollable options in middle, sticky footer with quantity + "Add to Order" button.

Key Components:

Drag handle + close X (top-right)
Dish hero image
Dish name, description, base price, allergen icons
Option groups: Size (radio), Add-ons (checkbox), Spice level (slider), Cooking preference (radio)
Special instructions text field (max 100 chars with counter)
Quantity stepper
Sticky footer: "Add to Order – Rs. XYZ" CTA
Interactive Elements:

Select size → updates total in real time
Toggle add-ons → updates total
Drag spice slider (Mild → Extra Hot)
Type special note (e.g., "No onions")
Adjust quantity
Swipe down or tap X to dismiss
Navigation:

From: Order Builder ("+" tap on a menu card)
To: Returns to Order Builder with item appended to summary
Content:

Dish details (name, description, allergens: 🥜 nuts, 🌾 gluten, 🥛 dairy)
Sample modifiers: "Size: Half / Full", "Add Cheese (+Rs. 100)", "Spice: 🌶 to 🌶🌶🌶🌶"
Helper text: "Allergen info • Customize as needed"
States:

Default: First option in each group pre-selected
Required missing: "Add to Order" disabled with hint "Please select a size"
Out of stock add-on: Greyed checkbox with "Unavailable" label
Adding: Brief button spinner before sheet closes
PAGE 6 — Waiter: Bill & Payment
Purpose: Generate the final bill, support split payments, apply discounts, capture payment method, and close the table.

Layout Structure: Two-column — left itemized bill (scrollable), right payment actions panel with totals, discount, tip, and payment method tiles. Sticky footer with "Confirm Payment" CTA.

Key Components:

Header: Table #, guest count, waiter name, order start time
Itemized list grouped by guest (if split-bill mode)
Subtotal, discount, tax, service charge, tip, grand total
Discount input (requires manager PIN for >10%)
Tip selector chips (5%, 10%, 15%, custom)
Payment method tiles (Cash, Card, Mobile Wallet, Split)
"Print Receipt" + "Email Receipt" toggles
Primary CTA: "Confirm Payment & Close Table"
Interactive Elements:

Toggle "Split Bill" → mode switches to per-guest view
Apply discount → opens PIN modal if threshold exceeded
Select payment method → reveals method-specific input (card swipe prompt, cash tendered field)
Adjust tip
Confirm payment → success animation + return to Table Map
Navigation:

From: Order Builder ("Request Bill") or Table Map ("Bill" action)
To: Receipt confirmation overlay → back to Table Map (table now Free)
Content:

Sample bill: "2× Chicken Biryani – Rs. 1700, 1× Coke – Rs. 150…"
Totals: "Subtotal Rs. 1850, GST 13% Rs. 240.50, Total Rs. 2090.50"
Confirmation copy: "This will close Table T-05. Continue?"
States:

Default: Cash selected
Unauthorized discount: Red helper "Manager approval required" + disabled apply
Processing: Full-screen overlay "Processing payment…"
Success: Green check animation "Paid ✓ Receipt sent"
Failed: Red banner "Payment declined. Try another method." with retry
PAGE 7 — Kitchen Display System (KDS)
Purpose: Provide cooks a focused, hands-free-friendly board to see incoming orders, track prep time, and mark dishes ready.

Layout Structure: Full-screen kanban with 3 columns — "New", "Preparing", "Ready". Top bar shows shift, station filter, and average prep time KPI. Cards flow left → right.

Key Components:

Top bar: Shift label, station filter (All / Grill / Tandoor / Cold Station), avg prep time, alert count
3 vertical columns with auto-scrolling ticket cards
Each ticket card: order #, table #, items list, elapsed timer, priority flag
Audio alert toggle (top-right)
"Recall Last" button (undo for accidentally-completed tickets)
Interactive Elements:

Tap ticket card → expand to detail view (Page 8)
Tap "Start Cooking" → ticket moves to Preparing column, timer starts
Tap "Mark Ready" → ticket moves to Ready column, waiter notified
Long-press → mark as "Issue" (out of stock, etc.) → notifies waiter
Filter by station
Navigation:

From: Login → Kitchen Dashboard (kitchen staff home)
To: Ticket Detail (Page 8) on card tap
Content:

Sample ticket: "Order #142 • T-05 • 2× Chicken Biryani, 1× Coke • ⏱ 03:24"
Priority flags: 🔴 Late, 🟡 VIP, 🟢 Normal
KPI bar: "Avg prep: 8m 12s • 3 tickets waiting"
States:

Empty: "No active tickets — relax 🍳" illustration
Late ticket: Card border turns red after exceeding target time, audio alert
Connection lost: Top banner "KDS offline — showing cached tickets"
All ready: Celebration toast "Kitchen is clear! 🎉"
PAGE 8 — Kitchen: Ticket Detail
Purpose: Show one order's full detail (all items, modifiers, allergens, special notes) so the cook can prepare it accurately.

Layout Structure: Modal/overlay covering 80% of screen. Header with order # and table #, scrollable item list with checkboxes, footer with action buttons.

Key Components:

Header: Order #, Table #, waiter name, time placed, elapsed timer
Item list with: name, qty, modifiers (highlighted), allergens, special notes (in distinct callout)
Per-item checkbox to mark individual dishes ready
Footer actions: "Mark All Ready", "Report Issue", "Close"
Interactive Elements:

Check off individual items as cooked
"Mark All Ready" → moves entire ticket to Ready column
"Report Issue" → bottom sheet with reasons (Out of stock / Allergen conflict / Other)
Swipe down to dismiss
Navigation:

From: KDS (tap any ticket card)
To: Returns to KDS board
Content:

Item example: "1× Chicken Biryani — Spice: Extra Hot 🌶🌶🌶🌶 — ⚠ Note: No onions"
Allergen warnings highlighted in amber
Footer total: "3 items • All marked ready will notify waiter Mustafa"
States:

Default: No items checked
Partial: Some items checked, "Mark All Ready" still active
Issue reported: Red banner "Issue sent to waiter. Awaiting response."
Stale ticket: If older than 20 min, banner "This ticket is overdue"
PAGE 9 — Manager: Dashboard
Purpose: Give managers an at-a-glance live view of restaurant performance and surface anomalies that need their attention.

Layout Structure: Top app bar → KPI row (4 cards) → 2-column grid: left table occupancy heatmap + revenue chart, right alerts feed + top-selling items. Bottom: quick actions strip.

Key Components:

4 KPI cards: Today's Revenue, Covers Served, Avg Table Turn Time, Open Tables
Table occupancy heatmap (visual floor plan with heat colors)
Revenue line chart (hourly, today vs. last week)
Alerts feed (voids, discounts, late tickets, low stock)
Top 5 selling items list with bar lengths
Quick action chips: "Approve Discount", "View Reports", "Staff Activity"
Interactive Elements:

Tap any KPI → drill into detailed view
Hover/tap heatmap table → see current order/dwell time
Tap alert → take action (approve void, contact waiter, etc.)
Filter time range (Today, Week, Month) on chart
Navigation:

From: Login → Manager Dashboard (manager home)
To: Reports (Page 11), Staff Activity (Page 10), Order Builder (drill-in)
Content:

KPI sample: "Revenue Rs. 1,24,500 • +12% vs yesterday"
Heatmap legend: cool blue (free) → hot red (long dwell)
Alert sample: "🔴 Void requested at T-08 by Ibad — Tap to approve"
States:

Loading: Skeleton cards
Empty (start of day): "No transactions yet today. Stats will appear after the first order."
Anomaly detected: Red badge on KPI ("Revenue down 25% vs avg")
No alerts: "All clear ✓ No items need your attention"
PAGE 10 — Manager: Staff Activity Feed
Purpose: Provide a chronological audit log of all sensitive staff actions for accountability, training, and dispute resolution.

Layout Structure: Single-column timeline with sticky filter bar at top. Each entry is a row with avatar, action, timestamp, and optional drill-in chevron.

Key Components:

Filter bar: Date range, staff member, action type (Login, Void, Discount, Refund, Shift Open/Close)
Timeline entries grouped by date
Each entry: staff avatar + name, action description, table/order ref, timestamp
Search bar (free text)
Export button (CSV)
Interactive Elements:

Filter by date / staff / action type
Search by keyword
Tap entry → expand to show full context (order details, before/after values)
Export filtered view to CSV
Navigation:

From: Manager Dashboard (alert tap or quick-action chip)
To: Order/Bill detail on entry expand; back to Dashboard
Content:

Sample entries: "Mustafa voided item 'Coke' from Order #142 at T-05 — 7:42 PM"
"Ibad applied 15% discount on Order #137 (manager approved by Sarah) — 7:30 PM"
"Shift opened by Sarah — 6:00 PM"
States:

Loading: Skeleton rows
Empty: "No activity matches your filters."
Exporting: Toast "Preparing CSV…" → "Downloaded ✓"
PAGE 11 — Manager: Reports & Export
Purpose: Let managers analyze historical performance across configurable date ranges and export data for accounting or owner review.

Layout Structure: Top filter bar (date range + report type) → KPI summary row → main chart area → data table below → export action bar at bottom.

Key Components:

Date range picker + preset chips (Today, Yesterday, This Week, This Month, Custom)
Report type tabs (Sales, Items, Staff, Categories, Payment Methods)
Summary KPIs (Revenue, Orders, Avg Order Value, Refunds)
Visualization (line/bar/pie depending on report)
Sortable/filterable data table
Export buttons: PDF, CSV, Email to Owner
Interactive Elements:

Pick date range
Switch report tab
Sort table columns
Toggle chart type
Export to PDF/CSV
Schedule auto-email (modal)
Navigation:

From: Manager Dashboard
To: Back to Dashboard; Email modal opens overlay
Content:

Sample summary: "Mar 1–31: Rs. 18,40,000 across 1,245 orders • Avg Rs. 1,477"
Table columns vary by report (Date / Item / Qty / Revenue, etc.)
States:

Loading: Chart and table skeletons
Empty: "No data for the selected range."
Generating export: Modal "Generating PDF… this may take 10s"
Export ready: Toast with download link
PAGE 12 — Settings & Profile
Purpose: Shared screen across all roles for personal preferences, account management, and logging out securely.

Layout Structure: Left sidebar with setting categories → right pane with the selected category's controls. Top header shows user profile.

Key Components:

Profile header: avatar, name, role, employee ID
Sidebar categories: Account, Appearance, Notifications, Language, Help, About
Account: change PIN, update phone/email
Appearance: theme (Light / Dark / System), text size
Notifications: sound toggle, push, email
Language: English, Urdu, Roman Urdu
Help: FAQ link, contact support
Logout button (footer)
Interactive Elements:

Edit profile fields
Change PIN (requires current PIN)
Toggle theme / notifications
Switch language → app reloads with new locale
Tap Logout → confirmation dialog → return to Login
Navigation:

From: Profile avatar tap (any role's top bar)
To: Login (on logout); back to previous role dashboard
Content:

Profile: "Muhammad Mustafa • Waiter • EMP-0772"
Help text: "Need help? Contact your manager or DineEase support."
Version footer: "DineEase v1.0.0 • © 2026"
States:

Default: Account category selected
Saving: Per-control spinner "Saving…"
Saved: Inline check "Saved ✓"
Error: Inline red text "Could not update. Try again."
Logout confirm: Modal "Are you sure? Any unsynced orders will be lost."
PAGE 13 — Confirmation & Undo Components (Reusable System)
Purpose: Provide a consistent, app-wide safety net for destructive actions and reversible operations — directly implementing Nielsen's "User Control & Freedom" and "Error Prevention" heuristics.

Layout Structure: Two reusable patterns —

Confirmation Dialog — centered modal with overlay
Undo Toast — bottom-center floating bar with 5-second timer
Key Components:

Confirmation Dialog:

Icon (warning/info/destructive)
Title (action verb + object)
Description (consequence in plain language)
Two buttons: secondary "Cancel" + primary "Confirm" (destructive style if applicable)
Undo Toast:

Action description (e.g., "Item removed")
"Undo" link button
Animated countdown ring (5s)
Auto-dismiss
Interactive Elements:

Confirm dialog: tap Confirm → action proceeds; tap Cancel/overlay/Esc → dismiss
Undo toast: tap "Undo" within 5s → action reversed; ignore → action commits
Navigation:

From: Triggered contextually (delete order item, void table, apply large discount, close shift)
To: Returns to originating screen with action committed or reverted
Content (examples):

Dialog: "Void Bill for T-05? This will remove all items and cannot be undone after confirming. — [Cancel] [Void Bill]"
Toast: "Removed 'Coke' from order. — [Undo] (5s)"
Dialog: "Close Shift? You'll need to log in again to continue. — [Cancel] [Close Shift]"
States:

Idle: Dialog hidden / toast hidden
Visible: Dialog with focus trapped on Cancel by default; toast with countdown active
Undone: Toast updates to "Action undone ✓" then fades
Committed: Toast fades after 5s, action persists
Stacked: Multiple toasts stack vertically, max 3 visible
Summary Table (for the Report Appendix)
#	Page	Primary User	Top HCI Concept
1	Login	All staff	Error prevention, Universal design
2	Role Selection	Multi-role users	Recognition over recall
3	Table Map	Waiter	Direct manipulation, Gestalt proximity
4	Order Builder	Waiter	Fitts's Law, Miller's 7±2
5	Modifier Sheet	Waiter	Progressive disclosure
6	Bill & Payment	Waiter	Closure, Confirmation
7	KDS	Kitchen	Visibility of status, Pre-attentive color
8	Ticket Detail	Kitchen	Match real-world, Error prevention
9	Manager Dashboard	Manager	Information scent, Dashboards
10	Staff Activity	Manager	Audit trail, Visibility
11	Reports	Manager	Flexibility & efficiency
12	Settings	All staff	Consistency, User control
13	Confirm/Undo System	All staff	User control & freedom, Reversibility