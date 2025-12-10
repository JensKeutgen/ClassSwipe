import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    // State for Classes, Students, and Schedule
    // Structure: { id, name, students: [studentIds] }
    const [classes, setClasses] = useState(() => {
        const saved = localStorage.getItem('cs_classes');
        return saved ? JSON.parse(saved) : [];
    });

    // Structure: { id, name, classId, photoUrl (optional) }
    const [students, setStudents] = useState(() => {
        const saved = localStorage.getItem('cs_students');
        return saved ? JSON.parse(saved) : [];
    });

    // Structure: { id, classId, dayOfWeek, startTime, endTime, subject }
    const [schedule, setSchedule] = useState(() => {
        const saved = localStorage.getItem('cs_schedule');
        return saved ? JSON.parse(saved) : [];
    });

    // Structure: { id, studentId, classId, date, rating (0-3), note }
    // Rating: 0=Down(Absent), 1=Left(Bad), 2=Up(Avg), 3=Right(Good)
    const [ratings, setRatings] = useState(() => {
        const saved = localStorage.getItem('cs_ratings');
        return saved ? JSON.parse(saved) : [];
    });

    // Sync Settings: { backupUrl, restoreUrl }
    const [syncSettings, setSyncSettings] = useState(() => {
        const saved = localStorage.getItem('cs_sync_settings');
        return saved ? JSON.parse(saved) : { backupUrl: '', restoreUrl: '' };
    });

    // Automatic Dark Mode (System Preference)
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = (e) => {
            if (e.matches) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        };

        // Initial check
        handleChange(mediaQuery);

        // Listen for changes
        mediaQuery.addEventListener('change', handleChange);

        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const addClass = (newClass) => setClasses(prev => [...prev, newClass]);

    const addStudent = (newStudent, classId) => {
        setStudents(prev => [...prev, newStudent]);
        if (classId) {
            setClasses(prev => prev.map(c => {
                if (c.id === classId) {
                    return { ...c, studentIds: [...c.studentIds, newStudent.id] };
                }
                return c;
            }));
        }
    };

    const updateStudent = (updatedStudent) => {
        setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
    };

    const deleteClass = (classId) => {
        setClasses(prev => prev.filter(c => c.id !== classId));
        // Also delete students in that class? Or keep them orphaned? 
        // Better to delete them to clean up.
        setStudents(prev => prev.filter(s => s.classId !== classId));
        // And ratings
        setRatings(prev => prev.filter(r => r.classId !== classId));
    };

    const deleteStudent = (studentId) => {
        setStudents(prev => prev.filter(s => s.id !== studentId));
        setRatings(prev => prev.filter(r => r.studentId !== studentId));
        // Remove from class studentIds list
        setClasses(prev => prev.map(c => ({
            ...c,
            studentIds: c.studentIds.filter(id => id !== studentId)
        })));
    };

    const addRating = (rating) => setRatings(prev => [...prev, rating]);

    // Bulk import helper
    const importData = (newClasses, newStudents, newSchedule) => {
        setClasses(newClasses);
        setStudents(newStudents);
        setSchedule(newSchedule);
    };

    const clearData = () => {
        setClasses([]);
        setStudents([]);
        setSchedule([]);
        setRatings([]);
    };

    const getAllData = () => ({
        classes, students, schedule, ratings
    });

    const restoreAllData = (data) => {
        if (data.classes) setClasses(data.classes);
        if (data.students) setStudents(data.students);
        if (data.schedule) setSchedule(data.schedule);
        if (data.ratings) setRatings(data.ratings);
    };

    const updateSyncSettings = (settings) => {
        setSyncSettings(settings);
    };

    const backupData = async () => {
        if (!syncSettings.backupUrl) throw new Error("Backup URL not configured");
        const data = getAllData();
        const response = await fetch(syncSettings.backupUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error("Backup failed");
        return true;
    };

    const restoreData = async () => {
        if (!syncSettings.restoreUrl) throw new Error("Restore URL not configured");
        const response = await fetch(syncSettings.restoreUrl);
        if (!response.ok) throw new Error("Restore failed");
        const data = await response.json();
        restoreAllData(data);
        return true;
    };



    return (
        <AppContext.Provider value={{
            classes, students, schedule, ratings, syncSettings,
            addClass, addStudent, updateStudent, deleteClass, deleteStudent, addRating, importData, clearData,
            getAllData, restoreAllData, updateSyncSettings, backupData, restoreData
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);
