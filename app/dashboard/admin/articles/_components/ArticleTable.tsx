"use client";

import { Ban, CheckCircle, Eye, Edit, XCircle, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utils";
import { AdminArticle } from "../_hooks/useAdminArticles";

interface ArticleTableProps {
    articles: AdminArticle[];
    isLoading: boolean;
    search: string;
    onApprove: (id: number) => void;
    onReject: (id: number) => void;
    onEdit: (article: AdminArticle) => void;
    onBlock: (id: number) => void;
    onDelete: (id: number) => void;
}

export function ArticleTable({
    articles,
    isLoading,
    search,
    onApprove,
    onReject,
    onEdit,
    onBlock,
    onDelete
}: ArticleTableProps) {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "published":
                return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Dipublikasikan</span>;
            case "draft":
                return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">Draf</span>;
            case "pending":
                return <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-700">Menunggu Persetujuan</span>;
            case "blocked":
                return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">Diblokir</span>;
            case "rejected":
                return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">Ditolak</span>;
            case "revision_needed":
                return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">Perlu Revisi</span>;
            default:
                return null;
        }
    };

    return (
        <div className="bg-white rounded-xl border overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="text-left p-4 font-medium text-gray-600">Artikel</th>
                            <th className="text-left p-4 font-medium text-gray-600 hidden md:table-cell">Kategori</th>
                            <th className="text-left p-4 font-medium text-gray-600 hidden lg:table-cell">Penulis</th>
                            <th className="text-left p-4 font-medium text-gray-600 hidden sm:table-cell">Status</th>
                            <th className="text-left p-4 font-medium text-gray-600 hidden lg:table-cell">Tanggal</th>
                            <th className="text-right p-4 font-medium text-gray-600">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-16 h-12 bg-gray-200 rounded-lg" />
                                            <div className="h-4 bg-gray-200 rounded w-32" />
                                        </div>
                                    </td>
                                    <td className="p-4 hidden md:table-cell"><div className="h-4 bg-gray-200 rounded w-20" /></td>
                                    <td className="p-4 hidden lg:table-cell"><div className="h-4 bg-gray-200 rounded w-24" /></td>
                                    <td className="p-4 hidden sm:table-cell"><div className="h-6 bg-gray-200 rounded w-20" /></td>
                                    <td className="p-4 hidden lg:table-cell"><div className="h-4 bg-gray-200 rounded w-20" /></td>
                                    <td className="p-4"><div className="h-8 bg-gray-200 rounded w-24 ml-auto" /></td>
                                </tr>
                            ))
                        ) : articles.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-gray-500">
                                    {search ? "Tidak ada artikel yang cocok" : "Belum ada artikel"}
                                </td>
                            </tr>
                        ) : (
                            articles.map((article) => (
                                <tr key={article.id} className="hover:bg-gray-50">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                                                {article.thumbnail ? (
                                                    <Image
                                                        src={article.thumbnail}
                                                        alt={article.title}
                                                        width={64}
                                                        height={48}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xl">📄</div>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium truncate max-w-52">{article.title}</p>
                                                <p className="text-xs text-gray-500 sm:hidden">{article.category?.name}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 hidden md:table-cell">
                                        <span className="text-sm text-gray-600">{article.category?.name}</span>
                                    </td>
                                    <td className="p-4 hidden lg:table-cell">
                                        <span className="text-sm text-gray-600">{article.author?.name || "-"}</span>
                                    </td>
                                    <td className="p-4 hidden sm:table-cell">
                                        {getStatusBadge(article.moderation_status === "pending" || article.moderation_status === "rejected" || article.moderation_status === "revision_needed" ? article.moderation_status : article.status)}
                                    </td>
                                    <td className="p-4 hidden lg:table-cell">
                                        <span className="text-sm text-gray-500">{formatDate(article.created_at)}</span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-1 justify-end">
                                            {article.status === "draft" && (article.moderation_status === "pending" || !article.moderation_status) && (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => onApprove(article.id)}
                                                        title="Setujui"
                                                        className="text-green-500 hover:text-green-600"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => onReject(article.id)}
                                                        title="Tolak"
                                                        className="text-red-500 hover:text-red-600"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </Button>
                                                </>
                                            )}
                                            {article.status !== "blocked" && article.status !== "draft" && (
                                                <>
                                                    <Link href={ROUTES.articleRead(article.id)}>
                                                        <Button variant="ghost" size="icon" title="Lihat">
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => onEdit(article)}
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                </>
                                            )}
                                            {article.status === "draft" && (
                                                <Link href={ROUTES.articleRead(article.id)}>
                                                    <Button variant="ghost" size="icon" title="Lihat">
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onBlock(article.id)}
                                                title={article.status === "blocked" ? "Unblock" : "Block"}
                                                className={article.status === "blocked" ? "text-green-500 hover:text-green-600" : "text-yellow-500 hover:text-yellow-600"}
                                            >
                                                {article.status === "blocked" ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-500 hover:text-red-600"
                                                onClick={() => onDelete(article.id)}
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
