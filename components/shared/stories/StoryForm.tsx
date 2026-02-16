"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/utils";
import { StoryCategory, CreateStoryRequest } from "@/types";
import {
    AlertTriangle,
    X,
    Image as ImageIcon,
    Loader2,
    Eye,
    EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface StoryFormProps {
    categories: StoryCategory[];
    onSubmit: (data: CreateStoryRequest) => void;
    isLoading?: boolean;
    initialData?: Partial<CreateStoryRequest>;
    submitLabel?: string;
    className?: string;
}

export function StoryForm({
    categories,
    onSubmit,
    isLoading,
    initialData,
    submitLabel = "Kirim Cerita",
    className,
}: StoryFormProps) {
    const [title, setTitle] = useState(initialData?.title || "");
    const [content, setContent] = useState(initialData?.content || "");
    const [coverImage, setCoverImage] = useState(initialData?.cover_image || "");
    const [selectedCategories, setSelectedCategories] = useState<string[]>(
        initialData?.category_ids || []
    );
    const [tags, setTags] = useState<string[]>(initialData?.tags || []);
    const [tagInput, setTagInput] = useState("");
    const [isAnonymous, setIsAnonymous] = useState(initialData?.is_anonymous || false);
    const [hasTriggerWarning, setHasTriggerWarning] = useState(
        initialData?.has_trigger_warning || false
    );
    const [triggerWarningText, setTriggerWarningText] = useState(
        initialData?.trigger_warning_text || ""
    );
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!title.trim()) {
            newErrors.title = "Judul cerita wajib diisi";
        } else if (title.length < 10) {
            newErrors.title = "Judul minimal 10 karakter";
        }

        if (!content.trim()) {
            newErrors.content = "Isi cerita wajib diisi";
        } else if (content.length < 100) {
            newErrors.content = "Cerita minimal 100 karakter";
        }

        if (selectedCategories.length === 0) {
            newErrors.categories = "Pilih minimal satu kategori";
        }

        if (hasTriggerWarning && !triggerWarningText.trim()) {
            newErrors.triggerWarning = "Deskripsi trigger warning wajib diisi";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        onSubmit({
            title: title.trim(),
            content: content.trim(),
            cover_image: coverImage || undefined,
            category_ids: selectedCategories,
            tags: tags.length > 0 ? tags : undefined,
            is_anonymous: isAnonymous,
            has_trigger_warning: hasTriggerWarning,
            trigger_warning_text: hasTriggerWarning ? triggerWarningText : undefined,
        });
    };

    const toggleCategory = (categoryId: string) => {
        setSelectedCategories((prev) =>
            prev.includes(categoryId)
                ? prev.filter((id) => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    const addTag = () => {
        const tag = tagInput.trim().toLowerCase();
        if (tag && !tags.includes(tag) && tags.length < 5) {
            setTags([...tags, tag]);
            setTagInput("");
        }
    };

    const removeTag = (tag: string) => {
        setTags(tags.filter((t) => t !== tag));
    };

    return (
        <form onSubmit={handleSubmit} className={cn("space-y-6", className)}>
            {/* Title */}
            <div className="space-y-2">
                <Label htmlFor="title">Judul Cerita *</Label>
                <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Masukkan judul yang menggambarkan ceritamu"
                    className={errors.title ? "border-destructive" : ""}
                />
                {errors.title && (
                    <p className="text-sm text-destructive">{errors.title}</p>
                )}
            </div>

            {/* Categories */}
            <div className="space-y-2">
                <Label>Kategori *</Label>
                <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            type="button"
                            onClick={() => toggleCategory(category.id)}
                            className={cn(
                                "px-3 py-1.5 rounded-full text-sm transition-colors",
                                selectedCategories.includes(category.id)
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                            )}
                        >
                            {category.icon} {category.name}
                        </button>
                    ))}
                </div>
                {errors.categories && (
                    <p className="text-sm text-destructive">{errors.categories}</p>
                )}
            </div>

            {/* Cover Image */}
            <div className="space-y-2">
                <Label htmlFor="coverImage">Cover Image (URL)</Label>
                <div className="flex gap-2">
                    <Input
                        id="coverImage"
                        value={coverImage}
                        onChange={(e) => setCoverImage(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                    />
                    <Button type="button" variant="outline" size="icon">
                        <ImageIcon className="h-4 w-4" />
                    </Button>
                </div>
                {coverImage && (
                    <div className="relative h-40 rounded-lg overflow-hidden">
                        <Image
                            src={coverImage}
                            alt="Cover preview"
                            fill
                            className="object-cover"
                            unoptimized
                        />
                        <button
                            type="button"
                            onClick={() => setCoverImage("")}
                            className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 z-10"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="space-y-2">
                <Label htmlFor="content">Ceritamu *</Label>
                <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Ceritakan perjalananmu... Ingat, kamu tidak sendirian. Ceritamu bisa menginspirasi orang lain."
                    className={cn("min-h-50", errors.content && "border-destructive")}
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                    {errors.content ? (
                        <p className="text-destructive">{errors.content}</p>
                    ) : (
                        <p>{content.length}/100 karakter minimum</p>
                    )}
                </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
                <Label>Tags (opsional, maksimal 5)</Label>
                <div className="flex gap-2">
                    <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                addTag();
                            }
                        }}
                        placeholder="Ketik tag dan tekan Enter"
                        disabled={tags.length >= 5}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        onClick={addTag}
                        disabled={tags.length >= 5}
                    >
                        Tambah
                    </Button>
                </div>
                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                            <span
                                key={tag}
                                className="inline-flex items-center gap-1 bg-muted px-2 py-1 rounded-full text-sm"
                            >
                                #{tag}
                                <button
                                    type="button"
                                    onClick={() => removeTag(tag)}
                                    className="hover:text-destructive"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Anonymous Toggle */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                    {isAnonymous ? (
                        <EyeOff className="h-5 w-5 text-muted-foreground" />
                    ) : (
                        <Eye className="h-5 w-5 text-primary" />
                    )}
                    <div>
                        <p className="font-medium">Posting Anonim</p>
                        <p className="text-sm text-muted-foreground">
                            {isAnonymous
                                ? "Nama dan foto profilmu tidak akan ditampilkan"
                                : "Nama dan foto profilmu akan ditampilkan"}
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => setIsAnonymous(!isAnonymous)}
                    className={cn(
                        "w-12 h-6 rounded-full transition-colors relative",
                        isAnonymous ? "bg-primary" : "bg-muted"
                    )}
                >
                    <span
                        className={cn(
                            "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
                            isAnonymous ? "translate-x-7" : "translate-x-1"
                        )}
                    />
                </button>
            </div>

            {/* Trigger Warning Toggle */}
            <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        <div>
                            <p className="font-medium">Trigger Warning</p>
                            <p className="text-sm text-muted-foreground">
                                Aktifkan jika ceritamu mengandung konten sensitif
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setHasTriggerWarning(!hasTriggerWarning)}
                        className={cn(
                            "w-12 h-6 rounded-full transition-colors relative",
                            hasTriggerWarning ? "bg-orange-500" : "bg-muted"
                        )}
                    >
                        <span
                            className={cn(
                                "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
                                hasTriggerWarning ? "translate-x-7" : "translate-x-1"
                            )}
                        />
                    </button>
                </div>

                {hasTriggerWarning && (
                    <div className="space-y-2">
                        <Label htmlFor="triggerWarning">Deskripsi Trigger Warning *</Label>
                        <Input
                            id="triggerWarning"
                            value={triggerWarningText}
                            onChange={(e) => setTriggerWarningText(e.target.value)}
                            placeholder="Contoh: Cerita ini membahas tentang kecemasan dan serangan panik"
                            className={errors.triggerWarning ? "border-destructive" : ""}
                        />
                        {errors.triggerWarning && (
                            <p className="text-sm text-destructive">{errors.triggerWarning}</p>
                        )}
                    </div>
                )}
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {submitLabel}
                </Button>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-muted-foreground text-center">
                Dengan mengirim cerita, kamu menyetujui bahwa ceritamu akan ditinjau oleh moderator
                sebelum dipublikasikan. Cerita yang melanggar pedoman komunitas tidak akan diterbitkan.
            </p>
        </form>
    );
}
