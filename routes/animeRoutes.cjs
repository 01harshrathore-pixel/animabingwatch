 // routes/animeRoutes.cjs - FIXED VERSION
const express = require('express');
const router = express.Router();
const Anime = require('../models/Anime.cjs');
const adminAuth = require('../middleware/adminAuth.cjs');

/**
 * ✅ FIXED: FEATURED ANIME ROUTE
 */
router.get('/featured', async (req, res) => {
  try {
    console.log('📢 Fetching featured anime...');
    
    // Get featured anime or fallback to active anime
    let featuredAnime = await Anime.find({ 
      $or: [
        { featured: true },
        { isActive: { $ne: false } }
      ]
    })
    .select('_id title thumbnail bannerImage releaseYear subDubStatus contentType rating views featured featuredOrder')
    .sort({ featuredOrder: -1, updatedAt: -1 })
    .limit(10)
    .lean();

    console.log(`✅ Found ${featuredAnime.length} featured anime`);
    
    // If no featured anime, get some active anime as fallback
    if (featuredAnime.length === 0) {
      console.log('⚠️ No featured anime found, fetching active anime as fallback...');
      featuredAnime = await Anime.find({ isActive: { $ne: false } })
        .select('_id title thumbnail bannerImage releaseYear subDubStatus contentType rating views')
        .sort({ updatedAt: -1 })
        .limit(10)
        .lean();
    }

    res.json({ 
      success: true, 
      data: featuredAnime,
      message: `Successfully fetched ${featuredAnime.length} featured anime`
    });
    
  } catch (err) {
    console.error('❌ Error fetching featured anime:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Server error while fetching featured anime',
      details: err.message 
    });
  }
});

/**
 * ✅ FIXED: GET anime with PAGINATION
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 24;
    const skip = (page - 1) * limit;

    console.log(`📄 Fetching anime page ${page}, limit ${limit}`);

    // Query for active anime
    const query = { isActive: { $ne: false } };
    
    const [anime, total] = await Promise.all([
      Anime.find(query)
        .select('_id title thumbnail releaseYear subDubStatus contentType updatedAt createdAt views')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Anime.countDocuments(query)
    ]);

    console.log(`✅ Loaded ${anime.length} anime (page ${page} of ${Math.ceil(total / limit)})`);

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
    console.error('❌ Error fetching anime:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Server error while fetching anime',
      details: err.message 
    });
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

    console.log(`🔍 Searching anime for: "${q}" (page ${page})`);

    if (!q.trim()) {
      // If empty search, return first page of anime
      const query = { isActive: { $ne: false } };
      const found = await Anime.find(query)
        .select('_id title thumbnail releaseYear subDubStatus contentType updatedAt createdAt')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await Anime.countDocuments(query);

      return res.json({ 
        success: true, 
        data: found,
        pagination: {
          current: page,
          totalPages: Math.ceil(total / limit),
          hasMore: page < Math.ceil(total / limit),
          totalItems: total
        }
      });
    }

    const searchQuery = {
      $and: [
        { isActive: { $ne: false } },
        {
          $or: [
            { title: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } },
            { 'genreList.name': { $regex: q, $options: 'i' } }
          ]
        }
      ]
    };

    const [found, total] = await Promise.all([
      Anime.find(searchQuery)
        .select('_id title thumbnail releaseYear subDubStatus contentType updatedAt createdAt')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Anime.countDocuments(searchQuery)
    ]);

    console.log(`✅ Found ${found.length} results for "${q}"`);

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
    console.error('❌ Error searching anime:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Server error while searching anime',
      details: err.message 
    });
  }
});

/**
 * ✅ FIXED: GET single anime by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const animeId = req.params.id;
    console.log(`📺 Fetching anime details for ID: ${animeId}`);
    
    const item = await Anime.findOne({ 
      _id: animeId,
      isActive: { $ne: false }
    });
    
    if (!item) {
      console.log(`❌ Anime not found: ${animeId}`);
      return res.status(404).json({ 
        success: false, 
        message: 'Anime not found or inactive' 
      });
    }
    
    console.log(`✅ Found anime: ${item.title}`);
    
    // Increment views
    await Anime.findByIdAndUpdate(animeId, { $inc: { views: 1 } });
    
    res.json({ 
      success: true, 
      data: item,
      message: 'Anime details fetched successfully'
    });
    
  } catch (err) {
    console.error('❌ Error fetching anime by ID:', err);
    
    if (err.name === 'CastError') {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid anime ID format' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Server error while fetching anime details',
      details: err.message 
    });
  }
});

/**
 * ✅ ADMIN ROUTE - GET ALL ANIME FOR ADMIN DASHBOARD
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
    
    const [anime, total] = await Promise.all([
      Anime.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Anime.countDocuments(query)
    ]);
    
    console.log(`✅ Admin loaded ${anime.length} anime (total: ${total})`);
    
    res.json(anime);
    
  } catch (err) {
    console.error('❌ Admin anime list error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Failed to load anime list for admin',
      details: err.message 
    });
  }
});

/**
 * ✅ ADMIN ROUTE - UPDATE ANIME STATUS
 */
router.put('/admin/status/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    
    console.log(`🔄 Up anime status for ${id} to ${isActive}`);
    
    const updatedAnime = await Anime.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );
    
    if (!updatedAnime) {
      return res.status(404).json({ error: 'Anime not found' });
    }
    
    res.json({ success: true, message: 'Status updated', anime: updatedAnime });
  } catch (err) {
    console.error('❌ Status update error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * ✅ ADMIN ROUTE - DELETE ANIME
 */
router.delete('/admin/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🗑️ Deleting anime: ${id}`);
    
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

/**
 * ✅ ADD anime to featured
 */
router.post('/:id/featured', adminAuth, async (req, res) => {
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

/**
 * ✅ REMOVE anime from featured
 */
router.delete('/:id/featured', adminAuth, async (req, res) => {
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

/**
 * ✅ UPDATE featured order (bulk update)
 */
router.put('/featured/order', adminAuth, async (req, res) => {
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
