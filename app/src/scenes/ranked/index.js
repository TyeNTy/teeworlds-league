import React from "react";
import { Route, Routes } from "react-router-dom";
import Users from "../users";

const Ranked = () => {
  return (
    <Routes>
      <Route path="" element={<Users />} />
    </Routes>
  );
};

export default Ranked;
