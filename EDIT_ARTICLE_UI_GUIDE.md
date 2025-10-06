# Edit Article - UI/UX Design Guide

## 🎨 Layout Struktur

```
┌─────────────────────────────────────────────────────────────────────┐
│ ← Back   Dashboard / Edit Article    [Save Status]   [View] [Save] │ ← Sticky Header
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Section: JavaScript    Last Updated: Oct 5, 2025, 10:30 AM     │ │ ← Article Meta
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Article Title                                                    │ │ ← Title Input
│ │ [Introduction to React Hooks                              ]     │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│ ┌───────────────────────────┬───────────────────────────────────────┐│
│ │ Markdown Editor           │ Live Preview                        ││ ← Split View
│ ├───────────────────────────┼───────────────────────────────────────┤│
│ │ [toolbar icons]           │                                     ││
│ │                           │                                     ││
│ │ # React Hooks             │ React Hooks                         ││
│ │                           │ ═══════════                         ││
│ │ React Hooks are...        │ React Hooks are...                  ││
│ │                           │                                     ││
│ │ ```javascript             │ javascript                          ││
│ │ const [state] = ...       │ const [state] = ...                 ││
│ │ ```                       │                                     ││
│ │                           │                                     ││
│ └───────────────────────────┴───────────────────────────────────────┘│
│                                                                       │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 💡 Tips                                                          │ │
│ │ • Press Cmd/Ctrl + S to save manually                           │ │
│ │ • Your changes auto-save after 3 seconds of inactivity          │ │
│ │ • Use the view mode toggle to switch between edit, split, and   │ │
│ │   preview                                                        │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

## 🎯 Key UI Elements

### 1. Sticky Header
```
┌────────────────────────────────────────────────────────────┐
│  [← Back]  Dashboard / Edit Article                        │
│                                                             │
│                    [Saving... ⟳]                            │
│                                                             │
│              [Edit] [Split] [Preview]  [Save]              │
└────────────────────────────────────────────────────────────┘
```

**Features:**
- Back button dengan konfirmasi jika ada unsaved changes
- Breadcrumb navigation
- Real-time save status di tengah
- View mode toggle (3 tombol)
- Primary save button

### 2. Save Status Indicators

```
State 1: Saving
┌──────────────────┐
│ ⟳ Saving...      │ ← Blue color
└──────────────────┘

State 2: Saved
┌──────────────────────────────┐
│ ✓ Saved at 10:30:45 AM      │ ← Green color
└──────────────────────────────┘

State 3: Error
┌──────────────────┐
│ ✗ Save failed    │ ← Red color
└──────────────────┘

State 4: Unsaved
┌──────────────────────┐
│ Unsaved changes      │ ← Yellow color
└──────────────────────┘
```

### 3. View Modes

#### Edit Mode
```
┌────────────────────────────────────────┐
│ Markdown Editor                        │
├────────────────────────────────────────┤
│ [🎨 Toolbar with formatting buttons]  │
│                                        │
│ # Your Content Here                    │
│                                        │
│ Start typing...                        │
│                                        │
│                                        │
└────────────────────────────────────────┘
```

#### Split Mode (Default)
```
┌─────────────────────┬──────────────────┐
│ Markdown Editor     │ Live Preview     │
├─────────────────────┼──────────────────┤
│ # Heading           │ Heading          │
│                     │ ═══════          │
│ **Bold text**       │ Bold text        │
│                     │                  │
│ - List item         │ • List item      │
│                     │                  │
└─────────────────────┴──────────────────┘
```

#### Preview Mode
```
┌────────────────────────────────────────┐
│ Live Preview                           │
├────────────────────────────────────────┤
│                                        │
│ Heading                                │
│ ═══════                                │
│                                        │
│ Your rendered markdown content with    │
│ all formatting applied...              │
│                                        │
│                                        │
└────────────────────────────────────────┘
```

### 4. Article Meta Card
```
┌────────────────────────────────────────────────────┐
│  Section                    Last Updated           │
│  JavaScript                 Oct 5, 2025, 10:30 AM  │
└────────────────────────────────────────────────────┘
```

### 5. Tips Section
```
┌──────────────────────────────────────────────────────────┐
│ 💡 Tips                                                  │
│ • Press [Cmd/Ctrl + S] to save manually                 │
│ • Your changes auto-save after 3 seconds of inactivity  │
│ • Use the view mode toggle to switch between views      │
│ • Markdown syntax is fully supported with live preview  │
└──────────────────────────────────────────────────────────┘
```

## 🎨 Color Scheme

### Status Colors
- **Primary**: Blue `#0D79F2` - Buttons, links, saving state
- **Success**: Green `#059669` - Saved confirmation
- **Warning**: Yellow `#F59E0B` - Unsaved changes warning
- **Danger**: Red `#DC2626` - Error states, delete actions
- **Muted**: Gray - Secondary text, borders

