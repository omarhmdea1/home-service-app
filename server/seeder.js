const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');

// Load models
const Service = require('./models/Service');
const Booking = require('./models/Booking');
const User = require('./models/User');
const Category = require('./models/Category');
const Favorite = require('./models/Favorite');
const ProviderProfile = require('./models/ProviderProfile');
const Review = require('./models/Review');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Sample data for seeding with realistic information

// Categories data
const categories = [
  {
    name: 'Plumbing',
    description: 'Professional plumbing services for your home and business',
    icon: 'fa-faucet',
    image: '/images/categories/plumbing.jpg',
    isActive: true,
    order: 1
  },
  {
    name: 'Cleaning',
    description: 'Keep your space spotless with our professional cleaning services',
    icon: 'fa-broom',
    image: '/images/categories/cleaning.jpg',
    isActive: true,
    order: 2
  },
  {
    name: 'Electrical',
    description: 'Professional electrical services for all your needs',
    icon: 'fa-bolt',
    image: '/images/categories/electrical.jpg',
    isActive: true,
    order: 3
  },
  {
    name: 'Gardening',
    description: 'Transform your outdoor space with our gardening services',
    icon: 'fa-leaf',
    image: '/images/categories/gardening.jpg',
    isActive: true,
    order: 4
  },
  {
    name: 'Painting',
    description: 'Professional painting services for interior and exterior',
    icon: 'fa-paint-roller',
    image: '/images/categories/painting.jpg',
    isActive: true,
    order: 5
  },
  {
    name: 'Moving',
    description: 'Reliable moving services to help you relocate',
    icon: 'fa-truck',
    image: '/images/categories/moving.jpg',
    isActive: true,
    order: 6
  },
  {
    name: 'Other',
    description: 'Additional home services not covered in other categories',
    icon: 'fa-tools',
    image: '/images/categories/other.jpg',
    isActive: true,
    order: 7
  }
];
const users = [
  // Providers
  {
    firebaseUid: 'provider1',
    name: 'Cohen Plumbing Solutions',
    email: 'cohen@example.com',
    role: 'provider',
    phone: '+972-50-1234567',
    address: 'Herzl 100, Tel Aviv',
    photoURL: 'https://randomuser.me/api/portraits/men/32.jpg',
    isVerified: true,
    bio: 'Professional plumbing services with over 15 years of experience. We specialize in emergency repairs, installations, and maintenance.',
    specialties: ['Plumbing', 'Repairs', 'Installation', 'Emergency Services'],
    averageRating: 4.8,
    reviewCount: 120,
    createdAt: new Date('2024-01-15'),
    lastLogin: new Date()
  },
  {
    firebaseUid: 'provider2',
    name: 'Naki Babait Cleaning',
    email: 'naki@example.com',
    role: 'provider',
    phone: '+972-50-7654321',
    address: 'Dizengoff 50, Tel Aviv',
    photoURL: 'https://randomuser.me/api/portraits/women/44.jpg',
    isVerified: true,
    bio: 'Professional cleaning services for homes and offices. We use eco-friendly products and provide thorough cleaning services.',
    specialties: ['Cleaning', 'Deep Cleaning', 'Move-in/Move-out Cleaning', 'Office Cleaning'],
    averageRating: 4.9,
    reviewCount: 95,
    createdAt: new Date('2024-02-10'),
    lastLogin: new Date()
  },
  {
    firebaseUid: 'provider3',
    name: 'ElectraTech Solutions',
    email: 'electra@example.com',
    role: 'provider',
    phone: '+972-50-8765432',
    address: 'Allenby 75, Tel Aviv',
    photoURL: 'https://randomuser.me/api/portraits/men/45.jpg',
    isVerified: true,
    bio: 'Licensed electricians providing top-quality electrical services for residential and commercial properties.',
    specialties: ['Electrical', 'Wiring', 'Lighting', 'Installations'],
    averageRating: 4.7,
    reviewCount: 87,
    createdAt: new Date('2024-03-05'),
    lastLogin: new Date()
  },
  {
    firebaseUid: 'provider4',
    name: 'GreenThumb Landscaping',
    email: 'greenthumb@example.com',
    role: 'provider',
    phone: '+972-52-9876543',
    address: 'Rothschild 100, Tel Aviv',
    photoURL: 'https://randomuser.me/api/portraits/women/28.jpg',
    isVerified: true,
    bio: 'Professional gardening and landscaping services. We create and maintain beautiful outdoor spaces.',
    specialties: ['Gardening', 'Landscaping', 'Lawn Care', 'Plant Maintenance'],
    averageRating: 4.6,
    reviewCount: 65,
    createdAt: new Date('2024-04-12'),
    lastLogin: new Date()
  },
  
  // Customers
  {
    firebaseUid: 'customer1',
    name: 'David Levy',
    email: 'david@example.com',
    role: 'customer',
    phone: '+972-52-1112233',
    address: 'Ben Gurion 75, Tel Aviv',
    photoURL: 'https://randomuser.me/api/portraits/men/22.jpg',
    isVerified: true,
    createdAt: new Date('2024-01-20'),
    lastLogin: new Date()
  },
  {
    firebaseUid: 'customer2',
    name: 'Sarah Cohen',
    email: 'sarah@example.com',
    role: 'customer',
    phone: '+972-54-3334455',
    address: 'Ibn Gabirol 120, Tel Aviv',
    photoURL: 'https://randomuser.me/api/portraits/women/22.jpg',
    isVerified: true,
    createdAt: new Date('2024-02-15'),
    lastLogin: new Date()
  },
  {
    firebaseUid: 'customer3',
    name: 'Michael Rosen',
    email: 'michael@example.com',
    role: 'customer',
    phone: '+972-53-5556677',
    address: 'Weizmann 45, Tel Aviv',
    photoURL: 'https://randomuser.me/api/portraits/men/35.jpg',
    isVerified: true,
    createdAt: new Date('2024-03-10'),
    lastLogin: new Date()
  }
];

