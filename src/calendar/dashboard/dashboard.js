import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, Space, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import moment from 'moment';

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingEvent, setEditingEvent] = useState(null);

  const fetchEvents = () => {
    fetch('http://127.0.0.1:8000/api/events')
      .then(response => response.json())
      .then(data => setEvents(data))
      .catch(error => console.error('Error fetching events:', error));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const columns = [
    {
      title: 'Título',
      dataIndex: 'title',
      key: 'title',
      filterSearch: true,
      filters: [
        ...new Set(events.map(event => event.title))
      ].map(title => ({ text: title, value: title })),
      onFilter: (value, record) => record.title.indexOf(value) === 0,
    },
    {
      title: 'Descripción',
      dataIndex: 'description',
      key: 'description',
      filterSearch: true,
      filters: [
        ...new Set(events.map(event => event.description))
      ].map(desc => ({ text: desc, value: desc })),
      onFilter: (value, record) => record.description?.indexOf(value) === 0,
    },
    {
      title: 'Fecha de Inicio',
      dataIndex: 'start_date',
      key: 'start_date',
      render: (text) => moment(text).format('YYYY-MM-DD HH:mm'),
      sorter: (a, b) => moment(b.start_date).valueOf() - moment(a.start_date).valueOf(),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Fecha de Fin',
      dataIndex: 'end_date',
      key: 'end_date',
      render: (text) => moment(text).format('YYYY-MM-DD HH:mm'),
      sorter: (a, b) => moment(b.end_date).valueOf() - moment(a.end_date).valueOf(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            style={{ 
              backgroundColor: '#4CAF50',
              borderColor: '#4CAF50'
            }}
          />
          <Button 
            danger 
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            style={{ 
              backgroundColor: '#FF9800',
              borderColor: '#FF9800',
              color: 'white'
            }}
          />
        </Space>
      ),
    },
  ];

  const handleEdit = (event) => {
    setEditingEvent(event);
    form.setFieldsValue({
      title: event.title,
      description: event.description,
      dates: [moment(event.start_date), moment(event.end_date)],
    });
    setIsModalVisible(true);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: '¿Estás seguro que deseas eliminar este evento?',
      onOk: () => {
        return new Promise((resolve, reject) => {
          fetch(`http://127.0.0.1:8000/api/events/${id}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
          })
          .then(response => {
            if (response.ok || response.status === 204) {
              message.success('Evento eliminado exitosamente');
              fetchEvents();
              resolve();
            } else {
              throw new Error('Error al eliminar');
            }
          })
          .catch(error => {
            console.error('Error:', error);
            message.error('Error al eliminar el evento');
            reject();
          });
        });
      },
      okText: 'Sí',
      cancelText: 'No',
      okButtonProps: {
        style: { backgroundColor: '#FF9800', borderColor: '#FF9800' }
      },
      centered: true,
      maskClosable: false
    });
  };

  const handleSubmit = async (values) => {
    const eventData = {
      title: values.title,
      description: values.description,
      start_date: values.dates[0].format('YYYY-MM-DD HH:mm:ss'),
      end_date: values.dates[1].format('YYYY-MM-DD HH:mm:ss'),
    };

    try {
      const url = editingEvent
        ? `http://127.0.0.1:8000/api/events/${editingEvent.id}`
        : 'http://127.0.0.1:8000/api/events';
      const method = editingEvent ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        message.success(`Evento ${editingEvent ? 'actualizado' : 'creado'} exitosamente`);
        setIsModalVisible(false);
        form.resetFields();
        setEditingEvent(null);
        fetchEvents();
      }
    } catch (error) {
      message.error('Error al guardar el evento');
    }
  };

  return (
    <div style={{ padding: 24, background: '#f5f5f5' }}>
      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingEvent(null);
            form.resetFields();
            setIsModalVisible(true);
          }}
          style={{ 
            backgroundColor: '#4CAF50',
            borderColor: '#4CAF50'
          }}
        >
          Agregar Evento
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={events}
        rowKey="id"
        pagination={{ 
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} eventos`
        }}
        style={{ 
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
        onChange={(pagination, filters, sorter) => {
          console.log('Table params:', { pagination, filters, sorter });
        }}
      />

      <Modal
        title={editingEvent ? 'Editar Evento' : 'Crear Evento'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingEvent(null);
        }}
        footer={null}
        bodyStyle={{ backgroundColor: '#fff' }}
      >
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
        >
          <Form.Item
            name="title"
            label="Título"
            rules={[{ required: true, message: '¡Por favor ingresa el título!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Descripción"
          >
            <Input.TextArea />
          </Form.Item>

          <Form.Item
            name="dates"
            label="Fechas del Evento"
            rules={[{ required: true, message: '¡Por favor selecciona las fechas!' }]}
          >
            <DatePicker.RangePicker
              showTime
              format="YYYY-MM-DD HH:mm"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit"
              style={{ 
                backgroundColor: '#4CAF50',
                borderColor: '#4CAF50'
              }}
            >
              {editingEvent ? 'Actualizar' : 'Crear'}
            </Button>
            <Button 
              onClick={() => {
                setIsModalVisible(false);
                form.resetFields();
                setEditingEvent(null);
              }}
              style={{ 
                marginLeft: 8,
                backgroundColor: '#FF9800',
                borderColor: '#FF9800',
                color: 'white'
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

export default Dashboard;