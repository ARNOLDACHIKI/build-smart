import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';

type InviteTokenModalProps = {
  isOpen: boolean;
  spaceName: string;
  onConfirm: (token: string) => void;
  onCancel: () => void;
};

export const InviteTokenModal = ({ isOpen, spaceName, onConfirm, onCancel }: InviteTokenModalProps) => {
  const [token, setToken] = useState('');

  const handleConfirm = () => {
    const trimmedToken = token.trim();
    if (trimmedToken) {
      onConfirm(trimmedToken);
      setToken('');
    }
  };

  const handleCancel = () => {
    setToken('');
    onCancel();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => {
      if (!open) handleCancel();
    }}>
      <AlertDialogContent className="bg-[#121420] border-[#2A2D3C]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-slate-100">Join {spaceName}</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-400">
            Enter the invite token for <strong>{spaceName}</strong> to join this community.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4">
          <Input
            placeholder="Enter invite token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleConfirm();
              }
            }}
            className="bg-[#1A1D2B] border-[#2A2D3C] text-slate-100 placeholder-slate-500"
          />
        </div>
        <div className="flex gap-3 justify-end">
          <AlertDialogCancel onClick={handleCancel} className="bg-[#1A1D2B] border-[#2A2D3C] text-slate-300 hover:bg-[#232738]">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!token.trim()}
            className="bg-[#BED234] text-[#121420] hover:bg-[#a8d624]"
          >
            Join
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};
