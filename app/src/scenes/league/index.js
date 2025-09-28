import React from "react";
import { Route, Routes } from "react-router-dom";
import Rules from "./rules";
import Clans from "./clans";
import Users from "../users";
import Calendar from "./calendar";
import Results from "./results";
import Stats from "./stats";
import Votes from "./votes";

const League = () => {
  return (
    <Routes>
      <Route path="/rules/*" element={<Rules />} />
      <Route path="/clans/*" element={<Clans />} />
      <Route path="/users/*" element={<Users />} />
      <Route path="/calendar/*" element={<Calendar />} />
      <Route path="/results/*" element={<Results />} />
      <Route path="/stats/*" element={<Stats />} />
      <Route path="/votes/*" element={<Votes />} />
      <Route path="/*" index element={<Users />} />
    </Routes>
  );
};

export default League;
