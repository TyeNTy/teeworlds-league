import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";

import "react-big-calendar/lib/css/react-big-calendar.css";

// Setup the localizer by providing the moment (or globalize, or Luxon) Object
// to the correct localizer.
const localizer = momentLocalizer(moment); // or globalizeLocalizer

// Example events for the calendar
const myEventsList = [
  {
    title: "Team Meeting",
    start: new Date(2025, 3, 7, 10, 0), // April 7, 2025, 10:00 AM
    end: new Date(2025, 3, 7, 11, 0), // April 7, 2025, 11:00 AM
  },
  {
    title: "Project Deadline",
    start: new Date(2025, 3, 7, 0, 0), // April 7, 2025, All Day
    end: new Date(2025, 3, 7, 23, 59),
  },
  {
    title: "Code Review",
    start: new Date(2025, 3, 7, 14, 0), // April 7, 2025, 2:00 PM
    end: new Date(2025, 3, 7, 15, 0), // April 7, 2025, 3:00 PM
  },
];

const MyCalendar = (props) => (
  <div className="myCustomHeight">
    <Calendar
      localizer={localizer}
      events={myEventsList}
      startAccessor="start"
      endAccessor="end"
      min={new Date(1970, 1, 1, 12, 0)} // Start at 12 PM
      max={new Date(1970, 1, 1, 23, 0)} // End at 11 PM
    />
  </div>
);

export default MyCalendar;
