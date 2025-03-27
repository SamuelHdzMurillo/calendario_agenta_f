import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import { useNavigate } from "react-router-dom";
import { Button } from "antd";
import moment from "moment";
import "moment/locale/es";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../App.css";
import logo from "../img/BCS_2.png";

moment.locale("es");
const localizer = momentLocalizer(moment);

const messages = {
  date: "Fecha",
  time: "Hora",
  event: "Evento",
  allDay: "Todo el día",
  week: "Semana",
  work_week: "Semana laboral",
  day: "Día",
  month: "Mes",
  previous: "Anterior",
  next: "Siguiente",
  yesterday: "Ayer",
  tomorrow: "Mañana",
  today: "Hoy",
  agenda: "Agenda",
  noEventsInRange: "No hay eventos en este rango.",
  showMore: (total) => `+ Ver más (${total})`,
};

const EventComponent = ({ event }) => (
  <div>
    <strong>{event.title}</strong>
    <div style={{ fontSize: "0.8em" }}>
      {moment(event.start).format("HH:mm")} -{" "}
      {moment(event.end).format("HH:mm")}
    </div>
  </div>
);

const CalendarComponent = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [view, setView] = useState("month");
  const [date, setDate] = useState(new Date());
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setHasToken(!!token);
  }, []);

  // Obtener y mapear los eventos de la API
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/events")
      .then((response) => response.json())
      .then((data) => {
        console.log("API Response:", data); // Add this line to check the data
        const mappedEvents = data.map((event) => ({
          id: event.id,
          title: event.title,
          start: moment(event.start_date).toDate(),
          end: moment(event.end_date).toDate(),
          description: event.description,
        }));
        console.log("Mapped Events:", mappedEvents); // Add this line to check mapped events
        setEvents(mappedEvents);
      })
      .catch((error) => console.error("Error al cargar los eventos:", error));
  }, []);

  // Función para personalizar el estilo de cada evento
  const eventStyleGetter = (event) => {
    const color = event.id % 2 === 0 ? "#4caf50" : "#ff9800";
    const style = {
      backgroundColor: color,
      borderRadius: "5px",
      opacity: 0.9,
      color: "white",
      border: "none",
      padding: "2px 5px",
      fontSize: "0.85em",
    };
    return { style };
  };

  // Maneja el clic en un evento para mostrar sus detalles
  const handleSelectEvent = (event) => {
    alert(
      `Evento: ${event.title}\nHora: ${moment(event.start).format(
        "HH:mm"
      )} - ${moment(event.end).format("HH:mm")}\nDescripción: ${
        event.description || "Sin descripción"
      }`
    );
  };

  // Maneja el cambio de vista (Mes, Semana, Día, Agenda)
  const handleViewChange = (newView) => {
    setView(newView);
  };

  // Maneja la navegación (Hoy, Anterior, Siguiente)
  const handleNavigate = (newDate) => {
    setDate(newDate);
  };

  return (
    <div
      className="App"
      style={{ height: "100vh", padding: "20px", backgroundColor: "#f4f7fa" }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src={logo}
            alt="Logo"
            style={{ width: "40%", height: "50px", marginRight: "10px" }}
          />
          <h1
            style={{
              margin: 5,
              color: "#333",
              fontSize: "30px",
              fontWeight: "bold",
            }}
          >
            Calendario de Eventos
          </h1>
        </div>
        <div>
          {hasToken ? (
            <Button
              type="primary"
              onClick={() => navigate("/dashboard")}
              style={{
                marginRight: "10px",
                backgroundColor: "#4CAF50",
                borderColor: "#4CAF50",
              }}
            >
              Dashboard
            </Button>
          ) : null}
          <Button type="primary" onClick={() => navigate("/login")}>
            Iniciar Sesión
          </Button>
        </div>
      </header>

      <div
        style={{
          backgroundColor: "white",
          borderRadius: "10px",
          padding: "20px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "70vh" }}
          eventPropGetter={eventStyleGetter}
          messages={messages}
          components={{ event: EventComponent }}
          onSelectEvent={handleSelectEvent}
          view={view}
          onView={handleViewChange}
          onNavigate={handleNavigate}
          date={date}
          views={["month", "week", "day", "agenda"]}
          defaultView="month"
          showMultiDayTimes
          selectable
        />
      </div>
    </div>
  );
};

export default CalendarComponent;