### Component Colors
```css
Background:        #000000 (dark) / #FFFFFF (light)
Secondary BG:      #262626 (dark) / #F5F5F5 (light)
Text:              #FAFAFA (dark) / #262626 (light)
Border:            #404040 (dark) / #E5E5E5 (light)
Accent:            #0D79F2
```

## 📱 Responsive Breakpoints

### Desktop (≥1024px)
- Full split view
- All toolbar buttons visible
- Sidebar expanded

### Tablet (768px - 1023px)
- Split view available
- Compact toolbar
- Collapsible sidebar

### Mobile (<768px)
- Single column view only (no split)
- Minimal toolbar
- Touch-optimized controls
- Fullscreen editor

## ⌨️ Keyboard Shortcuts Display

```
┌─────────────────────────────────────┐
│ Keyboard Shortcuts                  │
├─────────────────────────────────────┤
│ [Cmd/Ctrl + S]  Save article        │
│ [Cmd/Ctrl + ⇧ + P]  Toggle preview  │
│ [Esc]           Close dialogs       │
└─────────────────────────────────────┘
```

## 🔄 Loading States

### Initial Load
```
┌────────────────────────────────────┐
│     Loading article...             │
│     [═══════════════    ] 75%      │
└────────────────────────────────────┘
```

### Saving State
```
Button: [⟳ Saving...]
Center: ⟳ Saving...
```

### Success State
```
Button: [✓ Saved]
Toast:  ✓ Article saved successfully!
```

## 🎭 User Interactions

### 1. Hover States
- Buttons: Scale 1.05, shadow increase
- Links: Underline, color change
- Cards: Border color change, subtle shadow

### 2. Focus States
- Input fields: Primary color border + glow
- Buttons: Ring outline
- Editor: Border highlight

### 3. Active States
- Buttons: Pressed effect (scale 0.95)
- Toggle buttons: Background + shadow

### 4. Disabled States
- Reduced opacity (50%)
- Cursor: not-allowed
- Grayed out appearance

## 🎬 Animations

### Smooth Transitions
```css
transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
```

### Fade In
```css
opacity: 0 → 1 (300ms)
```

### Slide In
```css
transform: translateY(-10px) → translateY(0)
```

### Pulse (Saving indicator)
```css
animation: pulse 2s infinite
```

## 🎯 Accessibility Features

### ARIA Labels
- All interactive elements have proper labels
- Status announcements for screen readers
- Keyboard navigation support

### Focus Management
- Logical tab order
- Visible focus indicators
- Skip to content link

### Color Contrast
- WCAG AA compliant
- Text contrast ratio ≥ 4.5:1
- Interactive elements ≥ 3:1

---

**Design System**: Tailwind CSS + Custom Components  
**Icons**: Justd Icons  
**Fonts**: System fonts with fallbacks  
**Dark Mode**: Automatic based on system preference
