const allowedOrigins = [
  // Local development
   // Replace with your real frontend domain
  'https://safecoinspot-2.onrender.com' // Example if deployed on Render
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies, Authorization headers, etc.
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

module.exports = corsOptions;
