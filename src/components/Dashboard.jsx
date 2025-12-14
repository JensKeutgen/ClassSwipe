import React from 'react';
import * as XLSX from 'xlsx';
import { Users, Download, Plus, Play, ChevronRight, Save, Upload, Trash2, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateGrade } from '../utils/gradeUtils';

const Dashboard = ({ onSelectClass }) => {
    const { classes, ratings, students, getAllData, restoreAllData, deleteClass, activeSessions, removeSession } = useApp();

    const pendingSessions = activeSessions
        .map(s => {
            const cls = classes.find(c => c.id === s.classId);
            return cls ? { ...s, className: cls.name } : null;
        })
        .filter(s => s !== null)
        .sort((a, b) => new Date(b.lastUpdate) - new Date(a.lastUpdate));

    const handleExport = () => {
        try {
            if (classes.length === 0) {
                alert("Noch keine Klassen zum Exportieren!");
                return;
            }

            const wb = XLSX.utils.book_new();

            classes.forEach(cls => {
                const classStudents = students.filter(s => s.classId === cls.id);

                if (classStudents.length === 0) return;

                const sheetData = classStudents.map(student => {
                    const sRatings = ratings.filter(r => r.studentId === student.id).sort((a, b) => new Date(a.date) - new Date(b.date));
                    const validRatings = sRatings.filter(r => r.rating > 0);

                    // Grade Calculation
                    const totalScore = validRatings.reduce((acc, r) => {
                        if (r.rating === 3) return acc + 1; // Good
                        if (r.rating === 2) return acc + 0.5; // Avg
                        return acc; // Bad is 0
                    }, 0);

                    const percentage = validRatings.length > 0 ? totalScore / validRatings.length : 0;
                    // Formula: Custom ranges via gradeUtils
                    const grade = validRatings.length > 0 ? calculateGrade(percentage) : "-";

                    // Name handling
                    let nameParts = student.name.split(',');
                    let nachname = student.name;
                    let vorname = "";

                    if (nameParts.length > 1) {
                        nachname = nameParts[0].trim();
                        vorname = nameParts[1].trim();
                    } else {
                        const parts = student.name.split(' ');
                        if (parts.length > 1) {
                            nachname = parts[parts.length - 1];
                            vorname = parts.slice(0, parts.length - 1).join(' ');
                        }
                    }

                    // Overview String
                    const overview = sRatings.map(r => {
                        const date = new Date(r.date).toLocaleDateString();
                        const status = r.rating === 3 ? '+' : r.rating === 2 ? 'o' : r.rating === 1 ? '-' : 'Fehlt';
                        const note = r.grade ? `(Note: ${r.grade.toFixed(1)})` : r.note ? `(${r.note})` : '';
                        return `${date}: ${status}${note}`;
                    }).join('; ');

                    return {
                        "Name": nachname,
                        "Vorname": vorname,
                        "Durchschnitt": grade,
                        "Anzahl Einträge": sRatings.length,
                        "Übersicht": overview
                    };
                });

                // Calculate Class Average
                if (sheetData.length > 0) {
                    const numericGrades = sheetData
                        .map(d => parseFloat(String(d.Durchschnitt).replace(',', '.')))
                        .filter(g => !isNaN(g));

                    if (numericGrades.length > 0) {
                        const classAvg = (numericGrades.reduce((a, b) => a + b, 0) / numericGrades.length).toFixed(1).replace('.', ',');
                        sheetData.push({
                            "Name": "KLASSENDURCHSCHNITT",
                            "Vorname": "",
                            "Durchschnitt": classAvg,
                            "Anzahl Einträge": "",
                            "Übersicht": ""
                        });
                    }
                }

                const ws = XLSX.utils.json_to_sheet(sheetData);

                // Adjust column widths roughly
                ws['!cols'] = [
                    { wch: 20 }, // Name
                    { wch: 20 }, // Vorname
                    { wch: 12 }, // Durch..
                    { wch: 15 }, // Anzahl
                    { wch: 100 } // Übersicht
                ];

                // Sanitize sheet name (Excel limit 31 chars, no special chars)
                const safeName = cls.name.replace(/[\\/?*[\]]/g, "").substring(0, 31) || `Class ${cls.id}`;
                XLSX.utils.book_append_sheet(wb, ws, safeName);
            });

            if (wb.SheetNames.length === 0) {
                alert("Keine Daten für den Export gefunden (keine Schüler in Klassen).");
                return;
            }

            XLSX.writeFile(wb, "ClassSwipe_Bericht_Erweitert.xlsx");
        } catch (error) {
            console.error("Export ErrorDetails:", error);
            alert(`Ein Fehler ist aufgetreten: ${error.message}`);
        }
    };

    return (
        <div className="h-full overflow-y-auto">
            <div className="p-6 max-w-lg mx-auto pb-20">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">ClassSwipe</h1>
                        <p className="text-gray-500 dark:text-gray-400">Schülerleistung erfassen</p>
                    </div>
                    <button
                        onClick={() => window.location.hash = '#/add-class'}
                        className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                    >
                        <Plus className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                    </button>
                </header>

                <div className="mb-8">
                    {pendingSessions.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Offene Bewertungen</h2>
                            <div className="space-y-4">
                                {pendingSessions.map(session => (
                                    <div key={session.classId} className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 p-4 rounded-xl flex items-center justify-between">
                                        <div>
                                            <h3 className="font-bold text-gray-800 dark:text-gray-100">{session.className}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {session.currentIndex} / {session.total} Schüler bewertet • {new Date(session.lastUpdate).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => onSelectClass(session.classId)}
                                                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition flex items-center gap-2"
                                            >
                                                <Play size={16} /> Fortsetzen
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm('Möchtest du diese Bewertung abschließen? Der Fortschritt für die verbleibenden Schüler geht verloren.')) {
                                                        removeSession(session.classId);
                                                    }
                                                }}
                                                className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                                                title="Abschließen / Verwerfen"
                                            >
                                                <Check size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Deine Klassen</h2>

                    {classes.length === 0 ? (
                        <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                            <p className="text-gray-500 dark:text-gray-400 mb-4">Noch keine Klassen.</p>
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => window.location.hash = '#/add-class'}
                                    className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                                >
                                    Manuell erstellen
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {classes.map(cls => (
                                <div
                                    key={cls.id}
                                    className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition"
                                >
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg">
                                            {cls.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-800 dark:text-white">{cls.name}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{cls.studentIds.length} Schüler</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => onSelectClass(cls.id)}
                                            className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2"
                                        >
                                            Swipe starten <Play size={16} fill="currentColor" />
                                        </button>
                                        <button
                                            onClick={() => window.location.hash = `#/students/${cls.id}`}
                                            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center gap-2"
                                        >
                                            <Users size={16} /> Schüler
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (window.confirm(`Bist du sicher, dass du "${cls.name}" und alle Schüler löschen möchtest?`)) {
                                                    deleteClass(cls.id);
                                                }
                                            }}
                                            className="px-3 py-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-200 dark:hover:bg-red-900/40 transition flex items-center justify-center"
                                            title="Klasse löschen"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-8 space-y-3">
                    <button
                        onClick={handleExport}
                        className="w-full py-4 bg-gray-900 dark:bg-gray-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-800 dark:hover:bg-gray-600 transition shadow-xl"
                    >
                        <Download size={20} />
                        Excel-Bericht exportieren
                    </button>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => {
                                const data = getAllData();
                                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `ClassSwipe_Backup_${new Date().toISOString().slice(0, 10)}.json`;
                                a.click();
                                URL.revokeObjectURL(url);
                            }}
                            className="py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                        >
                            <Save size={18} /> Sicherung
                        </button>
                        <label className="py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-300 dark:hover:bg-gray-600 transition cursor-pointer">
                            <Upload size={18} /> Wiederherstellen
                            <input
                                type="file"
                                accept=".json"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (!file) return;
                                    const reader = new FileReader();
                                    reader.onload = (evt) => {
                                        try {
                                            const data = JSON.parse(evt.target.result);
                                            restoreAllData(data);
                                            alert("Daten erfolgreich wiederhergestellt!");
                                        } catch (err) {
                                            alert("Fehler beim Wiederherstellen: " + err.message);
                                        }
                                    };
                                    reader.readAsText(file);
                                    e.target.value = null;
                                }}
                            />
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
