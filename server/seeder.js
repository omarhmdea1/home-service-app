const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');

// Load models
const Service = require('./src/models/Service');
const Booking = require('./src/models/Booking');
const User = require('./src/models/User');
const Category = require('./src/models/Category');
const Favorite = require('./src/models/Favorite');
const ProviderProfile = require('./src/models/ProviderProfile');
const Review = require('./src/models/Review');
const Message = require('./src/models/Message');

// Load environment variables
dotenv.config();

// Set mongoose settings
mongoose.set('strictQuery', false);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Utility functions for generating realistic data
const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];
const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

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
    name: 'Carpentry',
    description: 'Professional carpentry and woodworking services',
    icon: 'fa-hammer',
    image: '/images/categories/carpentry.jpg',
    isActive: true,
    order: 7
  },
  {
    name: 'HVAC',
    description: 'Heating, ventilation, and air conditioning services',
    icon: 'fa-snowflake',
    image: '/images/categories/hvac.jpg',
    isActive: true,
    order: 8
  },
  {
    name: 'Handyman',
    description: 'General handyman services for various home repairs',
    icon: 'fa-tools',
    image: '/images/categories/handyman.jpg',
    isActive: true,
    order: 9
  }
];

// Generate 15 realistic providers
const generateProviders = () => {
  const providerNames = [
    { name: 'Cohen Plumbing Solutions', category: 'Plumbing', email: 'cohen@hausly.com' },
    { name: 'Naki Babait Cleaning', category: 'Cleaning', email: 'naki@hausly.com' },
    { name: 'ElectraTech Solutions', category: 'Electrical', email: 'electra@hausly.com' },
    { name: 'GreenThumb Landscaping', category: 'Gardening', email: 'greenthumb@hausly.com' },
    { name: 'Rainbow Painters', category: 'Painting', email: 'rainbow@hausly.com' },
    { name: 'Swift Movers', category: 'Moving', email: 'swift@hausly.com' },
    { name: 'Master Carpenters', category: 'Carpentry', email: 'master@hausly.com' },
    { name: 'Cool Air HVAC', category: 'HVAC', email: 'coolair@hausly.com' },
    { name: 'Fix-It Pro', category: 'Handyman', email: 'fixit@hausly.com' },
    { name: 'Premium Plumbing', category: 'Plumbing', email: 'premium@hausly.com' },
    { name: 'Sparkle Clean', category: 'Cleaning', email: 'sparkle@hausly.com' },
    { name: 'Power Electric', category: 'Electrical', email: 'power@hausly.com' },
    { name: 'Garden Paradise', category: 'Gardening', email: 'paradise@hausly.com' },
    { name: 'Color Masters', category: 'Painting', email: 'color@hausly.com' },
    { name: 'Easy Move', category: 'Moving', email: 'easymove@hausly.com' }
  ];

  const addresses = [
    'Herzl 100, Tel Aviv', 'Dizengoff 50, Tel Aviv', 'Allenby 75, Tel Aviv',
    'Rothschild 100, Tel Aviv', 'Ben Gurion 200, Tel Aviv', 'Ibn Gabirol 150, Tel Aviv',
    'King George 80, Tel Aviv', 'Shenkin 45, Tel Aviv', 'Bialik 25, Tel Aviv',
    'Carmel Market 15, Tel Aviv', 'Florentin 60, Tel Aviv', 'Jaffa Port 30, Jaffa',
    'Ramat Aviv Mall, Tel Aviv', 'Sarona Market, Tel Aviv', 'Neve Tzedek 20, Tel Aviv'
  ];

  const bios = {
    'Plumbing': 'Professional plumbing services with years of experience. We handle emergency repairs, installations, and maintenance with highest quality standards.',
    'Cleaning': 'Eco-friendly cleaning services for homes and offices. We use safe products and provide thorough, reliable cleaning solutions.',
    'Electrical': 'Licensed electricians providing safe and efficient electrical services for residential and commercial properties.',
    'Gardening': 'Transform your outdoor space with our professional gardening and landscaping services. We create beautiful, sustainable gardens.',
    'Painting': 'Professional painting services for interior and exterior projects. Quality workmanship with attention to detail.',
    'Moving': 'Reliable and efficient moving services. We handle your belongings with care and ensure smooth relocation.',
    'Carpentry': 'Expert carpentry and woodworking services. Custom furniture, repairs, and installations with precision craftsmanship.',
    'HVAC': 'Complete heating, ventilation, and air conditioning services. Installation, repair, and maintenance by certified technicians.',
    'Handyman': 'General handyman services for all your home repair needs. Quick, reliable solutions for various household tasks.'
  };

  return providerNames.map((provider, index) => ({
    firebaseUid: `provider${index + 1}`,
    name: provider.name,
    email: provider.email,
    role: 'provider',
    phone: `+972-5${getRandomNumber(0, 9)}-${getRandomNumber(1000000, 9999999)}`,
    address: addresses[index],
    photoURL: `https://randomuser.me/api/portraits/${getRandomElement(['men', 'women'])}/${getRandomNumber(1, 95)}.jpg`,
    isVerified: true,
    bio: bios[provider.category],
    specialties: [provider.category, 'Repairs', 'Installation', 'Maintenance'],
    averageRating: (4.0 + Math.random() * 1).toFixed(1),
    reviewCount: getRandomNumber(25, 150),
    createdAt: getRandomDate(new Date(2023, 0, 1), new Date(2024, 6, 1)),
    lastLogin: getRandomDate(new Date(2024, 10, 1), new Date())
  }));
};

