"use client";

import { Search, Shield, User, Ban, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import { useAdminUsers } from "./_hooks/useAdminUsers";

export default function AdminUsersPage() {
  const {
    user,
    users,
    totalPages,
    isLoading,
    blockId,
    blockAction,
    search,
    page,
    setSearch,
    setPage,
    setBlockId,
    openBlockDialog,
    handleBlockAction
  } = useAdminUsers();

  if (user?.role !== "admin") {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-destructive">Akses Ditolak</h1>
        <p className="text-muted-foreground">Anda tidak memiliki akses ke halaman ini.</p>
      </div>
    );
  }

  const getRoleBadge = (role: string) => {
    if (role === "admin") {
      return <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700">Admin</span>;
    }
    if (role === "moderator") {
      return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">Moderator</span>;
    }
    return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">User</span>;
  };

  const getStatusBadge = (isBlocked: boolean) => {
    if (isBlocked) {
      return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">Diblokir</span>;
    }
    return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Aktif</span>;
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Kelola Pengguna</h1>
        <p className="text-gray-500">Lihat dan kelola semua pengguna terdaftar</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
          <Input
            placeholder="Cari nama atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-medium text-gray-600">Pengguna</th>
                <th className="text-left p-4 font-medium text-gray-600 hidden md:table-cell">Email</th>
                <th className="text-left p-4 font-medium text-gray-600">Role</th>
                <th className="text-left p-4 font-medium text-gray-600">Status</th>
                <th className="text-left p-4 font-medium text-gray-600 hidden lg:table-cell">Terdaftar</th>
                <th className="text-right p-4 font-medium text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full" />
                        <div className="h-4 bg-gray-200 rounded w-32" />
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell"><div className="h-4 bg-gray-200 rounded w-40" /></td>
                    <td className="p-4"><div className="h-6 bg-gray-200 rounded w-16" /></td>
                    <td className="p-4"><div className="h-6 bg-gray-200 rounded w-16" /></td>
                    <td className="p-4 hidden lg:table-cell"><div className="h-4 bg-gray-200 rounded w-24" /></td>
                    <td className="p-4"><div className="h-8 bg-gray-200 rounded w-24 ml-auto" /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    {search ? "Tidak ada pengguna yang cocok" : "Belum ada pengguna"}
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className={`hover:bg-gray-50 ${u.is_blocked ? 'bg-red-50/50' : ''}`}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          u.role === "admin" ? "bg-purple-100" : u.role === "moderator" ? "bg-blue-100" : u.is_blocked ? "bg-red-100" : "bg-gray-100"
                        }`}>
                          {u.role === "admin" ? (
                            <Shield className="w-5 h-5 text-purple-600" />
                          ) : u.role === "moderator" ? (
                            <Shield className="w-5 h-5 text-blue-600" />
                          ) : u.is_blocked ? (
                            <Ban className="w-5 h-5 text-red-500" />
                          ) : (
                            <User className="w-5 h-5 text-gray-600" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{u.name}</p>
                          <p className="text-xs text-gray-500 md:hidden truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <span className="text-sm text-gray-600">{u.email}</span>
                    </td>
                    <td className="p-4">
                      {getRoleBadge(u.role)}
                    </td>
                    <td className="p-4">
                      {getStatusBadge(u.is_blocked)}
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      <span className="text-sm text-gray-500">{formatDate(u.created_at)}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1 justify-end">
                        {u.role !== "admin" && u.role !== "moderator" && (
                          <>
                            {u.is_blocked ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openBlockDialog(u.id, "unblock")}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                title="Buka Blokir"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openBlockDialog(u.id, "block")}
                                className="text-orange-500 hover:text-orange-600 hover:bg-orange-50"
                                title="Blokir"
                              >
                                <Ban className="w-4 h-4" />
                              </Button>
                            )}
                          </>
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


      {/* Block/Unblock Confirmation Modal */}
      <Dialog open={blockId !== null} onOpenChange={() => setBlockId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {blockAction === "unblock" ? "Buka Blokir Pengguna?" : "Blokir Pengguna?"}
            </DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 py-4">
            {blockAction === "unblock"
              ? "Pengguna akan dapat mengakses akun mereka kembali."
              : "Pengguna tidak akan dapat login dan mengakses fitur apapun."}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBlockId(null)}>Batal</Button>
            <Button
              className={blockAction === "unblock"
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-orange-500 hover:bg-orange-600 text-white"}
              onClick={handleBlockAction}
            >
              {blockAction === "unblock" ? "Buka Blokir" : "Blokir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
