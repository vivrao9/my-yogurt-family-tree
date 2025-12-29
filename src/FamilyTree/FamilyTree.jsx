import styles from "./FamilyTree.module.css";
import { useState, useEffect, useRef } from "react";

import {
  csv,
  timeParse,
  stratify as d3Stratify,
  tree,
  scaleLinear,
  extent,
  axisLeft,
  timeFormat,
  select,
  timeMonth,
  timeDay
} from "d3";

const width = window.innerWidth < 768 ? 375 : 550;
const margin = { top: 24, right: 12, bottom: 24, left: 60 };
const innerWidth = width - margin.left - margin.right;

const dataUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSkJC69ibvZ11GazByREhQ9O7ULwgZs6yeMW01VjTFv8FmBC8iVNeyA-JoQl2uxQSU6wuZ5Q-vyQcD-/pub?gid=0&single=true&output=csv";
const ROOT_ID = "__ROOT__";

function FamilyTree() {
  const [data, setData] = useState(null);
  const axisRef = useRef(null);

  const parseDate = timeParse("%m-%d-%Y");

  // ---- DATA LOAD (always runs) ----
  useEffect(() => {
    csv(dataUrl, d => ({
      Name: d.Name?.trim(),
      Parent: d.Parent?.trim() || null,
      Date: parseDate(d.Date),
    })).then(raw => {
      const ids = new Set(raw.map(d => d.Name));

      setData([
        { Name: ROOT_ID, Parent: null, Date: null },
        ...raw.map(d => ({
          ...d,
          Parent: ids.has(d.Parent) ? d.Parent : ROOT_ID,
        })),
      ]);
    });
  }, []);

  // ---- SCALE (defined even when data is null) ----
  const height = data ? 66 * data.length : 480;

  const timeScale = scaleLinear()
    .domain(
      data
        ? extent(data.filter(d => d.Date), d => d.Date)
        : [0, 1]
    )
    .range([margin.top, height - margin.bottom]);

const [minDate, maxDate] = timeScale.domain();

// Generate monthly boundaries
const months = timeMonth.range(
  timeMonth.floor(minDate),
  timeMonth.ceil(maxDate)
);

// Create tick dates: 15th and 30th of each month
const tickDates = months.flatMap(m => {
  const first = new Date(m.getFullYear(), m.getMonth(), 1);
  const fifteenth = new Date(m.getFullYear(), m.getMonth(), 15);

  return [first, fifteenth].filter(
    d => d >= minDate && d <= maxDate
  );
});

  // ---- AXIS (always registered) ----
useEffect(() => {
  if (!data) return;

  const axis = axisLeft(timeScale)
    .tickValues(tickDates)
    .tickFormat(timeFormat("%b %d"));

  select(axisRef.current)
    .call(axis)
    .call(g => g.select(".domain").remove());
}, [data, timeScale]);


  // ---- SAFE EARLY RENDER ----
  if (!data) {
    return <div>Loading…</div>;
  }

  const BASE_X = margin.left;
  const INDENT = 16; // pixels per level (tweak to taste)

  // ---- HIERARCHY ----
  const stratifier = d3Stratify()
    .id(d => d.Name)
    .parentId(d => d.Parent);

  const root = stratifier(data);
  tree().nodeSize([0, 0])(root);

  const nodes = root
    .descendants()
    .filter(d => d.id !== ROOT_ID)
    .map(d => ({
      ...d,
      x: BASE_X + d.depth * INDENT,
      y: timeScale(d.data.Date),
    }));

  const links = root
    .links()
    .filter(l => l.source.id !== ROOT_ID)
    .map(l => ({
      source: {
        x: BASE_X + l.source.depth * INDENT,
        y: timeScale(l.source.data.Date),
      },
      target: {
        x: BASE_X + l.target.depth * INDENT,
        y: timeScale(l.target.data.Date),
      },
    }));

  return (
    <svg width={width} height={height}>
      <defs>
        <marker
          id="arrow"
          viewBox="0 -5 10 10"
          refX="5"
          refY="0"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M0,-5L10,0L0,5" fill="black" />
        </marker>
      </defs>

      <g ref={axisRef} transform={`translate(${margin.left - 10},0)`} />

      <g>
        {links.map((l, i) => (
          <line
            key={i}
            x1={l.source.x}
            y1={l.source.y}
            x2={l.target.x}
            y2={l.target.y}
            stroke="black"
            markerEnd="url(#arrow)"
          />
        ))}
      </g>

      <g>
        {nodes.map((n, i) => (
          <text
            key={i}
            x={n.x + 6}
            y={n.y}
            dominantBaseline="middle"
            fontSize={12}
          >
            {n.data.Name}
          </text>
        ))}
      </g>
    </svg>
  );
}

export default FamilyTree;
