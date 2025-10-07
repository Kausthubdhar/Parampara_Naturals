import React from 'react';
import { Mail, CheckCircle, Clock, RefreshCw } from 'lucide-react';

interface EmailConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

const EmailConfirmationModal: React.FC<EmailConfirmationModalProps> = ({ isOpen, onClose, email }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-white/20 rounded-full">
              <Mail className="w-8 h-8" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center mb-2">
            Check Your Email
          </h2>
          <p className="text-emerald-100 text-center text-sm">
            We've sent a confirmation link to your email address
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Email Display */}
          <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <Mail className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Email sent to:</p>
                <p className="text-slate-900 dark:text-white font-semibold truncate">{email}</p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-4 mb-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold">1</span>
              </div>
              <div>
                <p className="text-slate-900 dark:text-white font-medium text-sm">Open your email inbox</p>
                <p className="text-slate-600 dark:text-slate-300 text-xs">Check your spam folder if you don't see it</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold">2</span>
              </div>
              <div>
                <p className="text-slate-900 dark:text-white font-medium text-sm">Click the confirmation link</p>
                <p className="text-slate-600 dark:text-slate-300 text-xs">This will verify your email and activate your account</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold">3</span>
              </div>
              <div>
                <p className="text-slate-900 dark:text-white font-medium text-sm">Return to the app</p>
                <p className="text-slate-600 dark:text-slate-300 text-xs">You'll be automatically signed in</p>
              </div>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-blue-800 dark:text-blue-200 font-medium text-sm">What's happening now?</span>
            </div>
            <p className="text-blue-700 dark:text-blue-300 text-xs">
              Your account is being created and will be activated once you confirm your email address.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3">
            <button
              onClick={onClose}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 hover:scale-[1.02] flex items-center justify-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Got it, thanks!</span>
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>I've confirmed my email</span>
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
            <p className="text-center text-xs text-slate-500 dark:text-slate-400">
              Didn't receive the email? Check your spam folder or{' '}
              <button className="text-emerald-600 dark:text-emerald-400 hover:underline">
                resend confirmation
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmationModal;
