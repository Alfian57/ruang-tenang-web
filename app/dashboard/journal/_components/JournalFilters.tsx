"use client";

import { useState } from "react";
import { useJournalStore } from "@/store/journalStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export function JournalFilters() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { isLoading } = useJournalStore();

    // Get initial values from URL
    const initialStartDate = searchParams.get("start_date");
    const initialEndDate = searchParams.get("end_date");
    const initialTags = searchParams.get("tags");

    // Local state for inputs
    const [startDate, setStartDate] = useState<string>(initialStartDate || "");
    const [endDate, setEndDate] = useState<string>(initialEndDate || "");
    const [tagInput, setTagInput] = useState<string>(initialTags || "");

    const createQueryString = (params: Record<string, string | null>) => {
        const newParams = new URLSearchParams(searchParams.toString());
        Object.entries(params).forEach(([key, value]) => {
            if (value === null || value === "") {
                newParams.delete(key);
            } else {
                newParams.set(key, value);
            }
        });
        return newParams.toString();
    };

    const handleApply = () => {
        const params = {
            start_date: startDate || null,
            end_date: endDate || null,
            tags: tagInput || null,
        };
        router.push(`${pathname}?${createQueryString(params)}`);
    };

    const handleReset = () => {
        setStartDate("");
        setEndDate("");
        setTagInput("");
        router.push(pathname);
    };

    return (
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-4 animate-in slide-in-from-top-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Date Range - Start */}
                <div className="space-y-2">
                    <Label className="text-xs">Dari Tanggal</Label>
                    <div className="relative">
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="h-9"
                        />
                    </div>
                </div>

                {/* Date Range - End */}
                <div className="space-y-2">
                    <Label className="text-xs">Sampai Tanggal</Label>
                    <div className="relative">
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="h-9"
                        />
                    </div>
                </div>

                {/* Tags Filter */}
                <div className="space-y-2">
                    <Label className="text-xs">Tag (pisahkan koma)</Label>
                    <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="contoh: kerja, liburan"
                        className="h-9"
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="text-gray-500"
                    disabled={isLoading}
                >
                    Reset Filter
                </Button>
                <Button
                    size="sm"
                    onClick={handleApply}
                    disabled={isLoading}
                >
                    Terapkan Filter
                </Button>
            </div>
        </div>
    );
}
