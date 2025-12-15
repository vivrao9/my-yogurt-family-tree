import React from "react";
import ReactDOM from "react-dom/client";
import FamilyTree from "./FamilyTree/FamilyTree.jsx";
import "./style.css";

ReactDOM.createRoot(document.getElementById("tree")).render(
  <React.StrictMode>
    <FamilyTree />
  </React.StrictMode>,
);