// Generate 30 realistic customers
const generateCustomers = () => {
  const firstNames = [
    'David', 'Sarah', 'Michael', 'Rachel', 'Daniel', 'Maya', 'Yonatan', 'Noa',
    'Eitan', 'Tamar', 'Avi', 'Shira', 'Roi', 'Gal', 'Omri', 'Tal',
    'Ariel', 'Lior', 'Chen', 'Dana', 'Yoav', 'Hila', 'Nadav', 'Mor',
    'Itai', 'Keren', 'Shai', 'Rina', 'Alon', 'Michal'
  ];

  const lastNames = [
    'Cohen', 'Levy', 'Rosen', 'Goldberg', 'Katz', 'Friedman', 'Green', 'Klein',
    'Schwartz', 'Miller', 'Davis', 'Brown', 'Wilson', 'Garcia', 'Martinez'
  ];

  const addresses = [
    'Ben Gurion 75, Tel Aviv', 'Ibn Gabirol 120, Tel Aviv', 'Weizmann 45, Tel Aviv',
    'Nordau 85, Tel Aviv', 'Arlozorov 200, Tel Aviv', 'Hayarkon 150, Tel Aviv',
    'Sheinkin 90, Tel Aviv', 'King George 110, Tel Aviv', 'Dizengoff 180, Tel Aviv',
    'Rothschild 220, Tel Aviv', 'Allenby 95, Tel Aviv', 'Bialik 55, Tel Aviv',
    'Carmel 40, Tel Aviv', 'Florentin 70, Tel Aviv', 'Sarona 25, Tel Aviv'
  ];

  const usedEmails = new Set();

  return Array.from({ length: 30 }, (_, index) => {
    const firstName = getRandomElement(firstNames);
    const lastName = getRandomElement(lastNames);
    
    // Ensure unique email by adding index if needed
    let baseEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`;
    let email = baseEmail;
    let counter = 1;
    
    while (usedEmails.has(email)) {
      email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${counter}@email.com`;
      counter++;
    }
    
    usedEmails.add(email);
    
    return {
      firebaseUid: `customer${index + 1}`,
      name: `${firstName} ${lastName}`,
      email: email,
      role: 'customer',
      phone: `+972-5${getRandomNumber(0, 9)}-${getRandomNumber(1000000, 9999999)}`,
      address: getRandomElement(addresses),
      photoURL: `https://randomuser.me/api/portraits/${getRandomElement(['men', 'women'])}/${getRandomNumber(1, 95)}.jpg`,
      isVerified: Math.random() > 0.1, // 90% verified
      createdAt: getRandomDate(new Date(2023, 6, 1), new Date(2024, 10, 1)),
      lastLogin: getRandomDate(new Date(2024, 10, 15), new Date())
    };
  });
};

