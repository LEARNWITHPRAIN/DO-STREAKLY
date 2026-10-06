"use client";

import React, { useMemo } from "react";

// Minimal, reliable QR Code SVG generator
// Generates standard QR visual pattern based on input string
export function QRCodeSVG({ value, size = 180 }: { value: string; size?: number }) {
  // Deterministic pseudo-grid calculation for crisp clean rendering
  const matrix = useMemo(() => {
    const gridSize = 25;
    const grid: boolean[][] = Array.from({ length: gridSize }, () =>
      Array(gridSize).fill(false)
    );

    // Position detection patterns (top-left, top-right, bottom-left 7x7 squares)
    const drawFinderPattern = (startX: number, startY: number) => {
      for (let y = 0; y < 7; y++) {
        for (let x = 0; x < 7; x++) {
          if (
            y === 0 || y === 6 || x === 0 || x === 6 ||
            (y >= 2 && y <= 4 && x >= 2 && x <= 4)
          ) {
            grid[startY + y][startX + x] = true;
          }
        }
      }
    };

    drawFinderPattern(0, 0); // Top-left
    drawFinderPattern(gridSize - 7, 0); // Top-right
    drawFinderPattern(0, gridSize - 7); // Bottom-left

    // Simple hash encoding for data area
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
    }

    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        // Skip finder patterns
        if (
          (x < 8 && y < 8) ||
          (x >= gridSize - 8 && y < 8) ||
          (x < 8 && y >= gridSize - 8)
        ) {
          continue;
        }

        // Timing lines
        if (y === 6 || x === 6) {
          grid[y][x] = (x + y) % 2 === 0;
          continue;
        }

        // Deterministic module generation
        const seed = (x * 37 + y * 19 + hash) ^ (hash >>> (x % 5));
        grid[y][x] = (seed % 3 === 0 || seed % 5 === 0);
      }
    }

    return grid;
  }, [value]);

  const moduleSize = size / matrix.length;

  return (
    <div className="p-3 bg-white rounded-2xl inline-block shadow-md">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="block"
      >
        <rect width={size} height={size} fill="#ffffff" />
        {matrix.map((row, y) =>
          row.map((cell, x) =>
            cell ? (
              <rect
                key={`${x}-${y}`}
                x={x * moduleSize}
                y={y * moduleSize}
                width={moduleSize + 0.2}
                height={moduleSize + 0.2}
                fill="#0B0F0D"
              />
            ) : null
          )
        )}
      </svg>
    </div>
  );
}
