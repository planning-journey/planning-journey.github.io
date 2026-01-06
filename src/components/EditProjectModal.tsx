import React, { useState, useEffect } from 'react';

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditProject: (projectId: string, newName: string) => void;
  projectId: string;
  projectName: string;
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({ isOpen, onClose, onEditProject, projectId, projectName }) => {
  const [newProjectName, setNewProjectName] = useState(projectName);

  useEffect(() => {
    setNewProjectName(projectName);
  }, [projectName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName.trim() && newProjectName.trim() !== projectName) {
      onEditProject(projectId, newProjectName);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-xl w-full max-w-sm border border-slate-200/50 dark:border-slate-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">프로젝트 이름 수정</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="프로젝트 이름"
            className="w-full p-3 mb-4 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
            required
          />
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-all duration-300 shadow-sm"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-300 shadow-sm"
            >
              수정
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProjectModal;
