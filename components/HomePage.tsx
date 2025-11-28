  // components/HomePage.tsx - UPDATED WITH IMPROVED FEATURED ANIME API HANDLING
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Anime, FilterType, ContentTypeFilter } from '../src/types';
import AnimeCard from './AnimeCard';
import { SkeletonLoader } from './SkeletonLoader';
import { getAnimePaginated, searchAnime } from '../services/animeService';
import FeaturedAnimeCarousel from '../src/components/FeaturedAnimeCarousel';

interface Props {
  onAnimeSelect: (anime: Anime) => void;
  searchQuery: string;
  filter: FilterType;
  contentType: ContentTypeFilter;
}

// Constant for fields to be requested
const ANIME_FIELDS = 'title,thumbnail,releaseYear,status,contentType,subDubStatus,description,genreList';

const HomePage: React.FC<Props> = ({
  onAnimeSelect,
  searchQuery,
  filter,
  contentType
}) => {
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [featuredAnimes, setFeaturedAnimes] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
 
  // ✅ PAGINATION STATES
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // ✅ IMPROVED: FETCH FEATURED ANIMES with better error handling and JSON validation
  const fetchFeaturedAnimes = useCallback(async () => {
    try {
      console.log('🔄 Fetching featured animes...');
     
      // Try multiple endpoints
      const endpoints = [
        '/api/anime/featured',
        '/api/featured',
        'https://animabing.onrender.com/api/anime/featured'
      ];
      
      let apiData: Anime[] = [];
      let apiSuccess = false;

      for (const endpoint of endpoints) {
        try {
          console.log(`🔍 Trying featured endpoint: ${endpoint}`);
          const response = await fetch(endpoint);
          
          if (!response.ok) {
            console.log(`❌ Featured endpoint ${endpoint} returned status: ${response.status}`);
            continue;
          }
          
          // Check if response is JSON before parsing
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            console.log(`⚠️ Featured endpoint ${endpoint} returned non-JSON response`);
            continue;
          }
          
          const data = await response.json();
          console.log(`✅ Featured API success from: ${endpoint}`, data);
           
          // Handle different response structures
          if (Array.isArray(data)) {
            apiData = data;
          } else if (data.data && Array.isArray(data.data)) {
            apiData = data.data;
          } else if (data.featured && Array.isArray(data.featured)) {
            apiData = data.featured;
          } else if (data.success && Array.isArray(data.data)) {
            apiData = data.data;
          }
           
          if (apiData.length > 0) {
            apiSuccess = true;
            console.log(`✅ Found ${apiData.length} featured animes from ${endpoint}`);
            break;
          }
        } catch (error) {
          console.log(`❌ Featured API failed for: ${endpoint}`, error);
          continue;
        }
      }

      if (apiSuccess && apiData.length > 0) {
        // Limit to 24 animes for carousel
        const limitedData = apiData.slice(0, 24);
        setFeaturedAnimes(limitedData);
        // Also update localStorage as backup
        localStorage.setItem('featuredAnimes', JSON.stringify(limitedData));
        console.log(`✅ Successfully loaded ${limitedData.length} featured animes`);
      } else {
        // Fallback to localStorage
        throw new Error('All featured APIs failed or returned no data');
      }
    } catch (error) {
      console.log('⚠️ Using localStorage fallback for featured animes');
      // Fallback to localStorage
      try {
        const stored = localStorage.getItem('featuredAnimes');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Limit to 24 from stored as well
            const limitedData = parsed.slice(0, 24);
            console.log('✅ Loaded featured animes from localStorage:', limitedData.length);
            setFeaturedAnimes(limitedData);
          } else {
            console.log('⚠️ No featured animes found in localStorage');
            setFeaturedAnimes([]);
          }
        } else {
          console.log('⚠️ No featured animes found in localStorage');
          setFeaturedAnimes([]);
        }
      } catch (err) {
        console.error('❌ Error loading featured from localStorage:', err);
        setFeaturedAnimes([]);
      }
    }
  }, []);

  // ✅ DYNAMIC ALL CONTENT TEXT BASED ON FILTER
  const getAllContentHeading = useCallback(() => {
    if (contentType !== 'All') {
      return `All ${contentType}`;
    }
 
    switch (filter) {
      case 'Hindi Dub':
        return 'All Hindi Dub';
      case 'Hindi Sub':
        return 'All Hindi Sub';
      case 'English Sub':
        return 'All English Sub';
      default:
        return 'All Content';
    }
  }, [filter, contentType]);

  // ✅ OPTIMIZED: Load initial data with pagination
  const loadInitialAnime = async () => {
    try {
      setIsLoading(true);
      setError(null);
   
      const data = await getAnimePaginated(1, 36, ANIME_FIELDS);
   
      if (!data || data.length === 0) {
        setError('No anime data available');
        return;
      }
   
      setAnimeList(data);
      setHasMore(data.length === 36);
      setCurrentPage(1);
   
    } catch (err) {
      console.error('Error loading anime:', err);
      setError('Failed to load anime data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ OPTIMIZED: Load more data
  const loadMoreAnime = async () => {
    if (isLoadingMore || !hasMore) return;
 
    try {
      setIsLoadingMore(true);
      const nextPage = currentPage + 1;
      const data = await getAnimePaginated(nextPage, 24, ANIME_FIELDS);
   
      if (data.length === 0) {
        setHasMore(false);
      } else {
        setAnimeList(prev => [...prev, ...data]);
        setCurrentPage(nextPage);
        setHasMore(data.length === 24);
      }
    } catch (err) {
      console.error('Error loading more anime:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // ✅ IMPROVED INITIAL LOAD - Better error handling
  useEffect(() => {
    const initializeData = async () => {
      await loadInitialAnime();
      await fetchFeaturedAnimes();
    };
   
    initializeData();
  }, [fetchFeaturedAnimes]);

  // ✅ REMOVED AUTO-REFRESH since APIs are failing frequently
  // This reduces unnecessary network requests and console errors

  // ✅ OPTIMIZED SEARCH
  useEffect(() => {
    let isMounted = true;
    const performSearch = async () => {
      if (searchQuery.trim() === '') {
        if (isMounted) {
          await loadInitialAnime();
          await fetchFeaturedAnimes();
        }
        return;
      }
      try {
        setIsLoading(true);
        const data = await searchAnime(searchQuery, ANIME_FIELDS);
        if (isMounted) {
          setAnimeList(data);
          setFeaturedAnimes([]); // Clear featured during search
          setError(null);
          setHasMore(false);
        }
      } catch (err) {
        if (isMounted) {
          setError('Search failed. Please try again.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    const timeoutId = setTimeout(performSearch, 300);
 
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [searchQuery, fetchFeaturedAnimes]);

  // ✅ FILTER LOGIC
  const filteredAnime = useMemo(() => {
    let filtered = [...animeList];
    if (contentType !== 'All') {
      filtered = filtered.filter(anime =>
        anime.contentType === contentType
      );
    }
    if (filter !== 'All') {
      filtered = filtered.filter(anime =>
        anime.subDubStatus === filter
      );
    }
    return filtered;
  }, [animeList, filter, contentType]);

  // ✅ FILTER BUTTONS
  const filterButtons = [
    { key: 'All' as FilterType, label: 'All' },
    { key: 'Hindi Dub' as FilterType, label: 'Hindi Dub' },
    { key: 'Hindi Sub' as FilterType, label: 'Hindi Sub' },
    { key: 'English Sub' as FilterType, label: 'English Sub' }
  ];

  // ✅ HANDLE FILTER CHANGE
  const handleFilterChange = (newFilter: FilterType) => {
    const url = new URL(window.location.href);
    if (newFilter === 'All') {
      url.searchParams.delete('filter');
    } else {
      url.searchParams.set('filter', newFilter);
    }
    window.location.href = url.toString();
  };

  // ✅ INFINITE SCROLL
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop
          < document.documentElement.offsetHeight - 1000) return;
   
      if (!isLoadingMore && hasMore && !searchQuery) {
        loadMoreAnime();
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoadingMore, hasMore, searchQuery, loadMoreAnime]);

  // ✅ LOADING STATE - Simplified without section heading
  if (isLoading && animeList.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-white mb-8">
            {searchQuery ? 'Searching...' : 'Loading...'}
          </h1>
          <div className="space-y-8">
            {/* Featured Carousel Skeleton */}
            <div className="h-96 bg-gray-800 rounded-lg animate-pulse"></div>
           
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 lg:gap-3">
              {Array.from({ length: 12 }).map((_, index) => (
                <SkeletonLoader key={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ ERROR STATE
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="bg-red-900/20 rounded-xl p-8 max-w-md mx-auto border border-red-500/30">
              <div className="text-6xl mb-4">😞</div>
              <h2 className="text-2xl font-semibold text-white mb-2">Error Loading Anime</h2>
              <p className="text-red-300 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-2 rounded-lg transition-all duration-300 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ MAIN RENDER - Simplified carousel with only heading, cards, and names (no extra texts)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-4 lg:py-8">
     
        {/* SIMPLIFIED LATEST CONTENT CAROUSEL - Only show when not searching; PC: 4 cards/slide, Mobile: 1 card/slide; Name at bottom */}
        {!searchQuery && featuredAnimes.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-4">
              Latest Content
            </h2>
            <FeaturedAnimeCarousel
              featuredAnimes={featuredAnimes}
              onAnimeSelect={onAnimeSelect}
            />
          </div>
        )}
     
        {/* MOBILE FILTER BUTTONS */}
        <div className="mb-4 lg:hidden">
          <div className="flex flex-nowrap gap-1 overflow-x-auto pb-1 scrollbar-hide">
            {filterButtons.map((filterBtn) => (
              <button
                key={filterBtn.key}
                onClick={() => handleFilterChange(filterBtn.key)}
                className={`
                  px-2 py-1 rounded-md text-[10px] font-medium transition-all duration-200
                  border shadow-sm hover:shadow whitespace-nowrap flex-shrink-0
                  transform hover:scale-102 active:scale-98 min-w-[60px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900
                  ${filter === filterBtn.key
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white border-transparent shadow-blue-500/20'
                    : 'bg-slate-800/80 text-slate-300 border-slate-600 hover:border-slate-500 hover:bg-slate-700/80'
                  }
                `}
              >
                {filterBtn.label}
              </button>
            ))}
          </div>
        </div>

        {/* ALL CONTENT SECTION - NOW WITH DYNAMIC HEADING */}
        {filteredAnime.length === 0 ? (
          <div className="text-center py-8 lg:py-16">
            <div className="bg-slate-800/50 rounded-xl p-6 lg:p-8 max-w-md mx-auto border border-slate-700">
              <div className="text-4xl lg:text-6xl mb-3 lg:mb-4">🔍</div>
              <h2 className="text-xl lg:text-2xl font-semibold text-slate-300 mb-2">
                {searchQuery ? 'No Results Found' : 'No Anime Available'}
              </h2>
              <p className="text-slate-400 text-sm lg:text-base">
                {searchQuery
                  ? `No results for "${searchQuery}"`
                  : 'Check back later for new content'
                }
              </p>
              {filter !== 'All' && (
                <div className="mt-3 lg:mt-4">
                  <button
                    onClick={() => handleFilterChange('All')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg transition-all duration-300 font-medium text-sm lg:text-base shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                  >
                    Show All Content
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="mt-6 lg:mt-8">
              {/* DYNAMIC ALL CONTENT HEADING */}
              <h2 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-3 lg:mb-4">
                {getAllContentHeading()}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 lg:gap-3">
                {filteredAnime.map((anime, index) => (
                  <AnimeCard
                    key={anime.id}
                    anime={anime}
                    onClick={onAnimeSelect}
                    index={index}
                  />
                ))}
              </div>
              {/* LOAD MORE SECTION */}
              {hasMore && !searchQuery && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={loadMoreAnime}
                    disabled={isLoadingMore}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-8 py-3 rounded-lg transition-all duration-300 font-medium disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                  >
                    {isLoadingMore ? 'Loading...' : 'Load More Anime'}
                  </button>
                </div>
              )}
              {isLoadingMore && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 lg:gap-3 mt-4">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <SkeletonLoader key={`more-${index}`} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;
