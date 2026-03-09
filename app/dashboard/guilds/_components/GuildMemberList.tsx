"use client";

import { Users, Crown, ShieldCheck, UserMinus, ArrowUpCircle, ArrowRightLeft } from "lucide-react";
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
    leader: { label: "Leader", color: "text-yellow-600 bg-yellow-50", icon: Crown },
    admin: { label: "Admin", color: "text-blue-600 bg-blue-50", icon: ShieldCheck },
    member: { label: "Member", color: "text-gray-600 bg-gray-50", icon: Users },
};

export function GuildMemberList({
    members,
    isAdmin,
    isLeader,
    currentUserId,
    onKick,
    onPromote,
    onTransfer,
}: GuildMemberListProps) {
    return (
        <div className="space-y-2">
            {members.map((member) => {
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
                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
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
                                        onClick={() => onPromote(member.user_id)}
                                        title="Promosikan ke Admin"
                                        className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"
                                    >
                                        <ArrowUpCircle className="w-4 h-4" />
                                    </button>
                                )}
                                {isLeader && onTransfer && (
                                    <button
                                        onClick={() => onTransfer(member.user_id)}
                                        title="Transfer Kepemimpinan"
                                        className="p-1.5 rounded-lg hover:bg-yellow-50 text-yellow-600 transition-colors"
                                    >
                                        <ArrowRightLeft className="w-4 h-4" />
                                    </button>
                                )}
                                {onKick && (
                                    <button
                                        onClick={() => onKick(member.user_id)}
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
    );
}
