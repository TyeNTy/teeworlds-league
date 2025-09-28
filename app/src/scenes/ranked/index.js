import React from "react";
import { Route, Routes } from "react-router-dom";
import Users from "../users";
import TopBarRanked from "../../components/TopBarRanked";
import Footer from "../../components/Footer";
import Clans from "../clans";

const Ranked = () => {
  return (
    <div className="flex flex-1">
    <div className="flex min-h-screen w-full flex-col">
      <TopBarRanked />
      <div className="flex-1">
        <Routes>
          <Route path="/users/*" element={<Users />} />
          <Route path="/clans/*" element={<Clans />} />
          <Route path="" element={<Users />} />
        </Routes>
      </div>
      <Footer />
    </div>
  </div>
  );
};

export default Ranked;
