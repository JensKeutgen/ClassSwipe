import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const AddClass = () => {
    const { addClass } = useApp();
    const [name, setName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        const newClass = {
            id: `class-${Date.now()}`,
            name: name.trim(),
            studentIds: []
        };

        addClass(newClass);
        window.history.back();
    };

    return (
        <div className="p-6 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Neue Klasse hinzufügen</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Klassenname</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="z.B. Mathematik 10a"
                        className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        autoFocus
                    />
                </div>
                <button
                    type="submit"
                    disabled={!name.trim()}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                >
                    Klasse erstellen
                </button>
            </form>
        </div>
    );
};

export default AddClass;
