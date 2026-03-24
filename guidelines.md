# Tile Naming Guidelines

Use these naming rules for board references:

- `Tile <row>`: references an entire row.
- `Tile <row>:<cell>`: references one specific cell in a row.
- `Tile <rowA>,<rowB>:<cell>`: references the same cell index across multiple rows.

## Examples

- `Tile 1` = first row
- `Tile 1:1` = first row, first cell
- `Tile 1,2:1` = row 1 and row 2, first cell in each row
- `Tile 3:4` = third row, fourth cell

## Coordinate Rules

- Row index starts at `1` (top row is `1`).
- Cell index starts at `1` (leftmost cell is `1`).
- Current board size is `11` rows by `5` cells per row.
