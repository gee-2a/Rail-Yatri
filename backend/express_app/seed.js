const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Train = require('./models/Train');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to DB. Seeding trains...');
    
    await Train.deleteMany({});
    console.log('Cleared out old trains.');

    const trainData = [];
    const cities = ["New Delhi", "Mumbai", "Kolkata", "Chennai", "Bangalore", "Hyderabad", "Pune", "Ahmedabad", "Jaipur", "Lucknow", "Patna", "Bhopal", "Agra", "Varanasi"];
    const types = ["Rajdhani Express", "Shatabdi Express", "Vande Bharat", "Duronto Express", "Garib Rath", "Sampark Kranti", "Jan Shatabdi", "Superfast Express"];
    
    for (let i = 1; i <= 30; i++) {
        let srcIdx = Math.floor(Math.random() * cities.length);
        let destIdx = Math.floor(Math.random() * cities.length);
        while (srcIdx === destIdx) destIdx = Math.floor(Math.random() * cities.length);
        
        let type = types[Math.floor(Math.random() * types.length)];
        let dept = new Date(Date.now() + Math.random() * 7 * 86400000); 
        let arr = new Date(dept.getTime() + (Math.random() * 20 + 4) * 3600000); 
        
        let fixedTotalSeats = 388;
        let basePrice = Math.floor(Math.random() * 8) * 100 + 300; // Random price between ₹300 and ₹1000
        
        trainData.push({
            name: `${type}`,
            number: Math.floor(10000 + Math.random() * 89999).toString(),
            source: cities[srcIdx],
            destination: cities[destIdx],
            departureTime: dept,
            arrivalTime: arr,
            totalSeats: fixedTotalSeats,
            availableSeats: fixedTotalSeats,
            basePrice: basePrice
        });
    }

    await Train.insertMany(trainData);
    console.log('30 Trains (With Dynamic Pricing) successfully seeded!');
    process.exit();
  })
  .catch(err => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });
