"use client";

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
    Shield,
    Trophy,
    Ticket,
    Users,
    Swords,
} from "lucide-react";
import { motion } from "framer-motion";
import { useGuildPage } from "./_hooks/useGuildPage";
import { GuildCard, GuildLeaderboard, MyGuildBanner } from "./_components";

export default function GuildsPage() {
    const {
        publicGuilds,
        leaderboard,
        myGuild,
        isLoading,
        activeTab,
        setActiveTab,
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
        handleCreateGuild,
        // Join
        isJoinOpen,
        setIsJoinOpen,
        inviteCode,
        setInviteCode,
        handleJoinByCode,
        handleJoinGuild,
    } = useGuildPage();

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
                            Bergabung atau buat guild untuk menyelesaikan tantangan bersama
                        </p>
                    </div>
                </div>

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
            </motion.div>

            {/* My Guild Banner */}
            {myGuild?.is_member && <MyGuildBanner myGuild={myGuild} />}

            {/* Tab switcher */}
            <div className="flex gap-2 border-b pb-0">
                <button
                    onClick={() => setActiveTab("browse")}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${activeTab === "browse"
                        ? "border-primary text-primary"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                >
                    <Shield className="w-4 h-4" />
                    Jelajahi Guild
                </button>
                <button
                    onClick={() => setActiveTab("leaderboard")}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${activeTab === "leaderboard"
                        ? "border-primary text-primary"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                >
                    <Trophy className="w-4 h-4" />
                    Leaderboard
                </button>
            </div>

            {/* Tab content */}
            {activeTab === "browse" && (
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="grid gap-3">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="bg-white p-4 rounded-xl border animate-pulse h-24" />
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
                            <div className="grid gap-3">
                                {publicGuilds.map((guild) => (
                                    <GuildCard
                                        key={guild.id}
                                        guild={guild}
                                        onJoin={handleJoinGuild}
                                        isMemberOfAny={myGuild?.is_member}
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
            )}

            {activeTab === "leaderboard" && (
                <div>
                    {isLoading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="bg-white p-3 rounded-xl border animate-pulse h-16" />
                            ))}
                        </div>
                    ) : (
                        <GuildLeaderboard entries={leaderboard} />
                    )}
                </div>
            )}
        </div>
    );
}
