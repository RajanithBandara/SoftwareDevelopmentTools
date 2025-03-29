import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, InputNumber, Switch, Space, Popconfirm, message, Card, Typography, Tag, Tooltip, Badge, Divider } from "antd";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SyncOutlined,
    EnvironmentOutlined,
    CompassOutlined,
    DashboardOutlined,
    WarningOutlined
} from "@ant-design/icons";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const { Title, Text, Paragraph } = Typography;

interface Sensor {
    id: number;
    location: string;
    latitude: number;
    longitude: number;
    status: boolean;
}

// Enhanced weather-themed color palette
const colors = {
    primary: "#1677ff", // More vibrant blue
    secondary: "#52c41a", // Green for active
    danger: "#f5222d", // Red for inactive/delete
    background: "#f0f8ff", // Light blue background
    cardBg: "#ffffff", // White for cards
    borderColor: "#d9e8ff", // Light blue border
    headerBg: "#f0f7ff", // Slightly darker header background
    hoverBg: "#f5f9ff", // Hover background
    inactiveGray: "#bfbfbf", // Gray for inactive status
};

const SensorManagement: React.FC = () => {
    const [sensors, setSensors] = useState<Sensor[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [editingSensor, setEditingSensor] = useState<Sensor | null>(null);
    const [form] = Form.useForm();
    const [refreshKey, setRefreshKey] = useState<number>(0);
    const [totalActive, setTotalActive] = useState<number>(0);

    // Fetch sensor list
    const fetchSensors = async () => {
        setLoading(true);
        try {
            const response = await axios.get("http://localhost:5000/api/settings/sensors");
            setSensors(response.data);
            setTotalActive(response.data.filter((sensor: Sensor) => sensor.status).length);
            setRefreshKey(prev => prev + 1);
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
        form.setFieldsValue({ status: true }); // Default to active
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
                    id: editingSensor.id,
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
            message.success(`Sensor ${currentStatus ? "deactivated" : "activated"}!`);
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
            width: "7%",
        },
        {
            title: "Location",
            dataIndex: "location",
            key: "location",
            width: "25%",
            render: (text: string, record: Sensor) => (
                <Space>
                    <Badge status={record.status ? "success" : "error"} />
                    <Text strong style={{ fontSize: "15px" }}>{text}</Text>
                </Space>
            )
        },
        {
            title: "Coordinates",
            key: "coordinates",
            width: "25%",
            render: (_, record: Sensor) => (
                <Space>
                    <CompassOutlined style={{ color: colors.primary }} />
                    <Tooltip title="View on map">
                        <a
                            href={`https://maps.google.com/?q=${record.latitude},${record.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {record.latitude.toFixed(4)}, {record.longitude.toFixed(4)}
                        </a>
                    </Tooltip>
                </Space>
            ),
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            width: "18%",
            render: (status: boolean, record: Sensor) => (
                <motion.div
                    whileTap={{ scale: 0.9 }}
                >
                    <Tag
                        color={status ? colors.secondary : colors.danger}
                        style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '14px',
                            border: 'none'
                        }}
                        icon={status ? <DashboardOutlined /> : <WarningOutlined />}
                    >
                        {status ? 'Active' : 'Inactive'}
                    </Tag>
                    <Switch
                        checked={status}
                        onChange={() => toggleStatus(record.id, status)}
                    />
                </motion.div>
            ),
        },
        {
            title: "Actions",
            key: "actions",
            width: "25%",
            render: (_: any, record: Sensor) => (
                <Space size="middle">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => openEditModal(record)}
                            style={{
                                background: colors.primary,
                                borderRadius: '6px',
                                boxShadow: '0 2px 5px rgba(24,144,255,0.2)'
                            }}
                        >
                            Edit
                        </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Popconfirm
                            title="Delete Sensor"
                            description="Are you sure you want to delete this sensor? This action cannot be undone."
                            onConfirm={() => handleDelete(record.id)}
                            okText="Delete"
                            cancelText="Cancel"
                            placement="topRight"
                            okButtonProps={{ danger: true }}
                        >
                            <Button
                                danger
                                icon={<DeleteOutlined />}
                                style={{
                                    borderRadius: '6px',
                                    boxShadow: '0 2px 5px rgba(245,34,45,0.1)'
                                }}
                            >
                                Delete
                            </Button>
                        </Popconfirm>
                    </motion.div>
                </Space>
            ),
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{ padding: "20px" }}
        >
            <Card
                style={{
                    boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
                    borderRadius: "12px",
                    background: colors.cardBg,
                    marginBottom: "20px",
                    border: "none"
                }}
            >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <div>
                        <Title level={3} style={{ margin: "0 0 4px 0" }}>
                            <EnvironmentOutlined /> Weather Sensor Management
                        </Title>
                        <Paragraph type="secondary">
                            Manage your network of weather monitoring sensors
                        </Paragraph>
                    </div>
                    <Space>
                        <Card
                            size="small"
                            style={{
                                borderRadius: "8px",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                                background: colors.headerBg
                            }}
                        >
                            <Space>
                                <DashboardOutlined style={{ color: colors.secondary }} />
                                <Text strong>{totalActive} Active</Text>
                                <Text type="secondary">of {sensors.length} Total</Text>
                            </Space>
                        </Card>
                    </Space>
                </div>

                <Divider style={{ margin: "12px 0 24px" }} />

                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
                    <Space>
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                            <Button
                                icon={<SyncOutlined spin={loading} />}
                                onClick={fetchSensors}
                                loading={loading}
                                style={{
                                    borderRadius: "6px",
                                    boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
                                }}
                            >
                                Refresh
                            </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={openAddModal}
                                style={{
                                    borderRadius: "6px",
                                    boxShadow: "0 2px 8px rgba(24,144,255,0.2)"
                                }}
                                size="large"
                            >
                                Add New Sensor
                            </Button>
                        </motion.div>
                    </Space>
                </div>

                <AnimatePresence mode="wait" key={refreshKey}>
                    <motion.div
                        key={refreshKey}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                    >
                        <Table
                            dataSource={sensors}
                            columns={columns}
                            rowKey="id"
                            loading={loading}
                            pagination={{
                                pageSize: 7,
                                showSizeChanger: true,
                                pageSizeOptions: ['7', '15', '30'],
                                showTotal: (total) => `Total ${total} sensors`
                            }}
                            style={{
                                borderRadius: "8px",
                                overflow: "hidden",
                            }}
                            components={{
                                body: {
                                    row: (props) => (
                                        <motion.tr
                                            {...props}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3, delay: props['data-row-key'] * 0.05 }}
                                            whileHover={{ backgroundColor: colors.hoverBg }}
                                        />
                                    )
                                }
                            }}
                        />
                    </motion.div>
                </AnimatePresence>
            </Card>

            <Modal
                title={
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        style={{ display: "flex", alignItems: "center", gap: "8px" }}
                    >
                        {editingSensor ? <EditOutlined /> : <PlusOutlined />}
                        <span>{editingSensor ? "Edit Weather Sensor" : "Add New Weather Sensor"}</span>
                    </motion.div>
                }
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
                okText={editingSensor ? "Update Sensor" : "Add Sensor"}
                destroyOnClose
                width={520}
                maskClosable={false}
                okButtonProps={{
                    style: {
                        borderRadius: "6px",
                        boxShadow: "0 2px 5px rgba(24,144,255,0.2)"
                    }
                }}
                cancelButtonProps={{
                    style: {
                        borderRadius: "6px"
                    }
                }}
            >
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <Form form={form} layout="vertical">
                        <Form.Item
                            name="location"
                            label={
                                <span>
                                    <EnvironmentOutlined /> Location Name
                                </span>
                            }
                            rules={[{ required: true, message: "Please enter the location" }]}
                        >
                            <Input
                                placeholder="Enter location name (e.g., Downtown, Airport)"
                                style={{ borderRadius: "6px", height: "40px" }}
                            />
                        </Form.Item>
                        <div style={{ display: "flex", gap: "16px" }}>
                            <Form.Item
                                name="latitude"
                                label={
                                    <span>
                                        <CompassOutlined /> Latitude
                                    </span>
                                }
                                rules={[
                                    { required: true, message: "Required" },
                                    { type: 'number', min: -90, max: 90, message: "Must be between -90 and 90" }
                                ]}
                                style={{ flex: 1 }}
                                tooltip="Latitude coordinate in decimal degrees format"
                            >
                                <InputNumber
                                    placeholder="e.g., 40.7128"
                                    style={{ width: "100%", borderRadius: "6px", height: "40px" }}
                                    precision={6}
                                />
                            </Form.Item>
                            <Form.Item
                                name="longitude"
                                label={
                                    <span>
                                        <CompassOutlined /> Longitude
                                    </span>
                                }
                                rules={[
                                    { required: true, message: "Required" },
                                    { type: 'number', min: -180, max: 180, message: "Must be between -180 and 180" }
                                ]}
                                style={{ flex: 1 }}
                                tooltip="Longitude coordinate in decimal degrees format"
                            >
                                <InputNumber
                                    placeholder="e.g., -74.0060"
                                    style={{ width: "100%", borderRadius: "6px", height: "40px" }}
                                    precision={6}
                                />
                            </Form.Item>
                        </div>
                        <Form.Item
                            name="status"
                            label={
                                <span>
                                    <DashboardOutlined /> Sensor Status
                                </span>
                            }
                            valuePropName="checked"
                            initialValue={true}
                            tooltip="Toggle to activate or deactivate the sensor"
                        >
                            <Switch
                                checkedChildren="1"
                                unCheckedChildren="0"
                            />
                        </Form.Item>
                    </Form>
                </motion.div>
            </Modal>
        </motion.div>
    );
};

export default SensorManagement;