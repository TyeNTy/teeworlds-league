import React from "react";
import { Route, Routes } from "react-router-dom";

import Detail from "./detail";
import List from "./list";

const Votes = () => {
    return (
        <Routes>
            <Route path="/:id" element={<Detail />} />
            <Route path="" element={<List />} />
        </Routes>
    );
};

export default Votes; 