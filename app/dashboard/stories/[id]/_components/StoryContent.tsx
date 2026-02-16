import Image from "next/image";
import {
  Heart,
  Eye,
  Calendar,
  Tag,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { InspiringStory } from "@/types/gamification";

interface StoryContentProps {
  story: InspiringStory;
  heartLoading: boolean;
  onToggleHeart: () => void;
}

export function StoryContent({ story, heartLoading, onToggleHeart }: StoryContentProps) {
  return (
    <>
      {/* Cover Image */}
      {story.cover_image && (
        <div className="rounded-2xl overflow-hidden mb-8 aspect-video bg-gray-100 relative">
          <Image
            src={story.cover_image}
            alt={story.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Title & Meta */}
      <div className="mb-8">
        {story.is_featured && (
          <Badge className="bg-amber-500 text-white mb-3">
            ✨ Kisah Pilihan
          </Badge>
        )}
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          {story.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-gray-600">
          <div className="flex items-center gap-2">
            {story.is_anonymous ? (
              <>
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-500" />
                </div>
                <span>Anonim</span>
              </>
            ) : (
              <>
                {story.author?.avatar ? (
                  <Image
                    src={story.author.avatar}
                    alt={story.author.name}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-amber-600" />
                  </div>
                )}
                <span className="font-medium">{story.author?.name}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Calendar className="w-4 h-4" />
            {story.published_at &&
              format(new Date(story.published_at), "d MMMM yyyy", {
                locale: idLocale,
              })}
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Eye className="w-4 h-4" />
            {story.view_count} views
          </div>
        </div>
      </div>

      {/* Categories & Tags */}
      <div className="flex flex-wrap gap-2 mb-8">
        {story.categories?.map((cat) => (
          <Badge key={cat.id} variant="secondary" className="gap-1">
            {cat.icon} {cat.name}
          </Badge>
        ))}
        {story.tags?.map((tag, i) => (
          <Badge key={i} variant="outline" className="gap-1">
            <Tag className="w-3 h-3" />
            {tag}
          </Badge>
        ))}
      </div>

      {/* Content */}
      <div
        className="prose prose-lg max-w-none mb-8"
        dangerouslySetInnerHTML={{ __html: story.content }}
      />

      {/* Actions */}
      <div className="flex items-center gap-4 py-6 border-y mb-8">
        <Button
          variant={story.has_hearted ? "default" : "outline"}
          onClick={onToggleHeart}
          disabled={heartLoading}
          className={cn(
            "gap-2",
            story.has_hearted && "bg-rose-500 hover:bg-rose-600"
          )}
        >
          <Heart
            className={cn(
              "w-5 h-5",
              story.has_hearted && "fill-current"
            )}
          />
          {story.heart_count} Apresiasi
        </Button>
        <div className="flex items-center gap-1 text-gray-600">
          <Heart className="w-5 h-5" />
          {story.comment_count} Komentar
        </div>
      </div>
    </>
  );
}
