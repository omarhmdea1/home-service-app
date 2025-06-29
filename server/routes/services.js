const express = require('express');
const router = express.Router();

// Mock data for services
const services = [
  {
    id: '1',
    title: 'House Cleaning',
    description: 'Professional house cleaning services',
    price: 100,
    image: '/images/cleaning.jpg',
    category: 'Cleaning'
  },
  {
    id: '2',
    title: 'Plumbing Services',
    description: 'Expert plumbing services for all your needs',
    price: 150,
    image: '/images/plumbing.jpg',
    category: 'Plumbing'
  },
  {
    id: '3',
    title: 'Electrical Repair',
    description: 'Reliable electrical repair services',
    price: 200,
    image: '/images/electrical.jpg',
    category: 'Electrical'
  }
];

// GET /api/services
router.get('/', (req, res) => {
  res.json(services);
});

module.exports = router;
