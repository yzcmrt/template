import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import './TaskPage.css'

interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  completed: boolean;
  type: 'daily' | 'weekly';
}

const TaskPage = () => {
  const { t } = useTranslation()
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 'daily-1',
      title: 'Watch an ad',
      description: 'Watch a short advertisement to earn points',
      reward: 50,
      completed: false,
      type: 'daily'
    },
    {
      id: 'daily-2',
      title: 'Share on social media',
      description: 'Share your mining progress on social media',
      reward: 100,
      completed: false,
      type: 'daily'
    },
    {
      id: 'daily-3',
      title: 'Invite a friend',
      description: 'Invite a friend to join TON Mining',
      reward: 200,
      completed: false,
      type: 'daily'
    },
    {
      id: 'weekly-1',
      title: '7-day login streak',
      description: 'Log in for 7 consecutive days',
      reward: 500,
      completed: false,
      type: 'weekly'
    },
    {
      id: 'weekly-2',
      title: '5-day mining streak',
      description: 'Mine for 5 consecutive days',
      reward: 750,
      completed: false,
      type: 'weekly'
    }
  ])

  // Görevi tamamla
  const completeTask = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: true } : task
    ))
    
    // Burada backend'e görev tamamlama bilgisi gönderilecek
  }

  // Daily ve weekly görevleri ayır
  const dailyTasks = tasks.filter(task => task.type === 'daily')
  const weeklyTasks = tasks.filter(task => task.type === 'weekly')

  return (
    <div className="task-page">
      <h1>{t('task.title')}</h1>
      
      <div className="task-section">
        <h2>{t('task.daily')}</h2>
        {dailyTasks.map(task => (
          <div key={task.id} className={`task-card ${task.completed ? 'completed' : ''}`}>
            <div className="task-info">
              <h3>{task.title}</h3>
              <p>{task.description}</p>
              <p className="task-reward">{t('task.reward', { points: task.reward })}</p>
            </div>
            <button 
              onClick={() => completeTask(task.id)}
              disabled={task.completed}
            >
              {task.completed ? t('task.completed') : t('task.complete')}
            </button>
          </div>
        ))}
      </div>
      
      <div className="task-section">
        <h2>{t('task.weekly')}</h2>
        {weeklyTasks.map(task => (
          <div key={task.id} className={`task-card ${task.completed ? 'completed' : ''}`}>
            <div className="task-info">
              <h3>{task.title}</h3>
              <p>{task.description}</p>
              <p className="task-reward">{t('task.reward', { points: task.reward })}</p>
            </div>
            <button 
              onClick={() => completeTask(task.id)}
              disabled={task.completed}
            >
              {task.completed ? t('task.completed') : t('task.complete')}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TaskPage 