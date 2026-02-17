# Work Order Schedule Timeline

An interactive timeline component for a manufacturing ERP system built with Angular 17+. This application allows users to visualize, create, and edit work orders across multiple work centers.

## Features

### Core Features
- **Timeline Grid** with Day/Week/Month zoom levels
- **Work Order Bars** with status indicators (Open, In Progress, Complete, Blocked)
- **Create/Edit Slide-out Panel** with form validation using Reactive Forms
- **Overlap Detection** - prevents overlapping work orders on the same work center
- **Three-dot Actions Menu** with Edit/Delete options
- **Current Day Indicator** - vertical line showing today's date
- **Row Hover States** - highlighted background on hover

### Bonus Features
- **localStorage Persistence** - work orders survive page refresh
- **Smooth Animations** - panel slide-in/out, hover effects
- **"Today" Button** - quickly jump to center on today's date
- **Tooltip on Bar Hover** - shows work order details
- **Keyboard Navigation** - Escape to close panel

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| **Angular 17+** | Framework (standalone components) |
| **TypeScript** | Language (strict mode) |
| **SCSS** | Styling |
| **Reactive Forms** | Form management & validation |
| **ng-select** | Dropdown/select components |
| **@ng-bootstrap/ng-bootstrap** | Date picker (ngb-datepicker) |
| **Angular Signals** | Reactive state management |
| **Circular Std** | Font family (from design tokens) |

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm 9+

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd work-order-timeline

# Install dependencies
npm install

# Start the development server
ng serve
```

Navigate to `http://localhost:4200/` in your browser.

## Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── models/          # TypeScript interfaces & types
│   │   ├── services/        # Business logic services
│   │   └── data/            # Sample data
│   ├── features/
│   │   └── timeline/
│   │       ├── timeline-container/   # Main orchestrator
│   │       ├── timeline-header/      # Date column headers
│   │       ├── timeline-grid/        # Scrollable grid area
│   │       ├── work-center-list/     # Fixed left panel
│   │       ├── work-order-bar/       # Individual work order bar
│   │       └── work-order-panel/     # Create/Edit slide-out panel
│   ├── shared/
│   │   └── components/
│   │       └── status-badge/         # Reusable status pill
│   ├── app.component.ts
│   └── app.config.ts
├── styles.scss              # Global styles & design tokens
└── index.html
```

## Architecture Decisions

### Component Architecture
- **Standalone Components**: All components use Angular 17+ standalone pattern for better tree-shaking and simpler imports
- **Smart/Dumb Pattern**: Timeline Container is the smart component that orchestrates state; child components are presentational
- **Single Panel Component**: One panel component handles both create and edit modes via a mode flag

### State Management
- **Angular Signals**: Used for reactive state management instead of RxJS BehaviorSubjects for simpler, more performant reactivity
- **Service-based**: WorkOrderService and TimelineService manage application state centrally

### Date Calculations
- **Position Mapping**: Dates are converted to pixel positions using the formula: `(targetDate - rangeStart) / daysDuration * columnWidth`
- **Zoom Levels**: Each zoom level has a different column width and date increment (day=60px, week=120px, month=180px)
- **Overlap Detection**: Two date ranges overlap if `startA <= endB && endA >= startB`

### Design Tokens
- Design tokens from `fe-take-home-challenge.tokens.json` are mapped to CSS custom properties in `styles.scss`
- Colors, typography, and shadows follow the provided design system

## Sample Data

The application includes hardcoded sample data with:
- **5 Work Centers**: Extrusion Line A, CNC Machine 1, Assembly Station, Quality Control, Packaging Line
- **10 Work Orders**: Distributed across all work centers with all 4 status types
- **Multiple orders on same center**: Assembly Station has 3 non-overlapping orders

## Libraries Used

| Library | Version | Reason |
|---------|---------|--------|
| `@ng-select/ng-select` | ^12.0.0 | Required for dropdown components per spec |
| `@ng-bootstrap/ng-bootstrap` | ^16.0.0 | Required for ngb-datepicker per spec |
| `bootstrap` | ^5.3.3 | Peer dependency for ng-bootstrap |

## Development

```bash
# Development server
ng serve

# Build for production
ng build

# Run tests
ng test
