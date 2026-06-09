import React, { useMemo, useState } from "react";
import { Shuffle } from "lucide-react";

const BOARD_ORDER = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];

const TARGET_RANGES = [
  { label: "41-50", min: 41, max: 50 },
  { label: "51-60", min: 51, max: 60 },
  { label: "61-70", min: 61, max: 70 },
  { label: "71-80", min: 71, max: 80 },
  { label: "81-90", min: 81, max: 90 },
  { label: "91-100", min: 91, max: 100 },
  { label: "101-110", min: 101, max: 110 },
  { label: "111-120", min: 111, max: 120 },
  { label: "121-130", min: 121, max: 130 },
  { label: "131-140", min: 131, max: 140 },
  { label: "141-150", min: 141, max: 150 },
  { label: "151-170", min: 151, max: 170 },
];

const COLOURS = {
  background: "#050505",
  wire: "#8b8b8b",
  white: "#f4ebcf",
  black: "#181818",
  red: "#c93625",
  green: "#3d9951",
  textLight: "#ffffff",
  textDark: "#202020",
  checkout: "#7CFF84",
  checkoutStroke: "#063b16",
};

function polarToCartesian(cx, cy, r, angleDeg) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

function annularSectorPath(cx, cy, innerR, outerR, startAngle, endAngle) {
  const outerStart = polarToCartesian(cx, cy, outerR, endAngle);
  const outerEnd = polarToCartesian(cx, cy, outerR, startAngle);
  const innerStart = polarToCartesian(cx, cy, innerR, startAngle);
  const innerEnd = polarToCartesian(cx, cy, innerR, endAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerR} ${outerR} 0 ${largeArcFlag} 0 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerStart.x} ${innerStart.y}`,
    `A ${innerR} ${innerR} 0 ${largeArcFlag} 1 ${innerEnd.x} ${innerEnd.y}`,
    "Z",
  ].join(" ");
}

function labelPosition(cx, cy, radius, angleDeg) {
  return polarToCartesian(cx, cy, radius, angleDeg);
}

function getShotResult(score, hitValue, canCheckout = false) {
  const remaining = score - hitValue;
  const isCheckout = remaining === 0 && canCheckout;
  const isBust = remaining < 0 || remaining === 1 || (remaining === 0 && !canCheckout);

  return {
    remaining,
    isCheckout,
    isBust,
    text: isBust ? "" : String(remaining),
  };
}

function getRemainingScore(score, hitValue, canCheckout = false) {
  const result = getShotResult(score, hitValue, canCheckout);
  if (result.isBust) return score;
  return result.remaining;
}

function textColourForRing(ring, index) {
  if (ring === "singleOuter" || ring === "singleInner") {
    return index % 2 === 0 ? COLOURS.textLight : COLOURS.textDark;
  }
  return COLOURS.textLight;
}

function segmentFill(ring, index) {
  if (ring === "double" || ring === "triple") {
    return index % 2 === 0 ? COLOURS.red : COLOURS.green;
  }
  return index % 2 === 0 ? COLOURS.black : COLOURS.white;
}

function Dartboard({ score, onHit }) {
  const cx = 500;
  const cy = 500;

  const board = {
    outerNumber: 452,
    doubleOuter: 405,
    doubleInner: 355,
    tripleOuter: 238,
    tripleInner: 195,
    outerBull: 72,
    innerBull: 36,
  };

  const outerNumberFontSize = 38;
  const boardValueFontSize = 24;

  const rings = [
    { key: "double", inner: board.doubleInner, outer: board.doubleOuter, multiplier: 2, labelRadius: 380, showLabel: true, canCheckout: true },
    { key: "singleOuter", inner: board.tripleOuter, outer: board.doubleInner, multiplier: 1, labelRadius: 296, showLabel: true, canCheckout: false },
    { key: "triple", inner: board.tripleInner, outer: board.tripleOuter, multiplier: 3, labelRadius: 216, showLabel: true, canCheckout: false },
    { key: "singleInner", inner: board.outerBull, outer: board.tripleInner, multiplier: 1, labelRadius: 134, showLabel: false, canCheckout: false },
  ];

  return (
    <div className="board-wrap">
      <svg viewBox="0 0 1000 1000" className="dartboard" role="img" aria-label="Clickable dartboard checkout calculator">
        <rect width="1000" height="1000" fill={COLOURS.background} />
        <circle cx={cx} cy={cy} r={470} fill="none" stroke="#3c3c3c" strokeWidth="4" />
        <circle cx={cx} cy={cy} r={430} fill="none" stroke="#9a9a9a" strokeWidth="2" />
        <circle cx={cx} cy={cy} r={410} fill="none" stroke="#595959" strokeWidth="4" />

        {BOARD_ORDER.map((number, index) => {
          const pos = labelPosition(cx, cy, board.outerNumber, index * 18);

          return (
            <text
              key={`number-${number}`}
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={outerNumberFontSize}
              fontWeight="900"
              fill="white"
              style={{ paintOrder: "stroke", stroke: "#111", strokeWidth: 3 }}
            >
              {number}
            </text>
          );
        })}

        {rings.map((ring) =>
          BOARD_ORDER.map((number, index) => {
            const start = index * 18 - 9;
            const end = index * 18 + 9;
            const centre = index * 18;
            const hitValue = number * ring.multiplier;
            const pos = labelPosition(cx, cy, ring.labelRadius, centre);
            const shot = getShotResult(score, hitValue, ring.canCheckout);

            return (
              <g
                key={`${ring.key}-${number}`}
                onClick={() => onHit(hitValue, ring.canCheckout)}
                className="segment"
                style={{ cursor: shot.isBust ? "default" : "pointer" }}
              >
                <path
                  d={annularSectorPath(cx, cy, ring.inner, ring.outer, start, end)}
                  fill={segmentFill(ring.key, index)}
                  stroke={COLOURS.wire}
                  strokeWidth="2"
                />

                {ring.showLabel && !shot.isBust && (
                  <text
                    x={pos.x}
                    y={pos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={boardValueFontSize}
                    fontWeight="800"
                    fill={shot.isCheckout ? COLOURS.checkout : textColourForRing(ring.key, index)}
                    style={{
                      paintOrder: "stroke",
                      stroke: shot.isCheckout
                        ? COLOURS.checkoutStroke
                        : ring.key.includes("single")
                          ? "transparent"
                          : "rgba(0,0,0,0.2)",
                      strokeWidth: shot.isCheckout ? 5 : 2,
                      pointerEvents: "none",
                    }}
                  >
                    {shot.text}
                  </text>
                )}
              </g>
            );
          })
        )}

        <g onClick={() => onHit(25, false)} style={{ cursor: getShotResult(score, 25, false).isBust ? "default" : "pointer" }}>
          <circle cx={cx} cy={cy} r={board.outerBull} fill={COLOURS.green} stroke={COLOURS.wire} strokeWidth="2" />
          {!getShotResult(score, 25, false).isBust && (
            <text
              x={cx}
              y={cy - 54}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={boardValueFontSize}
              fontWeight="800"
              fill="white"
              style={{ pointerEvents: "none" }}
            >
              {getShotResult(score, 25, false).text}
            </text>
          )}
        </g>

        <g onClick={() => onHit(50, true)} style={{ cursor: getShotResult(score, 50, true).isBust ? "default" : "pointer" }}>
          <circle cx={cx} cy={cy} r={board.innerBull} fill={COLOURS.red} stroke={COLOURS.wire} strokeWidth="2" />
          {!getShotResult(score, 50, true).isBust && (
            <text
              x={cx}
              y={cy + 1}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={boardValueFontSize}
              fontWeight="800"
              fill={getShotResult(score, 50, true).isCheckout ? COLOURS.checkout : "white"}
              style={{
                pointerEvents: "none",
                paintOrder: "stroke",
                stroke: getShotResult(score, 50, true).isCheckout ? COLOURS.checkoutStroke : "transparent",
                strokeWidth: getShotResult(score, 50, true).isCheckout ? 5 : 0,
              }}
            >
              {getShotResult(score, 50, true).text}
            </text>
          )}
        </g>
      </svg>
    </div>
  );
}

export default function App() {
  const [scoreInput, setScoreInput] = useState("62");
  const [selectedRange, setSelectedRange] = useState("61-70");

  const score = useMemo(() => {
    const parsed = Number.parseInt(scoreInput, 10);
    if (Number.isNaN(parsed)) return 0;
    return Math.max(0, Math.min(170, parsed));
  }, [scoreInput]);

  function chooseRandomTarget() {
    const range = TARGET_RANGES.find((item) => item.label === selectedRange) || TARGET_RANGES[0];
    const randomScore = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
    setScoreInput(String(randomScore));
  }

  function handleHit(hitValue, canCheckout = false) {
    const nextScore = getRemainingScore(score, hitValue, canCheckout);
    setScoreInput(String(nextScore));
  }

  return (
    <main className="app-shell">
      <div className="phone-layout">
        <header className="controls">
          <div className="field score-field">
            <label htmlFor="score">Score</label>
            <input
              id="score"
              inputMode="numeric"
              value={scoreInput}
              onChange={(event) => setScoreInput(event.target.value.replace(/[^0-9]/g, ""))}
            />
          </div>

          <div className="field">
            <label htmlFor="range">Range</label>
            <select id="range" value={selectedRange} onChange={(event) => setSelectedRange(event.target.value)}>
              {TARGET_RANGES.map((range) => (
                <option key={range.label} value={range.label}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>

          <button className="random-button" onClick={chooseRandomTarget} aria-label="Choose random target">
            <Shuffle size={18} strokeWidth={3} />
          </button>
        </header>

        <section className="board-section">
          <Dartboard score={score} onHit={handleHit} />
        </section>
      </div>
    </main>
  );
}
