import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import FoodItem from '../models/FoodItem.js';
import Resource from '../models/Resource.js';
import User from '../models/User.js';
import InventoryItem from '../models/InventoryItem.js';

dotenv.config();

const foodItems = [
  // Fruits
  {
    name: 'Apple',
    category: 'fruit',
    typicalExpirationDays: 30,
    costPerUnit: 0.50,
    unit: 'piece',
    description: 'Fresh red apples'
  },
  {
    name: 'Banana',
    category: 'fruit',
    typicalExpirationDays: 7,
    costPerUnit: 0.30,
    unit: 'piece',
    description: 'Ripe yellow bananas'
  },
  {
    name: 'Orange',
    category: 'fruit',
    typicalExpirationDays: 14,
    costPerUnit: 0.60,
    unit: 'piece',
    description: 'Fresh oranges'
  },
  {
    name: 'Strawberries',
    category: 'fruit',
    typicalExpirationDays: 5,
    costPerUnit: 3.00,
    unit: 'pound',
    description: 'Fresh strawberries'
  },
  {
    name: 'Grapes',
    category: 'fruit',
    typicalExpirationDays: 10,
    costPerUnit: 2.50,
    unit: 'pound',
    description: 'Seedless grapes'
  },

  // Vegetables
  {
    name: 'Carrots',
    category: 'vegetable',
    typicalExpirationDays: 21,
    costPerUnit: 1.00,
    unit: 'pound',
    description: 'Fresh carrots'
  },
  {
    name: 'Broccoli',
    category: 'vegetable',
    typicalExpirationDays: 7,
    costPerUnit: 2.00,
    unit: 'head',
    description: 'Fresh broccoli'
  },
  {
    name: 'Tomatoes',
    category: 'vegetable',
    typicalExpirationDays: 7,
    costPerUnit: 1.50,
    unit: 'pound',
    description: 'Ripe tomatoes'
  },
  {
    name: 'Lettuce',
    category: 'vegetable',
    typicalExpirationDays: 7,
    costPerUnit: 2.00,
    unit: 'head',
    description: 'Romaine lettuce'
  },
  {
    name: 'Potatoes',
    category: 'vegetable',
    typicalExpirationDays: 30,
    costPerUnit: 0.75,
    unit: 'pound',
    description: 'Russet potatoes'
  },
  {
    name: 'Onions',
    category: 'vegetable',
    typicalExpirationDays: 30,
    costPerUnit: 0.50,
    unit: 'pound',
    description: 'Yellow onions'
  },
  {
    name: 'Bell Peppers',
    category: 'vegetable',
    typicalExpirationDays: 10,
    costPerUnit: 1.25,
    unit: 'piece',
    description: 'Fresh bell peppers'
  },

  // Dairy Products
  {
    name: 'Milk',
    category: 'dairy',
    typicalExpirationDays: 7,
    costPerUnit: 3.50,
    unit: 'liter',
    description: 'Fresh whole milk'
  },
  {
    name: 'Cheddar Cheese',
    category: 'dairy',
    typicalExpirationDays: 30,
    costPerUnit: 5.00,
    unit: 'pound',
    description: 'Sharp cheddar cheese'
  },
  {
    name: 'Yogurt',
    category: 'dairy',
    typicalExpirationDays: 14,
    costPerUnit: 1.20,
    unit: 'cup',
    description: 'Greek yogurt'
  },
  {
    name: 'Butter',
    category: 'dairy',
    typicalExpirationDays: 90,
    costPerUnit: 4.50,
    unit: 'pound',
    description: 'Salted butter'
  },
  {
    name: 'Sour Cream',
    category: 'dairy',
    typicalExpirationDays: 21,
    costPerUnit: 2.50,
    unit: 'container',
    description: 'Sour cream'
  },

  // Proteins
  {
    name: 'Chicken Breast',
    category: 'protein',
    typicalExpirationDays: 3,
    costPerUnit: 8.00,
    unit: 'pound',
    description: 'Boneless chicken breast'
  },
  {
    name: 'Ground Beef',
    category: 'protein',
    typicalExpirationDays: 2,
    costPerUnit: 6.50,
    unit: 'pound',
    description: 'Lean ground beef'
  },
  {
    name: 'Eggs',
    category: 'protein',
    typicalExpirationDays: 21,
    costPerUnit: 4.00,
    unit: 'dozen',
    description: 'Large eggs'
  },
  {
    name: 'Salmon Fillet',
    category: 'protein',
    typicalExpirationDays: 2,
    costPerUnit: 12.00,
    unit: 'pound',
    description: 'Fresh salmon fillet'
  },
  {
    name: 'Bacon',
    category: 'protein',
    typicalExpirationDays: 14,
    costPerUnit: 6.00,
    unit: 'package',
    description: 'Smoked bacon'
  },
  {
    name: 'Tofu',
    category: 'protein',
    typicalExpirationDays: 30,
    costPerUnit: 3.00,
    unit: 'package',
    description: 'Firm tofu'
  },

  // Grains & Bread
  {
    name: 'White Bread',
    category: 'grain',
    typicalExpirationDays: 7,
    costPerUnit: 2.50,
    unit: 'loaf',
    description: 'Sliced white bread'
  },
  {
    name: 'Brown Rice',
    category: 'grain',
    typicalExpirationDays: 180,
    costPerUnit: 3.00,
    unit: 'pound',
    description: 'Long grain brown rice'
  },
  {
    name: 'Pasta',
    category: 'grain',
    typicalExpirationDays: 365,
    costPerUnit: 1.50,
    unit: 'pound',
    description: 'Dried spaghetti pasta'
  },
  {
    name: 'Oatmeal',
    category: 'grain',
    typicalExpirationDays: 365,
    costPerUnit: 4.00,
    unit: 'package',
    description: 'Rolled oats'
  },
  {
    name: 'Tortillas',
    category: 'grain',
    typicalExpirationDays: 14,
    costPerUnit: 3.00,
    unit: 'package',
    description: 'Flour tortillas'
  },

  // Beverages
  {
    name: 'Orange Juice',
    category: 'beverage',
    typicalExpirationDays: 10,
    costPerUnit: 4.00,
    unit: 'liter',
    description: 'Fresh orange juice'
  },
  {
    name: 'Bottled Water',
    category: 'beverage',
    typicalExpirationDays: 365,
    costPerUnit: 5.00,
    unit: 'pack',
    description: '24-pack bottled water'
  },
  {
    name: 'Coffee',
    category: 'beverage',
    typicalExpirationDays: 180,
    costPerUnit: 8.00,
    unit: 'bag',
    description: 'Ground coffee'
  },

  // Snacks
  {
    name: 'Potato Chips',
    category: 'snack',
    typicalExpirationDays: 60,
    costPerUnit: 3.50,
    unit: 'bag',
    description: 'Classic potato chips'
  },
  {
    name: 'Granola Bars',
    category: 'snack',
    typicalExpirationDays: 180,
    costPerUnit: 4.50,
    unit: 'box',
    description: 'Chewy granola bars'
  },
  {
    name: 'Crackers',
    category: 'snack',
    typicalExpirationDays: 90,
    costPerUnit: 3.00,
    unit: 'box',
    description: 'Whole wheat crackers'
  },
  {
    name: 'Peanut Butter',
    category: 'snack',
    typicalExpirationDays: 180,
    costPerUnit: 5.00,
    unit: 'jar',
    description: 'Creamy peanut butter'
  },

  // Condiments & Others
  {
    name: 'Ketchup',
    category: 'other',
    typicalExpirationDays: 180,
    costPerUnit: 2.50,
    unit: 'bottle',
    description: 'Tomato ketchup'
  },
  {
    name: 'Mayonnaise',
    category: 'other',
    typicalExpirationDays: 120,
    costPerUnit: 3.50,
    unit: 'jar',
    description: 'Mayonnaise'
  },
  {
    name: 'Olive Oil',
    category: 'other',
    typicalExpirationDays: 365,
    costPerUnit: 8.00,
    unit: 'bottle',
    description: 'Extra virgin olive oil'
  },
  {
    name: 'Canned Beans',
    category: 'other',
    typicalExpirationDays: 730,
    costPerUnit: 1.50,
    unit: 'can',
    description: 'Black beans'
  }
];

