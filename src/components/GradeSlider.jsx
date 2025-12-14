import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';

const GradeSlider = forwardRef(({ value, range = { min: 1, max: 6 } }, ref) => {
    // Value should be between 1 and 6
    // 1 is Top (0% Y), 6 is Bottom (100% Y)? 
    // User said: "6 (unten) bis 1 (oben)"
    // So 1 -> Top, 6 -> Bottom.

    const clampedValue = Math.max(range.min, Math.min(range.max, value || range.min));
    const percentage = ((clampedValue - range.min) / (range.max - range.min)) * 100;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end justify-center pb-24 pointer-events-none"
        >
            <div
                className="relative w-24 h-[40vh] bg-white/10 rounded-full py-6 flex flex-col items-center justify-between"
                ref={ref}
            >
                {/* Track Line */}
                <div className="absolute top-8 bottom-8 left-1/2 w-1 -translate-x-1/2 bg-white/20 rounded-full" />

                {/* Nodes */}
                <div className="h-full flex flex-col justify-between items-center w-full z-10">
                    {[1, 2, 3, 4, 5, 6].map((grade) => (
                        <div
                            key={grade}
                            className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg transition-all duration-200 ${Math.abs(clampedValue - grade) < 0.3
                                ? 'bg-blue-500 text-white scale-150 shadow-lg shadow-blue-500/50'
                                : 'bg-white/20 text-white/70'
                                }`}
                        >
                            {grade}
                        </div>
                    ))}
                </div>

                {/* Active Indicator (Follower) */}
                <div
                    className="absolute left-1/2 -translate-x-1/2 w-20 h-10 bg-white text-black font-bold rounded-full flex items-center justify-center shadow-xl z-20"
                    style={{ top: `${percentage}%`, marginTop: '-1.25rem' }} // Center vertically on the point
                >
                    {clampedValue.toFixed(1)}
                </div>
            </div>

            <div className="absolute bottom-10 text-white/50 text-sm font-medium animate-pulse">
                Zum Bestätigen loslassen
            </div>
        </motion.div>
    );
});

export default GradeSlider;
