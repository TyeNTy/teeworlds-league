import React from "react";
import { Route, Routes } from "react-router-dom";
import League from "./league";

const Rules = () => {
  return (
    <Routes>
      <Route path="/league" element={<League />} />
    </Routes>
  );
};

export default Rules;
