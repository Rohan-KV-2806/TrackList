import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { type Track } from './SongAdd';

interface PlayListAdderProps {
  onAddMultiple: (tracks: Track[]) => void;
}

export default function PlayListAdder({ onAddMultiple }: PlayListAdderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const getDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.preload = 'metadata';
      audio.src = URL.createObjectURL(file);

      audio.onloadedmetadata = () => {
        URL.revokeObjectURL(audio.src);
        resolve(audio.duration);
      };
      audio.onerror = () => resolve(0);
    });
  };

  const handleAddPlaylist = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsLoading(true);
    const newTracks: Track[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('audio/')) {
        const duration = await getDuration(file);
        newTracks.push({
          id: `${file.name}-${i}-pl`,
          title: file.name.replace(/\.[^/.]+$/, ""),
          duration: Math.round(duration),
          fileUri: URL.createObjectURL(file),
        });
      }
    }

    onAddMultiple(newTracks);
    setIsLoading(false);

    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <input
        type="file"
        // @ts-ignore
        webkitdirectory=""
        directory=""
        multiple
        ref={inputRef}
        onChange={handleAddPlaylist}
        className="hidden"
      />
      <Button 
        variant="secondary" 
        onClick={() => inputRef.current?.click()} 
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Scanning Folder...
          </>
        ) : (
          '+ Add Whole Playlist/Folder'
        )}
      </Button>
      <p className="text-xs text-muted-foreground text-center w-full">
        Selects a folder and adds all audio files directly to the queue in one go.
      </p>
    </div>
  );
}