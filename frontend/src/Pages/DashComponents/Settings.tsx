import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, InputNumber, Switch, Space, Popconfirm, message } from "antd";
import axios from "axios";

interface Sensor {
    id: number;
    location: string;
    latitude: number;
    longitude: number;
    status: boolean;
}

const SensorManagement: React.FC = () => {
    const [sensors, setSensors] = useState<Sensor[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [editingSensor, setEditingSensor] = useState<Sensor | null>(null);
    const [form] = Form.useForm();

    // Fetch sensor list
    const fetchSensors = async () => {
        setLoading(true);
        try {
            const response = await axios.get("http://localhost:5000/api/settings/sensors");
            setSensors(response.data);
        } catch (error) {
            message.error("Failed to fetch sensors.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSensors();
    }, []);

    // Open modal for adding a new sensor
    const openAddModal = () => {
        setEditingSensor(null);
        form.resetFields();
        setModalVisible(true);
    };

    // Open modal for editing an existing sensor
    const openEditModal = (sensor: Sensor) => {
        setEditingSensor(sensor);
        form.setFieldsValue(sensor);
        setModalVisible(true);
    };

    // Ensure form is correctly populated when editing
    useEffect(() => {
        if (editingSensor) {
            form.setFieldsValue(editingSensor);
        }
    }, [editingSensor, form]);

    // Save sensor (add or update)
    const handleSave = async (values: any) => {
        try {
            if (editingSensor) {
                // Update existing sensor
                await axios.put(`http://localhost:5000/api/settings/sensors/${editingSensor.id}`, {
                    id: editingSensor.id, // Ensure ID is included
                    ...values,
                });
                message.success("Sensor updated successfully!");
            } else {
                // Add new sensor
                await axios.post("http://localhost:5000/api/settings/sensors", values);
                message.success("Sensor added successfully!");
            }
            setModalVisible(false);
            fetchSensors();
        } catch (error) {
            message.error("Operation failed.");
            console.error(error);
        }
    };

    // Delete sensor
    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`http://localhost:5000/api/settings/sensors/${id}`);
            message.success("Sensor deleted successfully!");
            fetchSensors();
        } catch (error) {
            message.error("Failed to delete sensor.");
            console.error(error);
        }
    };

    // Toggle sensor status
    const toggleStatus = async (id: number, currentStatus: boolean) => {
        try {
            await axios.put(`http://localhost:5000/api/settings/sensors/${id}/status`, { status: !currentStatus });
            message.success("Sensor status updated!");
            fetchSensors();
        } catch (error) {
            message.error("Failed to update status.");
            console.error(error);
        }
    };

    // Define table columns
    const columns = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
        },
        {
            title: "Location",
            dataIndex: "location",
            key: "location",
        },
        {
            title: "Latitude",
            dataIndex: "latitude",
            key: "latitude",
        },
        {
            title: "Longitude",
            dataIndex: "longitude",
            key: "longitude",
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status: boolean, record: Sensor) => (
                <Switch checked={status} onChange={() => toggleStatus(record.id, status)} />
            ),
        },
        {
            title: "Actions",
            key: "actions",
            render: (_: any, record: Sensor) => (
                <Space>
                    <Button type="link" onClick={() => openEditModal(record)}>
                        Edit
                    </Button>
                    <Popconfirm title="Are you sure delete this sensor?" onConfirm={() => handleDelete(record.id)}>
                        <Button type="link" danger>
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: "20px" }}>
            <Space style={{ marginBottom: "16px" }}>
                <Button type="primary" onClick={openAddModal}>
                    Add Sensor
                </Button>
            </Space>
            <Table dataSource={sensors} columns={columns} rowKey="id" loading={loading} />

            <Modal
                title={editingSensor ? "Edit Sensor" : "Add Sensor"}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={() => {
                    form
                        .validateFields()
                        .then((values) => {
                            handleSave(values);
                        })
                        .catch((info) => {
                            console.log("Validate Failed:", info);
                        });
                }}
                okText="Save"
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="location" label="Location" rules={[{ required: true, message: "Please enter the location" }]}>
                        <Input placeholder="Enter location" />
                    </Form.Item>
                    <Form.Item name="latitude" label="Latitude" rules={[{ required: true, message: "Please enter latitude" }]}>
                        <InputNumber placeholder="Latitude" style={{ width: "100%" }} />
                    </Form.Item>
                    <Form.Item name="longitude" label="Longitude" rules={[{ required: true, message: "Please enter longitude" }]}>
                        <InputNumber placeholder="Longitude" style={{ width: "100%" }} />
                    </Form.Item>
                    <Form.Item name="status" label="Status" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default SensorManagement;
