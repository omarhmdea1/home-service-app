const express = require('express');
const router = express.Router();
const Service = require('../models/Service');

// ✅ DEBUG: Log all requests to services API (development only)
if (process.env.NODE_ENV === 'development') {
  router.use((req, res, next) => {
    console.log(`🚀 Services API: ${req.method} ${req.path}`, req.query);
    next();
  });
}

// GET /api/services
// Get all services with optional filtering, search, and pagination
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      providerId, 
      search, 
      page = 1, 
      limit = 50,
      sortBy = 'createdAt'
    } = req.query;
    
    console.log('🔍 Services API called with:', { category, search, page, limit });
    const startTime = Date.now();
    
    const query = {};
    
    // Apply filters
    if (category) query.category = category; // ✅ FIXED: Use exact match for category
    if (providerId) query.providerId = providerId;
    
    // ✅ OPTIMIZED: Text search across multiple fields
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        { providerName: searchRegex }
      ];
    }
    
    // ✅ PAGINATION: Convert to numbers and set reasonable limits
    const pageNum = parseInt(page) || 1;
    const limitNum = Math.min(parseInt(limit) || 50, 100); // Max 100 items per page
    const skip = (pageNum - 1) * limitNum;
    
    // ✅ OPTIMIZED: Parallel execution for better performance
    const [services, totalCount] = await Promise.all([
      Service.find(query)
        .sort({ [sortBy]: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(), // ✅ Use lean() for better performance
      Service.countDocuments(query)
    ]);
    
    const queryTime = Date.now() - startTime;
    console.log(`✅ Query completed in ${queryTime}ms, found ${services.length}/${totalCount} services`);
    
    // ✅ Include pagination metadata
    res.json({
      services,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        pages: Math.ceil(totalCount / limitNum),
        hasMore: skip + services.length < totalCount
      },
      meta: {
        queryTime: `${queryTime}ms`,
        count: services.length
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching services:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      services: [], // Fallback empty array
      pagination: { page: 1, limit: 50, total: 0, pages: 0, hasMore: false }
    });
  }
});

// GET /api/services/categories
// Get all unique categories
// ⚠️  IMPORTANT: This route MUST be defined BEFORE /:id route
router.get('/categories', async (req, res) => {
  try {
    console.log('🏷️ Fetching all categories...');
    const startTime = Date.now();
    
    const categories = await Service.distinct('category');
    const queryTime = Date.now() - startTime;
    
    console.log(`✅ Categories fetched in ${queryTime}ms:`, categories);
    
    res.json(categories.filter(cat => cat).sort()); // Filter out null/empty and sort
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      categories: []
    });
  }
});

// GET /api/services/:id
// Get single service
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // ✅ VALIDATION: Check if ID is valid MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        message: 'Invalid service ID format',
        error: `"${id}" is not a valid ObjectId`
      });
    }
    
    console.log('🔍 Fetching service with ID:', id);
    const service = await Service.findById(id);
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    res.json(service);
  } catch (error) {
    console.error('❌ Error fetching service:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/services
// Create a new service
router.post('/', async (req, res) => {
  try {
    const service = await Service.create(req.body);
    res.status(201).json(service);
  } catch (error) {
    console.error('Error creating service:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/services/:id
// Update a service
router.put('/:id', async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    res.json(service);
  } catch (error) {
    console.error('Error updating service:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/services/:id
// Delete a service
router.delete('/:id', async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ✅ DEBUG: Route to list all registered routes (helpful for troubleshooting)
if (process.env.NODE_ENV === 'development') {
  router.get('/debug/routes', (req, res) => {
    const routes = [];
    router.stack.forEach(layer => {
      if (layer.route) {
        const methods = Object.keys(layer.route.methods);
        routes.push({
          path: layer.route.path,
          methods: methods,
          stack: layer.route.stack.length
        });
      }
    });
    
    res.json({
      message: 'Services API Routes',
      routes: routes,
      timestamp: new Date().toISOString()
    });
  });
}

module.exports = router;
