import { Settings, Flag } from 'lucide-react';

interface HeaderProps {
  onOpenModal: () => void;
}

const Header = ({ onOpenModal }: HeaderProps) => {
  return (
    <header className="flex items-center justify-between p-4 border-b border-slate-800">
      <h1 className="text-lg font-bold tracking-wider text-slate-200">PLANNING JOURNEY</h1>
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-slate-800 transition-all duration-300">
          <Settings className="w-5 h-5 text-slate-400" />
        </button>
        <button
          onClick={onOpenModal}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 transition-all duration-300 shadow-md"
        >
          <Flag className="w-4 h-4" />
          <span>목표 관리</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
