const { MongoClient } = require('mongodb');
const bcryptjs = require('bcryptjs');
const { ObjectId } = require('mongodb');
const dns = require('dns');

dns.setServers([
  '8.8.8.8',   
  '8.8.4.4'
]);



async function seedDatabase() {
  // Use environment variable or fallback to hardcoded value
  // Declare the password separately

// Use environment variable or fallback to hardcoded value for static export
const password = 'LlnNytZ7Idoy4Aeu';

const MONGODB_URI = `mongodb+srv://labengherbia:${password}@cluster0.hnu75.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

  console.log('Connecting to MongoDB...');
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // Check if data already exists
    const usersCount = await db.collection("users").countDocuments();
    const lotsCount = await db.collection("lots").countDocuments();
    
    if (usersCount > 0 || lotsCount > 0) {
      console.log('Database already seeded');
      return;
    }
    
    // Create default lots
    console.log('Creating default lots...');
    const defaultLots = [
      { name: "Carrelage", isDefault: true, createdAt: new Date() },
      { name: "Menuiserie", isDefault: true, createdAt: new Date() },
      { name: "Peinture", isDefault: true, createdAt: new Date() },
      { name: "TCE", isDefault: true, createdAt: new Date() }
    ];
    
    await db.collection("lots").insertMany(defaultLots);
    
    // Create default admin user
    console.log('Creating default admin user...');
    const adminPassword = await bcryptjs.hash("admin123", 10);
    
    await db.collection("users").insertOne({
      name: "Admin User",
      email: "admin@hbtrack.com",
      password: adminPassword,
      role: "ingenieur",
      lot: "TCE",
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Create sample users
    console.log('Creating sample users...');
    const sampleUsers = [
      {
        name: "Jean Dupont",
        email: "jean@hbtrack.com",
        password: await bcryptjs.hash("password123", 10),
        role: "chef_chantier",
        lot: "TCE",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Marie Martin",
        email: "marie@hbtrack.com",
        password: await bcryptjs.hash("password123", 10),
        role: "conducteur",
        lot: "TCE",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Pierre Carreleur",
        email: "pierre@hbtrack.com",
        password: await bcryptjs.hash("password123", 10),
        role: "ouvrier",
        lot: "Carrelage",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Sophie Menuisier",
        email: "sophie@hbtrack.com",
        password: await bcryptjs.hash("password123", 10),
        role: "sous_traitant",
        lot: "Menuiserie",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    await db.collection("users").insertMany(sampleUsers);
    
    // Create sample tasks
    console.log('Creating sample tasks...');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const sampleTasks = [
      {
        title: "Pose de carrelage salle de bain",
        description: "Poser le carrelage dans la salle de bain du 2ème étage",
        lot: "Carrelage",
        createdBy: "admin@hbtrack.com",
        createdAt: yesterday,
        scheduledDate: today,
        status: "pending",
        comments: [],
        updatedAt: yesterday
      },
      {
        title: "Installation des portes",
        description: "Installer les portes intérieures du 1er étage",
        lot: "Menuiserie",
        createdBy: "admin@hbtrack.com",
        createdAt: yesterday,
        scheduledDate: today,
        status: "done",
        comments: [
          {
            _id: new ObjectId(),
            taskId: "task2",
            userId: "sophie@hbtrack.com",
            userName: "Sophie Menuisier",
            text: "Toutes les portes ont été installées",
            createdAt: today
          }
        ],
        updatedAt: today
      },
      {
        title: "Peinture des murs du salon",
        description: "Appliquer la première couche de peinture sur les murs du salon",
        lot: "Peinture",
        createdBy: "jean@hbtrack.com",
        createdAt: yesterday,
        scheduledDate: today,
        status: "not_done",
        comments: [
          {
            _id: new ObjectId(),
            taskId: "task3",
            userId: "jean@hbtrack.com",
            userName: "Jean Dupont",
            text: "Retard de livraison de la peinture",
            createdAt: today
          }
        ],
        updatedAt: today
      },
      {
        title: "Inspection générale",
        description: "Inspection générale du chantier avant la visite du client",
        lot: "TCE",
        createdBy: "admin@hbtrack.com",
        createdAt: today,
        scheduledDate: tomorrow,
        status: "pending",
        comments: [],
        updatedAt: today
      }
    ];
    
    await db.collection("tasks").insertMany(sampleTasks);
    
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

seedDatabase();