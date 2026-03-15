"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Users, Crown, ShieldCheck, UserMinus, ArrowUpCircle, ArrowRightLeft, AlertTriangle } from "lucide-react";
import Image from "next/image";
import type { GuildMember } from "@/types/guild";

interface GuildMemberListProps {
    members: GuildMember[];
    isAdmin: boolean;
    isLeader: boolean;
    currentUserId?: number;
    onKick?: (userId: number) => void;
    onPromote?: (userId: number) => void;
    onTransfer?: (userId: number) => void;
}

const ROLE_BADGES: Record<string, { label: string; color: string; icon: typeof Crown }> = {
    leader: { label: "Ketua", color: "text-yellow-600 bg-yellow-50", icon: Crown },
    admin: { label: "Wakil Ketua", color: "text-blue-600 bg-blue-50", icon: ShieldCheck },
    member: { label: "Anggota", color: "text-gray-600 bg-gray-50", icon: Users },
};

type ConfirmAction = {
    type: "promote" | "kick" | "transfer";
    member: GuildMember;
} | null;

export function GuildMemberList({
    members,
    isAdmin,
    isLeader,
    currentUserId,
    onKick,
    onPromote,
    onTransfer,
}: GuildMemberListProps) {
    const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

    const getConfirmInfo = () => {
        if (!confirmAction) return { title: "", description: "", buttonLabel: "", variant: "default" as const };
        const name = confirmAction.member.name;
        switch (confirmAction.type) {
            case "promote":
                return {
                    title: "Promosikan ke Wakil Ketua?",
                    description: `Apakah kamu yakin ingin mempromosikan ${name} menjadi Wakil Ketua? Wakil Ketua dapat mengeluarkan anggota dan mengatur guild.`,
                    buttonLabel: "Ya, Promosikan",
                    variant: "default" as const,
                };
            case "kick":
                return {
                    title: "Keluarkan Anggota?",
                    description: `Apakah kamu yakin ingin mengeluarkan ${name} dari guild? Tindakan ini tidak dapat dibatalkan.`,
                    buttonLabel: "Ya, Keluarkan",
                    variant: "destructive" as const,
                };
            case "transfer":
                return {
                    title: "Transfer Kepemimpinan?",
                    description: `Apakah kamu yakin ingin mentransfer kepemimpinan guild kepada ${name}? Kamu akan menjadi anggota biasa setelah transfer.`,
                    buttonLabel: "Ya, Transfer",
                    variant: "destructive" as const,
                };
        }
    };

    const handleConfirm = () => {
        if (!confirmAction) return;
        const userId = confirmAction.member.user_id;
        switch (confirmAction.type) {
            case "promote":
                onPromote?.(userId);
                break;
            case "kick":
                onKick?.(userId);
                break;
            case "transfer":
                onTransfer?.(userId);
                break;
        }
        setConfirmAction(null);
    };

    const info = getConfirmInfo();

    const rolePriority: Record<string, number> = { leader: 0, admin: 1, member: 2 };

    const sortedMembers = [...members].sort((a, b) => {
        const priorityA = rolePriority[a.role] ?? 3;
        const priorityB = rolePriority[b.role] ?? 3;
        if (priorityA !== priorityB) {
            return priorityA - priorityB;
        }
        return b.xp_contributed - a.xp_contributed;
    });

    return (
        <>
            <div className="space-y-2">
                {sortedMembers.map((member) => {
                    const badge = ROLE_BADGES[member.role] || ROLE_BADGES.member;
                    const RoleIcon = badge.icon;
                    const isCurrentUser = member.user_id === currentUserId;
                    const canManage = !isCurrentUser && member.role !== "leader";

                    return (
                        <div
                            key={member.id}
                            className="flex items-center gap-3 bg-white rounded-xl border p-3 hover:bg-gray-50 transition-colors"
                        >
                            {/* Avatar */}
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                                {member.avatar ? (
                                    <Image src={member.avatar} alt={member.name} width={40} height={40} className="w-full h-full object-cover rounded-full" />
                                ) : (
                                    <span className="text-sm font-semibold text-primary">
                                        {member.name?.charAt(0)?.toUpperCase() || "?"}
                                    </span>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-800 truncate">
                                        {member.name}
                                        {isCurrentUser && <span className="text-xs text-gray-400 ml-1">(Kamu)</span>}
                                    </span>
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${badge.color}`}>
                                        <RoleIcon className="w-3 h-3" />
                                        {badge.label}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                                    <span>@{member.username}</span>
                                    <span>Lv.{member.user_level}</span>
                                    <span>{member.xp_contributed.toLocaleString()} XP</span>
                                </div>
                            </div>

                            {/* Actions */}
                            {canManage && (isAdmin || isLeader) && (
                                <div className="flex items-center gap-1 shrink-0">
                                    {isLeader && member.role === "member" && onPromote && (
                                        <button
                                            onClick={() => setConfirmAction({ type: "promote", member })}
                                            title="Promosikan ke Wakil Ketua"
                                            className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"
                                        >
                                            <ArrowUpCircle className="w-4 h-4" />
                                        </button>
                                    )}
                                    {isLeader && onTransfer && (
                                        <button
                                            onClick={() => setConfirmAction({ type: "transfer", member })}
                                            title="Transfer Kepemimpinan"
                                            className="p-1.5 rounded-lg hover:bg-yellow-50 text-yellow-600 transition-colors"
                                        >
                                            <ArrowRightLeft className="w-4 h-4" />
                                        </button>
                                    )}
                                    {onKick && (
                                        <button
                                            onClick={() => setConfirmAction({ type: "kick", member })}
                                            title="Keluarkan"
                                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                                        >
                                            <UserMinus className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Confirmation Modal */}
            <Dialog open={!!confirmAction} onOpenChange={(open) => { if (!open) setConfirmAction(null); }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className={`w-5 h-5 ${info.variant === "destructive" ? "text-red-500" : "text-blue-500"}`} />
                            {info.title}
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-gray-500 py-2">{info.description}</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmAction(null)}>
                            Batal
                        </Button>
                        <Button
                            variant={info.variant}
                            onClick={handleConfirm}
                        >
                            {info.buttonLabel}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
