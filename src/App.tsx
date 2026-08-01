import { useState } from 'react';
import Page1 from './pages/Page1';
import Page2 from './pages/Page2';
import { type Track } from './components/core/SongAdd';
import Header from './components/ui/header';
import Footer from './components/ui/footer';

export default function App() {
  const [page, setPage] = useState<'page1' | 'page2'>('page1');
  
  // Keep queue in memory only. Blob URLs break if saved to localStorage.
  const [queue, setQueue] = useState<Track[]>([]);
  
  // Default to 30 mins (1800 secs)
  const [targetCommuteTime, setTargetCommuteTime] = useState<number>(1800); 

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 md:px-8">
        {/* Page Navigation Tabs */}
        <div className="flex gap-2 mb-8 border-b pb-2">
          <button 
            onClick={() => setPage('page1')} 
            className={`px-4 py-2 text-sm font-medium transition-colors rounded-t-md ${
              page === 'page1' 
                ? 'bg-primary text-primary-foreground' 
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            1. Build Queue
          </button>
          <button 
            onClick={() => setPage('page2')} 
            className={`px-4 py-2 text-sm font-medium transition-colors rounded-t-md ${
              page === 'page2' 
                ? 'bg-primary text-primary-foreground' 
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            2. Start Commute
          </button>
        </div>

        {/* Render Active Page */}
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
      </main>

      <Footer />
    </div>
  );
}