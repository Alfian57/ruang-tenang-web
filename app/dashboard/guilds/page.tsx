"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Plus,
    Ticket,
    Users,
    Swords,
    ImagePlus,
    Shield,
    Flame,
    ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useGuildPage } from "./_hooks/useGuildPage";
import { GuildCard, MyGuildBanner } from "./_components";

export default function GuildsPage() {
    const {
        publicGuilds,
        myGuild,
        isLoading,
        page,
        setPage,
        totalPages,
        // Create
        isCreateOpen,
        setIsCreateOpen,
        isSubmitting,
        newName,
        setNewName,
        newDescription,
        setNewDescription,
        newIsPublic,
        setNewIsPublic,
        newProfileImagePreview,
        handleProfileImageChange,
        fileInputRef,
        handleCreateGuild,
        // Join
        isJoinOpen,
        setIsJoinOpen,
        inviteCode,
        setInviteCode,
        handleJoinByCode,
        handleJoinGuild,
    } = useGuildPage();

    const hasGuild = myGuild?.is_member;

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 lg:p-6 space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl">
                        <Swords className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Guild</h1>
                        <p className="text-gray-500 text-sm md:text-base">
                            {hasGuild
                                ? "Kelola guild kamu dan selesaikan tugas bersama"
                                : "Bergabung atau buat guild untuk menyelesaikan tantangan bersama"}
                        </p>
                    </div>
                </div>

                {/* Show create/join buttons only if user doesn't have a guild */}
                {!hasGuild && (
                    <div className="flex gap-2">
                        {/* Join by Invite Code */}
                        <Dialog open={isJoinOpen} onOpenChange={setIsJoinOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="gap-2">
                                    <Ticket className="w-4 h-4" />
                                    Kode Undangan
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Bergabung dengan Kode Undangan</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Kode Undangan</label>
                                        <Input
                                            placeholder="Masukkan kode undangan guild..."
                                            value={inviteCode}
                                            onChange={(e) => setInviteCode(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsJoinOpen(false)}>
                                        Batal
                                    </Button>
                                    <Button
                                        onClick={handleJoinByCode}
                                        disabled={isSubmitting || !inviteCode.trim()}
                                    >
                                        {isSubmitting ? "Bergabung..." : "Gabung"}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        {/* Create Guild */}
                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
                                    <Plus className="w-4 h-4" />
                                    Buat Guild
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-lg">
                                <DialogHeader>
                                    <DialogTitle>Buat Guild Baru</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    {/* Profile Image Upload */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Foto Profil Guild</label>
                                        <div className="flex items-center gap-4">
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 hover:border-primary/50 flex items-center justify-center overflow-hidden transition-colors bg-gray-50 hover:bg-primary/5 shrink-0"
                                            >
                                                {newProfileImagePreview ? (
                                                    <Image
                                                        src={newProfileImagePreview}
                                                        alt="Preview"
                                                        width={80}
                                                        height={80}
                                                        className="w-full h-full object-cover rounded-xl"
                                                    />
                                                ) : (
                                                    <ImagePlus className="w-6 h-6 text-gray-400" />
                                                )}
                                            </button>
                                            <div className="text-sm text-gray-500">
                                                <p>Klik untuk mengunggah foto profil guild.</p>
                                                <p className="text-xs text-gray-400 mt-0.5">PNG, JPG. Maks 2MB.</p>
                                            </div>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/png,image/jpeg,image/webp"
                                                onChange={handleProfileImageChange}
                                                className="hidden"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Nama Guild</label>
                                        <Input
                                            placeholder="Misal: Tim Semangat Pagi"
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            maxLength={100}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Deskripsi</label>
                                        <Textarea
                                            placeholder="Ceritakan tentang guild kamu..."
                                            value={newDescription}
                                            onChange={(e) => setNewDescription(e.target.value)}
                                            rows={3}
                                            maxLength={500}
                                        />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={newIsPublic}
                                                onChange={(e) => setNewIsPublic(e.target.checked)}
                                                className="rounded border-gray-300 text-primary focus:ring-primary"
                                            />
                                            <span className="text-sm font-medium">Guild Publik</span>
                                        </label>
                                        <span className="text-xs text-gray-400">
                                            {newIsPublic
                                                ? "Siapapun bisa melihat dan bergabung"
                                                : "Hanya bisa bergabung via kode undangan"}
                                        </span>
                                    </div>

                                    {/* Info box */}
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
                                        <p className="font-medium mb-1">📋 Ketentuan Guild:</p>
                                        <ul className="space-y-0.5 list-disc list-inside text-amber-600">
                                            <li>Setiap user hanya bisa bergabung di 1 guild</li>
                                            <li>Maksimal 10 anggota per guild</li>
                                            <li>Kamu otomatis menjadi Ketua guild</li>
                                            <li>Kamu bisa menunjuk 1 Wakil Ketua</li>
                                        </ul>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                                        Batal
                                    </Button>
                                    <Button
                                        onClick={handleCreateGuild}
                                        disabled={isSubmitting || !newName.trim()}
                                    >
                                        {isSubmitting ? "Membuat..." : "Buat Guild"}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                )}
            </motion.div>

            {/* My Guild Banner — shown prominently if user has a guild */}
            {myGuild?.is_member && <MyGuildBanner myGuild={myGuild} />}

            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 inline-flex items-center gap-1.5">
                            <Flame className="w-3.5 h-3.5" />
                            Guild Event 7 Hari
                        </p>
                        <h3 className="text-base font-semibold text-gray-900 mt-1">Challenge: 1 aksi kecil tiap hari</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Setiap anggota menuntaskan minimal 1 aksi pemulihan harian (jurnal/chat/pernafasan), lalu share insight singkat ke guild.
                        </p>
                    </div>
                    <Button asChild variant="outline" className="bg-white">
                        <Link href="/dashboard/community">
                            Buka Mission Board
                            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                        </Link>
                    </Button>
                </div>
            </section>

            {/* Guild list title + already-joined info */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    <h2 className="font-semibold text-gray-800">Jelajahi Guild</h2>
                </div>

                {hasGuild && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-700 flex items-center gap-2">
                        <Shield className="w-4 h-4 shrink-0" />
                        <span>
                            Kamu sudah bergabung di guild <strong>{myGuild?.guild?.name}</strong>. Setiap user hanya bisa bergabung di 1 guild.
                        </span>
                    </div>
                )}
            </div>

            {/* Guild grid */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl border overflow-hidden animate-pulse">
                                <div className="aspect-[16/9] bg-gray-200" />
                                <div className="p-4 space-y-3">
                                    <div className="h-5 bg-gray-200 rounded w-2/3" />
                                    <div className="h-3 bg-gray-100 rounded w-full" />
                                    <div className="h-3 bg-gray-100 rounded w-4/5" />
                                    <div className="h-8 bg-gray-100 rounded-xl" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : publicGuilds.length === 0 ? (
                    <div className="text-center py-16">
                        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-500">Belum ada guild</h3>
                        <p className="text-gray-400 text-sm mt-1">
                            Jadilah yang pertama membuat guild!
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {publicGuilds.map((guild) => (
                                <GuildCard
                                    key={guild.id}
                                    guild={guild}
                                    onJoin={handleJoinGuild}
                                    isMemberOfAny={myGuild?.is_member}
                                    myGuildId={myGuild?.guild?.id}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center gap-2 pt-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page <= 1}
                                    onClick={() => setPage(page - 1)}
                                >
                                    Sebelumnya
                                </Button>
                                <span className="flex items-center px-3 text-sm text-gray-500">
                                    {page} / {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page >= totalPages}
                                    onClick={() => setPage(page + 1)}
                                >
                                    Selanjutnya
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
