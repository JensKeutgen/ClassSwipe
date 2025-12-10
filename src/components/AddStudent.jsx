import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Camera, Image as ImageIcon, X } from 'lucide-react';

const AddStudent = ({ classId }) => {
    const { addStudent: addStudentToContext } = useApp();
    const [name, setName] = useState('');
    const [image, setImage] = useState(null);
    const [showImageOptions, setShowImageOptions] = useState(false);
    const cameraInputRef = useRef(null);
    const fileInputRef = useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        const newStudent = {
            id: `student-${Date.now()}`,
            name: name.trim(),
            classId: classId,
            imageUrl: image
        };

        addStudentToContext(newStudent, classId);
        window.history.back();
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
                setShowImageOptions(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCameraClick = () => {
        if (cameraInputRef.current) cameraInputRef.current.click();
        setShowImageOptions(false);
    };

    const handleFileClick = () => {
        if (fileInputRef.current) fileInputRef.current.click();
        setShowImageOptions(false);
    };

    return (
        <div className="p-6 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Schüler hinzufügen</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-center">
                    <div className="relative group cursor-pointer" onClick={() => setShowImageOptions(true)}>
                        {image ? (
                            <img src={image} alt="Vorschau" className="w-32 h-32 rounded-full object-cover border-4 border-gray-100 dark:border-gray-700" />
                        ) : (
                            <div className="w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400 dark:text-gray-500 border-4 border-dashed border-gray-300 dark:border-gray-600">
                                <Camera size={40} />
                            </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-full transition">
                            {/* Overlay for hover effect */}
                        </div>
                    </div>
                </div>

                {/* Image Options Modal */}
                {showImageOptions && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowImageOptions(false)}>
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-xs space-y-4 animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Foto hinzufügen</h3>
                                <button onClick={() => setShowImageOptions(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <button type="button" onClick={handleCameraClick} className="flex flex-col items-center gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition">
                                    <Camera size={32} />
                                    <span className="font-medium">Kamera</span>
                                </button>
                                <button type="button" onClick={handleFileClick} className="flex flex-col items-center gap-2 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition">
                                    <ImageIcon size={32} />
                                    <span className="font-medium">Galerie</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Hidden Inputs */}
                <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleImageUpload} className="hidden" />
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name des Schülers</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Max Mustermann"
                        className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        autoFocus
                    />
                </div>

                <button
                    type="submit"
                    disabled={!name.trim()}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                >
                    Schüler hinzufügen
                </button>
            </form>
        </div>
    );
};

export default AddStudent;
