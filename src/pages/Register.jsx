import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { Mail, Lock, User, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Register = () => {
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await register(values.username, values.email, values.password);
      message.success('Account created successfully! Please login.');
      navigate('/login');
    } catch (error) {
      message.error(error.response?.data || 'Registration failed.');
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
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: '20px'
      }}>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          style={{ width: '100%', maxWidth: '400px' }}
        >
          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700' }}>Create Account</h2>
            <p style={{ color: '#a1a1aa' }}>Join TaskFlow AI and skyrocket your productivity</p>
          </div>

          <Form layout="vertical" onFinish={onFinish} size="large">
            <Form.Item
              name="username"
              rules={[{ required: true, message: 'Please enter a username' }]}
            >
              <Input 
                prefix={<User size={18} color="#71717a" />} 
                placeholder="Username" 
                style={{ background: '#1c1c22', border: '1px solid #27272a', color: 'white' }}
              />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}
            >
              <Input 
                prefix={<Mail size={18} color="#71717a" />} 
                placeholder="Email Address" 
                style={{ background: '#1c1c22', border: '1px solid #27272a', color: 'white' }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, min: 6, message: 'Password must be at least 6 characters' }]}
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
                fontWeight: '600'
              }}
            >
              Create Account
            </Button>
          </Form>

          <div style={{ marginTop: '24px', textAlign: 'center', color: '#a1a1aa' }}>
            Already have an account? <Link to="/login" style={{ color: '#00f2ff', fontWeight: '600' }}>Login here</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