// Generate services for each provider
const generateServices = (providers) => {
  const serviceTemplates = {
    'Plumbing': [
      { name: 'Emergency Plumbing Service', basePrice: 450, desc: 'Available 24/7 for urgent plumbing issues. Quick and reliable emergency repairs.' },
      { name: 'Standard Plumbing Repair', basePrice: 350, desc: 'Professional plumbing repairs for leaks, clogs, and fixture issues.' },
      { name: 'Bathroom Installation', basePrice: 2500, desc: 'Complete bathroom plumbing installation and renovation services.' },
      { name: 'Kitchen Plumbing', basePrice: 800, desc: 'Kitchen sink, dishwasher, and disposal installation and repair.' },
      { name: 'Water Heater Service', basePrice: 600, desc: 'Water heater installation, repair, and maintenance services.' },
      { name: 'Drain Cleaning', basePrice: 200, desc: 'Professional drain cleaning and unclogging services.' }
    ],
    'Cleaning': [
      { name: 'Standard House Cleaning', basePrice: 300, desc: 'Regular house cleaning service with eco-friendly products.' },
      { name: 'Deep Cleaning Service', basePrice: 500, desc: 'Thorough deep cleaning for move-ins, move-outs, and spring cleaning.' },
      { name: 'Office Cleaning', basePrice: 450, desc: 'Professional office and commercial space cleaning services.' },
      { name: 'Post-Construction Cleanup', basePrice: 800, desc: 'Specialized cleaning after construction or renovation projects.' },
      { name: 'Carpet Cleaning', basePrice: 250, desc: 'Professional carpet and upholstery cleaning services.' },
      { name: 'Window Cleaning', basePrice: 150, desc: 'Interior and exterior window cleaning for homes and offices.' }
    ],
    'Electrical': [
      { name: 'Electrical Repairs', basePrice: 400, desc: 'Safe and professional electrical repair services for homes and businesses.' },
      { name: 'Lighting Installation', basePrice: 350, desc: 'Professional installation of all types of lighting fixtures.' },
      { name: 'Outlet Installation', basePrice: 180, desc: 'New electrical outlet installation and GFCI upgrades.' },
      { name: 'Ceiling Fan Installation', basePrice: 250, desc: 'Professional ceiling fan installation and wiring.' },
      { name: 'Electrical Panel Upgrade', basePrice: 1200, desc: 'Electrical panel upgrades and circuit breaker installation.' },
      { name: 'Smart Home Wiring', basePrice: 600, desc: 'Smart home automation and electrical system upgrades.' }
    ],
    'Gardening': [
      { name: 'Garden Maintenance', basePrice: 250, desc: 'Regular garden maintenance including lawn mowing and plant care.' },
      { name: 'Landscape Design', basePrice: 1500, desc: 'Professional landscape design and installation services.' },
      { name: 'Tree Trimming', basePrice: 400, desc: 'Professional tree trimming and pruning services.' },
      { name: 'Lawn Installation', basePrice: 800, desc: 'New lawn installation with quality grass and irrigation.' },
      { name: 'Garden Cleanup', basePrice: 300, desc: 'Seasonal garden cleanup and debris removal.' },
      { name: 'Irrigation System', basePrice: 1000, desc: 'Sprinkler and drip irrigation system installation.' }
    ],
    'Painting': [
      { name: 'Interior Painting', basePrice: 800, desc: 'Professional interior painting with premium paints and finishes.' },
      { name: 'Exterior Painting', basePrice: 1200, desc: 'Weather-resistant exterior painting for lasting protection.' },
      { name: 'Cabinet Painting', basePrice: 600, desc: 'Kitchen and bathroom cabinet refinishing and painting.' },
      { name: 'Wallpaper Installation', basePrice: 500, desc: 'Professional wallpaper installation and removal services.' },
      { name: 'Deck Staining', basePrice: 400, desc: 'Deck cleaning, staining, and weatherproofing services.' },
      { name: 'Drywall Repair & Paint', basePrice: 350, desc: 'Drywall repair and professional painting services.' }
    ],
    'Moving': [
      { name: 'Local Moving Service', basePrice: 600, desc: 'Professional local moving services with careful handling.' },
      { name: 'Long Distance Moving', basePrice: 1500, desc: 'Reliable long-distance moving with full-service options.' },
      { name: 'Packing Services', basePrice: 400, desc: 'Professional packing and unpacking services with quality materials.' },
      { name: 'Storage Solutions', basePrice: 200, desc: 'Temporary storage solutions during your move.' },
      { name: 'Furniture Moving', basePrice: 300, desc: 'Specialized furniture and heavy item moving services.' },
      { name: 'Office Relocation', basePrice: 1000, desc: 'Complete office relocation and setup services.' }
    ],
    'Carpentry': [
      { name: 'Custom Furniture', basePrice: 1200, desc: 'Custom-built furniture designed to your specifications.' },
      { name: 'Kitchen Cabinets', basePrice: 2000, desc: 'Custom kitchen cabinet design and installation.' },
      { name: 'Shelving Installation', basePrice: 300, desc: 'Custom shelving and storage solutions installation.' },
      { name: 'Door Installation', basePrice: 400, desc: 'Interior and exterior door installation and repair.' },
      { name: 'Deck Building', basePrice: 1800, desc: 'Custom deck construction and outdoor living spaces.' },
      { name: 'Trim & Molding', basePrice: 500, desc: 'Crown molding, baseboards, and trim installation.' }
    ],
    'HVAC': [
      { name: 'AC Installation', basePrice: 2500, desc: 'Professional air conditioning system installation and setup.' },
      { name: 'Heating System Repair', basePrice: 400, desc: 'Heating system diagnosis, repair, and maintenance.' },
      { name: 'Duct Cleaning', basePrice: 300, desc: 'Professional air duct cleaning and sanitization services.' },
      { name: 'HVAC Maintenance', basePrice: 200, desc: 'Regular HVAC system maintenance and tune-ups.' },
      { name: 'Thermostat Installation', basePrice: 250, desc: 'Smart thermostat installation and programming.' },
      { name: 'Indoor Air Quality', basePrice: 600, desc: 'Air purification systems and indoor air quality solutions.' }
    ],
    'Handyman': [
      { name: 'General Repairs', basePrice: 150, desc: 'General home repairs and maintenance tasks.' },
      { name: 'Furniture Assembly', basePrice: 100, desc: 'Professional furniture assembly and installation.' },
      { name: 'Tile Repair', basePrice: 250, desc: 'Bathroom and kitchen tile repair and replacement.' },
      { name: 'Fence Repair', basePrice: 300, desc: 'Fence installation, repair, and maintenance services.' },
      { name: 'Gutter Cleaning', basePrice: 180, desc: 'Gutter cleaning and minor repair services.' },
      { name: 'Home Maintenance', basePrice: 200, desc: 'Regular home maintenance and minor repair services.' }
    ]
  };

  const services = [];
  const images = [
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e',
    'https://images.unsplash.com/photo-1542013936693-884638332954',
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a',
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952',
    'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf',
    'https://images.unsplash.com/photo-1604335399105-a0c585fd81a1',
    'https://images.unsplash.com/photo-1621905252507-c93694339d80',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f',
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b',
    'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae'
  ];

  providers.forEach(provider => {
    const category = provider.specialties[0];
    const templates = serviceTemplates[category] || serviceTemplates['Handyman'];
    const numberOfServices = getRandomNumber(2, Math.min(10, templates.length));
    
    // Shuffle templates and take the required number
    const shuffledTemplates = templates.sort(() => 0.5 - Math.random()).slice(0, numberOfServices);
    
    shuffledTemplates.forEach(template => {
      const priceVariation = 0.8 + Math.random() * 0.4; // ±20% price variation
      services.push({
        title: template.name,
        description: template.desc,
        price: Math.round(template.basePrice * priceVariation),
        image: getRandomElement(images),
        category: category,
        providerId: provider.firebaseUid,
        providerName: provider.name,
        providerPhoto: provider.photoURL,
        isActive: Math.random() > 0.05, // 95% active
        rating: (4.0 + Math.random() * 1).toFixed(1),
        reviewCount: getRandomNumber(5, 80),
        createdAt: getRandomDate(provider.createdAt, new Date()),
        duration: getRandomElement(['30 minutes', '1 hour', '2 hours', '3 hours', '4 hours', 'Half day', 'Full day'])
      });
    });
  });

  return services;
};