const services = [
  // Plumbing Services
  {
    title: 'Emergency Plumbing Service',
    description: 'Available 24/7 for urgent plumbing issues. We fix leaks, burst pipes, and solve all emergency plumbing problems quickly and efficiently.',
    price: 450,
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e',
    category: 'Plumbing',
    providerId: 'provider1',
    providerName: 'Cohen Plumbing Solutions',
    providerPhoto: 'https://randomuser.me/api/portraits/men/32.jpg',
    isActive: true,
    rating: 4.9,
    reviewCount: 78,
    createdAt: new Date('2024-01-20')
  },
  {
    title: 'Standard Plumbing Service',
    description: 'Expert plumbing services for all your non-emergency needs. We fix leaks, install fixtures, and solve all plumbing issues with quality workmanship.',
    price: 350,
    image: 'https://images.unsplash.com/photo-1542013936693-884638332954',
    category: 'Plumbing',
    providerId: 'provider1',
    providerName: 'Cohen Plumbing Solutions',
    providerPhoto: 'https://randomuser.me/api/portraits/men/32.jpg',
    isActive: true,
    rating: 4.8,
    reviewCount: 120,
    createdAt: new Date('2024-01-25')
  },
  {
    title: 'Bathroom Installation & Renovation',
    description: 'Complete bathroom plumbing services including installation of new fixtures, renovations, and upgrades to existing bathrooms.',
    price: 2500,
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a',
    category: 'Plumbing',
    providerId: 'provider1',
    providerName: 'Cohen Plumbing Solutions',
    providerPhoto: 'https://randomuser.me/api/portraits/men/32.jpg',
    isActive: true,
    rating: 4.7,
    reviewCount: 45,
    createdAt: new Date('2024-02-10')
  },
  
  // Cleaning Services
  {
    title: 'Standard House Cleaning',
    description: 'Professional house cleaning services. We clean every corner of your home with attention to detail and use eco-friendly cleaning products.',
    price: 300,
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952',
    category: 'Cleaning',
    providerId: 'provider2',
    providerName: 'Naki Babait Cleaning',
    providerPhoto: 'https://randomuser.me/api/portraits/women/44.jpg',
    isActive: true,
    rating: 4.9,
    reviewCount: 95,
    createdAt: new Date('2024-02-15')
  },
  {
    title: 'Deep Cleaning Service',
    description: 'Thorough deep cleaning for homes that need extra attention. Perfect for spring cleaning or before/after moving.',
    price: 500,
    image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf',
    category: 'Cleaning',
    providerId: 'provider2',
    providerName: 'Naki Babait Cleaning',
    providerPhoto: 'https://randomuser.me/api/portraits/women/44.jpg',
    isActive: true,
    rating: 4.7,
    reviewCount: 45,
    createdAt: new Date('2024-02-20')
  },
  {
    title: 'Office Cleaning Service',
    description: 'Professional cleaning for offices and commercial spaces. Regular or one-time services available to keep your workplace clean and presentable.',
    price: 450,
    image: 'https://images.unsplash.com/photo-1604335399105-a0c585fd81a1',
    category: 'Cleaning',
    providerId: 'provider2',
    providerName: 'Naki Babait Cleaning',
    providerPhoto: 'https://randomuser.me/api/portraits/women/44.jpg',
    isActive: true,
    rating: 4.8,
    reviewCount: 32,
    createdAt: new Date('2024-03-05')
  },
  
  // Electrical Services
  {
    title: 'Electrical Repairs',
    description: 'Professional electrical repair services for homes and businesses. We fix electrical issues safely and efficiently.',
    price: 400,
    image: 'https://images.unsplash.com/photo-1621905252507-c93694339d80',
    category: 'Electrical',
    providerId: 'provider3',
    providerName: 'ElectraTech Solutions',
    providerPhoto: 'https://randomuser.me/api/portraits/men/45.jpg',
    isActive: true,
    rating: 4.7,
    reviewCount: 56,
    createdAt: new Date('2024-03-10')
  },
  {
    title: 'Lighting Installation',
    description: 'Expert installation of all types of lighting fixtures. Enhance your home with proper lighting solutions.',
    price: 350,
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f',
    category: 'Electrical',
    providerId: 'provider3',
    providerName: 'ElectraTech Solutions',
    providerPhoto: 'https://randomuser.me/api/portraits/men/45.jpg',
    isActive: true,
    rating: 4.8,
    reviewCount: 42,
    createdAt: new Date('2024-03-15')
  },
  
  // Gardening Services
  {
    title: 'Garden Maintenance',
    description: 'Regular garden maintenance to keep your outdoor space looking beautiful. Includes lawn mowing, pruning, and general upkeep.',
    price: 250,
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b',
    category: 'Gardening',
    providerId: 'provider4',
    providerName: 'GreenThumb Landscaping',
    providerPhoto: 'https://randomuser.me/api/portraits/women/28.jpg',
    isActive: true,
    rating: 4.6,
    reviewCount: 38,
    createdAt: new Date('2024-04-15')
  },
  {
    title: 'Landscape Design',
    description: 'Professional landscape design services to transform your outdoor space. We create beautiful, functional gardens tailored to your preferences.',
    price: 1500,
    image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae',
    category: 'Gardening',
    providerId: 'provider4',
    providerName: 'GreenThumb Landscaping',
    providerPhoto: 'https://randomuser.me/api/portraits/women/28.jpg',
    isActive: true,
    rating: 4.9,
    reviewCount: 27,
    createdAt: new Date('2024-04-20')
  }
];

