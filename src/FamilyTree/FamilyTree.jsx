// import module styles
import "./FamilyTree.module.css";

// import moment.js
import duration from "moment";

// React imports
import { useState, useEffect, useRef, React } from "react";

// D3 imports
import { csv, timeParse, scaleLinear, extent, select, axisLeft } from "d3";

// define constants
const width = window.innerWidth < 768 ? "100%" : 550;
const margin = { top: 5, right: 10, bottom: 5, left: 10 };
const innerWidth = width - margin.left - margin.right;
const padding = 1;
const height = 500;

const dataUrl =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSkJC69ibvZ11GazByREhQ9O7ULwgZs6yeMW01VjTFv8FmBC8iVNeyA-JoQl2uxQSU6wuZ5Q-vyQcD-/pub?gid=0&single=true&output=csv";

function YogurtItem({ props }) {
  // function to convert each row in the data to a component
  // output should be a div
  return (
    <div class="yogurtItem">
      <img src="../../public/yogurtContainer.png" alt="A container of yogurt" />
      <p class="yogurtName">{yogurtName}</p>
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

  const timeScale = scaleLinear()
    .domain(extent(data.map((d) => d.Date)))
    .range([0, height]);

  svg.append("g").call(axisLeft(timeScale));

  return (
    <>
      <p>fff</p>
      <svg ref={treeRef} width={innerWidth} height={height} />
    </>
  );
}

export default FamilyTree;
