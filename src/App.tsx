import { useState, useEffect } from 'react';
import Page1 from './pages/Page1';
import Page2 from './pages/Page2';
import { type Track } from './components/core/SongAdd';

export default function App() {
  const [page, setPage] = useState<'page1' | 'page2'>('page1');
  
  // 1. Initialize state from localStorage (if it exists)
  const [queue, setQueue] = useState<Track[]>(() => {
    try {
      const savedQueue = localStorage.getItem('commuteQueue');
      return savedQueue ? JSON.parse(savedQueue) : [];
    } catch (error) {
      console.error("Could not load queue", error);
      return [];
    }
  });

  const [targetCommuteTime, setTargetCommuteTime] = useState<number>(() => {
    try {
      const savedTime = localStorage.getItem('commuteTime');
      return savedTime ? parseInt(savedTime) : 1800; // Default to 30 mins (1800 secs)
    } catch (error) {
      return 1800;
    }
  });

  // 2. Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem('commuteQueue', JSON.stringify(queue));
    } catch (error) {
      console.error("Could not save queue", error);
    }
  }, [queue]);

  useEffect(() => {
    try {
      localStorage.setItem('commuteTime', targetCommuteTime.toString());
    } catch (error) {
      console.error("Could not save time", error);
    }
  }, [targetCommuteTime]);

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

      {/* Render the active page and pass down the shared state */}
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