// Function to import data
const importData = async () => {
  try {
    console.log('Clearing existing data...'.yellow);
    // Clear existing data
    await User.deleteMany();
    await Service.deleteMany();
    await Booking.deleteMany();
    await Category.deleteMany();
    await Favorite.deleteMany();
    await ProviderProfile.deleteMany();
    await Review.deleteMany();

    console.log('Inserting users...'.yellow);
    // Insert data
    const createdUsers = await User.insertMany(users);
    const createdCategories = await Category.insertMany(categories);
    const createdServices = await Service.insertMany(services);

    console.log('Creating provider profiles...'.yellow);
    // Create provider profiles
    const providerProfiles = [];
    for (const user of createdUsers) {
      if (user.role === 'provider') {
        providerProfiles.push({
          userId: user.firebaseUid,
          businessName: user.name,
          description: user.bio || `Professional ${user.specialties[0]} services`,
          yearsOfExperience: Math.floor(Math.random() * 15) + 3, // 3-18 years of experience
          licenses: [
            {
              name: `${user.specialties[0]} Professional License`,
              number: `LIC-${Math.floor(Math.random() * 10000)}`,
              expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)),
              verified: true
            }
          ],
          insurance: {
            hasInsurance: true,
            provider: 'SafeGuard Insurance',
            policyNumber: `POL-${Math.floor(Math.random() * 10000)}`,
            expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
          },
          serviceArea: ['Tel Aviv', 'Ramat Gan', 'Givatayim', 'Herzliya'],
          isVerified: true
        });
      }
    }
    
    const createdProviderProfiles = await ProviderProfile.insertMany(providerProfiles);

    console.log('Creating bookings...'.yellow);
    // Create bookings with references to services
    const currentDate = new Date();
    const tomorrow = new Date(currentDate);
    tomorrow.setDate(currentDate.getDate() + 1);
    
    const nextWeek = new Date(currentDate);
    nextWeek.setDate(currentDate.getDate() + 7);
    
    const lastWeek = new Date(currentDate);
    lastWeek.setDate(currentDate.getDate() - 7);
    
    const twoWeeksAgo = new Date(currentDate);
    twoWeeksAgo.setDate(currentDate.getDate() - 14);
    
    // Create some favorites
    const favorites = [
      {
        userId: 'customer1',
        serviceId: createdServices[0]._id
      },
      {
        userId: 'customer1',
        serviceId: createdServices[3]._id
      },
      {
        userId: 'customer2',
        serviceId: createdServices[1]._id
      },
      {
        userId: 'customer2',
        serviceId: createdServices[4]._id
      },
      {
        userId: 'customer3',
        serviceId: createdServices[6]._id
      }
    ];
    
    await Favorite.insertMany(favorites);
    
    const bookings = [
      // Customer 1 (David) bookings
      {
        serviceId: createdServices[0]._id, // Emergency Plumbing
        serviceName: createdServices[0].title,
        serviceImage: createdServices[0].image,
        userId: 'customer1',
        userName: 'David Levy',
        userEmail: 'david@example.com',
        providerId: 'provider1',
        providerName: 'Cohen Plumbing Solutions',
        date: tomorrow,
        time: '10:00 AM',
        address: 'Ben Gurion 75, Tel Aviv',
        notes: 'Urgent: Burst pipe in bathroom causing water damage',
        status: 'pending',
        price: createdServices[0].price,
        paymentStatus: 'pending',
        paymentMethod: '',
        createdAt: new Date()
      },
      {
        serviceId: createdServices[3]._id, // Standard House Cleaning
        serviceName: createdServices[3].title,
        serviceImage: createdServices[3].image,
        userId: 'customer1',
        userName: 'David Levy',
        userEmail: 'david@example.com',
        providerId: 'provider2',
        providerName: 'Naki Babait Cleaning',
        date: nextWeek,
        time: '14:00',
        address: 'Ben Gurion 75, Tel Aviv',
        notes: 'Please focus on kitchen and bathrooms',
        status: 'confirmed',
        price: createdServices[3].price,
        paymentStatus: 'pending',
        paymentMethod: '',
        createdAt: new Date(currentDate.setDate(currentDate.getDate() - 1))
      },
      {
        serviceId: createdServices[6]._id, // Electrical Repairs
        serviceName: createdServices[6].title,
        serviceImage: createdServices[6].image,
        userId: 'customer1',
        userName: 'David Levy',
        userEmail: 'david@example.com',
        providerId: 'provider3',
        providerName: 'ElectraTech Solutions',
        date: lastWeek,
        time: '11:30 AM',
        address: 'Ben Gurion 75, Tel Aviv',
        notes: 'Power outlet not working in living room',
        status: 'completed',
        price: createdServices[6].price,
        paymentStatus: 'paid',
        paymentMethod: 'credit_card',
        createdAt: new Date(currentDate.setDate(currentDate.getDate() - 10))
      },
      
      // Customer 2 (Sarah) bookings
      {
        serviceId: createdServices[1]._id, // Standard Plumbing
        serviceName: createdServices[1].title,
        serviceImage: createdServices[1].image,
        userId: 'customer2',
        userName: 'Sarah Cohen',
        userEmail: 'sarah@example.com',
        providerId: 'provider1',
        providerName: 'Cohen Plumbing Solutions',
        date: nextWeek,
        time: '09:00 AM',
        address: 'Ibn Gabirol 120, Tel Aviv',
        notes: 'Bathroom sink is clogged',
        status: 'confirmed',
        price: createdServices[1].price,
        paymentStatus: 'pending',
        paymentMethod: '',
        createdAt: new Date(currentDate.setDate(currentDate.getDate() - 2))
      },
      {
        serviceId: createdServices[4]._id, // Deep Cleaning
        serviceName: createdServices[4].title,
        serviceImage: createdServices[4].image,
        userId: 'customer2',
        userName: 'Sarah Cohen',
        userEmail: 'sarah@example.com',
        providerId: 'provider2',
        providerName: 'Naki Babait Cleaning',
        date: twoWeeksAgo,
        time: '10:00 AM',
        address: 'Ibn Gabirol 120, Tel Aviv',
        notes: 'Moving out, need thorough cleaning',
        status: 'completed',
        price: createdServices[4].price,
        paymentStatus: 'paid',
        paymentMethod: 'credit_card',
        createdAt: new Date(currentDate.setDate(currentDate.getDate() - 20))
      },
      
      // Customer 3 (Michael) bookings
      {
        serviceId: createdServices[8]._id, // Garden Maintenance
        serviceName: createdServices[8].title,
        serviceImage: createdServices[8].image,
        userId: 'customer3',
        userName: 'Michael Rosen',
        userEmail: 'michael@example.com',
        providerId: 'provider4',
        providerName: 'GreenThumb Landscaping',
        date: tomorrow,
        time: '16:00',
        address: 'Weizmann 45, Tel Aviv',
        notes: 'Need lawn mowing and hedge trimming',
        status: 'confirmed',
        price: createdServices[8].price,
        paymentStatus: 'pending',
        paymentMethod: '',
        createdAt: new Date(currentDate.setDate(currentDate.getDate() - 3))
      },
      {
        serviceId: createdServices[7]._id, // Lighting Installation
        serviceName: createdServices[7].title,
        serviceImage: createdServices[7].image,
        userId: 'customer3',
        userName: 'Michael Rosen',
        userEmail: 'michael@example.com',
        providerId: 'provider3',
        providerName: 'ElectraTech Solutions',
        date: lastWeek,
        time: '13:00',
        address: 'Weizmann 45, Tel Aviv',
        notes: 'Install new ceiling lights in living room',
        status: 'cancelled',
        price: createdServices[7].price,
        paymentStatus: 'refunded',
        paymentMethod: 'credit_card',
        createdAt: new Date(currentDate.setDate(currentDate.getDate() - 12))
      }
    ];

    const createdBookings = await Booking.insertMany(bookings);
    
    // Create reviews for completed bookings
    const reviews = [];
    for (const booking of createdBookings) {
      if (booking.status === 'completed') {
        reviews.push({
          bookingId: booking._id,
          serviceId: booking.serviceId,
          userId: booking.userId,
          userName: booking.userName,
          userPhoto: createdUsers.find(u => u.firebaseUid === booking.userId)?.photoURL || '',
          providerId: booking.providerId,
          rating: Math.floor(Math.random() * 2) + 4, // 4-5 star ratings
          comment: 'Great service! Very professional and completed the work quickly.',
          createdAt: new Date(new Date(booking.date).getTime() + 86400000) // 1 day after service date
        });
      }
    }
    
    // Add some provider responses to reviews
    if (reviews.length > 0) {
      reviews[0].response = {
        text: 'Thank you for your kind review! We appreciate your business.',
        date: new Date(new Date(reviews[0].createdAt).getTime() + 86400000) // 1 day after review
      };
    }
    
    await Review.insertMany(reviews);

    console.log('Data imported successfully!'.green.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

// Function to destroy data
const destroyData = async () => {
  try {
    await User.deleteMany();
    await Service.deleteMany();
    await Booking.deleteMany();
    await Category.deleteMany();
    await Favorite.deleteMany();
    await ProviderProfile.deleteMany();
    await Review.deleteMany();

    console.log('Data destroyed!'.red.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

// Run the appropriate function based on command line argument
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
