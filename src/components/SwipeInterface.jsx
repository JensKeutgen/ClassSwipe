import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { motion, useMotionValue, useTransform, useAnimation, animate } from 'framer-motion';
import { Check, X, Minus, ArrowUp } from 'lucide-react';
import { useApp } from '../context/AppContext';

const SwipeCard = forwardRef(({ student, onSwipe, index, zIndex }, ref) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const controls = useAnimation();

    const rotate = useTransform(x, [-200, 200], [-30, 30]);
    // Opacity removed to prevent transparency issues

    // Background Color Transform
    const backgroundColor = useTransform(
        [x, y],
        ([latestX, latestY]) => {
            const absX = Math.abs(latestX);
            const absY = Math.abs(latestY);

            if (absX < 20 && absY < 20) return "rgba(255, 255, 255, 0)"; // Transparent at center

            if (absX > absY) {
                // Horizontal
                if (latestX > 0) {
                    // Green
                    const opacity = Math.min(absX / 150, 1);
                    return `rgba(34, 197, 94, ${opacity * 0.5})`;
                } else {
                    // Red
                    const opacity = Math.min(absX / 150, 1);
                    return `rgba(239, 68, 68, ${opacity * 0.5})`;
                }
            } else {
                // Vertical
                if (latestY < 0) {
                    // Yellow (Up)
                    const opacity = Math.min(absY / 150, 1);
                    return `rgba(234, 179, 8, ${opacity * 0.5})`;
                } else {
                    // Gray (Down)
                    const opacity = Math.min(absY / 150, 1);
                    return `rgba(107, 114, 128, ${opacity * 0.5})`;
                }
            }
        }
    );

    useImperativeHandle(ref, () => ({
        triggerSwipe: async (direction) => {
            let targetX = 0;
            let targetY = 0;

            switch (direction) {
                case 'right': targetX = 500; break;
                case 'left': targetX = -500; break;
                case 'up': targetY = -500; break;
                case 'down': targetY = 500; break;
            }

            // Animate x/y to trigger visual feedback
            if (targetX !== 0) await animate(x, targetX, { duration: 0.5 });
            if (targetY !== 0) await animate(y, targetY, { duration: 0.5 });

            onSwipe(direction, student);
        }
    }));

    const handleDragEnd = async (event, info) => {
        const threshold = 100;
        const { x: dragX, y: dragY } = info.offset;

        if (dragX > threshold) {
            await controls.start({ x: 500 });
            onSwipe('right', student); // Good
        } else if (dragX < -threshold) {
            await controls.start({ x: -500 });
            onSwipe('left', student); // Bad
        } else if (dragY < -threshold) {
            await controls.start({ y: -500 });
            onSwipe('up', student); // Average
        } else if (dragY > threshold) {
            await controls.start({ y: 500 });
            onSwipe('down', student); // Absent
        } else {
            controls.start({ x: 0, y: 0 });
        }
    };

    const hasImage = !!student.imageUrl;

    return (
        <motion.div
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.7}
            onDragEnd={handleDragEnd}
            animate={controls}
            style={{ x, y, rotate, backgroundColor: '#fff', zIndex }}
            className={`absolute top-0 left-0 w-full h-full bg-white dark:bg-gray-800 rounded-3xl shadow-xl flex flex-col ${hasImage ? 'justify-end' : 'items-center justify-center'} p-6 border border-gray-100 dark:border-gray-700 cursor-grab active:cursor-grabbing overflow-hidden`}
        >
            {/* Color Overlay for All Modes */}
            <motion.div
                style={{ backgroundColor }}
                className="absolute inset-0 z-10 pointer-events-none"
            />

            {hasImage ? (
                <>
                    <img
                        src={student.imageUrl}
                        alt={student.name}
                        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
                    <div className="relative z-20 text-center w-full mb-8">
                        <h2 className="text-4xl font-bold text-white mb-2 drop-shadow-md">{student.name}</h2>
                        <p className="text-gray-200 text-lg font-medium drop-shadow-sm">Wischen zum Bewerten</p>
                    </div>
                </>
            ) : (
                <div className="relative z-20 flex flex-col items-center">
                    <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-full mb-6 flex items-center justify-center text-4xl font-bold text-gray-400 dark:text-gray-500">
                        {student.name.charAt(0)}
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white text-center mb-2">{student.name}</h2>
                    <p className="text-gray-500 dark:text-gray-400">Wischen zum Bewerten</p>
                </div>
            )}

            {/* Visual Indicators */}
            <motion.div style={{ opacity: useTransform(x, [50, 150], [0, 1]) }} className="absolute right-8 top-8 text-green-500 z-30">
                <Check size={48} />
            </motion.div>
            <motion.div style={{ opacity: useTransform(x, [-50, -150], [0, 1]) }} className="absolute left-8 top-8 text-red-500 z-30">
                <X size={48} />
            </motion.div>
            <motion.div style={{ opacity: useTransform(y, [-50, -150], [0, 1]) }} className="absolute top-8 text-blue-500 z-30">
                <ArrowUp size={48} />
            </motion.div>
            <motion.div style={{ opacity: useTransform(y, [50, 150], [0, 1]) }} className="absolute bottom-8 text-gray-400 z-30">
                <Minus size={48} />
            </motion.div>
        </motion.div>
    );
});

