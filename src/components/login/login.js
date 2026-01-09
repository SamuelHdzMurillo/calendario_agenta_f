import React, { useState } from "react";
import { Form, Input, Button, Card, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import axios from "axios";
import logo from "../../img/BCS_2.png";
import bgImage from "../../img/sun-tornado.png";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();  // Add this line

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/login",
        values
      );
      if (response.data.token) {
        message.success("Login exitoso");
        localStorage.setItem("token", response.data.token);
        // Guardar información del usuario si viene en la respuesta
        if (response.data.user) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
        } else if (response.data.roles) {
          // Si los roles vienen directamente en la respuesta
          localStorage.setItem("user", JSON.stringify({ roles: response.data.roles }));
        }
        // Redirigir al calendario para que el usuario vea los cambios
        navigate("/");
      } else {
        message.error("Credenciales incorrectas");
      }
    } catch (error) {
      message.error("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: `#4158D0`,
        background: `url(${bgImage})`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Card style={{ width: 300, textAlign: "center" }}>
        <img
          src={logo}
          alt="Logo"
          style={{ width: "100px", marginBottom: "20px" }}
        />
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Por favor ingresa tu usuario" },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Usuario" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: "Por favor ingresa tu contraseña" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Contraseña"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ width: "100%" }}
            >
              Iniciar Sesión
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
