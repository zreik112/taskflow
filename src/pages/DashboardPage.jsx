import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ProjectSidebar from '../components/ProjectSidebar';
import TaskCreate from '../components/TaskCreate';
import TaskList from '../components/TaskList';
import styles from './DashboardPage.module.css';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [selectedProject, setSelectedProject] = useState(null);
  const [taskListKey, setTaskListKey] = useState(0);

  function handleTaskCreated() {
    // Bump key to force TaskList to re-fetch
    setTaskListKey((k) => k + 1);
  }

  return (
    <div className={styles.shell}>
      {/* ── Header ── */}
      <header className={styles.header}>
        <span className={styles.brand}>TaskFlow</span>
        <div className={styles.headerRight}>
          <span className={styles.userEmail}>{user?.email}</span>
          <button className={styles.logoutBtn} onClick={logout} type="button">
            Sign out
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className={styles.body}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <ProjectSidebar
            selectedId={selectedProject?.id}
            onSelect={setSelectedProject}
          />
        </aside>

        {/* Main content */}
        <main className={styles.main}>
          {!selectedProject ? (
            <div className={styles.empty}>
              <p>Select a project on the left — or create one — to get started.</p>
            </div>
          ) : (
            <>
              <h2 className={styles.projectTitle}>{selectedProject.name}</h2>
              <TaskCreate
                projectId={selectedProject.id}
                onCreated={handleTaskCreated}
              />
              <TaskList
                key={taskListKey}
                projectId={selectedProject.id}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
