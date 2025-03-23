import React from "react";
import { Route, Routes } from "react-router-dom";
import LeagueSeason1 from "./leagueSeason1";
import LeagueSeason2 from "./leagueSeason2";
import { useSelector } from "react-redux";

const Rules = () => {
  return (
    <Routes>
      <Route path="/leagueSeason1" element={<LeagueSeason1 />} />
      <Route path="/leagueSeason2" element={<LeagueSeason2 />} />
    </Routes>
  );
};

export default Rules;
