import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface ForumDeleteDialogsProps {
    showDeletePostDialog: boolean;
    setShowDeletePostDialog: (show: boolean) => void;
    handleDeletePost: () => void;
    showDeleteForumDialog: boolean;
    setShowDeleteForumDialog: (show: boolean) => void;
    handleDeleteForum: () => void;
    isDeleting: boolean;
    setDeletePostId: (id: number | null) => void;
}

export function ForumDeleteDialogs({
    showDeletePostDialog,
    setShowDeletePostDialog,
    handleDeletePost,
    showDeleteForumDialog,
    setShowDeleteForumDialog,
    handleDeleteForum,
    isDeleting,
    setDeletePostId,
}: ForumDeleteDialogsProps) {
    return (
        <>
            <ConfirmDialog
                isOpen={showDeletePostDialog}
                onClose={() => {
                    setShowDeletePostDialog(false);
                    setDeletePostId(null);
                }}
                onConfirm={handleDeletePost}
                title="Hapus Balasan"
                description="Apakah kamu yakin ingin menghapus balasan ini? Tindakan ini tidak dapat dibatalkan."
                confirmText="Ya, Hapus"
                cancelText="Batal"
                variant="danger"
                isLoading={isDeleting}
            />

            <ConfirmDialog
                isOpen={showDeleteForumDialog}
                onClose={() => setShowDeleteForumDialog(false)}
                onConfirm={handleDeleteForum}
                title="Hapus Topik Diskusi"
                description="Apakah kamu yakin ingin menghapus topik diskusi ini selamanya? Semua balasan juga akan dihapus. Tindakan ini tidak dapat dibatalkan."
                confirmText="Ya, Hapus Selamanya"
                cancelText="Batal"
                variant="danger"
                isLoading={isDeleting}
            />
        </>
    );
}
