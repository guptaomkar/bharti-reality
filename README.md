# HAVEN - Premium Real Estate Platform

HAVEN is a modern, premium real estate web application built with the MERN stack (MongoDB, Express.js, React, Node.js) and Prisma. Designed with a cinematic "dark obsidian and gold" aesthetic, HAVEN provides an immersive platform for users to search, list, book, and explore exclusive properties. The application offers a sophisticated, glass-morphism interface, advanced search capabilities, and a seamless user experience.

> **Note**: *Add your new HAVEN aesthetic screenshots here.*
> 
> *Placeholder for Hero Section Screenshot*
> `![HAVEN Hero Section](./screenshots/hero-dark.png)`

## Features

- **Premium Property Listings**: View an exclusive range of property listings with comprehensive details, including descriptions, prices, high-quality images, and unique selling points.
- **Advanced Search**: Customize your property search by type (rent/sale), amenities, sorting options, and more, all navigated through a sleek, modern UI.
- **User Profiles**: Registered users can securely create and manage their profiles, keeping track of their listings and preferences.
- **Authentication**: Secure user registration and seamless login functionality (powered by Auth0).
- **Schedule a Visit**: Select preferred dates to book exclusive on-site property visits.
- **Interactive Maps & Location Information**: Integrated maps (Leaflet/Esri) provide crucial location data, showing properties, nearby amenities, and transportation options to help users make informed decisions.
- **Favorites Collection**: Effortlessly curate and manage a collection of your favorite properties.

> *Placeholder for Map View Screenshot*
> `![HAVEN Map View](./screenshots/map-dark.png)`

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Ananya01Agrawal/Real-estate-Booking-Website.git
   ```

2. Change into the project directory:
   ```bash
   cd Real-estate-Booking-Website
   ```

3. Install server dependencies and start the backend:
   ```bash
   cd server
   npm install
   ```

4. Install client dependencies:
   ```bash
   cd ../client
   npm install
   ```

5. Create `.env` files.
   
   **In the `server` directory (e.g., `server/.env`):**
   ```env
   PORT=8000
   DATABASE_URL="YOUR_MONGODB_URI"
   # Add your Auth0 backend configuration if applicable
   ```

   **In the `client` directory (e.g., `client/.env.local`):**
   ```env
   VITE_API_URL=http://localhost:8000
   # VITE_AUTH0_DOMAIN="..."
   # VITE_AUTH0_CLIENT_ID="..."
   ```

6. Start the development servers:

   **Backend (Haven Aesthetic Server):**
   ```bash
   cd server
   npm run haven:dev
   ```

   **Frontend:**
   ```bash
   cd client
   npm run dev
   ```

## Usage

- Explore curated property listings, use the advanced search functionality, and create a user profile to unlock booking features and property management.

## Contributing

Contributions are welcome! Please follow these steps to contribute:

1. Fork the repository.
2. Create a new branch for your feature or bug fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes and commit them:
   ```bash
   git commit -m "Your commit message here"
   ```
4. Push your changes to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Create a pull request to the main repository.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

## Contact

- [GitHub](https://github.com/guptaomkar)
- [LinkedIn](https://www.linkedin.com/in/omkargupta0/)
