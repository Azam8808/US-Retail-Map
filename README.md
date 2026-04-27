# US Retail Locations Map - Full Stack Visualization

An interactive, high-performance web application designed to visualize over 150,000 retail locations across the United States. Built with a focus on efficient data handling and smooth user experience.

---

## 🌟 Key Features

- **Tiered Zoom Rendering**:
  - **Level 1 (Country View)**: Visualizes store density by state using real-time aggregation.
  - **Level 2 (Cluster View)**: Uses grid-based clustering to group nearby stores, keeping the UI clean.
  - **Level 3 (Street View)**: Displays individual store pins with detailed info windows (Brand, Status, Type, etc.).
- **Dynamic Viewport Loading**: Optimized API that only fetches data within the user's current map bounds.
- **Advanced Filtering**: Filter by Brand Initial, State, or Status (Open/Closed) with auto-refresh.
- **Modern UI**: Dark-themed map with a blur-effect (Glassmorphism) dashboard.

---

## 🛠️ Tech Stack

### Frontend
- **React**: Modern component-based UI.
- **Leaflet**: Open-source mapping library (Free, no API key required).
- **Lucide Icons**: Premium vector icons.
- **Axios**: For reliable API communication.

### Backend
- **Node.js & Express**: Scalable server architecture.
- **PostgreSQL**: Robust database for complex spatial queries.
- **dotenv**: Secure environment variable management.

---

## 🚀 Getting Started

### 1. Database Configuration
1. Create a PostgreSQL database (e.g., `retail_db`).
2. Copy `backend/.env.example` to `backend/.env` and fill in your credentials.
3. Initialize the schema and seed sample data:
   ```bash
   cd backend
   node init_db.js
   node seed_db.js
   ```

### 2. Installation & Running

#### Backend
```bash
cd backend
npm install
npm start
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 📁 Project Structure

```text
/backend
├── routes/          # API Route handlers
├── services/        # Database & Business logic (MVC pattern)
├── init_db.js       # Database schema initialization
├── seed_db.js       # Data seeding script
└── server.js        # Main entry point

/frontend
├── src/
│   ├── App.tsx      # Main Map logic
│   └── App.css      # Custom Styles
└── .env.example     # Frontend environment template
```

---

## ⚡ Performance Highlights
- **Server-side Aggregation**: Calculations are performed in the database for maximum speed.
- **Debounced Fetching**: Prevents excessive API calls during map movement.
- **Index-Optimized Queries**: Uses PostgreSQL indexes on Latitude/Longitude for sub-500ms responses.

---

## 📝 License
This project is for educational purposes. 
