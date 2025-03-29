import React from 'react';
import { Layout, Menu, Button, Table, Space, Modal, Form, Input, Select, message } from 'antd';
import { UserOutlined, PlusOutlined, DeleteOutlined, EditOutlined, LogoutOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

const { Header, Sider, Content } = Layout;
const { Option } = Select;

const roles = ["Admin", "Data Analyst", "Environmental Officer", "Viewer"];

const AdminDashboard: React.FC = () => {
    const [collapsed, setCollapsed] = React.useState(false);
    const [users, setUsers] = React.useState<any[]>([]);
    const [isModalVisible, setIsModalVisible] = React.useState(false);
    const [form] = Form.useForm();

    const showUserModal = () => setIsModalVisible(true);
    const handleCancel = () => setIsModalVisible(false);
    const handleLogout = () => message.success('Logged out successfully!');

    const handleAddUser = () => {
        form.validateFields().then(values => {
            setUsers([...users, { key: users.length + 1, ...values }]);
            form.resetFields();
            setIsModalVisible(false);
            message.success('User added successfully!');
        }).catch(errorInfo => {
            console.log('Validation Failed:', errorInfo);
        });
    };

    const columns = [
        {
            title: 'Full Name',
            dataIndex: 'name',
            key: 'name',
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
            render: (_: any, record: any) => (
                <Space size="middle">
                    <Button type="primary" icon={<EditOutlined />} />
                    <Button type="default" danger icon={<DeleteOutlined />} />
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
                </Menu>
            </Sider>

            <Layout>
                <Header style={{ background: '#fff', padding: '0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '20px', fontWeight: 'bold' }}>
                    <span>Admin Dashboard</span>
                    <Button type="primary" icon={<LogoutOutlined />} onClick={handleLogout} danger>
                        Logout
                    </Button>
                </Header>
                <Content style={{ margin: '16px' }}>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
                        <Button type="primary" icon={<PlusOutlined />} onClick={showUserModal} style={{ marginBottom: '16px' }}>
                            Add User
                        </Button>
                        <Table columns={columns} dataSource={users} />
                    </motion.div>
                </Content>
            </Layout>

            <Modal title="Add User" visible={isModalVisible} onCancel={handleCancel} onOk={handleAddUser}>
                <Form form={form} layout="vertical">
                    <Form.Item name="name" label="Full Name" rules={[{ required: true, message: 'Please enter full name!' }]}> 
                        <Input placeholder="Enter full name" /> 
                    </Form.Item>
                    <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Please enter a valid email!' }]}> 
                        <Input placeholder="Enter email" /> 
                    </Form.Item>
                    <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Please enter a password!' }]}> 
                        <Input.Password placeholder="Enter password" /> 
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