const resources = [
  {
    title: 'How to Store Fruits for Maximum Freshness',
    description: 'Learn the best practices for storing different types of fruits to extend their shelf life and reduce waste.',
    url: 'https://example.com/fruit-storage',
    relatedCategory: 'fruit',
    type: 'article',
    tags: ['storage', 'tips', 'freshness']
  },
  {
    title: 'Dairy Product Storage Guide',
    description: 'Complete guide to properly storing milk, cheese, yogurt, and other dairy products.',
    url: 'https://example.com/dairy-storage',
    relatedCategory: 'dairy',
    type: 'guide',
    tags: ['dairy', 'storage', 'refrigeration']
  },
  {
    title: 'Reducing Food Waste at Home',
    description: 'Practical strategies to minimize food waste in your household and save money.',
    url: 'https://example.com/reduce-waste',
    relatedCategory: 'general',
    type: 'article',
    tags: ['waste reduction', 'sustainability', 'tips']
  },
  {
    title: 'Vegetable Preservation Techniques',
    description: 'Learn various methods to preserve vegetables including freezing, canning, and pickling.',
    url: 'https://example.com/veggie-preservation',
    relatedCategory: 'vegetable',
    type: 'guide',
    tags: ['preservation', 'vegetables', 'techniques']
  },
  {
    title: 'Meal Planning for Sustainability',
    description: 'Video tutorial on creating sustainable meal plans that reduce waste and save money.',
    url: 'https://example.com/meal-planning-video',
    relatedCategory: 'general',
    type: 'video',
    tags: ['meal planning', 'sustainability', 'budget']
  },
  {
    title: 'Protein Storage and Safety',
    description: 'Essential guide to safely storing meat, fish, and other protein sources.',
    url: 'https://example.com/protein-storage',
    relatedCategory: 'protein',
    type: 'guide',
    tags: ['protein', 'food safety', 'storage']
  },
  {
    title: 'Creative Recipes Using Leftovers',
    description: 'Transform your leftovers into delicious new meals with these creative recipes.',
    url: 'https://example.com/leftover-recipes',
    relatedCategory: 'general',
    type: 'recipe',
    tags: ['leftovers', 'recipes', 'creativity']
  },
  {
    title: 'Understanding Expiration Dates',
    description: 'Learn the difference between "best by," "use by," and "sell by" dates to reduce unnecessary waste.',
    url: 'https://example.com/expiration-dates',
    relatedCategory: 'general',
    type: 'article',
    tags: ['expiration', 'food safety', 'education']
  },
  {
    title: 'Composting Kitchen Waste',
    description: 'Step-by-step guide to starting a compost bin for your food scraps.',
    url: 'https://example.com/composting',
    relatedCategory: 'general',
    type: 'guide',
    tags: ['composting', 'sustainability', 'recycling']
  },
  {
    title: 'Grain Storage Best Practices',
    description: 'How to properly store rice, pasta, and other grains for long-term freshness.',
    url: 'https://example.com/grain-storage',
    relatedCategory: 'grain',
    type: 'article',
    tags: ['grains', 'storage', 'pantry']
  },
  {
    title: 'Seasonal Eating Guide',
    description: 'Eat seasonally to enjoy fresher food and support local agriculture.',
    url: 'https://example.com/seasonal-eating',
    relatedCategory: 'general',
    type: 'guide',
    tags: ['seasonal', 'local', 'sustainability']
  },
  {
    title: 'Freezing Fruits and Vegetables',
    description: 'Complete guide to freezing produce to extend shelf life.',
    url: 'https://example.com/freezing-guide',
    relatedCategory: 'fruit',
    type: 'guide',
    tags: ['freezing', 'preservation', 'storage']
  },
  {
    title: 'Budget-Friendly Grocery Shopping',
    description: 'Tips for shopping smart and reducing food costs without sacrificing quality.',
    url: 'https://example.com/budget-shopping',
    relatedCategory: 'general',
    type: 'article',
    tags: ['budget', 'shopping', 'tips']
  },
  {
    title: 'Batch Cooking for Busy Families',
    description: 'Video guide to batch cooking and meal prep to save time and reduce waste.',
    url: 'https://example.com/batch-cooking',
    relatedCategory: 'general',
    type: 'video',
    tags: ['batch cooking', 'meal prep', 'efficiency']
  },
  {
    title: 'Beverage Storage and Freshness',
    description: 'How to properly store different beverages to maintain quality.',
    url: 'https://example.com/beverage-storage',
    relatedCategory: 'beverage',
    type: 'article',
    tags: ['beverages', 'storage', 'freshness']
  },
  {
    title: 'Snack Organization Ideas',
    description: 'Creative ways to organize and store snacks to reduce waste and improve accessibility.',
    url: 'https://example.com/snack-organization',
    relatedCategory: 'snack',
    type: 'tip',
    tags: ['snacks', 'organization', 'storage']
  },
  {
    title: 'Zero-Waste Kitchen Tips',
    description: 'Transform your kitchen into a zero-waste zone with these practical tips.',
    url: 'https://example.com/zero-waste-kitchen',
    relatedCategory: 'general',
    type: 'article',
    tags: ['zero waste', 'sustainability', 'eco-friendly']
  },
  {
    title: 'Food Inventory Management',
    description: 'Digital and analog methods for tracking your food inventory effectively.',
    url: 'https://example.com/inventory-management',
    relatedCategory: 'general',
    type: 'guide',
    tags: ['inventory', 'organization', 'management']
  },
  {
    title: 'Cooking with Scraps',
    description: 'Recipe ideas for using vegetable scraps and food parts you normally throw away.',
    url: 'https://example.com/cooking-scraps',
    relatedCategory: 'vegetable',
    type: 'recipe',
    tags: ['scraps', 'zero waste', 'recipes']
  },
  {
    title: 'Smart Refrigerator Organization',
    description: 'Optimize your refrigerator space and improve food preservation with smart organization.',
    url: 'https://example.com/fridge-organization',
    relatedCategory: 'general',
    type: 'guide',
    tags: ['refrigerator', 'organization', 'efficiency']
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/food-management');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await FoodItem.deleteMany({});
    await Resource.deleteMany({});
    await User.deleteMany({});
    await InventoryItem.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create demo users
    const demoUser = await User.create({
      fullName: 'Demo User',
      email: 'demo@example.com',
      password: 'demo123'  // Will be hashed by the pre-save hook
    });
    console.log('✅ Created demo user (email: demo@example.com, password: demo123)');

    // Create another test user
    await User.create({
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'Test@123'  // Will be hashed by the pre-save hook
    });
    console.log('✅ Created test user (email: test@example.com, password: Test@123)');

    // Insert food items
    await FoodItem.insertMany(foodItems);
    console.log(`✅ Inserted ${foodItems.length} food items`);

    // Insert resources
    await Resource.insertMany(resources);
    console.log(`✅ Inserted ${resources.length} resources`);

    // Create sample inventory items for demo user
    const today = new Date();
    const sampleInventory = [
      {
        userId: demoUser._id,
        itemName: 'Fresh Milk',
        category: 'dairy',
        quantity: 2,
        purchaseDate: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        expirationDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        notes: 'Store in refrigerator'
      },
      {
        userId: demoUser._id,
        itemName: 'Chicken Breast',
        category: 'protein',
        quantity: 1.5,
        purchaseDate: today,
        expirationDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        notes: 'Use soon or freeze'
      },
      {
        userId: demoUser._id,
        itemName: 'Apples',
        category: 'fruit',
        quantity: 6,
        purchaseDate: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000),
        expirationDate: new Date(today.getTime() + 25 * 24 * 60 * 60 * 1000), // 25 days from now
        notes: 'Organic apples'
      },
      {
        userId: demoUser._id,
        itemName: 'Whole Wheat Bread',
        category: 'grain',
        quantity: 1,
        purchaseDate: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
        expirationDate: new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000), // 6 days from now
        notes: 'Keep sealed'
      },
      {
        userId: demoUser._id,
        itemName: 'Broccoli',
        category: 'vegetable',
        quantity: 2,
        purchaseDate: today,
        expirationDate: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
        notes: 'Fresh from farmers market'
      },
      {
        userId: demoUser._id,
        itemName: 'Yogurt',
        category: 'dairy',
        quantity: 4,
        purchaseDate: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
        expirationDate: new Date(today.getTime() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
        notes: 'Greek yogurt'
      },
      {
        userId: demoUser._id,
        itemName: 'Orange Juice',
        category: 'beverage',
        quantity: 1,
        purchaseDate: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
        expirationDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        notes: 'Fresh squeezed'
      },
      {
        userId: demoUser._id,
        itemName: 'Carrots',
        category: 'vegetable',
        quantity: 3,
        purchaseDate: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000),
        expirationDate: new Date(today.getTime() + 17 * 24 * 60 * 60 * 1000), // 17 days from now
        notes: 'Baby carrots'
      },
      {
        userId: demoUser._id,
        itemName: 'Cheddar Cheese',
        category: 'dairy',
        quantity: 0.5,
        purchaseDate: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000),
        expirationDate: new Date(today.getTime() + 25 * 24 * 60 * 60 * 1000), // 25 days from now
        notes: 'Sharp cheddar'
      },
      {
        userId: demoUser._id,
        itemName: 'Bananas',
        category: 'fruit',
        quantity: 5,
        purchaseDate: today,
        expirationDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        notes: 'Organic'
      },
      {
        userId: demoUser._id,
        itemName: 'Ground Beef',
        category: 'protein',
        quantity: 1,
        purchaseDate: today,
        expirationDate: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        notes: 'Cook tonight or freeze'
      },
      {
        userId: demoUser._id,
        itemName: 'Lettuce',
        category: 'vegetable',
        quantity: 1,
        purchaseDate: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
        expirationDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        notes: 'Romaine lettuce'
      },
      {
        userId: demoUser._id,
        itemName: 'Eggs',
        category: 'protein',
        quantity: 12,
        purchaseDate: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000),
        expirationDate: new Date(today.getTime() + 18 * 24 * 60 * 60 * 1000), // 18 days from now
        notes: 'Free range eggs'
      },
      {
        userId: demoUser._id,
        itemName: 'Strawberries',
        category: 'fruit',
        quantity: 2,
        purchaseDate: today,
        expirationDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        notes: 'Very fresh, use soon'
      },
      {
        userId: demoUser._id,
        itemName: 'Rice',
        category: 'grain',
        quantity: 5,
        purchaseDate: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000),
        expirationDate: new Date(today.getTime() + 170 * 24 * 60 * 60 * 1000), // 170 days from now
        notes: 'Brown rice'
      }
    ];

    await InventoryItem.insertMany(sampleInventory);
    console.log(`✅ Inserted ${sampleInventory.length} inventory items for demo user`);
    await InventoryItem.insertMany(sampleInventory);
    console.log(`✅ Inserted ${sampleInventory.length} inventory items for demo user`);

    console.log('🎉 Database seeded successfully!');
    console.log('📧 Login credentials:');
    console.log('   demo@example.com / demo123');
    console.log('   test@example.com / Test@123');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
