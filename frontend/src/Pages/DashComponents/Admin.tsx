import React, { useEffect, useState } from 'react';
import {
    Layout, Menu, Button, Table, Space, Modal, Form, Input, Select, message,
    Popconfirm
} from 'antd';
import {
    UserOutlined, PlusOutlined, DeleteOutlined, EditOutlined,
    LogoutOutlined, ReloadOutlined, DashboardOutlined, SyncOutlined,
    MenuFoldOutlined, MenuUnfoldOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Header, Sider, Content } = Layout;
const { Option } = Select;

const roles = ["Admin", "Data Analyst", "Environmental Officer", "Viewer"];

interface User {
    id: number;
    username: string;
    email: string;
    role: string;
}

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [form] = Form.useForm();
    const [pageSize, setPageSize] = useState(8);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await axios.get("http://localhost:5000/api/user-edit");
            setUsers(response.data);
        } catch (error) {
            message.error("Failed to fetch users.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const resetSensors = async () => {
        try {
            await axios.put("http://localhost:5000/api/settings/sensors/reset");
            message.success("All sensors reset successfully!");
        } catch (error) {
            message.error("Failed to reset sensors.");
            console.error(error);
        }
    };

    const showUserModal = () => {
        setIsEditMode(false);
        form.resetFields();
        setIsModalVisible(true);
    };

    const showEditModal = (user: User) => {
        setIsEditMode(true);
        setEditingUser(user);
        form.setFieldsValue({
            name: user.username,
            email: user.email,
            role: user.role,
            password: ""
        });
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingUser(null);
        form.resetFields();
    };

    const handleAddOrUpdateUser = async () => {
        try {
            const values = await form.validateFields();
            if (isEditMode && editingUser) {
                await axios.put(`http://localhost:5000/api/user-edit/${editingUser.id}`, {
                    name: values.name,
                    email: values.email,
                    role: values.role,
                    password: values.password
                });
                message.success("User updated successfully!");
            } else {
                await axios.post("http://localhost:5000/api/user-edit/register", {
                    name: values.name,
                    email: values.email,
                    role: values.role,
                    password: values.password
                });
                message.success("User added successfully!");
            }
            setIsModalVisible(false);
            form.resetFields();
            fetchUsers();
        } catch (error: any) {
            message.error(error.response?.data?.message || "Operation failed.");
            console.error(error);
        }
    };

    const handleDeleteUser = async (id: number) => {
        try {
            await axios.delete(`http://localhost:5000/api/user-edit/${id}`);
            message.success("User deleted successfully!");
            fetchUsers();
        } catch (error) {
            message.error("Failed to delete user.");
            console.error(error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        message.success('Logged out successfully!');
        navigate('/login');
    };

    const navigateToDashboard = () => {
        navigate('/dashboard');
    };

    const columns = [
        {
            title: 'Full Name',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: User) => (
                <Space size="middle">
                    <Button type="primary" icon={<EditOutlined />} onClick={() => showEditModal(record)} />
                    <Button type="default" danger icon={<DeleteOutlined />} onClick={() => handleDeleteUser(record.id)} />
                </Space>
            ),
        },
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} theme="dark">
                <div style={{ color: '#fff', textAlign: 'center', padding: '16px', fontSize: '20px' }}>AQI Admin</div>
                <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
                    <Menu.Item key="1" icon={<UserOutlined />}>User Management</Menu.Item>
                    <Menu.Item key="2" icon={<DashboardOutlined />} onClick={navigateToDashboard}>
                        Main Dashboard
                    </Menu.Item>
                    {/*<Menu.Item key="3" icon={<LogoutOutlined />} onClick={() => Modal.confirm({
                        title: 'Reset all sensors?',
                        content: 'This will reset all sensor readings to 0. Are you sure?',
                        okText: 'Yes, reset',
                        cancelText: 'Cancel',
                        onOk: resetSensors
                    })}>
                        Reset Sensors
                    </Menu.Item>*/}
                </Menu>
            </Sider>

            <Layout>
                <Header style={{ background: '#fff', padding: '0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '20px', fontWeight: 'bold' }}>Admin Dashboard</span>
                    <Space>
                        <Button
                            type="primary"
                            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={() => setCollapsed(!collapsed)}
                        />
                        <Button icon={<ReloadOutlined />} onClick={fetchUsers} />
                        <Popconfirm
                            title="Reset all sensors?"
                            description="This will reset sensor readings to 0. Are you sure?"
                            onConfirm={resetSensors}
                            okText="Yes, reset"
                            cancelText="Cancel"
                        >
                            <Button icon={<SyncOutlined />} type="dashed">
                                Reset Sensors
                            </Button>
                        </Popconfirm>
                        <Button type="primary" danger icon={<LogoutOutlined />} onClick={handleLogout}>
                            Logout
                        </Button>
                    </Space>
                </Header>

                <Content style={{ margin: '16px', padding: '16px', background: '#fff', borderRadius: '8px' }}>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={showUserModal}
                            style={{ marginBottom: '16px' }}
                        >
                            Add User
                        </Button>

                        <Table
                            columns={columns}
                            dataSource={users}
                            loading={loading}
                            rowKey="id"
                            pagination={{
                                pageSize,
                                showSizeChanger: true,
                                pageSizeOptions: ['8', '16', '32'],
                                onShowSizeChange: (_, size) => setPageSize(size),
                                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`,
                            }}
                            bordered
                            size="middle"
                        />
                    </motion.div>
                </Content>
            </Layout>

            <Modal
                title={isEditMode ? "Edit User" : "Add User"}
                open={isModalVisible}
                onCancel={handleCancel}
                onOk={handleAddOrUpdateUser}
            >
                <Form form={form} layout="vertical" initialValues={{ role: "Viewer" }}>
                    <Form.Item name="name" label="Full Name" rules={[{ required: true, message: 'Please enter full name!' }]}>
                        <Input placeholder="Enter full name" />
                    </Form.Item>
                    <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Please enter a valid email!' }]}>
                        <Input placeholder="Enter email" />
                    </Form.Item>
                    <Form.Item name="password" label="Password" rules={[{ required: !isEditMode, message: 'Please enter a password!' }]}>
                        <Input.Password placeholder={isEditMode ? "Enter new password (optional)" : "Enter password"} />
                    </Form.Item>
                    <Form.Item name="role" label="Role" rules={[{ required: true, message: 'Please select a role!' }]}>
                        <Select placeholder="Select a role">
                            {roles.map(role => <Option key={role} value={role}>{role}</Option>)}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </Layout>
    );
};

export default AdminDashboard;
