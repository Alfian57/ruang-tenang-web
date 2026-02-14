"use client";

import { Edit, Trash2, Music } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { getUploadUrl } from "@/services/http/upload-url";
import { SongCategory } from "@/types";

interface CategoryTableProps {
    categories: SongCategory[];
    search: string;
    onEdit: (category: SongCategory) => void;
    onDelete: (category: SongCategory) => void;
}

export function CategoryTable({
    categories,
    search,
    onEdit,
    onDelete
}: CategoryTableProps) {
    return (
        <div className="bg-white rounded-xl border overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="text-left p-4 font-medium text-gray-600">Kategori</th>
                            <th className="text-left p-4 font-medium text-gray-600">Jumlah Lagu</th>
                            <th className="text-right p-4 font-medium text-gray-600">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {categories.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="p-8 text-center text-gray-500">
                                    {search ? "Tidak ada kategori yang cocok" : "Belum ada kategori"}
                                </td>
                            </tr>
                        ) : (
                            categories.map((cat) => (
                                <tr key={cat.id} className="hover:bg-gray-50">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-linear-to-br from-red-100 to-red-200 shrink-0 flex items-center justify-center">
                                                {cat.thumbnail ? (
                                                    <Image src={getUploadUrl(cat.thumbnail)} alt={cat.name} width={48} height={48} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Music className="w-6 h-6 text-primary" />
                                                )}
                                            </div>
                                            <span className="font-medium">{cat.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 text-sm bg-blue-100 text-blue-700 rounded-full">
                                            {cat.song_count || 0} lagu
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-1 justify-end">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onEdit(cat)}
                                                title="Edit"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-500 hover:text-red-600"
                                                onClick={() => onDelete(cat)}
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
