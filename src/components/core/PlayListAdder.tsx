import { useState, useRef } from 'react';

export interface Track {
  id: string;
  title: string;
  duration: number;
  fileUri: string;
}

interface PlayListAdderProps {
  onAddMultiple: (tracks: Track[]) => void;
}

export default function PlayListAdder({ onAddMultiple }: PlayListAdderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reusing the simple duration extraction logic
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

    // Pass the whole batch up to the QueueBuilder
    onAddMultiple(newTracks);
    setIsLoading(false);

    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div style={{ marginBottom: '20px', border: '1px dashed #aaa', padding: '10px' }}>
      <input
        type="file"
        // @ts-ignore
        webkitdirectory=""
        directory=""
        multiple
        ref={inputRef}
        onChange={handleAddPlaylist}
        style={{ display: 'none' }}
      />
      <button onClick={() => inputRef.current?.click()} disabled={isLoading}>
        {isLoading ? 'Scanning Playlist...' : '+ Add Whole Playlist/Folder'}
      </button>
      <p style={{ fontSize: '0.85em', color: 'gray', margin: '5px 0 0 0' }}>
        Selects a folder and adds all audio files directly to the queue in one go.
      </p>
    </div>
  );
}