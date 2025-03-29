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
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
        >
            <Card
                style={{
                    width: 400,
                    boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                    borderRadius: '10px',
                    textAlign: 'center'
                }}
            >
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <Title level={3} style={{ margin: 0, color: '#333' }}>
                        Welcome Back
                    </Title>
                    <Text type="secondary">
                        Sign in to continue to your dashboard
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
                        <Input prefix={<UserOutlined />} placeholder="Email Address" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Please input your password!' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Password" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} icon={<LoginOutlined />} block>
                            Sign In
                        </Button>
                    </Form.Item>

                    <Form.Item style={{ textAlign: 'center', marginBottom: 0 }}>
                        <Text type="secondary">
                            Don't have an account?{' '}
                            <a onClick={() => navigate('/register')} style={{ color: '#1890ff' }}>
                                Register now
                            </a>
                        </Text>
                    </Form.Item>
                </Form>
            </Card>
        </motion.div>
    );
};

export default Login;
