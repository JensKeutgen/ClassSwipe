export const calculateGrade = (percentage) => {
    // Percentage is 0.0 to 1.0
    if (percentage >= 0.90) return 1;
    if (percentage >= 0.75) return 2;
    if (percentage >= 0.60) return 3;
    if (percentage >= 0.45) return 4;
    if (percentage >= 0.10) return 5;
    return 6;
};

export const getGradeColor = (grade) => {
    if (grade <= 2) return "text-green-600";
    if (grade <= 4) return "text-yellow-600";
    return "text-red-600";
};