const SwipeInterface = ({ classId, onFinish }) => {
    const { classes, students, addRating } = useApp();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedComments, setSelectedComments] = useState([]);
    const currentCardRef = useRef();

    const COMMENTS = ['Mündlich gut', 'Hausaufgaben fehlen', 'Material vergessen', 'Stört'];

    const currentClass = classes.find(c => c.id === classId);
    const classStudents = students.filter(s => currentClass?.studentIds.includes(s.id));

    const handleSwipe = (direction, student) => {
        let ratingValue = 0;
        let note = '';

        switch (direction) {
            case 'right': ratingValue = 3; note = 'Good'; break;
            case 'left': ratingValue = 1; note = 'Bad'; break;
            case 'up': ratingValue = 2; note = 'Average'; break;
            case 'down': ratingValue = 0; note = 'Absent'; break;
        }

        if (selectedComments.length > 0) {
            note += ` - ${selectedComments.join(', ')}`;
        }

        addRating({
            id: `rating-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            studentId: student.id,
            classId: classId,
            date: new Date().toISOString(),
            rating: ratingValue,
            note
        });

        setSelectedComments([]);

        if (currentIndex < classStudents.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            onFinish();
        }
    };

    const handleButtonClick = (direction) => {
        if (currentCardRef.current) {
            currentCardRef.current.triggerSwipe(direction);
        }
    };

    const toggleComment = (comment) => {
        setSelectedComments(prev =>
            prev.includes(comment)
                ? prev.filter(c => c !== comment)
                : [...prev, comment]
        );
    };

    if (!currentClass) return <div>Klasse nicht gefunden</div>;

    if (currentIndex >= classStudents.length) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Fertig!</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8">Du hast alle Schüler in {currentClass.name} bewertet.</p>
                <button
                    onClick={onFinish}
                    className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:bg-blue-700 transition"
                >
                    Zurück zum Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center w-full max-w-sm mx-auto mt-4 pb-6 h-full overflow-hidden">
            <div className="relative w-full h-[60vh] min-h-[400px] flex-shrink-0 mb-6">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-gray-300 dark:text-gray-600 text-xl">Keine Schüler mehr</div>
                </div>

                {classStudents.slice(currentIndex).reverse().map((student, index) => (
                    <SwipeCard
                        key={student.id}
                        ref={student.id === classStudents[currentIndex].id ? currentCardRef : null}
                        student={student}
                        onSwipe={handleSwipe}
                        index={index}
                        zIndex={index}
                    />
                ))}
            </div>

            <div className="grid grid-cols-2 gap-3 w-full px-4 mb-8">
                {COMMENTS.map(comment => (
                    <button
                        key={comment}
                        onClick={() => toggleComment(comment)}
                        className={`py-3 px-2 rounded-xl text-sm font-semibold transition-all shadow-sm border ${selectedComments.includes(comment)
                            ? 'bg-blue-600 text-white border-blue-600 shadow-blue-200'
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                    >
                        {comment}
                    </button>
                ))}
            </div>

            <div className="w-full flex justify-between px-8 text-gray-400 dark:text-gray-500 text-sm font-medium">
                <button
                    onClick={() => handleButtonClick('left')}
                    className="flex flex-col items-center gap-1 hover:scale-110 transition-transform"
                >
                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-red-500 dark:text-red-400 shadow-sm"><X size={20} /></div>
                    <span>Schlecht</span>
                </button>
                <button
                    onClick={() => handleButtonClick('down')}
                    className="flex flex-col items-center gap-1 hover:scale-110 transition-transform"
                >
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 shadow-sm"><Minus size={20} /></div>
                    <span>Fehlt</span>
                </button>
                <button
                    onClick={() => handleButtonClick('up')}
                    className="flex flex-col items-center gap-1 hover:scale-110 transition-transform"
                >
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-500 dark:text-blue-400 shadow-sm"><ArrowUp size={20} /></div>
                    <span>Mittel</span>
                </button>
                <button
                    onClick={() => handleButtonClick('right')}
                    className="flex flex-col items-center gap-1 hover:scale-110 transition-transform"
                >
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center text-green-500 dark:text-green-400 shadow-sm"><Check size={20} /></div>
                    <span>Gut</span>
                </button>
            </div>
        </div>
    );
};

export default SwipeInterface;
