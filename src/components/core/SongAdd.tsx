import { useState, useRef } from 'react';

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
  const inputRef = useRef<HTMLInputElement>(null);

  // Simple helper to read duration
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

    const newTracks: Track[] = [];

    // Loop through everything found in the folder
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Only grab audio files
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
    <div style={{ marginBottom: '20px' }}>
      <input
        type="file"
        // @ts-ignore - webkitdirectory allows folder selection
        webkitdirectory=""
        directory=""
        multiple
        ref={inputRef}
        onChange={handleFolderChange}
        style={{ display: 'none' }}
      />
      
      <button onClick={() => inputRef.current?.click()}>
        Select Music Folder
      </button>

      <div style={{ marginTop: '10px' }}>
        {tracks.map((track) => (
          <div 
            key={track.id} 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              padding: '8px', 
              borderBottom: '1px solid #ccc' 
            }}
          >
            <span>{track.title} ({formatTime(track.duration)})</span>
            <button onClick={() => handleAddClick(track)}>
              Add
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}