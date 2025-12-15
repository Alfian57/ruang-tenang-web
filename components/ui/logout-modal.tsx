"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LogOut, X } from "lucide-react";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function LogoutModal({ isOpen, onClose, onConfirm }: LogoutModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <LogOut className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-xl">Keluar dari Akun?</DialogTitle>
          <DialogDescription className="text-gray-500 mt-2">
            Apakah kamu yakin ingin keluar dari akun? Kamu perlu login kembali untuk mengakses dashboard.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-3 sm:justify-center mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 sm:flex-none rounded-full px-6"
          >
            <X className="w-4 h-4 mr-2" />
            Batal
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 sm:flex-none gradient-primary text-white rounded-full px-6"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Ya, Keluar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
