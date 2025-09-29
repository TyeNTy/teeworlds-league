import React from "react";
import { Route, Routes } from "react-router-dom";
import Users from "../users";
import TopBarRanked from "../../components/TopBarRanked";
import FooterRanked from "../../components/FooterRanked";
import Queues from "./queues";
import ResultsRanked from "./resultsRanked";
import StatsRanked from "./statsRanked";

const Ranked = () => {
  return (
    <div className="flex flex-1">
    <div className="flex min-h-screen w-full flex-col">
      <TopBarRanked />
      <div className="flex-1">
        <Routes>
          <Route path="/users/*" element={<Users />} />
          <Route path="/queues/*" element={<Queues />} />
          <Route path="/results/*" element={<ResultsRanked />} />
          <Route path="/stats/*" element={<StatsRanked />} />
          <Route path="" element={<Users />} />
        </Routes>
      </div>
      <FooterRanked />
    </div>
  </div>
  );
};

export default Ranked;
