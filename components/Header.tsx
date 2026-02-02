import React from 'react';
import { User } from '../types';
import LogoutIcon from './icons/LogoutIcon';

interface HeaderProps {
  user: User;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="w-full max-w-4xl mx-auto mb-4 py-4 border-b border-gray-700/50">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <p className="text-lg text-gray-300">
            Olá, <span className="font-bold text-emerald-400">{user.name.split(' ')[0]}</span>!
          </p>
          {user.isAdmin && (
            <a 
              href="/admin.html"
              className="bg-purple-600/20 text-purple-400 py-2 px-4 rounded-lg hover:bg-purple-600/40 hover:text-purple-300 transition-colors duration-200 uppercase text-sm font-bold tracking-wider"
            >
              <i className="fas fa-crown mr-2"></i>
              Painel Admin
            </a>
          )}
        </div>
        <button 
          onClick={onLogout}
          className="flex items-center bg-red-600/20 text-red-400 py-2 px-4 rounded-lg hover:bg-red-600/40 hover:text-red-300 transition-colors duration-200 uppercase text-sm font-bold tracking-wider"
        >
          <LogoutIcon className="mr-2" />
          Sair
        </button>
      </div>
    </header>
  );
};

export default Header;
