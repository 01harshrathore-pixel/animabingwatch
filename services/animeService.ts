 // services/animeServices.ts - FIXED VERSION
import type { Anime, Episode, Chapter } from '../src/types';

// ✅ FIXED: CORRECT API BASE URL
// Render backend URL with proper API path
const API_BASE = import.meta.env.VITE_API_BASE || 'https://animabingwatch-y20k.onrender.com/api';

// ✅ LOG API BASE FOR DEBUGGING
console.log('🌐 API Base URL Configured:', API_BASE);
console.log('📡 Environment:', import.meta.env.MODE);
console.log('🔗 Full Featured URL:', `${API_BASE}/anime/featured`);

// ✅ CACHE IMPLEMENTATION
const cache = new Map();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

/**
 * ✅ FIXED: FEATURED ANIME FUNCTION
 */
export const getFeaturedAnime = async (): Promise<Anime[]> => {
  const cacheKey = 'featured-anime';
  
  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('🎯 Cache hit for featured anime');
    return cached.data;
  }

  try {
    console.log('📡 Fetching featured anime from API...');
    const url = `${API_BASE}/anime/featured`;
    console.log('🔗 API URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Origin': window.location.origin
      },
      mode: 'cors',
      credentials: 'same-origin'
    });
    
    console.log('📊 Response Status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Response Error:', errorText);
      
      // Try to parse error as JSON if possible
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(`API Error: ${errorJson.error || errorJson.message || response.statusText}`);
      } catch {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }
    }
    
    const result = await response.json();
    console.log('✅ API Response received:', result);
    
    let featuredData: Anime[] = [];
    
    if (result.success && Array.isArray(result.data)) {
      featuredData = result.data.map((anime: any) => ({
        ...anime,
        id: anime._id || anime.id,
        lastUpdated: anime.updatedAt ? new Date(anime.updatedAt).getTime() : Date.now()
      }));
    } else if (Array.isArray(result)) {
      // Handle case where API returns array directly
      featuredData = result.map((anime: any) => ({
        ...anime,
        id: anime._id || anime.id,
        lastUpdated: anime.updatedAt ? new Date(anime.updatedAt).getTime() : Date.now()
      }));
    } else {
      console.warn('⚠️ API response format unexpected:', result);
    }

    // Store in cache
    cache.set(cacheKey, {
      data: featuredData,
      timestamp: Date.now()
    });

    console.log(`✅ Loaded ${featuredData.length} featured anime`);
    return featuredData;
    
  } catch (error) {
    console.error('❌ Error in getFeaturedAnime:', error);
    
    // Fallback: Try direct render URL as backup
    try {
      console.log('🔄 Trying fallback API call...');
      const fallbackResponse = await fetch('https://animabingwatch-y20k.onrender.com/api/anime/featured');
      if (fallbackResponse.ok) {
        const fallbackResult = await fallbackResponse.json();
        if (fallbackResult.success && Array.isArray(fallbackResult.data)) {
          return fallbackResult.data.map((anime: any) => ({
            ...anime,
            id: anime._id || anime.id
          }));
        }
      }
    } catch (fallbackError) {
      console.error('❌ Fallback also failed:', fallbackError);
    }
    
    return [];
  }
};

/**
 * ✅ FIXED: Paginated API calls
 */
export const getAnimePaginated = async (page: number = 1, limit: number = 24): Promise<Anime[]> => {
  const cacheKey = `anime-page-${page}-${limit}`;
  
  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`🎯 Cache hit for page ${page}`);
    return cached.data;
  }

  try {
    console.log(`📡 Fetching page ${page} from API...`);
    const url = `${API_BASE}/anime?page=${page}&limit=${limit}`;
    console.log('🔗 API URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Origin': window.location.origin
      },
      mode: 'cors'
    });
    
    console.log('📊 Response Status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Response Error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('✅ API Response received, data length:', result.data?.length || 0);
    
    let animeData: Anime[] = [];
    
    if (result.success && Array.isArray(result.data)) {
      animeData = result.data.map((anime: any) => ({
        ...anime,
        id: anime._id || anime.id,
        lastUpdated: anime.updatedAt ? new Date(anime.updatedAt).getTime() : Date.now()
      }));
    }

    // Store in cache
    cache.set(cacheKey, {
      data: animeData,
      timestamp: Date.now()
    });

    console.log(`✅ Loaded ${animeData.length} anime for page ${page}`);
    return animeData;
    
  } catch (error) {
    console.error('❌ Error in getAnimePaginated:', error);
    
    // Fallback
    try {
      const fallbackResponse = await fetch(`https://animabingwatch-y20k.onrender.com/api/anime?page=${page}&limit=${limit}`);
      if (fallbackResponse.ok) {
        const fallbackResult = await fallbackResponse.json();
        if (fallbackResult.success && Array.isArray(fallbackResult.data)) {
          return fallbackResult.data.map((anime: any) => ({
            ...anime,
            id: anime._id || anime.id
          }));
        }
      }
    } catch (fallbackError) {
      console.error('❌ Fallback also failed:', fallbackError);
    }
    
    return [];
  }
};

