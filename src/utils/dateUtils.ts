// src/utils/dateUtils.ts
export const formatDateToYYYYMMDD = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const formateYYYYMMDDToDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const formatDateForDisplay = (date: Date | string | null | undefined): string => {
    if (!date) return '';

    let dateObj: Date;
    if (typeof date === 'string') {
        dateObj = formateYYYYMMDDToDate(date);
    } else {
        dateObj = date;
    }

    const year = dateObj.getFullYear();
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const day = dateObj.getDate().toString().padStart(2, '0');

    return `${year}년 ${month}월 ${day}일`;
};

export const getDdayInfo = (endDateString: string, selectedDate: Date): { text: string; isUrgent: boolean } => {
    const endDate = formateYYYYMMDDToDate(endDateString);
    endDate.setHours(0, 0, 0, 0); // Normalize to start of day

    selectedDate.setHours(0, 0, 0, 0); // Normalize to start of day

    const diffTime = endDate.getTime() - selectedDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return { text: 'D-day', isUrgent: true };
    } else if (diffDays > 0) {
        return { text: `D-${diffDays}`, isUrgent: diffDays <= 7 };
    } else {
        return { text: `D+${Math.abs(diffDays)}`, isUrgent: false };
    }
};
