# Uploy - P2P Car Sharing Platform

Uploy is a peer-to-peer car sharing platform that connects car owners with people who need to rent vehicles. The platform enables car owners to monetize their underutilized vehicles while providing renters with convenient access to a variety of cars at competitive prices.

> 🏆 **Award-Winning Project**: This project won the National Olympiad of Information Technologies in 2021! Note that the frontend code is not included in this repository.

## Features

- **User Authentication**: Secure sign-up and login system
- **Vehicle Management**: Car owners can list their vehicles with detailed information
- **Search & Filters**: Users can search for available vehicles with various filters
- **Booking System**: Seamless booking process with date and time selection
- **Payment Integration**: Secure payment processing via Stripe
- **Reviews & Ratings**: Users can review and rate their rental experiences
- **Smart Car Integration**: Connect with vehicle APIs for remote access
- **Driver License Verification**: Safety verification of driver licenses
- **Real-time Notifications**: Updates on booking status and communications
- **Interactive Maps**: Location-based searching and navigation

## Tech Stack

### Backend
- **Node.js** with **Express.js** framework
- **MongoDB** database
- **Socket.io** for real-time communication
- **JWT** for authentication
- **Stripe** for payment processing
- **Smartcar API** integration
- Third-party services: Google Maps, validation libraries

### Frontend
- **React.js** for UI components
- **React Router** for navigation
- **Axios** for API requests
- **SASS** for styling
- **Webpack** for bundling
- Various UI components: date pickers, carousels, etc.

## Getting Started

### Prerequisites
- Node.js (v14+)
- npm or yarn
- MongoDB

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/uploy.git
   cd uploy
   ```

2. Install server dependencies
   ```
   cd server
   npm install
   ```

3. Set up environment variables (create .env files based on provided examples)

4. Start the server
   ```
   cd ../server
   npm start
   ```

5. Open your browser and navigate to `http://localhost:${process.env.PORT}`

## Project Structure

- `client/`: Frontend React application
  - `src/`: Source code
    - `components/`: Reusable UI components
    - `screens/`: Main application screens
    - `classes/`: Class definitions
- `server/`: Backend Express API
  - `routes/`: API endpoints
  - `services/`: Business logic
  - `middlewares/`: Express middlewares
  - `db/`: Database models and connection
  - `validation/`: Input validation schemas
  - `errors/`: Error handling