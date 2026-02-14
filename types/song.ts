// Song types
export interface SongCategory {
  id: number;
  name: string;
  thumbnail: string;
  song_count?: number;
  created_at: string;
}

export interface Song {
  id: number;
  title: string;
  file_path: string;
  thumbnail: string;
  category_id: number;
  category?: SongCategory;
  created_at: string;
}

// Playlist types
export interface Playlist {
  id: number;
  user_id: number;
  name: string;
  description: string;
  thumbnail: string;
  is_public: boolean;
  is_admin_playlist: boolean;
  item_count: number;
  total_songs: number;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    avatar: string;
  };
  items?: PlaylistItem[];
}

export interface PlaylistItem {
  id: number;
  playlist_id: number;
  song_id: number;
  position: number;
  added_at: string;
  song?: Song;
}

export interface PlaylistListItem {
  id: number;
  name: string;
  description: string;
  thumbnail: string;
  is_public: boolean;
  is_admin_playlist: boolean;
  item_count: number;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    avatar: string;
  };
}

export interface CreatePlaylistRequest {
  name: string;
  description?: string;
  thumbnail?: string;
  is_public?: boolean;
}

export interface UpdatePlaylistRequest {
  name: string;
  description?: string;
  thumbnail?: string;
  is_public?: boolean;
}
