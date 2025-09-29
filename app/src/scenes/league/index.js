import React from "react";
import { Route, Routes } from "react-router-dom";
import Rules from "./rules";
import Clans from "../clans";
import Users from "../users";
import Calendar from "./calendar";
import Results from "./results";
import Stats from "./stats";
import Votes from "./votes";
import TopBarLeague from "../../components/TopBarLeague";
import Footer from "../../components/Footer";

const League = () => {
  return (
    <div className="flex flex-1">
    <div className="flex min-h-screen w-full flex-col">
      <TopBarLeague />
      <div className="flex-1">
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
      </div>
      <Footer />
    </div>
  </div>
  );
};

export default League;
