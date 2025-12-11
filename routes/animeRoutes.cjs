  const express = require('express');
const router = express.Router();
const Anime = require('../models/Anime.cjs');
const adminAuth = require('../middleware/adminAuth.cjs'); // ✅ Add this

/**
 * ✅ NEW: ADMIN ROUTE - GET ALL ANIME FOR ADMIN DASHBOARD
 * This route requires admin authentication
 */
router.get('/admin/list', adminAuth, async (req, res) => {
  try {
    console.log('📊 Admin fetching anime list...');
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    
    const search = req.query.search || '';
    const contentType = req.query.contentType || '';
    const status = req.query.status || '';
    
    // Build search query
    const query = {};
    
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    
    if (contentType && contentType !== 'All') {
      query.contentType = contentType;
    }
    
    if (status && status !== 'All') {
      query.status = status;
    }
    
    // Get anime with all fields (admin needs all data)
    const anime = await Anime.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    const total = await Anime.countDocuments(query);
    
    // Format response for admin
    const formattedAnime = anime.map(item => ({
      _id: item._id,
      id: item._id,
      title: item.title,
      thumbnail: item.thumbnail,
      bannerImage: item.bannerImage || '',
      contentType: item.contentType || 'Anime',
      status: item.status || 'Ongoing',
      subDubStatus: item.subDubStatus || 'Hindi Sub',
      releaseYear: item.releaseYear || new Date().getFullYear(),
      rating: item.rating || 0,
      description: item.description || '',
      genreList: item.genreList || [],
      episodes: item.episodes || [],
      reportCount: item.reportCount || 0,
      featured: item.featured || false,
      views: item.views || 0,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      isActive: item.isActive !== false // Default to true if not set
    }));
    
    res.json(formattedAnime); // ✅ Return array directly (as expected in AnimeListTable)
    
  } catch (err) {
    console.error('❌ Admin anime list error:', err);
    res.status(500).json({ error: 'Failed to load anime list for admin' });
  }
});

/**
 * ✅ NEW: ADMIN ROUTE - UPDATE ANIME STATUS
 */
router.put('/admin/status/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    
    const updatedAnime = await Anime.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );
    
    if (!updatedAnime) {
      return res.status(404).json({ error: 'Anime not found' });
    }
    
    res.json({ success: true, message: 'Status updated' });
  } catch (err) {
    console.error('❌ Status update error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * ✅ NEW: ADMIN ROUTE - DELETE ANIME
 */
router.delete('/admin/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedAnime = await Anime.findByIdAndDelete(id);
    
    if (!deletedAnime) {
      return res.status(404).json({ error: 'Anime not found' });
    }
    
    res.json({ success: true, message: 'Anime deleted successfully' });
  } catch (err) {
    console.error('❌ Delete error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ EXISTING CODE CONTINUES BELOW...
// =========================================
// DON'T MODIFY BELOW THIS LINE
// =========================================

/**
 * ✅ FIXED: FEATURED ANIME ROUTE (FIXES THE ERROR)
 * This must be added BEFORE the /:id route
 */
router.get('/featured', async (req, res) => {
  try {
    // ✅ Get featured anime - using featured field from schema
    const featuredAnime = await Anime.find({ 
      featured: true 
    })
    .select('title thumbnail releaseYear subDubStatus contentType updatedAt createdAt bannerImage rating')
    .sort({ featuredOrder: -1, createdAt: -1 })
    .limit(10)
    .lean();

    res.json({ 
      success: true, 
      data: featuredAnime
    });
  } catch (err) {
    console.error('Error fetching featured anime:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * ✅ FIXED: GET anime with PAGINATION
 * Returns paginated anime from DB sorted by LATEST UPDATE
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 24;
    const skip = (page - 1) * limit;

    // ✅ FIXED: Only get necessary fields for listing
    const anime = await Anime.find()
      .select('title thumbnail releaseYear subDubStatus contentType updatedAt createdAt')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Anime.countDocuments();

    res.json({ 
      success: true, 
      data: anime,
      pagination: {
        current: page,
        totalPages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (err) {
    console.error('Error fetching anime:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * ✅ FIXED: SEARCH anime with PAGINATION
 */
router.get('/search', async (req, res) => {
  try {
    const q = req.query.query || '';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 24;
    const skip = (page - 1) * limit;

    const found = await Anime.find({
      title: { $regex: q, $options: 'i' }
    })
    .select('title thumbnail releaseYear subDubStatus contentType updatedAt createdAt')
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

    const total = await Anime.countDocuments({
      title: { $regex: q, $options: 'i' }
    });

    res.json({ 
      success: true, 
      data: found,
      pagination: {
        current: page,
        totalPages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (err) {
    console.error('Error searching anime:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * ✅ FIXED: GET single anime by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const item = await Anime.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Anime not found' });
    res.json({ success: true, data: item });
  } catch (err) {
    // ✅ Better error handling for invalid ObjectId
    if (err.name === 'CastError') {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid anime ID format' 
      });
    }
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ ADDED: FEATURED MANAGEMENT ROUTES

// Add anime to featured
router.post('/:id/featured', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Count current featured animes for ordering
    const featuredCount = await Anime.countDocuments({ featured: true });
    
    const updatedAnime = await Anime.findByIdAndUpdate(
      id,
      { 
        featured: true,
        featuredOrder: featuredCount + 1
      },
      { new: true }
    );
    
    if (!updatedAnime) {
      return res.status(404).json({ success: false, error: 'Anime not found' });
    }
    
    res.json({ 
      success: true, 
      message: 'Anime added to featured',
      data: updatedAnime 
    });
  } catch (err) {
    console.error('Error adding to featured:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Remove anime from featured
router.delete('/:id/featured', async (req, res) => {
  try {
    const { id } = req.params;
    
    const updatedAnime = await Anime.findByIdAndUpdate(
      id,
      { 
        featured: false,
        featuredOrder: 0
      },
      { new: true }
    );
    
    if (!updatedAnime) {
      return res.status(404).json({ success: false, error: 'Anime not found' });
    }
    
    res.json({ 
      success: true, 
      message: 'Anime removed from featured',
      data: updatedAnime 
    });
  } catch (err) {
    console.error('Error removing from featured:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update featured order (bulk update)
router.put('/featured/order', async (req, res) => {
  try {
    const { order } = req.body; // array of anime IDs in desired order
    
    if (!Array.isArray(order)) {
      return res.status(400).json({ success: false, error: 'Order must be an array of anime IDs' });
    }
    
    const bulkOps = order.map((animeId, index) => ({
      updateOne: {
        filter: { _id: animeId },
        update: { 
          featuredOrder: index + 1,
          featured: true // Ensure they remain featured
        }
      }
    }));
    
    await Anime.bulkWrite(bulkOps);
    
    res.json({ 
      success: true, 
      message: `Featured order updated for ${order.length} animes` 
    });
  } catch (err) {
    console.error('Error updating featured order:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