/**
 * ✅ FIXED: Search function
 */
export const searchAnime = async (query: string): Promise<Anime[]> => {
  const cacheKey = `search-${query}`;
  
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    if (!query.trim()) return await getAnimePaginated(1, 50);
    
    const url = `${API_BASE}/anime/search?query=${encodeURIComponent(query)}`;
    console.log('🔍 Searching anime:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      mode: 'cors'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    let searchData: Anime[] = [];
    
    if (result.success && Array.isArray(result.data)) {
      searchData = result.data.map((anime: any) => ({
        ...anime,
        id: anime._id || anime.id,
        lastUpdated: anime.updatedAt ? new Date(anime.updatedAt).getTime() : Date.now()
      }));
    }

    cache.set(cacheKey, {
      data: searchData,
      timestamp: Date.now()
    });

    console.log(`✅ Found ${searchData.length} results for "${query}"`);
    return searchData;
    
  } catch (error) {
    console.error('❌ Error in searchAnime:', error);
    return [];
  }
};

/**
 * ✅ FIXED: Get anime by ID
 */
export const getAnimeById = async (id: string): Promise<Anime | null> => {
  const cacheKey = `anime-${id}`;
  
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    console.log(`📡 Fetching anime by ID: ${id}`);
    
    const response = await fetch(`${API_BASE}/anime/${id}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      mode: 'cors'
    });
    
    if (!response.ok) {
      console.error(`❌ Failed to fetch anime ${id}:`, response.status);
      return null;
    }
    
    const result = await response.json();
    
    if (result.success && result.data) {
      const animeData = {
        ...result.data,
        id: result.data._id || result.data.id
      };
      
      // Store in cache
      cache.set(cacheKey, {
        data: animeData,
        timestamp: Date.now()
      });
      
      return animeData;
    }
    return null;
    
  } catch (error) {
    console.error(`❌ Error fetching anime ${id}:`, error);
    return null;
  }
};

/**
 * ✅ FIXED: Get episodes by anime ID
 */
export const getEpisodesByAnimeId = async (animeId: string): Promise<Episode[]> => {
  const cacheKey = `episodes-${animeId}`;
  
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    console.log(`📡 Fetching episodes for anime: ${animeId}`);
    
    const response = await fetch(`${API_BASE}/episodes/${animeId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      mode: 'cors'
    });
    
    if (!response.ok) {
      console.error(`❌ Failed to fetch episodes for ${animeId}:`, response.status);
      return [];
    }
    
    const episodes = await response.json();
    
    const transformedEpisodes: Episode[] = episodes.map((episode: any) => ({
      episodeId: episode._id,
      _id: episode._id,
      episodeNumber: episode.episodeNumber,
      title: episode.title || `Episode ${episode.episodeNumber}`,
      downloadLinks: episode.downloadLinks || [],
      secureFileReference: episode.secureFileReference || '',
      session: episode.session || 1
    }));
    
    // Store in cache
    cache.set(cacheKey, {
      data: transformedEpisodes,
      timestamp: Date.now()
    });
    
    console.log(`✅ Loaded ${transformedEpisodes.length} episodes for anime ${animeId}`);
    return transformedEpisodes;
    
  } catch (error) {
    console.error(`❌ Error fetching episodes for ${animeId}:`, error);
    return [];
  }
};

/**
 * ✅ FIXED: Get chapters by manga ID
 */
