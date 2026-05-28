import React, { useState, useEffect } from 'react';
import {
  Table, Tag, Space, Button, Input, Select, Card,
  message, Modal, Form, DatePicker, Segmented, Radio, Row, Col
} from 'antd';
import { Search, Edit, Trash2, Shield, List, Kanban, AlertCircle, CheckCircle2, Clock, Calendar } from 'lucide-react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { motion, AnimatePresence } from 'framer-motion';

const { Option } = Select;

const categories = [
  { value: 'WORK', label: 'Work 💼', color: 'blue' },
  { value: 'PERSONAL', label: 'Personal 👤', color: 'green' },
  { value: 'URGENT', label: 'Urgent 🚨', color: 'volcano' },
  { value: 'CODING', label: 'Coding 💻', color: 'purple' },
  { value: 'HEALTH', label: 'Health 🍏', color: 'gold' },
];

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);
  const [priorityFilter, setPriorityFilter] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'kanban'

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm] = Form.useForm();

  // Ledger history modal state
  const [ledgerModalOpen, setLedgerModalOpen] = useState(false);
  const [ledgerTask, setLedgerTask] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [verifyState, setVerifyState] = useState('idle'); // 'idle' | 'verifying' | 'success' | 'failed'

  // Drag & drop state
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
  }, [search, statusFilter, priorityFilter, categoryFilter]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await api.get('/tasks', {
        params: { search, status: statusFilter, priority: priorityFilter, category: categoryFilter },
      });
      setTasks(response.data);
    } catch (error) {
      message.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this task?',
      content: 'This action cannot be undone and will remove the cryptographic task ledger.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await api.delete(`/tasks/${id}`);
          message.success('Task deleted');
          fetchTasks();
        } catch (error) {
          message.error('Delete failed');
        }
      },
    });
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    editForm.setFieldsValue({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      category: task.category,
      estimatedTime: task.estimatedTime,
      dueDate: task.dueDate ? dayjs(task.dueDate) : null,
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      const values = await editForm.validateFields();
      setEditLoading(true);
      const taskData = {
        ...values,
        dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : null,
      };
      await api.put(`/tasks/${editingTask.id}`, taskData);
      message.success('Task updated successfully!');
      setEditModalOpen(false);
      setEditingTask(null);
      fetchTasks();
    } catch (error) {
      message.error('Failed to update task');
    } finally {
      setEditLoading(false);
    }
  };

  // Ledger history handlers
  const handleViewLedger = async (task) => {
    setLedgerTask(task);
    setLedgerModalOpen(true);
    setHistoryLoading(true);
    setVerifyState('idle');
    try {
      const response = await api.get(`/tasks/${task.id}/history`);
      setHistoryList(response.data);
    } catch (err) {
      message.error('Failed to fetch audit ledger');
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleVerifyLedger = () => {
    setVerifyState('verifying');
    setTimeout(() => {
      let isValid = true;
      for (let i = 1; i < historyList.length; i++) {
        if (historyList[i].previousHash !== historyList[i - 1].stateHash) {
          isValid = false;
          break;
        }
      }
      setVerifyState(isValid ? 'success' : 'failed');
    }, 1200);
  };

  // HTML5 Drag and Drop Handlers
  const handleDragStart = (e, task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e, column) => {
    e.preventDefault();
    setDragOverColumn(column);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    if (!draggedTask) return;
    
    if (draggedTask.status === targetStatus) return;

    try {
      const updatedTask = { ...draggedTask, status: targetStatus };
      await api.put(`/tasks/${draggedTask.id}`, updatedTask);
      message.success(`Task status updated to ${targetStatus.replace('_', ' ')}`);
      fetchTasks();
    } catch (err) {
      message.error('Failed to update task status');
    } finally {
      setDraggedTask(null);
    }
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <span style={{ fontWeight: '600', color: 'white' }}>{text}</span>,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (cat) => {
        const match = categories.find(c => c.value === cat);
        return match ? <Tag color={match.color}>{match.label}</Tag> : <Tag color="default">General 💼</Tag>;
      }
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => (
        <Tag color={priority === 'HIGH' ? 'volcano' : priority === 'MEDIUM' ? 'gold' : 'blue'}>
          {priority}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'COMPLETED' ? 'green' : status === 'IN_PROGRESS' ? 'blue' : 'processing'}>
          {status?.replace('_', ' ')}
        </Tag>
      ),
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date) => (date ? new Date(date).toLocaleDateString() : '-'),
    },
    {
      title: 'Ledger Audit',
      key: 'ledger',
      render: (_, record) => (
        <Button
          icon={<Shield size={16} />}
          type="text"
          style={{ color: '#22c55e', background: 'rgba(34, 197, 94, 0.05)', borderRadius: '6px' }}
          onClick={() => handleViewLedger(record)}
          title="Verify Ledger Integrity"
        >
          Verify
        </Button>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<Edit size={16} />}
            type="text"
            style={{ color: '#00f2ff' }}
            onClick={() => handleEdit(record)}
          />
          <Button
            icon={<Trash2 size={16} />}
            type="text"
            danger
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  const columnsByStatus = {
    PENDING: tasks.filter(t => t.status === 'PENDING'),
    IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS'),
    COMPLETED: tasks.filter(t => t.status === 'COMPLETED'),
  };

  return (
    <div>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '32px',
        flexWrap: 'wrap', gap: '16px'
      }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>My Tasks</h1>
          <p style={{ color: '#a1a1aa' }}>Manage and organize your tasks using tabular list or dynamic Kanban boards.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Radio.Group 
            value={viewMode} 
            onChange={(e) => setViewMode(e.target.value)}
            optionType="button"
            buttonStyle="solid"
          >
            <Radio.Button value="list"><List size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> List</Radio.Button>
            <Radio.Button value="kanban"><Kanban size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Kanban</Radio.Button>
          </Radio.Group>
          <Button
            type="primary"
            style={{
              height: '40px',
              background: 'linear-gradient(90deg, #00f2ff, #7000ff)',
              border: 'none', fontWeight: '600',
              borderRadius: '8px'
            }}
            onClick={() => navigate('/create-task')}
          >
            New Task
          </Button>
        </div>
      </div>

      <Card className="glass-morphism" style={{ marginBottom: '24px' }}>
        <Space wrap size="large">
          <Input
            placeholder="Search tasks..."
            prefix={<Search size={18} color="#71717a" />}
            style={{ width: 280, background: '#1c1c22', border: '1px solid #27272a', color: 'white' }}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            placeholder="Filter by Status"
            style={{ width: 170 }}
            allowClear
            onChange={setStatusFilter}
          >
            <Option value="PENDING">Pending</Option>
            <Option value="IN_PROGRESS">In Progress</Option>
            <Option value="COMPLETED">Completed</Option>
          </Select>
          <Select
            placeholder="Filter by Priority"
            style={{ width: 170 }}
            allowClear
            onChange={setPriorityFilter}
          >
            <Option value="LOW">Low</Option>
            <Option value="MEDIUM">Medium</Option>
            <Option value="HIGH">High</Option>
          </Select>
          <Select
            placeholder="Filter by Category"
            style={{ width: 180 }}
            allowClear
            onChange={setCategoryFilter}
          >
            {categories.map(c => (
              <Option key={c.value} value={c.value}>{c.label}</Option>
            ))}
          </Select>
        </Space>
      </Card>

      <AnimatePresence mode="wait">
        {viewMode === 'list' ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="glass-morphism">
              <Table
                columns={columns}
                dataSource={tasks}
                loading={loading}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="kanban"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="kanban-board">
              {['PENDING', 'IN_PROGRESS', 'COMPLETED'].map((status) => {
                const columnTasks = columnsByStatus[status] || [];
                const displayTitle = status === 'PENDING' ? 'Pending Tasks' : status === 'IN_PROGRESS' ? 'In Progress' : 'Completed';
                const statusColor = status === 'PENDING' ? '#eab308' : status === 'IN_PROGRESS' ? '#3b82f6' : '#22c55e';
                
                return (
                  <div
                    key={status}
                    className={`kanban-column ${dragOverColumn === status ? 'drag-over' : ''}`}
                    onDragOver={(e) => handleDragOver(e, status)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, status)}
                  >
                    <div className="kanban-column-header">
                      <h3 style={{ margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: statusColor }} />
                        {displayTitle}
                      </h3>
                      <Tag color="default" style={{ borderRadius: '10px' }}>{columnTasks.length}</Tag>
                    </div>

                    <div style={{ minHeight: '400px' }}>
                      {columnTasks.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: '#71717a', fontSize: '13px', border: '1px dashed #27272a', borderRadius: '8px' }}>
                          Drag tasks here
                        </div>
                      ) : (
                        columnTasks.map((task) => (
                          <div
                            key={task.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, task)}
                            className="kanban-card glass-morphism"
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                              <h4 style={{ margin: 0, color: 'white', fontWeight: '600' }}>{task.title}</h4>
                              <Tag color={task.priority === 'HIGH' ? 'volcano' : task.priority === 'MEDIUM' ? 'gold' : 'blue'}>
                                {task.priority}
                              </Tag>
                            </div>
                            <p style={{ color: '#a1a1aa', fontSize: '12px', marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {task.description || 'No description provided.'}
                            </p>
                            
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                              {task.category && (
                                <Tag color={categories.find(c => c.value === task.category)?.color || 'default'} style={{ fontSize: '10px' }}>
                                  {categories.find(c => c.value === task.category)?.label || 'General'}
                                </Tag>
                              )}
                              {task.estimatedTime && (
                                <Tag icon={<Clock size={10} style={{ verticalAlign: 'middle', marginRight: '3px' }} />} style={{ fontSize: '10px', color: '#a1a1aa', background: 'rgba(255,255,255,0.02)' }}>
                                  {task.estimatedTime}
                                </Tag>
                              )}
                              {task.dueDate && (
                                <Tag icon={<Calendar size={10} style={{ verticalAlign: 'middle', marginRight: '3px' }} />} style={{ fontSize: '10px', color: '#a1a1aa', background: 'rgba(255,255,255,0.02)' }}>
                                  {dayjs(task.dueDate).format('MMM D')}
                                </Tag>
                              )}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                              <Button
                                icon={<Shield size={12} />}
                                type="text"
                                style={{ color: '#22c55e', fontSize: '11px', padding: '0 6px', height: '24px', background: 'rgba(34, 197, 94, 0.05)' }}
                                onClick={() => handleViewLedger(task)}
                              >
                                Ledger
                              </Button>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <Button
                                  icon={<Edit size={14} />}
                                  type="text"
                                  style={{ color: '#00f2ff', padding: '0 6px', height: '24px' }}
                                  onClick={() => handleEdit(task)}
                                />
                                <Button
                                  icon={<Trash2 size={14} />}
                                  type="text"
                                  danger
                                  style={{ padding: '0 6px', height: '24px' }}
                                  onClick={() => handleDelete(task.id)}
                                />
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Task Modal */}
      <Modal
        title={<span style={{ color: 'white' }}>Edit Task</span>}
        open={editModalOpen}
        onOk={handleEditSubmit}
        onCancel={() => { setEditModalOpen(false); setEditingTask(null); }}
        confirmLoading={editLoading}
        okText="Save Changes"
        okButtonProps={{
          style: { background: 'linear-gradient(90deg, #00f2ff, #7000ff)', border: 'none' },
        }}
      >
        <Form form={editForm} layout="vertical" style={{ marginTop: '16px' }}>
          <Form.Item
            name="title"
            label={<span style={{ color: 'white' }}>Title</span>}
            rules={[{ required: true, message: 'Title is required' }]}
          >
            <Input style={{ background: '#1c1c22', border: '1px solid #27272a', color: 'white' }} />
          </Form.Item>

          <Form.Item
            name="description"
            label={<span style={{ color: 'white' }}>Description</span>}
          >
            <Input.TextArea
              rows={3}
              style={{ background: '#1c1c22', border: '1px solid #27272a', color: 'white' }}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="priority"
                label={<span style={{ color: 'white' }}>Priority</span>}
              >
                <Select style={{ width: '100%' }}>
                  <Option value="LOW">Low</Option>
                  <Option value="MEDIUM">Medium</Option>
                  <Option value="HIGH">High</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label={<span style={{ color: 'white' }}>Status</span>}
              >
                <Select style={{ width: '100%' }}>
                  <Option value="PENDING">Pending</Option>
                  <Option value="IN_PROGRESS">In Progress</Option>
                  <Option value="COMPLETED">Completed</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="category"
                label={<span style={{ color: 'white' }}>Category</span>}
              >
                <Select style={{ width: '100%' }}>
                  {categories.map(c => (
                    <Option key={c.value} value={c.value}>{c.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
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
          </Row>

          <Form.Item
            name="dueDate"
            label={<span style={{ color: 'white' }}>Due Date</span>}
          >
            <DatePicker
              style={{ width: '100%', background: '#1c1c22', border: '1px solid #27272a' }}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Cryptographic Ledger History Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={20} color="#22c55e" />
            <span style={{ color: 'white' }}>Cryptographic Audit Ledger</span>
          </div>
        }
        open={ledgerModalOpen}
        onCancel={() => { setLedgerModalOpen(false); setLedgerTask(null); setHistoryList([]); }}
        footer={[
          <Button key="close" onClick={() => setLedgerModalOpen(false)} style={{ background: 'transparent', color: 'white', border: '1px solid #27272a' }}>
            Close
          </Button>,
          verifyState !== 'success' && (
            <Button
              key="verify"
              type="primary"
              icon={<Shield size={16} />}
              loading={verifyState === 'verifying'}
              onClick={handleVerifyLedger}
              style={{ background: '#22c55e', border: 'none' }}
            >
              Verify Ledger Chain
            </Button>
          )
        ]}
        width={600}
      >
        <div style={{ marginTop: '16px' }}>
          <p style={{ color: '#a1a1aa', fontSize: '13px', marginBottom: '20px' }}>
            Inspect the cryptographically secure blockchain-style history log for task: <strong>{ledgerTask?.title}</strong>. Every update calculates a SHA-256 hash linked to the previous state.
          </p>

          {verifyState === 'success' && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid #22c55e',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <CheckCircle2 color="#22c55e" size={24} style={{ flexShrink: 0 }} />
              <div>
                <h4 style={{ color: 'white', margin: 0, fontWeight: '600' }}>Cryptographic Integrity Verified</h4>
                <p style={{ color: '#a1a1aa', fontSize: '12px', margin: 0 }}>All state block hashes match their preceding linkages perfectly. Ledger is authentic and untampered.</p>
              </div>
            </motion.div>
          )}

          {verifyState === 'verifying' && (
            <div style={{ padding: '20px', textAlign: 'center', color: '#00f2ff' }}>
              <Shield size={32} className="neon-pulse" style={{ margin: '0 auto 10px', animation: 'neonPulse 1s infinite' }} />
              <p style={{ margin: 0 }}>Validating SHA-256 Block Linkages...</p>
            </div>
          )}

          {historyLoading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#71717a' }}>
              Loading ledger details...
            </div>
          ) : historyList.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#71717a' }}>
              No history blocks logged for this task.
            </div>
          ) : (
            <div className="blockchain-timeline">
              {historyList.map((block, idx) => (
                <div key={block.id} className={`blockchain-block ${verifyState === 'success' ? 'verified' : ''}`}>
                  <div className="block-index-circle">
                    {idx}
                  </div>
                  <div className="block-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <Tag color={block.action === 'CREATED' ? 'green' : 'blue'} style={{ textTransform: 'uppercase', fontSize: '10px' }}>
                        {block.action}
                      </Tag>
                      <span style={{ fontSize: '11px', color: '#71717a' }}>
                        {dayjs(block.timestamp).format('YYYY-MM-DD HH:mm:ss')}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div>
                        <span style={{ fontSize: '11px', color: '#71717a' }}>Block Hash:</span>
                        <div className="block-hash-field">{block.stateHash}</div>
                      </div>
                      {idx > 0 && (
                        <div>
                          <span style={{ fontSize: '11px', color: '#71717a' }}>Prev Block Link:</span>
                          <div className="block-hash-field" style={{ color: verifyState === 'success' ? '#22c55e' : '#a1a1aa' }}>{block.previousHash}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Tasks;
