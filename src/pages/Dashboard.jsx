import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Button, message } from 'antd';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  BrainCircuit,
  Sparkles
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (error) {
      message.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good Morning';
    if (hr < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const chartData = [
    { name: 'Mon', tasks: 3 },
    { name: 'Tue', tasks: 5 },
    { name: 'Wed', tasks: 2 },
    { name: 'Thu', tasks: 8 },
    { name: 'Fri', tasks: 6 },
    { name: 'Sat', tasks: 4 },
    { name: 'Sun', tasks: 7 },
  ];

  const stats = [
    {
      title: 'Total Tasks',
      value: tasks.length,
      icon: <CheckCircle2 color="#00f2ff" />,
      color: '#00f2ff',
    },
    {
      title: 'Pending',
      value: tasks.filter((t) => t.status === 'PENDING').length,
      icon: <Clock color="#eab308" />,
      color: '#eab308',
    },
    {
      title: 'Completed',
      value: tasks.filter((t) => t.status === 'COMPLETED').length,
      icon: <TrendingUp color="#22c55e" />,
      color: '#22c55e',
    },
    {
      title: 'High Priority',
      value: tasks.filter((t) => t.priority === 'HIGH').length,
      icon: <AlertCircle color="#ef4444" />,
      color: '#ef4444',
    },
  ];

  const columns = [
    {
      title: 'Task Title',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <span style={{ fontWeight: '600' }}>{text}</span>,
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => (
        <Tag
          color={
            priority === 'HIGH' ? 'volcano' : priority === 'MEDIUM' ? 'gold' : 'blue'
          }
        >
          {priority}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'COMPLETED' ? 'green' : 'processing'}>{status}</Tag>
      ),
    },
  ];

  const priorityChartData = [
    { name: 'High', value: tasks.filter((t) => t.priority === 'HIGH').length, color: '#ef4444' },
    { name: 'Medium', value: tasks.filter((t) => t.priority === 'MEDIUM').length, color: '#eab308' },
    { name: 'Low', value: tasks.filter((t) => t.priority === 'LOW').length, color: '#00f2ff' },
  ].filter(d => d.value > 0);

  const pieData = priorityChartData.length > 0 ? priorityChartData : [{ name: 'No Tasks', value: 1, color: '#27272a' }];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '30px', fontWeight: '800', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>{getGreeting()},</span>
          <span className="gradient-text">{user?.username}</span>
          <Sparkles size={24} color="#00f2ff" />
        </h1>
        <p style={{ color: '#a1a1aa' }}>
          Welcome back to TaskFlow AI. Here is your productivity summary for today.
        </p>
      </div>

      <Row gutter={[24, 24]}>
        {stats.map((stat, idx) => (
          <Col xs={24} sm={12} lg={6} key={idx}>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
            >
              <Card hoverable className="glass-morphism" style={{ borderLeft: `3px solid ${stat.color}` }}>
                <Statistic
                  title={<span style={{ color: '#a1a1aa', fontWeight: '500' }}>{stat.title}</span>}
                  value={stat.value}
                  prefix={stat.icon}
                  valueStyle={{ color: 'white', fontWeight: '800', fontSize: '28px' }}
                />
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col xs={24} lg={12}>
          <Card
            title={<span style={{ color: 'white', fontWeight: '600' }}>Productivity Trends</span>}
            className="glass-morphism"
            style={{ height: '420px' }}
          >
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f2ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00f2ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#27272a"
                  vertical={false}
                />
                <XAxis dataKey="name" stroke="#71717a" />
                <YAxis stroke="#71717a" />
                <Tooltip
                  contentStyle={{
                    background: '#141418',
                    border: '1px solid #27272a',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                  itemStyle={{ color: '#00f2ff' }}
                />
                <Area
                  type="monotone"
                  dataKey="tasks"
                  stroke="#00f2ff"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorTasks)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={6}>
          <Card
            title={<span style={{ color: 'white', fontWeight: '600' }}>Priority Breakdown</span>}
            className="glass-morphism"
            style={{ height: '420px' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '320px' }}>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#141418',
                      border: '1px solid #27272a',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ marginTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {pieData.map((item, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: item.color }} />
                    <span style={{ fontSize: '12px', color: '#a1a1aa' }}>
                      {item.name} ({item.value})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={6}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BrainCircuit size={20} color="#00f2ff" />
                <span style={{ color: 'white', fontWeight: '600' }}>AI Insight</span>
              </div>
            }
            className="glass-morphism"
            style={{ height: '420px' }}
          >
            <div style={{ textAlign: 'center', padding: '10px 5px' }}>
              <div
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  border: '4px solid #00f2ff',
                  margin: '0 auto 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  fontWeight: 'bold',
                  boxShadow: '0 0 15px rgba(0, 242, 255, 0.3)',
                  background: 'rgba(0, 242, 255, 0.02)'
                }}
              >
                {tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'COMPLETED').length / tasks.length) * 100) : 0}%
              </div>
              <p
                style={{
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '15px',
                  marginBottom: '10px',
                }}
              >
                Completion Ratio
              </p>
              <p style={{ color: '#a1a1aa', fontSize: '13px', lineHeight: '1.4' }}>
                {tasks.length > 0 
                  ? `You have completed ${tasks.filter(t => t.status === 'COMPLETED').length} out of ${tasks.length} tasks. High-priority tasks take priority to maximize efficiency.` 
                  : "Start creating tasks with AI guidance to build your customized dashboard metrics."
                }
              </p>
              <Button
                type="link"
                style={{ color: '#00f2ff', padding: 0, marginTop: '16px' }}
              >
                Weekly Analysis
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      <Row style={{ marginTop: '24px' }}>
        <Col span={24}>
          <Card
            title={<span style={{ color: 'white', fontWeight: '600' }}>Recent Tasks</span>}
            className="glass-morphism"
          >
            <Table
              columns={columns}
              dataSource={tasks.slice(0, 5)}
              pagination={false}
              loading={loading}
              rowKey="id"
              locale={{
                emptyText: (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#71717a' }}>
                    No tasks found. Click "Create Task" to get started!
                  </div>
                )
              }}
            />
          </Card>
        </Col>
      </Row>
    </motion.div>
  );
};

export default Dashboard;
