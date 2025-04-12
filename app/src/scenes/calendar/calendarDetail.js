import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import Modal from "../../components/Modal";
import Loader from "../../components/Loader";
import { useSelector } from "react-redux";
const localizer = momentLocalizer(moment);

const CalendarDetail = (props) => {
  const [filters, setFilters] = useState({
    startDate: moment().startOf("month").toDate(),
    endDate: moment().endOf("month").toDate(),
  });
  const [isCalendarLoading, setIsCalendarLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: "",
    startDate: "",
    endDate: "",
  });

  const navigate = useNavigate();

  const realUser = useSelector((state) => state.Auth.user);

  const getEvents = async () => {
    setIsCalendarLoading(true);
    const resEvents = await API.post("/event/search", {
      startDate: filters.startDate,
      endDate: filters.endDate,
    });

    if (!resEvents.ok) {
      toast.error(resEvents.message);
      return;
    }

    setEvents(resEvents.data);
    setIsCalendarLoading(false);
  };

  useEffect(() => {
    getEvents();
  }, [filters.startDate, filters.endDate]);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    const resEvent = await API.post("/event", {
      ...newEvent,
    });

    if (!resEvent.ok) {
      toast.error(resEvent.message);
      return;
    }

    setIsModalOpen(false);
    navigate(`/calendar/${resEvent.data._id}`);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event.event);
    setIsModalOpen(true);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-center">Calendar</h1>
      <div className="space-x-2">
        {realUser?.role === "ADMIN" && (
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => setIsModalOpen(true)}
          >
            Create Event
          </button>
        )}
      </div>

      <div className="flex justify-center items-center relative w-full h-[600px]">
        <Calendar
          localizer={localizer}
          events={events.map((event) => ({
            title: event.title,
            start: new Date(event.startDate),
            end: new Date(event.endDate),
            event: event,
          }))}
          startAccessor="start"
          endAccessor="end"
          min={new Date(1970, 1, 1, 12, 0)} // Start at 12 PM
          max={new Date(1970, 1, 1, 23, 0)} // End at 11 PM
          onSelectEvent={handleEventClick}
          onRangeChange={(range) => {
            if (Array.isArray(range)) {
              if (range.length > 0) {
                const sortedDates = [...range].sort((a, b) => a - b);
                let startDate = sortedDates[0];
                let endDate = sortedDates[sortedDates.length - 1];

                // Set startDate to 00:00
                startDate = new Date(startDate);
                startDate.setHours(0, 0, 0, 0);

                // Set endDate to 23:59
                endDate = new Date(endDate);
                endDate.setHours(23, 59, 59, 999);

                setFilters({ startDate, endDate });
              }
            }
          }}
          defaultView={Views.WEEK}
          views={[Views.WEEK, Views.DAY]}
          style={{ height: "100%", width: "100%" }}
        />
        {isCalendarLoading && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Loader />
          </div>
        )}
      </div>

      {/* Event Details Modal */}
      <Modal
        isOpen={isModalOpen && selectedEvent}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEvent(null);
        }}
        title={selectedEvent?.title}
      >
        {selectedEvent && (
          <div className="space-y-4">
            <div>
              <h3 className="font-bold">Clans</h3>
              <p>
                {selectedEvent.clanAName} vs {selectedEvent.clanBName}
              </p>
            </div>
            <div>
              <h3 className="font-bold">Time</h3>
              <p>
                {moment(selectedEvent.startDate).format("MMMM Do YYYY, h:mm a")}{" "}
                - {moment(selectedEvent.endDate).format("h:mm a")}
              </p>
            </div>
            {selectedEvent.twitch && (
              <div>
                <h3 className="font-bold">Stream</h3>
                <a
                  href={selectedEvent.twitch}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-purple-600 hover:text-purple-800"
                >
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Twitch_logo.svg/1200px-Twitch_logo.svg.png"
                    alt="Twitch"
                    className="w-6 h-6"
                  />
                  <span>Watch on Twitch</span>
                </a>
              </div>
            )}
            {realUser?.role === "ADMIN" && (
              <div className="flex justify-end mt-4">
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  onClick={() => {
                    setIsModalOpen(false);
                    navigate(`/calendar/${selectedEvent._id}`);
                  }}
                >
                  Edit Event
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Create Event Modal */}
      <Modal
        isOpen={isModalOpen && !selectedEvent}
        onClose={() => setIsModalOpen(false)}
        title="Create New Event"
      >
        <form onSubmit={handleCreateEvent}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Title
            </label>
            <input
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={newEvent.title}
              onChange={(e) =>
                setNewEvent({ ...newEvent, title: e.target.value })
              }
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Start Date
            </label>
            <input
              type="datetime-local"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={newEvent.startDate}
              onChange={(e) =>
                setNewEvent({ ...newEvent, startDate: e.target.value })
              }
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              End Date
            </label>
            <input
              type="datetime-local"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={newEvent.endDate}
              onChange={(e) =>
                setNewEvent({ ...newEvent, endDate: e.target.value })
              }
              required
            />
          </div>
          <div className="flex items-center justify-end">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Create
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CalendarDetail;
