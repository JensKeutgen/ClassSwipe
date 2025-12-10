import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Clipboard, CheckCircle, AlertCircle } from 'lucide-react';

const BulkAddStudents = ({ classId }) => {
    const { addStudent, classes } = useApp();
    const [text, setText] = useState('');
    const [preview, setPreview] = useState([]);
    const [error, setError] = useState(null);

    const currentClass = classes.find(c => c.id === classId);

    const parseText = (inputText) => {
        if (!inputText.trim()) {
            setPreview([]);
            return;
        }

        const lines = inputText.trim().split('\n');
        const parsed = [];
        let headersFound = false;
        let firstNameIndex = -1;
        let lastNameIndex = -1;

        // Try to detect headers in the first line
        const firstLine = lines[0].toLowerCase();
        if (firstLine.includes('vorname') || firstLine.includes('firstname')) {
            headersFound = true;
            const headers = lines[0].split(/\t|;|,\s*/); // Split by tab, semicolon, or comma

            headers.forEach((h, i) => {
                const header = h.toLowerCase().trim();
                if (header.includes('vorname') || header.includes('firstname')) firstNameIndex = i;
                if (header.includes('familienname') || header.includes('nachname') || header.includes('lastname') || header.includes('surname')) lastNameIndex = i;
            });
        }

        // Process lines
        const startIdx = headersFound ? 1 : 0;

        for (let i = startIdx; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const parts = line.split(/\t|;|,\s*/).map(p => p.trim());

            let firstName = '';
            let lastName = '';

            if (headersFound && firstNameIndex !== -1 && lastNameIndex !== -1) {
                firstName = parts[firstNameIndex] || '';
                lastName = parts[lastNameIndex] || '';
            } else {
                // Fallback: Assume "Lastname Firstname" (based on user image) or "Firstname Lastname"
                // User image shows: Familienname | Vorname
                // So default to: Index 0 = Lastname, Index 1 = Firstname
                if (parts.length >= 2) {
                    lastName = parts[0];
                    firstName = parts[1];
                } else {
                    // Just one name? Treat as Firstname
                    firstName = parts[0];
                }
            }

            if (firstName || lastName) {
                parsed.push({
                    name: `${firstName} ${lastName}`.trim(),
                    original: line
                });
            }
        }

        setPreview(parsed);
    };

    const handleTextChange = (e) => {
        const val = e.target.value;
        setText(val);
        parseText(val);
    };

    const handleImport = () => {
        if (preview.length === 0) return;

        try {
            let count = 0;
            preview.forEach(p => {
                const newStudent = {
                    id: `student-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    name: p.name,
                    classId: classId,
                    imageUrl: null
                };
                addStudent(newStudent, classId);
                count++;
            });

            alert(`${count} Schüler erfolgreich hinzugefügt!`);
            window.history.back();
        } catch (err) {
            setError("Fehler beim Hinzufügen der Schüler: " + err.message);
        }
    };

    if (!currentClass) return <div>Klasse nicht gefunden</div>;

    return (
        <div className="p-6 max-w-lg mx-auto pb-20">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Schülerliste importieren</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Füge deine Liste unten ein (z.B. aus Excel).</p>

            <div className="mb-4">
                <textarea
                    value={text}
                    onChange={handleTextChange}
                    placeholder={`Familienname\tVorname\nMustermann\tMax\nDoe\tJohn`}
                    className="w-full h-40 p-4 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
            </div>

            {preview.length > 0 && (
                <div className="mb-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-500" />
                        Vorschau ({preview.length} Schüler)
                    </h3>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                        {preview.map((p, i) => (
                            <div key={i} className="text-sm text-gray-600 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700 last:border-0 py-1">
                                {p.name}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {error && (
                <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg flex items-center gap-2 text-sm">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            <button
                onClick={handleImport}
                disabled={preview.length === 0}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
                <Clipboard size={20} />
                Schüler importieren
            </button>
        </div>
    );
};

export default BulkAddStudents;
