import React from 'react';
import {
    Form,
    Input,
    Button,
    Typography,
    message,
    Card,
    Space
} from 'antd';
import {
    UserOutlined,
    LockOutlined,
    LoginOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

interface LoginFormData {
    email: string;
    password: string;
}

const Login: React.FC = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState(false);

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
                // Successful login
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                message.success('Login Successful!');

                // Navigate to dashboard
                navigate('/dashboard');
            } else {
                // Handle login error
                message.error(data.message || 'Login failed');
            }
        } catch (err) {
            message.error('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                backgroundColor: '#f0f2f5'
            }}
        >
            <Card
                style={{
                    width: 400,
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
            >
                <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
                    <Title level={3} style={{ margin: 0 }}>
                        Welcome Back
                    </Title>
                    <Text type="secondary">
                        Sign in to continue to your dashboard
                    </Text>
                </Space>

                <Form
                    form={form}
                    style={{ marginTop: 24 }}
                    onFinish={onFinish}
                >
                    <Form.Item
                        name="email"
                        rules={[
                            {
                                required: true,
                                message: 'Please input your email!'
                            },
                            {
                                type: 'email',
                                message: 'Please enter a valid email!'
                            }
                        ]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="Email Address"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[
                            {
                                required: true,
                                message: 'Please input your password!'
                            }
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Password"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            icon={<LoginOutlined />}
                            block
                        >
                            Sign In
                        </Button>
                    </Form.Item>

                    <Form.Item style={{ textAlign: 'center', marginBottom: 0 }}>
                        <Text type="secondary">
                            Don't have an account?{' '}
                            <a onClick={() => navigate('/register')}>
                                Register now
                            </a>
                        </Text>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default Login;