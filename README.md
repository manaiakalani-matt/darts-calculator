# Dartboard Calculator

A mobile-first dartboard calculator for practising checkouts.

## What it does

- Enter a required score or generate a random target range.
- Every segment shows what would be left if you hit it.
- Tap a segment to subtract that hit from the score.
- Bust options disappear.
- Valid double-out checkouts show as a green highlighted `0`.
- Bullseye checkout works as a valid finish.
- The board is drawn with SVG, so no image asset is needed.

## Run locally

```bash
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal.

## Build

```bash
npm run build
```

## Notes

This version uses a standard dartboard order:

20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5

The inner single ring is kept visually for accuracy, but its numbers are hidden to avoid duplication with the outer single ring.
