import { useContext } from 'react';
import { RecordsContext } from '../context/RecordsContext';

export const useRecords = () => {
    const context = useContext(RecordsContext);
    if (!context) throw new Error('useRecords must be used within RecordsProvider');
    return context;
};