export const getChaptersByMangaId = async (mangaId: string): Promise<Chapter[]> => {
  const cacheKey = `chapters-${mangaId}`;
  
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    console.log(`📡 Fetching chapters for manga: ${mangaId}`);
    
    const response = await fetch(`${API_BASE}/chapters/${mangaId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      mode: 'cors'
    });
    
    if (!response.ok) {
      console.error(`❌ Failed to fetch chapters for ${mangaId}:`, response.status);
      return [];
    }
    
    const chapters = await response.json();
    
    const transformedChapters: Chapter[] = chapters.map((chapter: any) => ({
      chapterId: chapter._id,
      _id: chapter._id,
      chapterNumber: chapter.chapterNumber,
      title: chapter.title || `Chapter ${chapter.chapterNumber}`,
      downloadLinks: chapter.downloadLinks || [],
      secureFileReference: chapter.secureFileReference || '',
      session: chapter.session || 1
    }));
    
    // Store in cache
    cache.set(cacheKey, {
      data: transformedChapters,
      timestamp: Date.now()
    });
    
    return transformedChapters;
    
  } catch (error) {
    console.error(`❌ Error fetching chapters for ${mangaId}:`, error);
    return [];
  }
};

/**
 * ✅ FIXED: Get download links for a specific episode
 */
export const getEpisodeDownloadLinks = async (animeId: string, episodeNumber: number, session?: number): Promise<Episode | null> => {
  const cacheKey = `episode-links-${animeId}-${episodeNumber}-${session || 1}`;
  
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    let url = `${API_BASE}/episodes/download/${animeId}/${episodeNumber}`;
    if (session && session !== 1) {
      url += `?session=${session}`;
    }
    
    console.log('📥 Fetching episode download links from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      mode: 'cors'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result) {
      const episodeData: Episode = {
        episodeId: result._id,
        _id: result._id,
        episodeNumber: result.episodeNumber,
        title: result.title || `Episode ${result.episodeNumber}`,
        downloadLinks: result.downloadLinks || [],
        secureFileReference: result.secureFileReference || '',
        session: result.session || 1
      };
      
      // Store in cache
      cache.set(cacheKey, {
        data: episodeData,
        timestamp: Date.now()
      });
      
      return episodeData;
    }
    return null;
  } catch (error) {
    console.error('❌ Error fetching episode download links:', error);
    return null;
  }
};

/**
 * ✅ FIXED: Get download links for a specific chapter
 */
export const getChapterDownloadLinks = async (mangaId: string, chapterNumber: number, session?: number): Promise<Chapter | null> => {
  const cacheKey = `chapter-links-${mangaId}-${chapterNumber}-${session || 1}`;
  
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    let url = `${API_BASE}/chapters/download/${mangaId}/${chapterNumber}`;
    if (session && session !== 1) {
      url += `?session=${session}`;
    }
    
    console.log('📥 Fetching chapter download links from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      mode: 'cors'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result) {
      const chapterData: Chapter = {
        chapterId: result._id,
        _id: result._id,
        chapterNumber: result.chapterNumber,
        title: result.title || `Chapter ${result.chapterNumber}`,
        downloadLinks: result.downloadLinks || [],
        secureFileReference: result.secureFileReference || '',
        session: result.session || 1
      };
      
      // Store in cache
      cache.set(cacheKey, {
        data: chapterData,
        timestamp: Date.now()
      });
      
      return chapterData;
    }
    return null;
  } catch (error) {
    console.error('❌ Error fetching chapter download links:', error);
    return null;
  }
};

// ✅ ADMIN FUNCTIONS
export const getAdminAnimeList = async (
  page: number = 1, 
  limit: number = 50, 
  search: string = '',
  contentType: string = '',
  status: string = ''
): Promise<any[]> => {
  try {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Admin token not found');
    }
    
    let url = `${API_BASE}/anime/admin/list?page=${page}&limit=${limit}`;
    
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    if (contentType && contentType !== 'All') {
      url += `&contentType=${encodeURIComponent(contentType)}`;
    }
    if (status && status !== 'All') {
      url += `&status=${encodeURIComponent(status)}`;
    }
    
    console.log('📡 Fetching admin anime from:', url);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('token');
      window.location.href = '/admin/login';
      throw new Error('Session expired');
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const animeData = await response.json();
    
    console.log(`✅ Admin loaded ${animeData?.length || 0} anime`);
    return animeData || [];
    
  } catch (error) {
    console.error('❌ Error in getAdminAnimeList:', error);
    throw error;
  }
};

export const updateAnimeStatus = async (animeId: string, isActive: boolean): Promise<boolean> => {
  try {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE}/anime/admin/status/${animeId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ isActive })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result.success === true;
    
  } catch (error) {
    console.error('❌ Error updating anime status:', error);
    return false;
  }
};

export const deleteAnime = async (animeId: string): Promise<boolean> => {
  try {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE}/anime/admin/${animeId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result.success === true;
    
  } catch (error) {
    console.error('❌ Error deleting anime:', error);
    return false;
  }
};

// ✅ UTILITY FUNCTIONS
export const getAllAnime = async (): Promise<Anime[]> => {
  return getAnimePaginated(1, 50);
};

export const clearAnimeCache = () => {
  cache.clear();
  console.log('🗑️ Anime cache cleared');
};

export const clearEpisodeCache = (animeId: string) => {
  const keysToDelete: string[] = [];
  
  cache.forEach((value, key) => {
    if (key.includes(`episodes-${animeId}`) || key.includes(`episode-links-${animeId}`)) {
      keysToDelete.push(key);
    }
  });
  
  keysToDelete.forEach(key => cache.delete(key));
  console.log(`🗑️ Cleared ${keysToDelete.length} episode cache entries for anime ${animeId}`);
};

export const clearChapterCache = (mangaId: string) => {
  const keysToDelete: string[] = [];
  
  cache.forEach((value, key) => {
    if (key.includes(`chapters-${mangaId}`) || key.includes(`chapter-links-${mangaId}`)) {
      keysToDelete.push(key);
    }
  });
  
  keysToDelete.forEach(key => cache.delete(key));
  console.log(`🗑️ Cleared ${keysToDelete.length} chapter cache entries for manga ${mangaId}`);
};

// ✅ Test API connection
export const testApiConnection = async (): Promise<boolean> => {
  try {
    console.log('🔧 Testing API connection...');
    const response = await fetch(`${API_BASE}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Connection Test:', data);
      return true;
    }
    
    console.error('❌ API Connection Test Failed:', response.status);
    return false;
  } catch (error) {
    console.error('❌ API Connection Test Error:', error);
    return false;
  }
};

// Auto test connection on module load
if (typeof window !== 'undefined') {
  setTimeout(() => {
    testApiConnection();
  }, 1000);
}
