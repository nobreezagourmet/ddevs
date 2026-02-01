import React from 'react';
import { AppView } from '../types';

interface FooterProps {
  onNavigate: (view: AppView) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full max-w-4xl mx-auto mt-4 pb-4">
      <div className="bg-gray-800 rounded-2xl shadow-lg p-4">
        <nav className="flex justify-around items-center text-center text-gray-400">
          <button onClick={() => onNavigate(AppView.MY_NUMBERS)} className="flex flex-col items-center justify-center hover:text-indigo-400 transition-colors w-1/3">
            <i className="fa-solid fa-ticket fa-2x mb-2"></i>
            <span className="text-sm">meus números</span>
          </button>
          <button onClick={() => onNavigate(AppView.RULES)} className="flex flex-col items-center justify-center hover:text-indigo-400 transition-colors w-1/3">
            <i className="fa-solid fa-scroll fa-2x mb-2"></i>
            <span className="text-sm">regulamento</span>
          </button>
          <button onClick={() => onNavigate(AppView.RESULTS)} className="flex flex-col items-center justify-center hover:text-indigo-400 transition-colors w-1/3">
            <i className="fa-solid fa-trophy fa-2x mb-2"></i>
            <span className="text-sm">resultados</span>
          </button>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;