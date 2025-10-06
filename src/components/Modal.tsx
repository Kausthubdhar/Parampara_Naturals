import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {

  if (!isOpen) return null;

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'max-w-md';
      case 'md':
        return 'max-w-lg';
      case 'lg':
        return 'max-w-2xl';
      case 'xl':
        return 'max-w-4xl';
      case '2xl':
        return 'max-w-6xl';
      case '3xl':
        return 'max-w-7xl';
      default:
        return 'max-w-lg';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative w-full max-h-[95vh] sm:max-h-[90vh] ${getSizeClasses()} bg-white dark:bg-card-dark rounded-xl shadow-2xl border border-border/50 dark:border-border-dark/50 animate-in zoom-in-95 duration-200 flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border/50 dark:border-border-dark/50 flex-shrink-0">
          <h2 className="text-lg sm:text-xl font-bold text-text dark:text-text-dark">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-secondary/50 dark:hover:bg-secondary-dark/50 transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-text-secondary dark:text-text-secondary-dark" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;

