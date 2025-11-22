# Diagnostic Audit: Unmounted or Dead Components

## Summary
- Removed unreferenced UI components that were not mounted anywhere in the application.
- Cleaned up an unused markdown parsing utility folder that no longer had consumers.

## Removals
- `src/components/ui/MetadataBadge.tsx` (unused badge component)
- `src/components/ui/OutlineCard.tsx` (unused card wrapper)
- `src/components/ui/ResourceLinks.tsx` (unused resource link card and list)
- `src/components/ui/StatCard.tsx` (unused statistics card)
- `src/components/ui/H3.tsx` (unused heading variant)
- `src/components/ui/utils/markdownParser.ts` and its now-empty `utils/` directory

## Rationale
A repository-wide reference scan (`rg <ComponentName>`) showed no imports for these files, indicating they were dead code. Removing them reduces bundle surface area and future maintenance overhead while aligning the codebase with the currently mounted component tree.
