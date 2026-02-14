"use client";

import { Edit, Trash2, Music } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { getUploadUrl } from "@/services/http/upload-url";
import { SongWithCategory } from "../_hooks/useAdminSongs";

interface SongTableProps {
    songs: SongWithCategory[];
    search: string;
    onEdit: (song: SongWithCategory) => void;
    onDelete: (id: number) => void;
}

export function SongTable({
    songs,
    search,
    onEdit,
    onDelete
}: SongTableProps) {
    return (
        <div className="bg-white rounded-xl border overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="text-left p-4 font-medium text-gray-600">Lagu</th>
                            <th className="text-left p-4 font-medium text-gray-600 hidden sm:table-cell">Kategori</th>
                            <th className="text-right p-4 font-medium text-gray-600">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {songs.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="p-8 text-center text-gray-500">
                                    {search ? "Tidak ada lagu yang cocok" : "Belum ada lagu"}
                                </td>
                            </tr>
                        ) : (
                            songs.map((song) => (
                                <tr key={song.id} className="hover:bg-gray-50">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                                                {song.thumbnail ? (
                                                    <Image src={getUploadUrl(song.thumbnail)} alt={song.title} width={48} height={48} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Music className="w-6 h-6 text-gray-400" />
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium truncate">{song.title}</p>
                                                <p className="text-xs text-gray-500 sm:hidden">{song.category?.name || "Tanpa Kategori"}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 hidden sm:table-cell">
                                        <span className="text-sm text-gray-600">{song.category?.name || "Tanpa Kategori"}</span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-1 justify-end">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onEdit(song)}
                                                title="Edit"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-500 hover:text-red-600"
                                                onClick={() => onDelete(song.id)}
                                                title="Hapus"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
