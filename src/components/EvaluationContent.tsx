import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { db } from '../db';
import { formatDateToYYYYMMDD } from '../utils/dateUtils';

interface EvaluationContentProps {
  selectedDate: Date;
}

const EvaluationContent: React.FC<EvaluationContentProps> = ({ selectedDate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const formattedDate = formatDateToYYYYMMDD(selectedDate);

  useEffect(() => {
    const fetchEvaluation = async () => {
      const dailyEvaluation = await db.dailyEvaluations.get(formattedDate);
      if (dailyEvaluation) {
        setContent(dailyEvaluation.evaluationText);
        setEditedContent(dailyEvaluation.evaluationText);
      } else {
        setContent('');
        setEditedContent('');
      }
    };
    fetchEvaluation();
  }, [formattedDate]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isEditing, editedContent]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedContent(e.target.value);
  };

  const handleSave = async () => {
    await db.dailyEvaluations.put({ date: formattedDate, evaluationText: editedContent, createdAt: new Date() });
    setContent(editedContent);
    setIsEditing(false);
  };

  const handleContainerClick = () => {
    if (!isEditing) {
      setIsEditing(true);
    }
  };

  return (
    <div
      className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl transition-all duration-300 cursor-pointer"
      onClick={handleContainerClick}
    >
      {isEditing ? (
        <div className="flex flex-col gap-2">
          <textarea
            ref={textareaRef}
            className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 text-sm"
            value={editedContent}
            onChange={handleTextareaChange}
            placeholder="오늘의 일일 평가를 작성하세요..."
            rows={1}
          />
          <button
            onClick={handleSave}
            className="self-end px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-300 shadow-md text-sm"
          >
            저장
          </button>
        </div>
      ) : (
        <div className="prose dark:prose-invert max-w-none text-sm">
          {content ? (
            <ReactMarkdown>{content}</ReactMarkdown>
          ) : (
            <p className="text-slate-500 dark:text-slate-400 italic">
              오늘의 일일 평가를 남겨보세요.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default EvaluationContent;
