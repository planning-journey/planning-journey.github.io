import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { type Task } from '../db';

interface DragDropContextType {
  isDragging: boolean;
  draggedTask: Task | null;
  startDrag: (task: Task, event: React.PointerEvent) => void;
}

const DragDropContext = createContext<DragDropContextType | null>(null);

export const useDragDrop = () => {
  const context = useContext(DragDropContext);
  if (!context) throw new Error('useDragDrop must be used within a DragDropProvider');
  return context;
};

interface DragDropProviderProps {
  children: React.ReactNode;
  onDateSwitch: (date: Date) => void;
  currentDate: Date;
  onTaskMove: (taskId: string, targetDate: string | null, targetTaskId?: string | null, position?: 'before' | 'after') => void;
}

interface DropIndicatorState {
  x: number;
  y: number;
  width: number;
  type: 'task-gap' | 'date-highlight';
}

export const DragDropProvider: React.FC<DragDropProviderProps> = ({
  children,
  onDateSwitch,
  currentDate,
  onTaskMove
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  // 드랍 인디케이터 (파란색 선 또는 영역)
  const [dropIndicator, setDropIndicator] = useState<DropIndicatorState | null>(null);
  const [activeDropTargetInfo, setActiveDropTargetInfo] = useState<{
    targetId: string | null; // task id or date string
    targetType: 'task' | 'date';
    position: 'before' | 'after' | 'inside';
  } | null>(null);

  const dragOffset = useRef({ x: 0, y: 0 });
  const dateSwitchTimer = useRef<NodeJS.Timeout | null>(null);
  const lastHoveredDateStr = useRef<string | null>(null);

  useEffect(() => {
    if (isDragging) {
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';
      document.body.style.overflow = 'hidden'; // Prevent scrolling while dragging for now
    } else {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      document.body.style.overflow = '';
    }
  }, [isDragging]);

  const startDrag = useCallback((task: Task, e: React.PointerEvent) => {
    // e.preventDefault(); // removed to allow scrolling initiation if needed, but usually block for drag
    const element = e.currentTarget as HTMLElement;
    const rect = element.getBoundingClientRect();
    
    setIsDragging(true);
    setDraggedTask(task);
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    setPosition({
      x: e.clientX - (e.clientX - rect.left),
      y: e.clientY - (e.clientY - rect.top)
    });
  }, []);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!isDragging || !draggedTask) return;

    // 1. 오버레이 위치 업데이트
    setPosition({
      x: e.clientX - dragOffset.current.x,
      y: e.clientY - dragOffset.current.y
    });

    // 2. 요소 감지 (Hit Testing)
    // 오버레이가 pointer-events: none이어야 함.
    const elements = document.elementsFromPoint(e.clientX, e.clientY);
    
    // 타겟 초기화
    let foundTaskTarget: HTMLElement | undefined;
    let foundDateTarget: HTMLElement | undefined;
    let foundContainerTarget: HTMLElement | undefined;

    for (const el of elements) {
      if (el instanceof HTMLElement) {
        if (!foundTaskTarget && el.hasAttribute('data-task-id')) {
          foundTaskTarget = el;
        }
        if (!foundDateTarget && el.hasAttribute('data-calendar-date')) {
          foundDateTarget = el;
        }
        if (!foundContainerTarget && el.hasAttribute('data-drop-container')) {
          foundContainerTarget = el;
        }
      }
    }

    // 우선순위: 날짜 셀 > 태스크 아이템 > 빈 컨테이너
    // 날짜 셀 위에 있으면 날짜 이동 로직 우선
    if (foundDateTarget) {
      const dateStr = foundDateTarget.getAttribute('data-calendar-date');
      
      // 날짜 전환 타이머
      if (dateStr && dateStr !== lastHoveredDateStr.current) {
        if (dateSwitchTimer.current) clearTimeout(dateSwitchTimer.current);
        lastHoveredDateStr.current = dateStr;
        dateSwitchTimer.current = setTimeout(() => {
          onDateSwitch(new Date(dateStr));
        }, 500);
      }

      // 인디케이터 표시 (날짜 셀 강조)
      const rect = foundDateTarget.getBoundingClientRect();
      setDropIndicator({
        x: rect.left,
        y: rect.top,
        width: rect.width, // Not used for date highlight logic directly but kept for structure
        type: 'date-highlight' // Special type for date highlight
      });
      setActiveDropTargetInfo({
        targetId: dateStr,
        targetType: 'date',
        position: 'inside'
      });
      
      return; // 날짜 타겟 처리 완료
    } else {
      // 날짜 영역 벗어남 -> 타이머 해제
      if (dateSwitchTimer.current) {
        clearTimeout(dateSwitchTimer.current);
        dateSwitchTimer.current = null;
      }
      lastHoveredDateStr.current = null;
    }

    // 빈 컨테이너 감지 (태스크가 없을 때)
    if (foundContainerTarget) {
        const rect = foundContainerTarget.getBoundingClientRect();
        setDropIndicator({
            x: rect.left,
            y: rect.top,
            width: rect.width,
            type: 'date-highlight'
        });
        setActiveDropTargetInfo({
            targetId: 'empty-container',
            targetType: 'date',
            position: 'inside'
        });
        return;
    }

    // 태스크 타겟 처리
    if (foundTaskTarget) {
      const targetId = foundTaskTarget.getAttribute('data-task-id');
      if (targetId !== draggedTask.id) {
        const rect = foundTaskTarget.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        const isAfter = e.clientY > midY;
        
        setDropIndicator({
          x: rect.left + 4, // Slight indent
          y: isAfter ? rect.bottom : rect.top,
          width: rect.width - 8,
          type: 'task-gap'
        });
        setActiveDropTargetInfo({
          targetId: targetId,
          targetType: 'task',
          position: isAfter ? 'after' : 'before'
        });
        return;
      }
    }

    // 아무 곳도 아님
    setDropIndicator(null);
    setActiveDropTargetInfo(null);

  }, [isDragging, draggedTask, onDateSwitch]);

  const handlePointerUp = useCallback((e: PointerEvent) => {
    if (!isDragging || !draggedTask) return;

    if (dateSwitchTimer.current) {
      clearTimeout(dateSwitchTimer.current);
      dateSwitchTimer.current = null;
    }
    lastHoveredDateStr.current = null;

    // Direct hit-test on release to handle view updates (e.g. date switch) where handlePointerMove might not have fired
    const elements = document.elementsFromPoint(e.clientX, e.clientY);
    let foundDateTarget: HTMLElement | undefined;
    
    for (const el of elements) {
        if (el instanceof HTMLElement && el.hasAttribute('data-calendar-date')) {
            foundDateTarget = el;
            break;
        }
    }

    if (foundDateTarget) {
        const dateStr = foundDateTarget.getAttribute('data-calendar-date');
        if (dateStr) {
            onTaskMove(draggedTask.id, dateStr, null, 'after');
        }
    } else if (activeDropTargetInfo) {
      const { targetId, targetType, position } = activeDropTargetInfo;
      
      if (targetType === 'date') {
        if (targetId === 'empty-container') {
             // Move to the current date shown in the view
             const y = currentDate.getFullYear();
             const m = String(currentDate.getMonth() + 1).padStart(2, '0');
             const d = String(currentDate.getDate()).padStart(2, '0');
             onTaskMove(draggedTask.id, `${y}-${m}-${d}`, null, 'after');
        } else if (targetId) {
             // Move to a specific date cell
             onTaskMove(draggedTask.id, targetId, null, 'after');
        }
      } else if (targetType === 'task' && targetId) {
        // 순서 변경
        onTaskMove(draggedTask.id, null, targetId, position as 'before' | 'after');
      }
    }

    // Reset
    setIsDragging(false);
    setDraggedTask(null);
    setDropIndicator(null);
    setActiveDropTargetInfo(null);
  }, [isDragging, draggedTask, activeDropTargetInfo, onTaskMove]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, handlePointerMove, handlePointerUp]);

  return (
    <DragDropContext.Provider value={{ isDragging, draggedTask, startDrag }}>
      {children}
      {isDragging && (
        <>
          {/* Drag Overlay (Follows Cursor) */}
          {draggedTask && createPortal(
            <div
              className="fixed z-[60] pointer-events-none bg-white dark:bg-slate-800 p-3 rounded-lg shadow-xl border border-indigo-200 dark:border-indigo-700 w-64 flex flex-col gap-1"
              style={{
                left: position.x,
                top: position.y,
                transform: 'rotate(2deg) scale(1.02)',
                opacity: 0.9,
              }}
            >
              <div className="font-semibold text-gray-900 dark:text-white text-sm truncate">{draggedTask.title}</div>
              {draggedTask.description && (
                <div className="text-xs text-gray-500 truncate">{draggedTask.description}</div>
              )}
            </div>,
            document.body
          )}

          {/* Drop Indicator (Blue Line for Tasks) */}
          {dropIndicator && dropIndicator.type === 'task-gap' && createPortal(
            <div
              className="fixed z-[55] pointer-events-none bg-indigo-500 rounded-full shadow-sm transition-all duration-75 ease-out"
              style={{
                height: '4px',
                width: dropIndicator.width,
                left: dropIndicator.x,
                top: dropIndicator.y - 2, // Center the line on the gap
              }}
            />,
            document.body
          )}

          {/* Drop Indicator (Highlight for Date Cells) */}
          {dropIndicator && dropIndicator.type === 'date-highlight' && createPortal(
             <div
              className="fixed z-[55] pointer-events-none border-2 border-indigo-500 rounded-xl bg-indigo-500/20 transition-all duration-75 ease-out"
              style={{
                width: '56px', // Fixed width for date cell (w-14)
                height: '64px', // Approx height
                left: dropIndicator.x,
                top: dropIndicator.y,
              }}
            />,
            document.body
          )}
        </>
      )}
    </DragDropContext.Provider>
  );
};