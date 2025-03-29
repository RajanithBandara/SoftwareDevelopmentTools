import React, { useState } from 'react';
import { Form, Input, Button, Typography, message, Card, Space } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;

interface LoginFormData {
    email: string;
    password: string;
}

const Login: React.FC = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values: LoginFormData) => {
        setLoading(true);
        try {
            const response = await fetch("http://localhost:5000/api/users/login", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values)
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('userRole', data.userRole);
                localStorage.setItem('user', JSON.stringify(data.user));
                message.success(`Welcome back, ${data.user.username}!`);
                navigate('/dashboard');
            } else {
                message.error(data.message || 'Login failed');
            }
        } catch (err) {
            message.error('Network error. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                overflow: 'hidden'
            }}
        >
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
            >
                <Card
                    style={{
                        width: 420,
                        padding: 24,
                        boxShadow: '0 10px 20px rgba(0,0,0,0.25)',
                        borderRadius: '12px',
                        textAlign: 'center',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(12px)'
                    }}
                >
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        <Title level={2} style={{ margin: 0, color: '#2c3e50' }}>
                            ☁️ Weather Monitor Login
                        </Title>
                        <Text type="secondary" style={{ fontSize: '16px' }}>
                            Stay updated with real-time weather reports
                        </Text>
                    </Space>

                    <Form form={form} style={{ marginTop: 24 }} onFinish={onFinish}>
                        <Form.Item
                            name="email"
                            rules={[
                                { required: true, message: 'Please input your email!' },
                                { type: 'email', message: 'Please enter a valid email!' }
                            ]}
                        >
                            <Input prefix={<UserOutlined />} placeholder="Email Address" size="large" />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            rules={[{ required: true, message: 'Please input your password!' }]}
                        >
                            <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                icon={<LoginOutlined />}
                                block
                                size="large"
                                style={{ borderRadius: '8px', fontSize: '16px' }}
                            >
                                Sign In
                            </Button>
                        </Form.Item>

                        <Form.Item style={{ textAlign: 'center', marginBottom: 0 }}>
                            <Text type="secondary" style={{ fontSize: '14px' }}>
                                Don't have an account?{' '}
                                <a onClick={() => navigate('/register')} style={{ color: '#1890ff', fontWeight: 'bold' }}>
                                    Register now
                                </a>
                            </Text>
                        </Form.Item>
                    </Form>
                </Card>
            </motion.div>
        </motion.div>
    );
};

export default Login;
