"use client";

import {
    Search,
    Plus,
    Bell,
    Send,
    Clock,
    Trash2,
    Pencil,
    Ban,
    CheckCircle,
    AlertCircle,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { formatDate } from "@/utils";
import { useBroadcasts } from "./_hooks/useBroadcasts";
import { BroadcastFormDialog } from "./_components/BroadcastFormDialog";
import type { BroadcastNotification } from "@/services/api/broadcast";

function getStatusBadge(status: BroadcastNotification["status"]) {
    const map = {
        draft: { label: "Draft", className: "bg-gray-100 text-gray-700" },
        scheduled: { label: "Terjadwal", className: "bg-blue-100 text-blue-700" },
        sending: { label: "Mengirim", className: "bg-yellow-100 text-yellow-700" },
        sent: { label: "Terkirim", className: "bg-green-100 text-green-700" },
        cancelled: { label: "Dibatalkan", className: "bg-red-100 text-red-700" },
    };
    const s = map[status] || map.draft;
    return (
        <span className={`px-2 py-1 text-xs rounded-full font-medium ${s.className}`}>
            {s.label}
        </span>
    );
}

function getStatusIcon(status: BroadcastNotification["status"]) {
    switch (status) {
        case "draft":
            return <Bell className="w-5 h-5 text-gray-400" />;
        case "scheduled":
            return <Clock className="w-5 h-5 text-blue-500" />;
        case "sending":
            return <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" />;
        case "sent":
            return <CheckCircle className="w-5 h-5 text-green-500" />;
        case "cancelled":
            return <Ban className="w-5 h-5 text-red-400" />;
        default:
            return <Bell className="w-5 h-5 text-gray-400" />;
    }
}

export default function AdminBroadcastsPage() {
    const {
        user,
        broadcasts,
        totalPages,
        isLoading,
        isSubmitting,
        search,
        page,
        showCreateDialog,
        editingBroadcast,
        deleteId,
        sendId,
        setSearch,
        setPage,
        setShowCreateDialog,
        setEditingBroadcast,
        setDeleteId,
        setSendId,
        handleCreate,
        handleUpdate,
        handleDelete,
        handleSendNow,
        handleCancel,
    } = useBroadcasts();

    if (user?.role !== "admin") {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold text-destructive">Akses Ditolak</h1>
                <p className="text-muted-foreground">
                    Anda tidak memiliki akses ke halaman ini.
                </p>
            </div>
        );
    }

    return (
        <div className="p-4 lg:p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Broadcast Notifikasi</h1>
                    <p className="text-gray-500">
                        Kirim notifikasi push ke semua pengguna
                    </p>
                </div>
                <Button
                    onClick={() => setShowCreateDialog(true)}
                    className="bg-red-500 hover:bg-red-600 text-white"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Buat Broadcast
                </Button>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                    <Input
                        placeholder="Cari judul atau pesan..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 bg-white"
                    />
                </div>
            </div>

            {/* Broadcasts Table */}
            <div className="bg-white rounded-xl border overflow-hidden">
                <div className="overflow-x-auto table-scroll-indicator">
                    <table className="w-full min-w-180">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="text-left p-4 font-medium text-gray-600">
                                    Broadcast
                                </th>
                                <th className="text-left p-4 font-medium text-gray-600 hidden md:table-cell">
                                    Status
                                </th>
                                <th className="text-left p-4 font-medium text-gray-600 hidden lg:table-cell">
                                    Jadwal
                                </th>
                                <th className="text-left p-4 font-medium text-gray-600 hidden lg:table-cell whitespace-nowrap">
                                    Terkirim
                                </th>
                                <th className="text-left p-4 font-medium text-gray-600 hidden xl:table-cell">
                                    Dibuat
                                </th>
                                <th className="text-right p-4 font-medium text-gray-600 whitespace-nowrap w-32">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                                                <div>
                                                    <div className="h-4 bg-gray-200 rounded w-40 mb-1" />
                                                    <div className="h-3 bg-gray-200 rounded w-56" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 hidden md:table-cell">
                                            <div className="h-6 bg-gray-200 rounded w-20" />
                                        </td>
                                        <td className="p-4 hidden lg:table-cell">
                                            <div className="h-4 bg-gray-200 rounded w-28" />
                                        </td>
                                        <td className="p-4 hidden lg:table-cell">
                                            <div className="h-4 bg-gray-200 rounded w-16" />
                                        </td>
                                        <td className="p-4 hidden xl:table-cell">
                                            <div className="h-4 bg-gray-200 rounded w-24" />
                                        </td>
                                        <td className="p-4">
                                            <div className="h-8 bg-gray-200 rounded w-24 ml-auto" />
                                        </td>
                                    </tr>
                                ))
                            ) : broadcasts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-16 text-center">
                                        <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-500">
                                            {search
                                                ? "Tidak ada broadcast yang cocok"
                                                : "Belum ada broadcast"}
                                        </h3>
                                        <p className="text-gray-400 text-sm mt-1">
                                            {search
                                                ? "Coba kata kunci lain"
                                                : "Buat broadcast pertama untuk mengirim notifikasi ke pengguna"}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                broadcasts.map((b) => (
                                    <tr key={b.id} className="hover:bg-gray-50">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                                                    {getStatusIcon(b.status)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium truncate">{b.title}</p>
                                                    <p className="text-xs text-gray-500 truncate max-w-xs">
                                                        {b.body}
                                                    </p>
                                                    <div className="md:hidden mt-1">
                                                        {getStatusBadge(b.status)}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 hidden md:table-cell">
                                            {getStatusBadge(b.status)}
                                        </td>
                                        <td className="p-4 hidden lg:table-cell">
                                            <span className="text-sm text-gray-500">
                                                {b.scheduled_at
                                                    ? formatDate(b.scheduled_at)
                                                    : "-"}
                                            </span>
                                        </td>
                                        <td className="p-4 hidden lg:table-cell">
                                            <span className="text-sm text-gray-600">
                                                {b.status === "sent" ? (
                                                    <span className="flex items-center gap-1">
                                                        <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                                                        {b.sent_count}
                                                        {b.failed_count > 0 && (
                                                            <span className="text-red-400 ml-1 flex items-center gap-0.5">
                                                                <AlertCircle className="w-3 h-3" />
                                                                {b.failed_count}
                                                            </span>
                                                        )}
                                                    </span>
                                                ) : (
                                                    "-"
                                                )}
                                            </span>
                                        </td>
                                        <td className="p-4 hidden xl:table-cell">
                                            <span className="text-sm text-gray-500">
                                                {formatDate(b.created_at)}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-1 justify-end">
                                                {(b.status === "draft" ||
                                                    b.status === "scheduled") && (
                                                        <>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => setSendId(b.id)}
                                                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                                title="Kirim Sekarang"
                                                            >
                                                                <Send className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => setEditingBroadcast(b)}
                                                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                                title="Edit"
                                                            >
                                                                <Pencil className="w-4 h-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                {b.status === "scheduled" && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleCancel(b.id)}
                                                        className="text-orange-500 hover:text-orange-600 hover:bg-orange-50"
                                                        title="Batalkan"
                                                    >
                                                        <Ban className="w-4 h-4" />
                                                    </Button>
                                                )}
                                                {b.status !== "sending" && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => setDeleteId(b.id)}
                                                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                        title="Hapus"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
                        <span className="text-sm text-gray-600">
                            Halaman {page} dari {totalPages}
                        </span>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                            >
                                Sebelumnya
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page === totalPages}
                                onClick={() => setPage(page + 1)}
                            >
                                Selanjutnya
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create/Edit Dialog */}
            <BroadcastFormDialog
                open={showCreateDialog || editingBroadcast !== null}
                onClose={() => {
                    setShowCreateDialog(false);
                    setEditingBroadcast(null);
                }}
                onSubmit={(data) => {
                    if (editingBroadcast) {
                        handleUpdate(editingBroadcast.id, data);
                    } else {
                        handleCreate(data);
                    }
                }}
                isSubmitting={isSubmitting}
                editData={editingBroadcast}
            />

            {/* Delete Confirmation */}
            <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus Broadcast?</DialogTitle>
                    </DialogHeader>
                    <p className="text-gray-600 py-4">
                        Broadcast ini akan dihapus secara permanen dan tidak dapat
                        dikembalikan.
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteId(null)}>
                            Batal
                        </Button>
                        <Button
                            className="bg-red-500 hover:bg-red-600 text-white"
                            onClick={handleDelete}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Menghapus...
                                </>
                            ) : (
                                "Hapus"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Send Confirmation */}
            <Dialog open={sendId !== null} onOpenChange={() => setSendId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Kirim Broadcast Sekarang?</DialogTitle>
                    </DialogHeader>
                    <p className="text-gray-600 py-4">
                        Notifikasi akan dikirim ke <strong>semua pengguna</strong> yang
                        telah mengaktifkan notifikasi push. Tindakan ini tidak dapat
                        dibatalkan.
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSendId(null)}>
                            Batal
                        </Button>
                        <Button
                            className="bg-green-500 hover:bg-green-600 text-white"
                            onClick={handleSendNow}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Mengirim...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Kirim Sekarang
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
