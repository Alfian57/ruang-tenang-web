import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatFolder } from "@/types";
import { cn } from "@/utils";

interface ChatFolderDialogsProps {
  newFolderDialog: boolean;
  setNewFolderDialog: (open: boolean) => void;
  editFolderDialog: ChatFolder | null;
  setEditFolderDialog: (folder: ChatFolder | null) => void;
  folderName: string;
  setFolderName: (name: string) => void;
  folderColor: string;
  setFolderColor: (color: string) => void;
  onCreateFolder: () => void;
  onUpdateFolder: () => void;
  FOLDER_COLORS: { name: string; value: string }[];
}

export function ChatFolderDialogs({
  newFolderDialog,
  setNewFolderDialog,
  editFolderDialog,
  setEditFolderDialog,
  folderName,
  setFolderName,
  folderColor,
  setFolderColor,
  onCreateFolder,
  onUpdateFolder,
  FOLDER_COLORS,
}: ChatFolderDialogsProps) {
  return (
    <>
      <Dialog open={newFolderDialog} onOpenChange={setNewFolderDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Buat Folder Baru</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Nama folder"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onCreateFolder()}
            />
            <div>
              <label className="text-sm text-gray-600 mb-2 block">Warna</label>
              <div className="flex gap-2">
                {FOLDER_COLORS.map((color) => (
                  <button
                    key={color.value}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-all",
                      folderColor === color.value
                        ? "border-gray-800 scale-110"
                        : "border-transparent hover:scale-105"
                    )}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setFolderColor(color.value)}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setNewFolderDialog(false)}>
              Batal
            </Button>
            <Button onClick={onCreateFolder} disabled={!folderName.trim()}>
              Buat Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editFolderDialog} onOpenChange={(open) => !open && setEditFolderDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Nama folder"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onUpdateFolder()}
            />
            <div>
              <label className="text-sm text-gray-600 mb-2 block">Warna</label>
              <div className="flex gap-2">
                {FOLDER_COLORS.map((color) => (
                  <button
                    key={color.value}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-all",
                      folderColor === color.value
                        ? "border-gray-800 scale-110"
                        : "border-transparent hover:scale-105"
                    )}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setFolderColor(color.value)}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditFolderDialog(null)}>
              Batal
            </Button>
            <Button onClick={onUpdateFolder} disabled={!folderName.trim()}>
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
