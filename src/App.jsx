import React, { useState, useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import Dashboard from './components/Dashboard';
import SwipeInterface from './components/SwipeInterface';
import StudentList from './components/StudentList';
import StudentDetails from './components/StudentDetails';
import AddClass from './components/AddClass';
import AddStudent from './components/AddStudent';
import BulkAddStudents from './components/BulkAddStudents';
import Settings from './components/Settings';
import { ArrowLeft, Settings as SettingsIcon } from 'lucide-react';

function AppContent() {
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard, import, swipe, student-list, student-details
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  // Simple hash router for now
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#/import') {
        setCurrentView('import');
      } else if (hash.startsWith('#/swipe/')) {
        const classId = hash.split('/')[2];
        setSelectedClassId(classId);
        setCurrentView('swipe');
      } else if (hash.startsWith('#/students/')) {
        const classId = hash.split('/')[2];
        setSelectedClassId(classId);
        setCurrentView('student-list');
      } else if (hash.startsWith('#/student/')) {
        const studentId = hash.split('/')[2];
        setSelectedStudentId(studentId);
        setCurrentView('student-details');
      } else if (hash === '#/add-class') {
        setCurrentView('add-class');
      } else if (hash.startsWith('#/add-student/')) {
        const classId = hash.split('/')[2];
        setSelectedClassId(classId);
        setCurrentView('add-student');
      } else if (hash.startsWith('#/bulk-add/')) {
        const classId = hash.split('/')[2];
        setSelectedClassId(classId);
        setCurrentView('bulk-add-students');
      } else if (hash === '#/settings') {
        setCurrentView('settings');
      } else {
        setCurrentView('dashboard');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Initial check

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const renderView = () => {
    switch (currentView) {
      case 'swipe':
        return <SwipeInterface classId={selectedClassId} onFinish={() => window.location.hash = ''} />;
      case 'student-list':
        return <StudentList classId={selectedClassId} onSelectStudent={(id) => window.location.hash = `#/student/${id}`} />;
      case 'student-details':
        return <StudentDetails studentId={selectedStudentId} />;
      case 'add-class':
        return <AddClass />;
      case 'add-student':
        return <AddStudent classId={selectedClassId} />;
      case 'bulk-add-students':
        return <BulkAddStudents classId={selectedClassId} />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onSelectClass={(id) => window.location.hash = `#/swipe/${id}`} />;
    }
  };

  const isSwipeView = currentView === 'swipe';

  return (
    <div className={`w-screen flex flex-col transition-colors duration-200 ${isSwipeView ? 'h-[100dvh] overflow-hidden bg-gray-50 dark:bg-gray-900' : 'min-h-[100dvh] bg-gray-50 dark:bg-gray-900'}`}>
      <header className={`bg-white dark:bg-gray-800 shadow-sm z-10 flex-shrink-0 transition-colors duration-200 ${isSwipeView ? '' : 'sticky top-0'}`}>
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          {currentView !== 'dashboard' ? (
            <button onClick={() => window.history.back()} className="p-2 -ml-2 text-gray-600 dark:text-gray-300">
              <ArrowLeft size={24} />
            </button>
          ) : (
            <div className="w-10" /> // Spacer
          )}
          <h1 className="font-bold text-lg text-gray-800 dark:text-white">ClassSwipe</h1>
          <div className="w-10 flex justify-end">
            {currentView === 'dashboard' && (
              <button onClick={() => window.location.hash = '#/settings'} className="p-2 -mr-2 text-gray-600 dark:text-gray-300">
                <SettingsIcon size={24} />
              </button>
            )}
          </div>
        </div>
      </header>
      <main className={`relative w-full ${isSwipeView ? 'flex-1 overflow-hidden' : 'flex-1'}`}>
        {renderView()}
      </main>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
