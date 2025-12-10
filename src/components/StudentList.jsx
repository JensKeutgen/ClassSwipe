import React from 'react';
import { ChevronRight, User, Plus, Clipboard, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

const StudentList = ({ classId, onSelectStudent }) => {
    const { classes, students, deleteStudent } = useApp();
    const currentClass = classes.find(c => c.id === classId);

    if (!currentClass) return <div>Klasse nicht gefunden</div>;

    const classStudents = students.filter(s => currentClass.studentIds.includes(s.id));

    return (
        <div className="p-6 max-w-lg mx-auto pb-20">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{currentClass.name}</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => window.location.hash = `#/bulk-add/${classId}`}
                        className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition shadow-sm"
                        title="Liste einfügen"
                    >
                        <Clipboard size={24} />
                    </button>
                    <button
                        onClick={() => window.location.hash = `#/add-student/${classId}`}
                        className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition shadow-sm"
                        title="Schüler hinzufügen"
                    >
                        <Plus size={24} />
                    </button>
                </div>
            </div>

            {classStudents.length === 0 ? (
                <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Noch keine Schüler in dieser Klasse.</p>
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={() => window.location.hash = `#/add-student/${classId}`}
                            className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                        >
                            Schüler hinzufügen
                        </button>
                        <span className="text-gray-400 text-sm">oder</span>
                        <button
                            onClick={() => window.location.hash = `#/bulk-add/${classId}`}
                            className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                        >
                            Liste einfügen
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    {classStudents.map(student => (
                        <div
                            key={student.id}
                            onClick={() => onSelectStudent(student.id)}
                            className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer"
                        >
                            <div className="flex items-center gap-4">
                                {student.imageUrl ? (
                                    <img src={student.imageUrl} alt={student.name} className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-600" />
                                ) : (
                                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                                        <User size={24} />
                                    </div>
                                )}
                                <span className="font-medium text-gray-800 dark:text-white">{student.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm(`${student.name} löschen?`)) {
                                            deleteStudent(student.id);
                                        }
                                    }}
                                    className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition"
                                >
                                    <Trash2 size={18} />
                                </button>
                                <ChevronRight className="text-gray-400" size={20} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentList;
