import { useState } from 'react';
import Page1 from './pages/Page1';
import Page2 from './pages/Page2';
import { type Track } from './components/core/SongAdd';

export default function App() {
  const [page, setPage] = useState<'page1' | 'page2'>('page1');
  
  // Keep queue in memory only. Blob URLs break if saved to localStorage.
  const [queue, setQueue] = useState<Track[]>([]);
  
  // Default to 30 mins (1800 secs)
  const [targetCommuteTime, setTargetCommuteTime] = useState<number>(1800); 

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <nav style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button 
          onClick={() => setPage('page1')} 
          style={{ fontWeight: page === 'page1' ? 'bold' : 'normal' }}
        >
          1. Build Queue
        </button>
        <button 
          onClick={() => setPage('page2')} 
          style={{ fontWeight: page === 'page2' ? 'bold' : 'normal' }}
        >
          2. Start Commute
        </button>
      </nav>

      {page === 'page1' && (
        <Page1 
          queue={queue} 
          setQueue={setQueue} 
          targetCommuteTime={targetCommuteTime} 
          setTargetCommuteTime={setTargetCommuteTime} 
        />
      )}
      
      {page === 'page2' && (
        <Page2 
          queue={queue} 
          targetCommuteTime={targetCommuteTime} 
        />
      )}
    </div>
  );
}