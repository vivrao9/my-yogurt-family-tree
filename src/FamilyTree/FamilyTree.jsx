// import module styles
import styles from "./FamilyTree.module.css";

// import moment.js
import duration from "moment";

// React imports
import { useState, useEffect, useRef, React } from "react";

// D3 imports
import {
  csv,
  timeParse,
  scaleLinear,
  extent,
  select,
  axisLeft,
  timeFormat,
} from "d3";

// define constants
const width = window.innerWidth < 768 ? 375 : 550;
const margin = { top: 24, right: 12, bottom: 24, left: 12 };
const innerWidth = width - margin.left - margin.right;
const padding = 1;
const height = 960;
// const innerHeight = height - margin.top - margin.bottom;

const dataUrl =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSkJC69ibvZ11GazByREhQ9O7ULwgZs6yeMW01VjTFv8FmBC8iVNeyA-JoQl2uxQSU6wuZ5Q-vyQcD-/pub?gid=0&single=true&output=csv";

function YogurtItem({ name, time, texture, date, quantity = 1 }) {
  // function to convert each row in the data to a component
  // output should be a div
  return (
    <div class="yogurtItem">
      <img src="../../public/yogurtContainer.png" alt="A container of yogurt" />
      <p class="yogurtName">{name}</p>
      <p class="texture">
        <span class="indicator" />
        {texture}/10
      </p>
    </div>
  );
}

// create function
function FamilyTree({ dataFile, color = "#9a00f9" }) {
  const [data, setData] = useState(null);
  const treeRef = useRef();

  const svg = select(treeRef.current)
    .append("svg")
    .attr("width", innerWidth)
    .attr("height", height);

  const fmtDates = timeParse("%m-%d-%Y");

  // from https://www.d3indepth.com/requests/#row-conversion
  function convertRow(d) {
    return {
      Date: fmtDates(d.Date),
      Name: d.Name,
      Parent: d.Parent,
      Time: duration(d.Time),
      Amount: parseInt(d.Amount),
      Flavor: d.Flavor,
      Texture: parseInt(d.Texture),
    };
  }

  useEffect(() => {
    csv(dataUrl, convertRow).then(function (data) {
      data = data.valueOf();
      // console.log(data)
      // console.log(data.map(d => d['Date']))
      // data = data.map(d => fmtDates(d['Date']))
      // data = data.map(d => duration(d['Time']))
      setData([...data]);
      console.log(data);
    });
  }, []);

  if (!data) {
    return <div className="data-loading">Loading in data...</div>;
  }

  const height_ = 60 * data.length;

  const timeScale = scaleLinear()
    .domain(extent(data.map((d) => d.Date)))
    .range([margin.top, height_ - margin.bottom]);

  const link = svg
    .append("g")
    .attr("fill", "none")
    .attr("stroke-width", 2)
    .selectAll("path")
    .data(data)
    .join("path")
    .attr("stroke", "#f9f9f9")
    .attr(
      "marker-end",
      (d) => `url(${new URL(`#yogurt-${d.Name}`, location)})`,
    );

  const yx = axisLeft(timeScale)
    .tickArguments([36, "w"])
    .tickFormat(timeFormat("%b %d"))
    .tickSize(-`${innerWidth + 240}`);

  const axis = svg
    .append("g")
    .attr(
      "transform",
      `translate(${margin.left - 4}, ${margin.top + 4 - margin.bottom})`,
    )
    .call(yx)
    .call((g) => g.select("path").remove())
    .call((g) =>
      g
        .selectAll("line")
        .attr("class", `${styles.gridlines}`)
        .attr("transform", `translate(-24,0)`),
    )
    .call((g) =>
      g
        .selectAll("text")
        .attr("dy", "-0.5rem")
        .attr("dx", "0.5rem")
        .attr("class", `${styles.axisLabels}`),
    );

  const yogurtPoints = svg
    .append("g")
    .selectAll()
    .data(data)
    .enter()
    .append("text")
    .text((d) => d.Name)
    .attr("name", (d) => "yogurt-" + d.Name)
    .attr("x", (d) => innerWidth / 2)
    .attr("y", (d) => timeScale(d.Date))
    .attr("className", `${styles.yogurtLabel}`);

  const lineageArrows = svg
    .append("g")
    .selectAll()
    .data(data)
    .enter()
    .append("div")
    .attr("className", `${styles.arrow}`)
    .attr("from", (d) => "yogurt-" + d.Parent)
    .attr("to", (d) => "yogurt-" + d.Name);

  return (
    <>
      <svg ref={treeRef} width={innerWidth} height={height_} />
    </>
  );
}

export default FamilyTree;
