import { useState } from 'react';
import { db } from '../db';
import type { Goal } from '../db'; // Import Goal interface

interface GoalEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const presetColors = [
  '#4f46e5', // Indigo-600
  '#dc2626', // Red-600
  '#ea580c', // Orange-600
  '#d97706', // Amber-600
  '#059669', // Emerald-600
  '#0d9488', // Teal-600
  '#1d4ed8', // Blue-700
  '#8b5cf6', // Violet-500
];

type PeriodTypeOption = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'free';

const periodTypeOptions = [
  { value: 'yearly', label: '연간' },
  { value: 'monthly', label: '월간' },
  { value: 'weekly', label: '주간' },
  { value: 'daily', label: '일간' },
  { value: 'free', label: '자유' },
];

const GoalEditorModal = ({ isOpen, onClose }: GoalEditorModalProps) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState(presetColors[0]); // Default to first preset color
  const [periodType, setPeriodType] = useState<PeriodTypeOption>('daily');

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!name.trim()) return;
    try {
      await db.goals.add({
        name,
        color,
        periodType,
        createdAt: new Date(),
      } as Goal); // Cast to Goal to ensure type compatibility
      setName(''); // Reset form
      setColor(presetColors[0]);
      setPeriodType('daily');
      onClose(); // Close modal on success
    } catch (error) {
      console.error("Failed to save goal: ", error);
      // Optionally, show an error message to the user
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div 
        className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-md m-4 p-6 border border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start">
          <h2 className="text-2xl font-bold text-white mb-6">신규 목표 추가</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors text-2xl leading-none">&times;</button>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <div className="space-y-6"> {/* Increased spacing */}
            <div>
              <label htmlFor="goalName" className="block text-sm font-medium text-slate-300 mb-2">목표 이름</label>
              <input
                type="text"
                id="goalName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="예: 매일 30분 운동하기"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">목표 색상</label>
              <div className="flex flex-wrap gap-3">
                {presetColors.map((pc) => (
                  <button
                    key={pc}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 ${color === pc ? 'border-white ring-2 ring-indigo-500' : 'border-transparent'}`}
                    style={{ backgroundColor: pc }}
                    onClick={() => setColor(pc)}
                    title={pc}
                  ></button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">목표 기간 유형</label>
              <div className="flex flex-wrap gap-2">
                {periodTypeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPeriodType(option.value as PeriodTypeOption)}
                    className={`
                      px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-300
                      ${periodType === option.value
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600'
                      }
                    `}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mt-8">
            <button type="submit" className="w-full px-5 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 transition-all duration-300 shadow-md">
              목표 생성
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoalEditorModal;
