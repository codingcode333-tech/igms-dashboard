import { format, startOfYear, sub } from "date-fns";

export const dateFormat = "yyyy-MM-dd"

export const stringDate = date => formatDate(date, "d MMM, yyyy")

export const formatDate = (date = new Date(), form = dateFormat) => {
    try {
        if (!date || date === 'nan' || date === 'null' || date === 'undefined' || date === '') {
            return '';
        }
        
        const dateObj = (typeof date == 'string') ? new Date(date) : date;
        
        // Check if date is valid
        if (isNaN(dateObj.getTime())) {
            return '';
        }
        
        return format(dateObj, form);
    } catch (error) {
        console.warn('Date formatting error:', date, error);
        return '';
    }
}

export const dateBefore = (no_of_days = 0) => formatDate(sub(new Date(), { days: no_of_days }))

export const firstDateOfTheYear = formatDate(startOfYear(new Date()))

export const currentDate = formatDate()