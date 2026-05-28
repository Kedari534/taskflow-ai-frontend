import React, { useState, useRef, useEffect } from 'react';
import { Form, Input, Select, DatePicker, Button, Card, Row, Col, message, Tag, Spin } from 'antd';
import { Sparkles, Save, RotateCcw, BrainCircuit, CheckCircle, Send, User } from 'lucide-react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const { Option } = Select;

const CreateTask = () => {
  const [form] = Form.useForm();
  const [aiLoading, setAiLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);

  // KedAI Chat State
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I am KedAI — Kedari's personal AI Task Assistant. Ask me anything, or type a command like:\n\n\"Create a high priority task: Design client landing page by Friday\"\n\nto draft it directly into the form!"
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateWithAI = async () => {
    const title = form.getFieldValue('title');
    if (!title || title.trim() === '') {
      message.warning('Please enter a task title first!');
      return;
    }

    setAiLoading(true);
    try {
      const response = await api.post('/ai/generate', { title });
      setAiSuggestion(response.data);
      message.success('KedAI suggestions generated!');
      setMessages(prev => [
        ...prev,
        { role: 'user', content: `Generate details for: "${title}"` },
        {
          role: 'assistant',
          content: `Here is the KedAI-generated outline for: "${title}". Click the button below to apply it to your form.\n\n[CMD_CREATE_TASK]:{"title": "${title}", "description": "${response.data.description.replace(/"/g, '\\"')}", "priority": "${response.data.priority}", "estimatedTime": "${response.data.estimatedTime}"}`
        }
      ]);
    } catch (error) {
      message.error('KedAI service unavailable. Please try again later.');
    } finally {
      setAiLoading(false);
    }
  };

  const applyAISuggestion = () => {
    if (aiSuggestion) {
      form.setFieldsValue({
        description: aiSuggestion.description,
        priority: aiSuggestion.priority,
        estimatedTime: aiSuggestion.estimatedTime,
      });
      message.success('KedAI suggestions applied!');
    }
  };

  const handleApplyChatSuggestion = (data) => {
    form.setFieldsValue({
      title: data.title,
      description: data.description,
      priority: data.priority?.toUpperCase(),
      estimatedTime: data.estimatedTime,
    });
    message.success('KedAI applied task details to form!');
  };

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = { role: 'user', content: chatInput };
    setMessages(prev => [...prev, userMsg]);
    const promptToSend = chatInput;
    setChatInput('');
    setChatLoading(true);

    try {
      const history = messages.slice(1).map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content
      }));

      const response = await api.post('/ai/chat', { message: promptToSend, history });
      setMessages(prev => [...prev, { role: 'assistant', content: response.data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm sorry, KedAI couldn't reach the server. Please check your connection."
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  const onFinish = async (values) => {
    setSaveLoading(true);
    try {
      const taskData = {
        ...values,
        dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : null,
      };
      await api.post('/tasks', taskData);
      message.success('Task created successfully!');
      navigate('/tasks');
    } catch (error) {
      message.error('Failed to save task.');
    } finally {
      setSaveLoading(false);
    }
  };

  const parseMessage = (content) => {
    const cmdIndex = content.indexOf('[CMD_CREATE_TASK]:');
    if (cmdIndex !== -1) {
      const text = content.substring(0, cmdIndex).trim();
      const jsonStr = content.substring(cmdIndex + '[CMD_CREATE_TASK]:'.length).trim();
      try {
        const taskData = JSON.parse(jsonStr);
        return { text, taskData };
      } catch (e) {
        return { text: content, taskData: null };
      }
    }
    return { text: content, taskData: null };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>
          Create New Task
        </h1>
        <p style={{ color: '#a1a1aa' }}>
          Fill in details manually or converse with <strong style={{ color: '#00f2ff' }}>KedAI</strong> to automatically map details.
        </p>
      </div>

      <Row gutter={[32, 32]}>
        {/* Left - Task Form */}
        <Col xs={24} lg={12}>
          <Card className="glass-morphism" style={{ border: '1px solid #27272a' }}>
            <h3 style={{ color: 'white', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BrainCircuit size={18} color="#00f2ff" />
              Task Configuration Form
            </h3>
            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Form.Item
                name="title"
                label={<span style={{ color: 'white' }}>Task Title</span>}
                rules={[{ required: true, message: 'Task title is required' }]}
              >
                <Input
                  placeholder="e.g. Prepare client presentation"
                  style={{ background: '#1c1c22', border: '1px solid #27272a', color: 'white', height: '45px' }}
                />
              </Form.Item>

              <div style={{ marginTop: '-12px', marginBottom: '24px' }}>
                <Button
                  type="primary"
                  icon={<Sparkles size={16} />}
                  onClick={generateWithAI}
                  loading={aiLoading}
                  style={{
                    height: '36px',
                    background: 'linear-gradient(90deg, #00f2ff, #7000ff)',
                    border: 'none',
                    fontWeight: '600',
                    borderRadius: '6px'
                  }}
                >
                  Quick KedAI Outline
                </Button>
              </div>

              <Form.Item
                name="description"
                label={<span style={{ color: 'white' }}>Description</span>}
              >
                <Input.TextArea
                  rows={4}
                  style={{ background: '#1c1c22', border: '1px solid #27272a', color: 'white' }}
                  placeholder="Enter task details..."
                />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="priority"
                    label={<span style={{ color: 'white' }}>Priority</span>}
                    initialValue="MEDIUM"
                  >
                    <Select>
                      <Option value="LOW">Low</Option>
                      <Option value="MEDIUM">Medium</Option>
                      <Option value="HIGH">High</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="category"
                    label={<span style={{ color: 'white' }}>Category</span>}
                    initialValue="WORK"
                  >
                    <Select>
                      <Option value="WORK">Work 💼</Option>
                      <Option value="PERSONAL">Personal 👤</Option>
                      <Option value="URGENT">Urgent 🚨</Option>
                      <Option value="CODING">Coding 💻</Option>
                      <Option value="HEALTH">Health 🍏</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="estimatedTime"
                    label={<span style={{ color: 'white' }}>Estimated Time</span>}
                  >
                    <Input
                      placeholder="e.g. 2 hours"
                      style={{ background: '#1c1c22', border: '1px solid #27272a', color: 'white' }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="dueDate"
                    label={<span style={{ color: 'white' }}>Due Date</span>}
                  >
                    <DatePicker
                      style={{ width: '100%', background: '#1c1c22', border: '1px solid #27272a' }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
                <Button
                  type="primary"
                  icon={<Save size={18} />}
                  htmlType="submit"
                  loading={saveLoading}
                  style={{ background: '#22c55e', border: 'none', height: '45px', borderRadius: '8px', fontWeight: '600' }}
                >
                  Save Task
                </Button>
                <Button
                  icon={<RotateCcw size={18} />}
                  onClick={() => { form.resetFields(); setAiSuggestion(null); }}
                  style={{ background: 'transparent', color: 'white', border: '1px solid #27272a', height: '45px', borderRadius: '8px' }}
                >
                  Reset
                </Button>
              </div>
            </Form>
          </Card>
        </Col>

        {/* Right - KedAI Chat */}
        <Col xs={24} lg={12}>
          <Card
            className="glass-morphism"
            style={{ border: '1px solid #27272a', display: 'flex', flexDirection: 'column', height: '580px', padding: 0 }}
          >
            {/* KedAI Chat Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #27272a',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #00f2ff, #7000ff)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 12px rgba(0, 242, 255, 0.3)'
              }}>
                <Sparkles size={18} color="white" />
              </div>
              <div>
                <h3 style={{ color: 'white', margin: 0, fontSize: '16px', fontWeight: '700' }}>
                  KedAI
                </h3>
                <p style={{ color: '#22c55e', margin: 0, fontSize: '11px' }}>
                  ● Online — Kedari's Personal AI Assistant
                </p>
              </div>
            </div>

            {/* Chat Messages */}
            <div style={{
              flex: 1, overflowY: 'auto', padding: '20px',
              display: 'flex', flexDirection: 'column', gap: '12px'
            }}>
              {messages.map((msg, index) => {
                const { text, taskData } = parseMessage(msg.content);
                const isAssistant = msg.role === 'assistant';

                return (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      justifyContent: isAssistant ? 'flex-start' : 'flex-end',
                      gap: '8px',
                      alignItems: 'flex-start'
                    }}
                  >
                    {isAssistant && (
                      <div style={{
                        width: '28px', height: '28px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #00f2ff, #7000ff)',
                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                        flexShrink: 0
                      }}>
                        <Sparkles size={14} color="white" />
                      </div>
                    )}
                    <div
                      style={{
                        padding: '12px 16px',
                        borderRadius: isAssistant ? '4px 12px 12px 12px' : '12px 4px 12px 12px',
                        fontSize: '14px',
                        lineHeight: '1.5',
                        whiteSpace: 'pre-line',
                        maxWidth: '85%',
                        background: isAssistant
                          ? 'rgba(0, 242, 255, 0.05)'
                          : 'linear-gradient(90deg, rgba(0,242,255,0.15), rgba(112,0,255,0.15))',
                        border: isAssistant
                          ? '1px solid rgba(0, 242, 255, 0.1)'
                          : '1px solid rgba(112, 0, 255, 0.2)',
                        color: 'white'
                      }}
                    >
                      {text}
                      {taskData && (
                        <div style={{
                          marginTop: '12px',
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '8px',
                          padding: '10px'
                        }}>
                          <div style={{ fontSize: '11px', color: '#a1a1aa', marginBottom: '4px' }}>
                            KedAI Draft:
                          </div>
                          <div style={{ fontWeight: '600', color: 'white', fontSize: '13px' }}>
                            {taskData.title}
                          </div>
                          {taskData.description && (
                            <div style={{ fontSize: '12px', color: '#71717a', margin: '4px 0' }}>
                              {taskData.description}
                            </div>
                          )}
                          <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                            <Tag color="default">{taskData.priority}</Tag>
                            {taskData.estimatedTime && <Tag color="default">{taskData.estimatedTime}</Tag>}
                          </div>
                          <Button
                            type="primary"
                            size="small"
                            onClick={() => handleApplyChatSuggestion(taskData)}
                            style={{
                              marginTop: '10px',
                              background: 'linear-gradient(90deg, #00f2ff, #7000ff)',
                              border: 'none',
                              fontSize: '12px',
                              height: '28px'
                            }}
                          >
                            Apply to Form
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {chatLoading && (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #00f2ff, #7000ff)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                  }}>
                    <Sparkles size={14} color="white" />
                  </div>
                  <div style={{
                    padding: '12px 16px', borderRadius: '4px 12px 12px 12px',
                    background: 'rgba(0, 242, 255, 0.05)',
                    border: '1px solid rgba(0, 242, 255, 0.1)'
                  }}>
                    <Spin size="small" />
                    <span style={{ color: '#71717a', fontSize: '12px', marginLeft: '8px' }}>
                      KedAI is thinking...
                    </span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div style={{
              display: 'flex', padding: '12px',
              background: '#0e0e12',
              borderTop: '1px solid #27272a',
              gap: '8px'
            }}>
              <Input
                placeholder="Ask KedAI anything..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onPressEnter={handleSendChat}
                disabled={chatLoading}
                style={{ background: '#1c1c22', border: '1px solid #27272a', color: 'white', flex: 1 }}
              />
              <Button
                type="primary"
                icon={<Send size={16} />}
                onClick={handleSendChat}
                loading={chatLoading}
                style={{
                  background: 'linear-gradient(90deg, #00f2ff, #7000ff)',
                  border: 'none', width: '45px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              />
            </div>
          </Card>
        </Col>
      </Row>
    </motion.div>
  );
};

export default CreateTask;
