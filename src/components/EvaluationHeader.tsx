import { ClipboardCheck } from 'lucide-react';


interface EvaluationHeaderProps {
  hasEvaluation: boolean;
  onOpenEvaluationOverlay: () => void;
  stickyHeaderHeight: number;
  dailyDetailFormHeight: number;
}

const EvaluationHeader: React.FC<EvaluationHeaderProps> = ({ hasEvaluation, onOpenEvaluationOverlay }) => {



  return (
    <div className="bg-white dark:bg-slate-900/70 backdrop-blur-sm border-t border-slate-200/50 dark:border-slate-700">
      <div className="flex items-center justify-between p-4 cursor-pointer" onClick={onOpenEvaluationOverlay}>
        <div className="flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5 text-slate-500" />
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Evaluation</h2>
          {hasEvaluation && (
            <div className="w-2 h-2 bg-green-400 rounded-full ml-1"></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EvaluationHeader;