// Function to import data
const importData = async () => {
  try {
    console.log('🧹 Clearing existing data...'.yellow);
    
    // Clear existing data
    await User.deleteMany();
    await Service.deleteMany();
    await Booking.deleteMany();
    await Category.deleteMany();
    await Favorite.deleteMany();
    await ProviderProfile.deleteMany();
    await Review.deleteMany();
    await Message.deleteMany();

    console.log('👥 Creating users...'.yellow);
    
    // Generate and insert users
    const providers = generateProviders();
    const customers = generateCustomers();
    const allUsers = [...providers, ...customers];
    
    const createdUsers = await User.insertMany(allUsers);
    const createdCategories = await Category.insertMany(categories);
    
    console.log('🛠️ Creating services...'.yellow);
    
    // Generate and insert services
    const services = generateServices(providers);
    const createdServices = await Service.insertMany(services);
    
    console.log('📋 Creating provider profiles...'.yellow);
    
    // Create provider profiles
    const providerProfiles = providers.map(provider => ({
      userId: provider.firebaseUid,
      businessName: provider.name,
      description: provider.bio,
      yearsOfExperience: getRandomNumber(3, 20),
      licenses: [
        {
          name: `${provider.specialties[0]} Professional License`,
          number: `LIC-${getRandomNumber(10000, 99999)}`,
          expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)),
          verified: true
        }
      ],
      insurance: {
        hasInsurance: true,
        provider: getRandomElement(['SafeGuard Insurance', 'ProTech Insurance', 'SecureWork Insurance']),
        policyNumber: `POL-${getRandomNumber(10000, 99999)}`,
        expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
      },
      serviceArea: ['Tel Aviv', 'Ramat Gan', 'Givatayim', 'Herzliya', 'Petah Tikva'],
      isVerified: Math.random() > 0.1 // 90% verified
    }));
    
    await ProviderProfile.insertMany(providerProfiles);
    
    console.log('📅 Creating bookings...'.yellow);
    
    // Generate realistic bookings
    const bookings = [];
    const now = new Date();
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const oneMonthLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    // Each customer makes 1-5 bookings
    customers.forEach(customer => {
      const numberOfBookings = getRandomNumber(1, 5);
      
      for (let i = 0; i < numberOfBookings; i++) {
        const service = getRandomElement(createdServices);
        const provider = providers.find(p => p.firebaseUid === service.providerId);
        
        const requestDate = getRandomDate(oneMonthAgo, now);
        const serviceDate = getRandomDate(requestDate, oneMonthLater);
        
        // Determine status based on service date
        let status;
        if (serviceDate < now) {
          status = getRandomElement(['completed', 'completed', 'completed', 'cancelled']); // 75% completed
        } else {
          status = getRandomElement(['pending', 'confirmed', 'confirmed']); // 33% pending, 67% confirmed
        }
        
        const booking = {
          serviceId: service._id,
          serviceName: service.title,
          serviceImage: service.image,
          userId: customer.firebaseUid,
          userName: customer.name,
          userEmail: customer.email,
          providerId: service.providerId,
          providerName: service.providerName,
          date: serviceDate,
          time: getRandomElement(['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']),
          address: customer.address,
          notes: getRandomElement([
            'Please call before arriving',
            'Urgent repair needed',
            'Flexible with timing',
            'Please bring all necessary tools',
            'First time service',
            'Regular maintenance needed'
          ]),
          status: status,
          price: service.price,
          paymentStatus: status === 'completed' ? 'paid' : 'pending',
          paymentMethod: status === 'completed' ? getRandomElement(['credit_card', 'cash', 'paypal']) : '',
          createdAt: requestDate,
          duration: service.duration
        };
        
        bookings.push(booking);
      }
    });
    
    const createdBookings = await Booking.insertMany(bookings);
    
    console.log('💬 Creating messages...'.yellow);
    
    // Generate messages for active bookings (pending and confirmed)
    const messages = [];
    const messageTemplates = {
      customer: [
        'Hi! When can you start the work?',
        'What time works best for you?',
        'Do you need access to water/electricity?',
        'How long will this take approximately?',
        'Should I prepare anything before you arrive?',
        'Can you provide an estimate for additional work?',
        'Is the quoted price final?',
        'Do you offer any warranty on your work?',
        'Can you work on weekends?',
        'What payment methods do you accept?'
      ],
      provider: [
        'Hello! I can start tomorrow morning if that works for you.',
        'I typically work between 9 AM and 5 PM.',
        'Yes, I\'ll need access to the main water valve.',
        'This should take approximately 2-3 hours.',
        'Please clear the work area before I arrive.',
        'I can provide a detailed estimate when I see the scope.',
        'The price includes materials and labor.',
        'Yes, I provide a 1-year warranty on all work.',
        'I can work Saturday mornings for urgent jobs.',
        'I accept cash, credit card, and bank transfer.',
        'I\'ll arrive 15 minutes early to set up.',
        'Please have someone available during the work.',
        'I\'ll clean up the work area when finished.',
        'Let me know if you have any concerns.',
        'I\'ll send you a photo when the work is complete.'
      ]
    };
    
    createdBookings
      .filter(booking => ['pending', 'confirmed'].includes(booking.status))
      .forEach(booking => {
        const numberOfMessages = getRandomNumber(2, 10);
        let messageDate = new Date(booking.createdAt);
        
        for (let i = 0; i < numberOfMessages; i++) {
          const isCustomerMessage = i % 2 === 0; // Alternate between customer and provider
          const sender = isCustomerMessage ? booking.userId : booking.providerId;
          const recipient = isCustomerMessage ? booking.providerId : booking.userId;
          
          // Add random delay between messages (1-24 hours)
          messageDate = new Date(messageDate.getTime() + getRandomNumber(1, 24) * 60 * 60 * 1000);
          
          messages.push({
            bookingId: booking._id,
            senderId: sender,
            recipientId: recipient,
            content: getRandomElement(isCustomerMessage ? messageTemplates.customer : messageTemplates.provider),
            isRead: Math.random() > 0.3, // 70% read
            createdAt: messageDate,
            updatedAt: messageDate
          });
        }
      });
    
    await Message.insertMany(messages);
    
    console.log('⭐ Creating reviews...'.yellow);
    
    // Generate reviews for completed bookings
    const reviews = [];
    const reviewComments = [
      'Excellent service! Very professional and completed the work perfectly.',
      'Great work! Arrived on time and cleaned up afterwards.',
      'Highly recommend! Quality work at a fair price.',
      'Professional and efficient. Will definitely use again.',
      'Outstanding service! Exceeded my expectations.',
      'Very satisfied with the work. Great communication throughout.',
      'Quality workmanship and attention to detail.',
      'Prompt, reliable, and reasonably priced.',
      'Excellent customer service and quality work.',
      'Very pleased with the results. Highly professional.'
    ];
    
    createdBookings
      .filter(booking => booking.status === 'completed')
      .forEach(booking => {
        const customer = customers.find(c => c.firebaseUid === booking.userId);
        const reviewDate = new Date(booking.date.getTime() + getRandomNumber(1, 7) * 24 * 60 * 60 * 1000);
        
        const review = {
          bookingId: booking._id,
          serviceId: booking.serviceId,
          userId: booking.userId,
          userName: booking.userName,
          userPhoto: customer.photoURL,
          providerId: booking.providerId,
          rating: getRandomNumber(4, 5), // 4-5 star ratings
          comment: getRandomElement(reviewComments),
          createdAt: reviewDate
        };
        
        // 30% chance of provider response
        if (Math.random() < 0.3) {
          review.response = {
            text: getRandomElement([
              'Thank you for your kind review! We appreciate your business.',
              'We\'re so glad you\'re happy with our service!',
              'Thank you! It was a pleasure working with you.',
              'We appreciate your feedback and look forward to serving you again.',
              'Thank you for choosing our services!'
            ]),
            date: new Date(reviewDate.getTime() + getRandomNumber(1, 3) * 24 * 60 * 60 * 1000)
          };
        }
        
        reviews.push(review);
      });
    
    await Review.insertMany(reviews);
    
    console.log('❤️ Creating favorites...'.yellow);
    
    // Generate favorites (customers favoriting providers/services)
    const favorites = [];
    customers.forEach(customer => {
      const numberOfFavorites = getRandomNumber(0, 5);
      const customerServices = getRandomNumber(0, numberOfFavorites) === 0 ? [] : 
        createdServices.sort(() => 0.5 - Math.random()).slice(0, numberOfFavorites);
      
      customerServices.forEach(service => {
        favorites.push({
          userId: customer.firebaseUid,
          serviceId: service._id
        });
      });
    });
    
    await Favorite.insertMany(favorites);
    
    console.log('✅ Data imported successfully!'.green.inverse);
    console.log(`📊 Generated:
    - ${providers.length} providers
    - ${customers.length} customers  
    - ${createdServices.length} services
    - ${createdBookings.length} bookings
    - ${messages.length} messages
    - ${reviews.length} reviews
    - ${favorites.length} favorites`.cyan);
    
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
    await Message.deleteMany();

    console.log('🗑️ Data destroyed!'.red.inverse);
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
