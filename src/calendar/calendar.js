import React, { useState, useEffect, useCallback } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Modal,
  Form,
  DatePicker,
  Upload,
  message,
  Avatar,
  Tag,
} from "antd";
import {
  UploadOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import moment from "moment";
import "moment/locale/es";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../App.css";
import logo from "../img/BCS_2.png";
import {
  isAuthenticated,
  hasRole,
  logout,
  getUserId,
  getUser,
} from "../utils/auth";

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
  const [authenticated, setAuthenticated] = useState(false);
  const [isEmployee, setIsEmployee] = useState(false);
  const [isJustificanteModalVisible, setIsJustificanteModalVisible] =
    useState(false);
  const [justificanteForm] = Form.useForm();
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      const auth = isAuthenticated();
      setAuthenticated(auth);
      setIsEmployee(hasRole("empleado"));
      // Obtener información del usuario
      const user = getUser();
      if (user) {
        setUserInfo(user);
      }
    };
    checkAuth();
    // Escuchar cambios en el localStorage
    const handleStorageChange = () => {
      checkAuth();
    };
    window.addEventListener("storage", handleStorageChange);
    // También verificar cuando el componente recibe foco
    window.addEventListener("focus", checkAuth);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", checkAuth);
    };
  }, []);

  // Función para cargar eventos y justificantes
  const loadEvents = useCallback(async () => {
    try {
      // Cargar eventos normales
      const eventsResponse = await fetch("http://127.0.0.1:8000/api/events");
      const eventsData = await eventsResponse.json();
      const mappedEvents = eventsData.map((event) => ({
        id: event.id,
        title: event.title,
        start: moment(event.start_date).toDate(),
        end: moment(event.end_date).toDate(),
        description: event.description,
        type: "evento",
      }));

      // Si el usuario es empleado, cargar sus justificantes
      if (isEmployee) {
        const userId = getUserId();
        if (userId) {
          const token = localStorage.getItem("token");
          const justificantesResponse = await fetch(
            `http://127.0.0.1:8000/api/empleados/${userId}/justificantes`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (justificantesResponse.ok) {
            const justificantesData = await justificantesResponse.json();
            const mappedJustificantes = justificantesData.map(
              (justificante) => ({
                id: `justificante_${justificante.id}`,
                title: `Justificante - ${justificante.estatus}`,
                start: moment(justificante.dia_justificar)
                  .startOf("day")
                  .toDate(),
                end: moment(justificante.dia_justificar).endOf("day").toDate(),
                description: `Estatus: ${justificante.estatus}${
                  justificante.documento ? " - Con documento" : ""
                }`,
                type: "justificante",
                estatus: justificante.estatus,
                justificanteId: justificante.id,
              })
            );

            // Combinar eventos y justificantes
            setEvents([...mappedEvents, ...mappedJustificantes]);
          } else {
            // Si falla la carga de justificantes, solo mostrar eventos
            setEvents(mappedEvents);
          }
        } else {
          setEvents(mappedEvents);
        }
      } else {
        // Si no es empleado, solo mostrar eventos
        setEvents(mappedEvents);
      }
    } catch (error) {
      console.error("Error al cargar los eventos:", error);
    }
  }, [isEmployee]);

  // Obtener y mapear los eventos de la API
  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Función para personalizar el estilo de cada evento
  const eventStyleGetter = (event) => {
    let color;

    // Si es un justificante, usar colores según el estatus
    if (event.type === "justificante") {
      switch (event.estatus) {
        case "aprobado":
          color = "#4caf50"; // Verde
          break;
        case "rechazado":
          color = "#f44336"; // Rojo
          break;
        case "pendiente":
        default:
          color = "#ff9800"; // Naranja
          break;
      }
    } else {
      // Para eventos normales, usar colores alternados
      color = event.id % 2 === 0 ? "#2196F3" : "#9C27B0";
    }

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

  // Maneja el cierre de sesión
  const handleLogout = () => {
    logout();
    setAuthenticated(false);
    setIsEmployee(false);
    navigate("/login");
  };

  // Maneja el clic en agregar justificante
  const handleAddJustificante = () => {
    setIsJustificanteModalVisible(true);
    justificanteForm.resetFields();
  };

  // Maneja el envío del formulario de justificante
  const handleJustificanteSubmit = async (values) => {
    try {
      const userId = getUserId();
      console.log("User ID obtenido:", userId);
      console.log("Valores del formulario:", values);

      if (!userId) {
        message.error(
          "No se pudo obtener el ID del usuario. Por favor, inicia sesión nuevamente."
        );
        console.error("No se encontró user_id en localStorage");
        return;
      }

      // Validar que se haya seleccionado una fecha
      if (!values.dia_justificar) {
        message.error("Por favor selecciona el día a justificar");
        return;
      }

      const formData = new FormData();
      formData.append("user_id", userId.toString());
      formData.append(
        "dia_justificar",
        moment(values.dia_justificar).format("YYYY-MM-DD")
      );
      formData.append("estatus", "pendiente");

      // Manejar el archivo si existe
      if (
        values.documento &&
        values.documento.fileList &&
        values.documento.fileList.length > 0
      ) {
        const file =
          values.documento.fileList[0].originFileObj ||
          values.documento.fileList[0];
        if (file) {
          formData.append("documento", file);
          console.log("Archivo agregado:", file.name, file.type, file.size);
        }
      }

      // Verificar contenido del FormData (solo para debug)
      console.log("FormData contenido:");
      for (let pair of formData.entries()) {
        console.log(
          pair[0] +
            ": " +
            (pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1])
        );
      }

      const token = localStorage.getItem("token");
      if (!token) {
        message.error("No se encontró el token de autenticación");
        return;
      }

      const response = await fetch("http://127.0.0.1:8000/api/justificantes", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // NO incluir Content-Type, el navegador lo establece automáticamente con el boundary correcto para FormData
        },
        body: formData,
      });

      const responseData = await response.json();
      console.log("Respuesta del servidor:", responseData);

      if (response.ok) {
        message.success("Justificante agregado exitosamente");
        setIsJustificanteModalVisible(false);
        justificanteForm.resetFields();
        // Recargar eventos para mostrar el nuevo justificante
        await loadEvents();
      } else {
        // Manejar errores de validación de Laravel
        if (responseData.errors) {
          const errorMessages = Object.values(responseData.errors)
            .flat()
            .join(", ");
          message.error(`Error de validación: ${errorMessages}`);
        } else if (responseData.message) {
          message.error(responseData.message);
        } else {
          message.error("Error al agregar el justificante");
        }
        console.error("Error del servidor:", responseData);
      }
    } catch (error) {
      console.error("Error:", error);
      message.error("Error al conectar con el servidor. Verifica tu conexión.");
    }
  };

  // Configuración del componente Upload
  const uploadProps = {
    beforeUpload: (file) => {
      // Validar tipo de archivo
      const validTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/jpg",
        "image/png",
      ];

      // También validar por extensión por si el tipo MIME no está disponible
      const validExtensions = [
        ".pdf",
        ".doc",
        ".docx",
        ".jpg",
        ".jpeg",
        ".png",
      ];
      const fileExtension = "." + file.name.split(".").pop().toLowerCase();

      const isValidType =
        validTypes.includes(file.type) ||
        validExtensions.includes(fileExtension);

      if (!isValidType) {
        message.error(
          "Solo se permiten archivos PDF, DOC, DOCX, JPG, JPEG o PNG"
        );
        return Upload.LIST_IGNORE;
      }

      // Validar tamaño (10MB = 10240 KB)
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error("El archivo debe ser menor a 10MB");
        return Upload.LIST_IGNORE;
      }

      return false; // Prevenir subida automática, se subirá con el formulario
    },
    maxCount: 1,
    accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png",
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
          marginBottom: "30px",
          backgroundColor: "white",
          padding: "20px 30px",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
          borderBottom: "3px solid #ff9800",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            flex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "60px",
              height: "60px",
              backgroundColor: "#f5f5f5",
              borderRadius: "10px",
              padding: "8px",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            }}
          >
            <img
              src={logo}
              alt="Logo"
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
          </div>
          <div>
            <h1
              style={{
                margin: 0,
                color: "#1a1a1a",
                fontSize: "28px",
                fontWeight: "600",
                letterSpacing: "-0.5px",
                lineHeight: "1.2",
              }}
            >
              Calendario de Faltas
            </h1>
            <p
              style={{
                margin: "4px 0 0 0",
                color: "#666",
                fontSize: "14px",
                fontWeight: "400",
              }}
            >
              Gestión de justificantes y eventos
            </p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {authenticated && isEmployee && (
            <Button
              type="primary"
              onClick={handleAddJustificante}
              style={{
                height: "40px",
                padding: "0 20px",
                fontSize: "14px",
                fontWeight: "500",
                backgroundColor: "#2196F3",
                borderColor: "#2196F3",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(33, 150, 243, 0.3)",
              }}
            >
              Agregar Justificante
            </Button>
          )}
          {authenticated && userInfo && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 15px",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
                border: "1px solid #e0e0e0",
              }}
            >
              <Avatar
                size={36}
                icon={<UserOutlined />}
                style={{
                  backgroundColor: "#ff9800",
                }}
              />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                  flex: 1,
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#1a1a1a",
                    lineHeight: "1.2",
                  }}
                >
                  {userInfo.name ||
                    userInfo.nombre ||
                    userInfo.nombre_empleado ||
                    userInfo.email ||
                    "Usuario"}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{ fontSize: "11px", color: "#666" }}>
                    ID:{" "}
                    {userInfo.id ||
                      userInfo.user_id ||
                      userInfo.empleado_id ||
                      "N/A"}
                  </span>
                  {userInfo.institucion && (
                    <>
                      <span style={{ fontSize: "11px", color: "#ccc" }}>•</span>
                      <span style={{ fontSize: "11px", color: "#666" }}>
                        {userInfo.institucion}
                      </span>
                    </>
                  )}
                  {userInfo.roles && userInfo.roles.length > 0 && (
                    <>
                      <span style={{ fontSize: "11px", color: "#ccc" }}>•</span>
                      <span style={{ fontSize: "11px", color: "#666" }}>
                        {userInfo.roles[0].charAt(0).toUpperCase() +
                          userInfo.roles[0].slice(1)}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <Button
                icon={<LogoutOutlined />}
                onClick={handleLogout}
                size="small"
                style={{
                  height: "28px",
                  padding: "0 12px",
                  fontSize: "12px",
                  backgroundColor: "#f44336",
                  borderColor: "#f44336",
                  color: "white",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              />
            </div>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {authenticated ? (
            <>
              {!isEmployee && (
                <Button
                  type="primary"
                  onClick={() => navigate("/dashboard")}
                  style={{
                    height: "40px",
                    padding: "0 20px",
                    fontSize: "14px",
                    fontWeight: "500",
                    backgroundColor: "#4CAF50",
                    borderColor: "#4CAF50",
                    borderRadius: "8px",
                    boxShadow: "0 2px 4px rgba(76, 175, 80, 0.3)",
                  }}
                >
                  Dashboard
                </Button>
              )}
            </>
          ) : (
            <Button
              type="primary"
              onClick={() => navigate("/login")}
              style={{
                height: "40px",
                padding: "0 24px",
                fontSize: "14px",
                fontWeight: "500",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(33, 150, 243, 0.3)",
              }}
            >
              Iniciar Sesión
            </Button>
          )}
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

      {/* Modal para agregar justificante */}
      <Modal
        title="Agregar Justificante"
        open={isJustificanteModalVisible}
        onCancel={() => {
          setIsJustificanteModalVisible(false);
          justificanteForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={justificanteForm}
          onFinish={handleJustificanteSubmit}
          layout="vertical"
        >
          <Form.Item
            name="dia_justificar"
            label="Día a Justificar"
            rules={[
              {
                required: true,
                message: "Por favor selecciona el día a justificar",
              },
            ]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="YYYY-MM-DD"
              placeholder="Selecciona el día"
            />
          </Form.Item>

          <Form.Item
            name="documento"
            label="Documento (Opcional)"
            extra="Formatos permitidos: PDF, DOC, DOCX, JPG, JPEG, PNG. Tamaño máximo: 10MB"
          >
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>Seleccionar archivo</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{
                backgroundColor: "#4CAF50",
                borderColor: "#4CAF50",
                marginRight: "10px",
              }}
            >
              Enviar Justificante
            </Button>
            <Button
              onClick={() => {
                setIsJustificanteModalVisible(false);
                justificanteForm.resetFields();
              }}
            >
              Cancelar
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CalendarComponent;
