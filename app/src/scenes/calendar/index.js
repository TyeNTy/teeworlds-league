import React from "react";
import { Route, Routes } from "react-router-dom";

import CalendarDetail from "./calendarDetail";
import Detail from "./detail";

const Calendar = () => {
  return (
    <Routes>
      <Route path="/:id" element={<Detail />} />
      <Route path="" element={<CalendarDetail />} />
    </Routes>
  );
};

export default Calendar;
