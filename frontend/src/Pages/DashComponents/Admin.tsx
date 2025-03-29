import React from 'react';
import { Layout, Menu, Button, Table, Space, Modal, Form, Input, message } from 'antd';
import { UserOutlined, PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

const { Header, Sider, Content } = Layout;

const AdminDashboard: React.FC = () => {
    const [collapsed, setCollapsed] = React.useState(false);
    const [users, setUsers] = React.useState<any[]>([]);
    const [isModalVisible, setIsModalVisible] = React.useState(false);
    const [form] = Form.useForm();

    const showUserModal = () => setIsModalVisible(true);
    const handleCancel = () => setIsModalVisible(false);

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
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
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
                <Header style={{ background: '#fff', padding: 0, textAlign: 'center', fontSize: '20px', fontWeight: 'bold' }}>
                    Admin Dashboard
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
                    <Form.Item name="username" label="Username" rules={[{ required: true, message: 'Please enter a username!' }]}>
                        <Input placeholder="Enter username" />
                    </Form.Item>
                    <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Please enter a valid email!' }]}>
                        <Input placeholder="Enter email" />
                    </Form.Item>
                </Form>
            </Modal>
        </Layout>
    );
};

export default AdminDashboard;
