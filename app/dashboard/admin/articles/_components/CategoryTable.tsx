"use client";

import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArticleCategory } from "@/types";

interface CategoryTableProps {
    categories: ArticleCategory[];
    isLoading: boolean;
    search: string;
    onEdit: (category: ArticleCategory) => void;
    onDelete: (category: ArticleCategory) => void;
}

export function CategoryTable({
    categories,
    isLoading,
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
                            <th className="text-left p-4 font-medium text-gray-600">Nama Kategori</th>
                            <th className="text-left p-4 font-medium text-gray-600 hidden sm:table-cell">Deskripsi</th>
                            <th className="text-left p-4 font-medium text-gray-600">Jumlah Artikel</th>
                            <th className="text-right p-4 font-medium text-gray-600">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {isLoading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="p-4"><div className="h-4 bg-gray-200 rounded w-32" /></td>
                                    <td className="p-4 hidden sm:table-cell"><div className="h-4 bg-gray-200 rounded w-48" /></td>
                                    <td className="p-4"><div className="h-4 bg-gray-200 rounded w-16" /></td>
                                    <td className="p-4"><div className="h-8 bg-gray-200 rounded w-20 ml-auto" /></td>
                                </tr>
                            ))
                        ) : categories.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-gray-500">
                                    {search ? "Tidak ada kategori yang cocok" : "Belum ada kategori"}
                                </td>
                            </tr>
                        ) : (
                            categories.map((category) => (
                                <tr key={category.id} className="hover:bg-gray-50">
                                    <td className="p-4">
                                        <span className="font-medium">{category.name}</span>
                                    </td>
                                    <td className="p-4 hidden sm:table-cell">
                                        <span className="text-sm text-gray-600 line-clamp-2">{category.description || "-"}</span>
                                    </td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 text-sm bg-blue-100 text-blue-700 rounded-full">
                                            {category.article_count || 0} artikel
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-1 justify-end">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onEdit(category)}
                                                title="Edit"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-500 hover:text-red-600"
                                                onClick={() => onDelete(category)}
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
