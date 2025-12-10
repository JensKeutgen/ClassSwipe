import React, { useState, useRef } from 'react';
import { Camera, Upload, User, Image as ImageIcon, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateGrade, getGradeColor } from '../utils/gradeUtils';

const StudentDetails = ({ studentId }) => {
    const { students, ratings, updateStudent } = useApp();
    const student = students.find(s => s.id === studentId);
    const [showImageOptions, setShowImageOptions] = useState(false);
    const cameraInputRef = useRef(null);
    const fileInputRef = useRef(null);

    if (!student) return <div>Schüler nicht gefunden</div>;

    const studentRatings = ratings.filter(r => r.studentId === studentId).sort((a, b) => new Date(a.date) - new Date(b.date));

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                updateStudent({ ...student, imageUrl: reader.result });
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

    // Calculate Grade
    // Rating: 0=Absent, 1=Bad, 2=Avg, 3=Good
    // We ignore Absent (0) for grade.
    const validRatings = studentRatings.filter(r => r.rating > 0);
    const totalScore = validRatings.reduce((acc, r) => {
        if (r.rating === 3) return acc + 1; // Good
        if (r.rating === 2) return acc + 0.5; // Avg
        return acc + 0; // Bad (1)
    }, 0);

    const maxScore = validRatings.length;
    const percentage = maxScore > 0 ? totalScore / maxScore : 0;
    const calculatedGrade = calculateGrade(percentage);

    let gradeDisplay = "N/A";
    let gradeColor = "text-gray-400";

    if (validRatings.length === 0) {
        gradeDisplay = "-";
    } else if (validRatings.length < 5) {
        // Not enough data - show range estimation? 
        // Or just show current calculated grade but grey?
        // User didn't specify behavior for low data, but let's stick to showing the grade based on current data
        // but maybe indicate it's preliminary.
        // Previous logic showed range. Let's keep range logic adapted to new scale?
        // Actually, with discrete steps 1,2,3... ranges are less ambiguous.
        // Let's just show the calculated grade but grey.
        gradeDisplay = calculatedGrade;
        gradeColor = "text-gray-500";
    } else {
        gradeDisplay = calculatedGrade;
        gradeColor = getGradeColor(calculatedGrade);
    }

    return (
        <div className="h-full overflow-y-auto">
            <div className="p-6 max-w-lg mx-auto pb-20">
                <div className="flex items-center gap-4 mb-8">
                    <div className="relative">
                        {student.imageUrl ? (
                            <img src={student.imageUrl} alt={student.name} className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-md" />
                        ) : (
                            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 border-4 border-white dark:border-gray-700 shadow-md">
                                <User size={48} />
                            </div>
                        )}
                        <button
                            onClick={() => setShowImageOptions(true)}
                            className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer shadow-sm hover:bg-blue-700 transition"
                        >
                            <Camera size={16} />
                        </button>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{student.name}</h2>
                        <p className="text-gray-500 dark:text-gray-400">Schülerdetails</p>
                    </div>
                    <div className="ml-auto text-center">
                        <div className={`text-3xl font-bold ${gradeColor}`}>{gradeDisplay}</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Note</div>
                    </div>
                </div>

                {/* Image Options Modal */}
                {showImageOptions && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowImageOptions(false)}>
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-xs space-y-4 animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Foto aktualisieren</h3>
                                <button onClick={() => setShowImageOptions(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={handleCameraClick} className="flex flex-col items-center gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition">
                                    <Camera size={32} />
                                    <span className="font-medium">Kamera</span>
                                </button>
                                <button onClick={handleFileClick} className="flex flex-col items-center gap-2 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition">
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

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-4">Leistungsverlauf</h3>
                    {studentRatings.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {studentRatings.map((rating, index) => (
                                <div
                                    key={index}
                                    title={`${new Date(rating.date).toLocaleDateString()}: ${rating.rating === 3 ? 'Gut' :
                                        rating.rating === 2 ? 'Mittel' :
                                            rating.rating === 1 ? 'Schlecht' : 'Fehlt'
                                        }${rating.note ? ` - ${rating.note}` : ''}`}
                                    className={`w-8 h-8 rounded-md transition-transform hover:scale-110 cursor-help ${rating.rating === 3 ? 'bg-green-500' :
                                        rating.rating === 2 ? 'bg-blue-500' :
                                            rating.rating === 1 ? 'bg-red-500' :
                                                'bg-gray-200 dark:bg-gray-600'
                                        }`}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400 text-center py-8">Noch keine Bewertungen.</p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl text-center">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">{studentRatings.filter(r => r.rating === 3).length}</div>
                        <div className="text-xs text-green-600 dark:text-green-400 uppercase font-bold tracking-wider">Gut</div>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl text-center">
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">{studentRatings.filter(r => r.rating === 1).length}</div>
                        <div className="text-xs text-red-600 dark:text-red-400 uppercase font-bold tracking-wider">Schlecht</div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-center">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{studentRatings.filter(r => r.rating === 2).length}</div>
                        <div className="text-xs text-blue-600 dark:text-blue-400 uppercase font-bold tracking-wider">Mittel</div>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl text-center">
                        <div className="text-2xl font-bold text-gray-600 dark:text-gray-300">{studentRatings.filter(r => r.rating === 0).length}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">Fehlt</div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-4">Letzte Aktivitäten</h3>
                    {studentRatings.length > 0 ? (
                        <div className="space-y-4">
                            {studentRatings.slice().reverse().map((rating, index) => (
                                <div key={index} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${rating.rating === 3 ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                                        rating.rating === 1 ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                                            rating.rating === 2 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                                                'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                        }`}>
                                        {rating.rating === 3 && '👍'}
                                        {rating.rating === 1 && '👎'}
                                        {rating.rating === 2 && '➖'}
                                        {rating.rating === 0 && '🚫'}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {rating.rating === 3 ? 'Gut' :
                                                    rating.rating === 1 ? 'Schlecht' :
                                                        rating.rating === 2 ? 'Mittel' : 'Fehlt'}
                                            </span>
                                            <span className="text-sm text-gray-400">
                                                {new Date(rating.date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        {rating.note && (
                                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{rating.note}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400 text-center py-4">Noch keine Aktivitäten.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentDetails;
