import React from "react";
import { Route, Routes } from "react-router-dom";

import Detail from "./detail";
import List from "./list";
import Profile from "./profile";

const Users = () => {
  return (
    <Routes>
      <Route path="/profile" element={<Profile />} />
      <Route path="/:userId" element={<Detail />} />
      <Route path="" element={<List />} />
    </Routes>
  );
};

export default Users;
