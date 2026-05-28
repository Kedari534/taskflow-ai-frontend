import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { Mail, Lock, User, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await login(values.username, values.password);
      message.success('Welcome back to TaskFlow!');
      navigate('/');
    } catch (error) {
      message.error('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      background: '#0a0a0c',
      color: 'white'
    }}>
      {/* Left Side - Visual */}
      <div style={{ 
        flex: 1, 
        background: 'linear-gradient(135deg, #0e0e12 0%, #000000 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px',
        borderRight: '1px solid #27272a'
      }} className="hide-mobile">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          style={{ 
            width: '400px', 
            height: '400px', 
            background: 'radial-gradient(circle, rgba(112, 0, 255, 0.2) 0%, transparent 70%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}
        >
          <Sparkles size={120} color="#00f2ff" style={{ filter: 'drop-shadow(0 0 20px #00f2ff)' }} />
          <div style={{ position: 'absolute', bottom: '20px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '10px' }}>TaskFlow AI</h1>
            <p style={{ color: '#a1a1aa', maxWidth: '300px' }}>
              The future of productivity is here. Manage tasks with the power of Artificial Intelligence.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Form */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: '20px'
      }}>
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          style={{ width: '100%', maxWidth: '400px' }}
        >
          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700' }}>Welcome Back</h2>
            <p style={{ color: '#a1a1aa' }}>Login to your dashboard to continue</p>
          </div>

          <Form layout="vertical" onFinish={onFinish} size="large">
            <Form.Item
              name="username"
              rules={[{ required: true, message: 'Please enter your username' }]}
            >
              <Input 
                prefix={<User size={18} color="#71717a" />} 
                placeholder="Username" 
                style={{ background: '#1c1c22', border: '1px solid #27272a', color: 'white' }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please enter your password' }]}
            >
              <Input.Password 
                prefix={<Lock size={18} color="#71717a" />} 
                placeholder="Password" 
                style={{ background: '#1c1c22', border: '1px solid #27272a', color: 'white' }}
              />
            </Form.Item>

            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              loading={loading}
              style={{ 
                height: '50px', 
                background: 'linear-gradient(90deg, #00f2ff, #7000ff)',
                border: 'none',
                fontWeight: '600',
                marginTop: '10px'
              }}
            >
              Log In
            </Button>
          </Form>

          <div style={{ marginTop: '24px', textAlign: 'center', color: '#a1a1aa' }}>
            Don't have an account? <Link to="/register" style={{ color: '#00f2ff', fontWeight: '600' }}>Register here</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
