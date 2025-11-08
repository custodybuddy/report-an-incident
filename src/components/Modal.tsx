
import React, { useEffect, useState } from 'react';
import Button from './ui/Button';

interface ModalProps {
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'confirm';
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

const ICONS = {
    success: {
        svg: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-emerald-900"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14 7 9"/></svg>,
        className: 'bg-emerald-400'
    },
    error: {
        svg: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-red-900"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
        className: 'bg-red-400'
    },
    info: {
        svg: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-amber-900"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12"/><line x1="12" y1="12" x2="12.01" y2="12"/></svg>,
        className: 'bg-amber-400'
    },
    confirm: {
        svg: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-yellow-900"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
        className: 'bg-yellow-400'
    },
}

const Modal: React.FC<ModalProps> = ({ title, message, type, onClose, onConfirm, confirmText, cancelText }) => {
    const [isVisible, setIsVisible] = useState(false);
    const icon = ICONS[type] || ICONS.info;

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation to finish
    };

    const handleConfirm = () => {
        if (onConfirm) {
          onConfirm();
        }
        handleClose();
    };

    return (
        <div 
            className={`fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            onClick={handleClose}
        >
            <div 
                className={`bg-[#161B22] rounded-xl shadow-2xl border border-slate-700 w-full max-w-sm p-6 transform transition-all duration-300 ${isVisible ? 'scale-100' : 'scale-95'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center space-x-3 mb-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${icon.className}`}>
                        {icon.svg}
                    </div>
                    <h3 className="text-xl font-bold text-slate-100">{title}</h3>
                </div>
                <p className="text-slate-300 text-sm mb-6">{message}</p>
                <div className="flex justify-end gap-3">
                    {type === 'confirm' && onConfirm ? (
                        <>
                            <Button onClick={handleClose} variant="secondary" size="sm">
                                {cancelText || 'Cancel'}
                            </Button>
                            <Button onClick={handleConfirm} variant="danger" size="sm">
                                {confirmText || 'Confirm'}
                            </Button>
                        </>
                    ) : (
                        <Button onClick={handleClose} size="sm">
                            Close
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Modal;
