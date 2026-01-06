import React, { useState, useEffect, useRef, useCallback, useImperativeHandle } from 'react';
import ReactMarkdown from 'react-markdown';
import { db } from '../db';
import { formatDateToYYYYMMDD } from '../utils/dateUtils';

export interface EvaluationContentRef {
  save: () => Promise<void>;
}

interface EvaluationContentProps {
  selectedDate: Date;
  setIsEditing: (isEditing: boolean) => void;
  parentIsEditing: boolean; // New prop to receive editing state from parent
  selectedProjectId: string | null; // Add selectedProjectId prop
}

const EvaluationContent = React.forwardRef<EvaluationContentRef, EvaluationContentProps>(
  ({ selectedDate, setIsEditing, parentIsEditing, selectedProjectId }, ref) => {
    const [content, setContent] = useState('');
    const [editedContent, setEditedContent] = useState('');
    const editedContentRef = useRef(''); // Ref to hold the latest editedContent
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isLocalEditing, setIsLocalEditing] = useState(false); // Internal state to manage editing mode

    const formattedDate = formatDateToYYYYMMDD(selectedDate);

    useEffect(() => {
      // Synchronize isLocalEditing with parentIsEditing
      setIsLocalEditing(parentIsEditing);
    }, [parentIsEditing]);

    useEffect(() => {
      const fetchEvaluation = async () => {
        if (!selectedProjectId) {
          setContent('');
          setEditedContent('');
          return;
        }
        const dailyEvaluation = await db.dailyEvaluations
          .where({ date: formattedDate, projectId: selectedProjectId })
          .first();

        if (dailyEvaluation) {
          setContent(dailyEvaluation.evaluationText);
          setEditedContent(dailyEvaluation.evaluationText);
        } else {
          setContent('');
          setEditedContent('');
        }
      };
      fetchEvaluation();
    }, [formattedDate, selectedProjectId]); // Add selectedProjectId as dependency

    // Keep the ref updated with the latest editedContent
    useEffect(() => {
      editedContentRef.current = editedContent;
    }, [editedContent]);

    const saveContent = useCallback(async () => {
      if (!selectedProjectId) return; // Cannot save without a selected project

      await db.dailyEvaluations.put({
        date: formattedDate,
        evaluationText: editedContentRef.current,
        createdAt: new Date(),
        projectId: selectedProjectId,
      });
      setContent(editedContentRef.current);
      setIsLocalEditing(false); // Exit local editing mode after saving
      setIsEditing(false); // Inform parent to exit editing mode
    }, [formattedDate, selectedProjectId, setContent, setIsLocalEditing, setIsEditing]);

    useImperativeHandle(ref, () => ({
      save: saveContent,
    }));

    useEffect(() => {
      setIsEditing(isLocalEditing); // Inform parent about local editing state
    }, [isLocalEditing, setIsEditing]);

    useEffect(() => {
      if (isLocalEditing && textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }, [isLocalEditing, editedContent]);

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setEditedContent(e.target.value);
    };

    return (
      <div
        className="text-slate-800 dark:text-white rounded-xl transition-all duration-300"
      >
        {isLocalEditing ? (
          <div className="flex flex-col gap-2">
            <textarea
              ref={textareaRef}
              className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 text-sm"
              value={editedContent}
              onChange={handleTextareaChange}
              placeholder="오늘의 일일 평가를 작성하세요..."
              rows={1}
            />
            {/* Internal Save button removed, now controlled by parent */}
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
  }
);

export default EvaluationContent;
