import React from 'react';
import { Button } from '@/components/ui/button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: () => void;
  onRetake: () => void;
  capturedImage: string | null;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onUpload, onRetake, capturedImage }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-lg">
        <h2 className="text-xl font-bold mb-4">Upload or Retake</h2>
        {capturedImage && <img src={capturedImage} alt="Captured" className="mb-4 max-w-full h-auto rounded" />}
        <div className="space-x-4">
          <Button onClick={onUpload}>Upload</Button>
          <Button onClick={onRetake}>Retake</Button>
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}; 