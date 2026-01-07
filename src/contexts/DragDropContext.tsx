import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { type Task, db } from '../db';

interface DragDropContextType {
  isDragging: boolean;
  draggedTask: Task | null;
  startDrag: (task: Task, event: React.PointerEvent) => void;
  registerDropZone: (id: string, element: HTMLElement) => void;
  unregisterDropZone: (id: string) => void;
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

export const DragDropProvider: React.FC<DragDropProviderProps> = ({
  children,
  onDateSwitch,
  currentDate,
  onTaskMove
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  // 드래그 시작 시점의 오프셋 (마우스 포인터와 요소 왼쪽 상단 사이의 거리)
  const dragOffset = useRef({ x: 0, y: 0 });
  
  // 날짜 전환 타이머 관련
  const dateSwitchTimer = useRef<NodeJS.Timeout | null>(null);
  const lastHoveredDateStr = useRef<string | null>(null);

  // 드랍존 관리 (TaskItem들의 위치 정보)
  const dropZones = useRef<Map<string, HTMLElement>>(new Map());

  // 스크롤 방지
  useEffect(() => {
    if (isDragging) {
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';
    } else {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    }
  }, [isDragging]);

  const startDrag = useCallback((task: Task, e: React.PointerEvent) => {
    e.preventDefault();
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
    if (!isDragging) return;

    // 1. 오버레이 위치 업데이트
    setPosition({
      x: e.clientX - dragOffset.current.x,
      y: e.clientY - dragOffset.current.y
    });

    // 2. 요소 감지 (Hit Testing)
    const elements = document.elementsFromPoint(e.clientX, e.clientY);
    
    // 2-1. 캘린더 날짜 감지
    const calendarCell = elements.find(el => el.hasAttribute('data-calendar-date')) as HTMLElement | undefined;
    
    if (calendarCell) {
      const dateStr = calendarCell.getAttribute('data-calendar-date');
      if (dateStr && dateStr !== lastHoveredDateStr.current) {
        // 새로운 날짜에 진입
        if (dateSwitchTimer.current) clearTimeout(dateSwitchTimer.current);
        lastHoveredDateStr.current = dateStr;
        
        dateSwitchTimer.current = setTimeout(() => {
          const newDate = new Date(dateStr);
          onDateSwitch(newDate);
          // 날짜가 바뀌면 드랍존 맵을 비우거나 하는 로직이 필요할 수 있지만, 
          // 리액트 라이프사이클에 의해 TaskList가 다시 렌더링되면서 처리됨.
        }, 500); // 0.5초 대기
      }
    } else {
      // 날짜 영역을 벗어남
      if (dateSwitchTimer.current) {
        clearTimeout(dateSwitchTimer.current);
        dateSwitchTimer.current = null;
      }
      lastHoveredDateStr.current = null;
    }

  }, [isDragging, onDateSwitch]);

  const handlePointerUp = useCallback((e: PointerEvent) => {
    if (!isDragging || !draggedTask) return;

    // 타이머 정리
    if (dateSwitchTimer.current) {
      clearTimeout(dateSwitchTimer.current);
      dateSwitchTimer.current = null;
    }
    lastHoveredDateStr.current = null;

    // 드랍 로직
    // 현재 마우스 위치에 있는 TaskItem을 찾아서 그 위치를 계산
    const elements = document.elementsFromPoint(e.clientX, e.clientY);
    const dropTarget = elements.find(el => el.hasAttribute('data-task-id')) as HTMLElement | undefined;
    
    // 날짜 타겟 확인 (다른 날짜에 드랍하는 경우)
    const calendarCell = elements.find(el => el.hasAttribute('data-calendar-date')) as HTMLElement | undefined;

    if (calendarCell) {
        const dateStr = calendarCell.getAttribute('data-calendar-date');
        if (dateStr) {
             // 다른 날짜로 이동 (순서는 마지막으로)
             onTaskMove(draggedTask.id, dateStr, null, 'after');
        }
    } else if (dropTarget) {
      const targetId = dropTarget.getAttribute('data-task-id');
      if (targetId && targetId !== draggedTask.id) {
        // 같은 날짜 내 순서 변경
        // 타겟 요소의 중간을 기준으로 위/아래 판별
        const rect = dropTarget.getBoundingClientRect();
        const isBottom = e.clientY > rect.top + rect.height / 2;
        
        const position = isBottom ? 'after' : 'before';
        onTaskMove(draggedTask.id, null, targetId, position);
      }
    }

    setIsDragging(false);
    setDraggedTask(null);
  }, [isDragging, draggedTask, onTaskMove]);

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

  const registerDropZone = useCallback((id: string, element: HTMLElement) => {
    dropZones.current.set(id, element);
  }, []);

  const unregisterDropZone = useCallback((id: string) => {
    dropZones.current.delete(id);
  }, []);

  return (
    <DragDropContext.Provider value={{ isDragging, draggedTask, startDrag, registerDropZone, unregisterDropZone }}>
      {children}
      {isDragging && draggedTask && createPortal(
        <div
            className="fixed z-50 pointer-events-none bg-white dark:bg-slate-800 p-4 rounded-xl shadow-2xl border-2 border-indigo-500 opacity-90 w-64"
            style={{
                left: position.x,
                top: position.y,
                transform: 'rotate(3deg)', // 살짝 기울여서 드래그 느낌 내기
            }}
        >
            <div className="font-medium text-gray-900 dark:text-white truncate">{draggedTask.title}</div>
            {draggedTask.description && (
                <div className="text-xs text-gray-500 mt-1 truncate">{draggedTask.description}</div>
            )}
        </div>,
        document.body
      )}
    </DragDropContext.Provider>
  );
};
