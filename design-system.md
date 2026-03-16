# Design System - Student Management App

## Scale: Refined (small, Apple/Notion-like)

## Colors

- Background: white (#FFFFFF)
- Surface: zinc-50/50
- Border: zinc-200, zinc-100
- Text primary: zinc-900, zinc-700
- Text secondary: zinc-600, zinc-500
- Text muted: zinc-400
- Accent: zinc-900 (buttons, active pagination)
- Danger hover: red-50 bg, red-600 text
- Grade badge: zinc-100 bg, zinc-600 text, zinc-200 border

## Typography

- Headers: text-sm font-medium text-zinc-500 uppercase tracking-wider
- Column headers: text-[10px] font-semibold text-zinc-500 uppercase tracking-tight
- Table cell primary: text-xs font-medium text-zinc-700
- Table cell secondary: text-xs text-zinc-600
- Email: text-xs text-zinc-500 font-mono tracking-tighter
- Pagination count: text-[10px] text-zinc-400 uppercase
- Page numbers: text-[10px] font-medium

## Spacing

- Table row padding: px-4 py-2.5
- Search bar height: h-8
- Action buttons: h-8 px-3
- Page number buttons: w-5 h-5

## Components

- Search: zinc-50 bg, zinc-200 border, rounded-md, text-xs
- Primary button: zinc-900 bg, white text, rounded-md, text-xs
- Secondary button: zinc-200 border, rounded-md, text-xs
- Table container: zinc-200 border, rounded-lg, shadow-[0_1px_2px_rgba(0,0,0,0.02)]
- Grade badge: px-2 py-0.5 rounded-full text-[10px]
- Drag handle: zinc-300 text, zinc-400 on group-hover, cursor-grab/grabbing
- Row hover: bg-zinc-50/80
- Action icons on row: opacity-0 group-hover:opacity-100, p-1 rounded

## Interactions

- Row actions (edit/delete): hidden by default, visible on hover
- Drag handle: visible always, subtle color
- Active page: zinc-900 bg, white text
- Inactive page: text-zinc-500 hover:text-zinc-900
