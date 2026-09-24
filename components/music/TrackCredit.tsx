import { Song } from "@/types";

interface TrackCreditProps {
  song: Pick<Song, "attribution" | "source_url" | "license_url">;
  className?: string;
}

export function TrackCredit({ song, className = "" }: TrackCreditProps) {
  if (!song.attribution && !song.source_url && !song.license_url) return null;

  return (
    <p className={`text-[10px] leading-4 text-gray-500 ${className}`}>
      {song.attribution ? <span>{song.attribution}</span> : null}
      {song.source_url ? (
        <>
          {song.attribution ? <span aria-hidden="true"> · </span> : null}
          <a href={song.source_url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-primary">
            sumber
          </a>
        </>
      ) : null}
      {song.license_url ? (
        <>
          {song.attribution || song.source_url ? <span aria-hidden="true"> · </span> : null}
          <a href={song.license_url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-primary">
            lisensi
          </a>
        </>
      ) : null}
    </p>
  );
}
