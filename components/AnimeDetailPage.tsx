 // components/AnimeListPage.tsx - FIXED VERSION
import React, { useState, useEffect, useMemo } from 'react';
import type { Anime, FilterType } from '../src/types';
import { getAllAnime } from '../services/animeService';
import Spinner from './Spinner';

interface AnimeListPageProps {
  onAnimeSelect: (anime: Anime) => void;
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
}

const AnimeListPage: React.FC<AnimeListPageProps> = ({ onAnimeSelect, filter, setFilter }) => {
  const [allAnime, setAllAnime] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnime = async () => {
      try {
        console.log('📋 AnimeListPage: Fetching anime...');
        setIsLoading(true);
        setError(null);
        const data = await getAllAnime();
        console.log('✅ AnimeListPage: Received', data.length, 'anime');
        setAllAnime(data);
      } catch (err) {
        console.error('❌ AnimeListPage: Error fetching anime:', err);
        setError('Failed to fetch anime data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnime();
  }, []);

  const sortedAndFilteredAnime = useMemo(() => {
    console.log('🎯 Filtering anime...', {
      total: allAnime.length,
      currentFilter: filter
    });

    let result = allAnime;
    
    // Filter by sub/dub status
    if (filter !== 'All') {
      result = result.filter(anime => anime.subDubStatus === filter);
    }
    
    // Sort by title
    const sorted = result.sort((a, b) => a.title.localeCompare(b.title));
    
    console.log('✅ Filtered result:', sorted.length, 'anime');
    return sorted;
  }, [allAnime, filter]);

  // Effect to manage the filtering loading indicator
  useEffect(() => {
    if (isFiltering) {
      const timer = setTimeout(() => setIsFiltering(false), 300);
      return () => clearTimeout(timer);
    }
  }, [sortedAndFilteredAnime, isFiltering]);

  const handleFilterChange = (newFilter: FilterType) => {
    if (newFilter !== filter) {
      setIsFiltering(true);
      setFilter(newFilter);
    }
  };

  const filterOptions: FilterType[] = ['All', 'Hindi Dub', 'Hindi Sub'];

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-slate-100 border-l-4 border-purple-500 pl-4">
          Anime List (A-Z)
          {!isLoading && (
            <span className="text-slate-400 text-lg ml-2">
              ({sortedAndFilteredAnime.length} items)
            </span>
          )}
        </h1>
        <div className="flex items-center gap-2 bg-slate-800/50 p-1 rounded-lg">
          {filterOptions.map(option => (
            <button
              key={option}
              onClick={() => handleFilterChange(option)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                filter === option
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Debug Info */}
      <div className="bg-slate-800/50 p-3 rounded-lg mb-6">
        <p className="text-slate-300 text-sm">
          🔍 Total Anime: {allAnime.length} | 
          Showing: {sortedAndFilteredAnime.length} | 
          Filter: {filter}
        </p>
      </div>
      
      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" text="Loading anime list..." />
        </div>
      )}
      
      {error && (
        <div className="text-center py-16">
          <div className="bg-red-900/20 rounded-xl p-8 max-w-md mx-auto">
            <div className="text-6xl mb-4">😞</div>
            <h2 className="text-2xl font-semibold text-white mb-2">Error Loading Anime</h2>
            <p className="text-red-300 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg transition"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
      
      {!isLoading && !error && (
        <div className="bg-slate-800/50 rounded-lg shadow-lg relative min-h-[300px]">
          {isFiltering && (
            <div className="absolute inset-0 bg-slate-800/60 flex justify-center items-center z-10 rounded-lg animate-fade-in">
              <Spinner size="md" text="Applying filter..." />
            </div>
          )}
          
          <ul className={`divide-y divide-slate-700 transition-opacity duration-300 ${isFiltering ? 'opacity-50' : 'opacity-100'}`}>
            {sortedAndFilteredAnime.length > 0 ? (
              sortedAndFilteredAnime.map((anime, index) => (
                <li key={anime.id}>
                  <button 
                    onClick={() => {
                      console.log('🎬 Selected anime:', anime.title, 'Episodes:', anime.episodes?.length);
                      onAnimeSelect(anime);
                    }}
                    className="w-full text-left p-4 flex justify-between items-center hover:bg-slate-700/50 transition-colors duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-slate-200 group-hover:text-purple-300 transition-colors font-medium">
                        {anime.title}
                      </span>
                      <span className="text-xs bg-slate-700 px-2 py-1 rounded-full text-slate-300">
                        {anime.contentType}
                      </span>
                      {anime.episodes && anime.episodes.length > 0 && (
                        <span className="text-xs bg-green-900/50 text-green-400 px-2 py-1 rounded-full">
                          {anime.episodes.length} EP
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded-full">
                      {anime.subDubStatus}
                    </span>
                  </button>
                </li>
              ))
            ) : (
              <li className="p-8 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-slate-300 mb-2">No Anime Found</h3>
                <p className="text-slate-400">
                  {filter !== 'All' 
                    ? `No anime found for filter: ${filter}`
                    : 'No anime available in the database'
                  }
                </p>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AnimeListPage;;
