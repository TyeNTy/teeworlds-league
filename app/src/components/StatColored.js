import React from "react";
import { useNavigate } from "react-router-dom";

function interpolateColor(minVal, maxVal, val) {
  const ratio = (val - minVal) / (maxVal - minVal);
  const r = Math.round((1 - ratio) * 255);
  const g = Math.round(ratio * 255);
  return `rgb(${r}, ${g}, 0)`;
}

const StatColored = ({ min, max, value }) => {
  const color = interpolateColor(min, max, value);
  return <div style={{ color }}>{value}</div>;
};

export default StatColored;
