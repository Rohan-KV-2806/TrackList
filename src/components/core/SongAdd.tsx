import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';

export interface Track {
  id: string;
  title: string;
  duration: number; // in seconds
  fileUri: string;  // URL to play the file later
}

interface SongAddProps {
  onAddTrack: (track: Track) => void;
}

export default function SongAdd({ onAddTrack }: SongAddProps) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const getDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      
      audio.onloadedmetadata = () => {
        resolve(audio.duration);
      };
      
      audio.onerror = () => resolve(0); // Fallback if file is corrupt
    });
  };

  const handleFolderChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsLoading(true);
    const newTracks: Track[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('audio/')) {
        const duration = await getDuration(file);
        newTracks.push({
          id: `${file.name}-${i}`,
          title: file.name.replace(/\.[^/.]+$/, ""), // Remove .mp3 extension
          duration: Math.round(duration),
          fileUri: URL.createObjectURL(file),
        });
      }
    }

    setTracks(newTracks);
    setIsLoading(false);
  };

  const handleAddClick = (track: Track) => {
    onAddTrack(track);
    setTracks(prev => prev.filter(t => t.id !== track.id));
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col gap-4">
      <input
        type="file"
        // @ts-ignore - webkitdirectory allows folder selection
        webkitdirectory=""
        directory=""
        multiple
        ref={inputRef}
        onChange={handleFolderChange}
        className="hidden"
      />
      
      <Button 
        variant="outline" 
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
          'Select Music Folder'
        )}
      </Button>

      {/* Display discovered tracks */}
      {tracks.length > 0 && (
        <div className="border rounded-lg p-1">
          <h4 className="text-sm font-medium text-muted-foreground px-3 py-2">Available Tracks</h4>
          <ScrollArea className="h-[200px] w-full rounded-md">
            <div className="flex flex-col">
              {tracks.map((track) => (
                <div 
                  key={track.id} 
                  className="flex items-center justify-between px-3 py-2 hover:bg-muted/50 rounded-md transition-colors"
                >
                  <div className="flex flex-col overflow-hidden mr-2">
                    <span className="text-sm font-medium truncate">{track.title}</span>
                    <span className="text-xs text-muted-foreground">{formatTime(track.duration)}</span>
                  </div>
                  <Button 
                    size="sm"
                    onClick={() => handleAddClick(track)}
                  >
                    Add
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}