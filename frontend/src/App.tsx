import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import './App.css';
import CategoryColumn from './components/CategoryColumn';
import TaskCard from './components/TaskCard';
import AddTaskModal from './components/AddTaskModal';
import UserManagement from './components/UserManagement';
import Header from './components/Header';
import { Task, Category, User } from './types';

const API_URL = 'http://34.70.121.37:5001/api';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [filterDueDate, setFilterDueDate] = useState<string>('All');
  const [showSpecialCategories, setShowSpecialCategories] = useState(false);
  const [loading, setLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchCategories();
    fetchTasks();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_URL}/tasks`);
      setTasks(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setLoading(false);
    }
  };

  const handleAddCategory = async (name: string) => {
    try {
      const response = await axios.post(`${API_URL}/categories`, { name });
      setCategories([...categories, response.data]);
    } catch (error) {
      console.error('Error adding category:', error);
      alert('Error adding category. It might already exist.');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const category = categories.find(cat => cat._id === id);
    if (category && !category.isDeletable) {
      alert('This category cannot be deleted.');
      return;
    }

    if (window.confirm('This will delete all tasks in this category. Are you sure?')) {
      try {
        await axios.delete(`${API_URL}/categories/${id}`);
        setCategories(categories.filter(cat => cat._id !== id));
        setTasks(tasks.filter(task => task.category._id !== id));
      } catch (error: any) {
        if (error.response?.status === 400) {
          alert('This category cannot be deleted.');
        } else {
          console.error('Error deleting category:', error);
        }
      }
    }
  };

  const handleAddTask = async (taskData: any) => {
    try {
      const response = await axios.post(`${API_URL}/tasks`, taskData);
      setTasks([...tasks, response.data]);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error adding task:', error);
      alert('Error adding task. Please check all fields.');
    }
  };

  const handleEditTask = async (taskData: any) => {
    if (!editingTask) return;
    try {
      const response = await axios.put(`${API_URL}/tasks/${editingTask._id}`, taskData);
      setTasks(tasks.map(task => task._id === editingTask._id ? response.data : task));
      setEditingTask(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/tasks/${id}`);

      const response = await axios.get(`${API_URL}/tasks`);
      setTasks(response.data);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleCompleteTask = async (id: string) => {
    try {
      const response = await axios.patch(`${API_URL}/tasks/${id}/complete`);
      setTasks(tasks.map(task => task._id === id ? response.data : task));
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const taskId = active.id as string;
    const categoryId = over.id as string;

    const category = categories.find(cat => cat._id === categoryId);
    if (!category) return;

    try {
      const response = await axios.patch(`${API_URL}/tasks/${taskId}/category`, {
        categoryId
      });
      setTasks(tasks.map(task => task._id === taskId ? response.data : task));
    } catch (error) {
      console.error('Error updating task category:', error);
    }
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const getFilteredTasks = () => {
    let filtered = [...tasks];

    if (!showSpecialCategories) {
      filtered = filtered.filter(task => task.status === 'active' || !task.status);
    }

    if (filterPriority !== 'All') {
      filtered = filtered.filter(task => task.priority === filterPriority);
    }

    if (filterDueDate !== 'All') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      switch (filterDueDate) {
        case 'Today':
          filtered = filtered.filter(task => {
            const dueDate = new Date(task.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            return dueDate.getTime() === today.getTime();
          });
          break;
        case 'This Week':
          const weekEnd = new Date(today);
          weekEnd.setDate(weekEnd.getDate() + 7);
          filtered = filtered.filter(task => {
            const dueDate = new Date(task.dueDate);
            return dueDate >= today && dueDate <= weekEnd;
          });
          break;
        case 'Overdue':
          filtered = filtered.filter(task => {
            const dueDate = new Date(task.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            return dueDate < today;
          });
          break;
      }
    }

    return filtered;
  };

  const getVisibleCategories = () => {
    if (showSpecialCategories) {
      return categories;
    }
    return categories.filter(cat => !cat.isSpecial);
  };

  const filteredTasks = getFilteredTasks();
  const visibleCategories = getVisibleCategories();
  const activeTask = activeId ? tasks.find(t => t._id === activeId) : null;

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="App">
      <Header
        onAddTask={() => setIsModalOpen(true)}
        onAddCategory={handleAddCategory}
        onManageUsers={() => setIsUserModalOpen(true)}
        filterPriority={filterPriority}
        setFilterPriority={setFilterPriority}
        filterDueDate={filterDueDate}
        setFilterDueDate={setFilterDueDate}
        showSpecialCategories={showSpecialCategories}
        setShowSpecialCategories={setShowSpecialCategories}
      />

      <div className="main-content">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="categories-container">
            {visibleCategories.length === 0 ? (
              <div className="empty-state">
                <h2>No categories yet</h2>
                <p>Create a category to start organizing your tasks</p>
              </div>
            ) : (
              visibleCategories.map(category => (
                <CategoryColumn
                  key={category._id}
                  category={category}
                  tasks={filteredTasks.filter(task => task.category._id === category._id)}
                  onDeleteTask={handleDeleteTask}
                  onEditTask={openEditModal}
                  onCompleteTask={handleCompleteTask}
                  onDeleteCategory={handleDeleteCategory}
                />
              ))
            )}
          </div>

          <DragOverlay>
            {activeTask ? (
              <TaskCard
                task={activeTask}
                onDelete={() => { }}
                onEdit={() => { }}
                onComplete={() => { }}
                isDragging
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <AddTaskModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={editingTask ? handleEditTask : handleAddTask}
        categories={categories}
        users={users}
        editingTask={editingTask}
      />

      {isUserModalOpen && (
        <UserManagement
          users={users}
          onUsersChange={fetchUsers}
          onClose={() => setIsUserModalOpen(false)}
        />
      )}
    </div>
  );
}

export default App;