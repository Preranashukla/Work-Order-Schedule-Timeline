# Engineering Log & AI Prompts

This document tracks the key architectural decisions and AI interactions during the development of the Work Order Schedule Timeline.

## Phase 1: Architecture & Core Setup

**Context:** Setting up a scalable Angular 17+ application with standalone components.

**Prompt:**
> "Scaffold an Angular 17 project structure for a manufacturing timeline component. I need a core module for services/models, a features module for the timeline logic, and a shared module for reusable UI components like badges. Use standalone components. The data model should support Work Centers and Work Orders."

**Decision Log:**
- **State Management:** Opted for Angular Signals over RxJS BehaviorSubjects for local state. Signals provide a cleaner API for synchronous state updates (like zoom level or panel visibility) and integrate better with the new change detection strategy.
- **Component Strategy:** Strictly standalone components to reduce NgModule boilerplate and improve tree-shaking.
- **Styling:** SCSS with CSS variables mapped to the provided design tokens for easy theming.

## Phase 2: Timeline Logic & Rendering

**Context:** Implementing the core timeline grid and date-to-pixel calculations.

**Prompt:**
> "I need a utility function to calculate the pixel position of a date on a timeline. Inputs: target date, timeline start date, timeline end date, and total container width. The output should be the `left` offset in pixels. Also need the inverse function (pixels to date) for click-to-create functionality."

**Decision Log:**
- **Positioning Algorithm:** Used linear interpolation `(date - start) / (end - start) * width`. This is deterministic and works for all zoom levels (Day/Week/Month).
- **Zoom Levels:** Implemented as a strategy pattern where `TimelineService` recalculates the visible date range and column widths based on the selected `ZoomLevel`.
- **Scroll Sync:** The header (dates) and the grid (bars) are in separate scroll containers. I implemented a scroll listener on the grid to programmatically update the header's `scrollLeft` to keep them in sync.

## Phase 3: Overlap Detection & Lane Assignment

**Context:** Handling overlapping work orders to prevent visual clutter and logical conflicts.

**Prompt:**
> "Write a TypeScript utility to detect overlapping date ranges. Input is an array of objects with start/end dates. Output should be a boolean indicating if a new range overlaps with any existing ones. Also, suggest an algorithm to assign 'lanes' or 'rows' to overlapping items so they stack vertically like a Gantt chart."

**Decision Log:**
- **Overlap Validation:** Strict validation prevents creating/editing a work order if it overlaps with another on the same work center *unless* they are in different lanes (visual only) or if the business logic strictly forbids it. For this requirement, we forbid overlaps on the same "row" but allow visual stacking if we were to support concurrent jobs.
- **Lane Assignment:** Implemented a greedy algorithm in `lane-assignment.util.ts`. It sorts orders by start date and places each in the first available lane that doesn't have a time conflict. This is O(n*m) where n is orders and m is lanes, which is efficient enough for <1000 orders.
- **Inclusive Dates:** Adjusted the overlap logic to treat end dates as inclusive (adding 24h) to match user expectations for daily planning.

## Phase 4: UI Polish & Accessibility

**Context:** Ensuring the component is production-ready and accessible.

**Prompt:**
> "Review this Angular component template for accessibility. Ensure all interactive elements (buttons, inputs, timeline bars) have correct ARIA labels, roles, and keyboard navigation support (Tab, Enter, Space). The timeline bars should be focusable."

**Decision Log:**
- **Keyboard Nav:** Added `tabindex="0"` to work order bars. Users can tab through orders and press Enter/Space to open the edit menu.
- **ARIA:** Added `aria-label` to all icon-only buttons and `aria-expanded` to menus. The create/edit panel is marked as `role="dialog"` with `aria-modal="true"`.
- **Z-Index Management:** Implemented dynamic z-index handling. Hovered or active items (like the actions menu) get promoted to `z-index: 100` to avoid clipping issues.

## Phase 5: Performance Optimization

**Context:** Handling large datasets (1000+ orders).

**Prompt:**
> "Optimize the rendering of a large list in Angular. I have 1000 items in a timeline. Scrolling is getting sluggish. Suggest improvements."

**Decision Log:**
- **OnPush Strategy:** All components use `ChangeDetectionStrategy.OnPush` to minimize unnecessary change detection cycles.
- **Virtual Scroll (Future):** While not fully implemented yet, the architecture supports adding CDK Virtual Scroll. For now, we use `trackBy` functions in all `*ngFor` loops to prevent DOM thrashing during updates.
- **Scroll Sync:** Optimized the scroll event listener to avoid layout thrashing by reading scroll positions directly from the event target.

---

*Note: This log is maintained to track the evolution of the codebase and the reasoning behind key technical choices.*
