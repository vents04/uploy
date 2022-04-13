import React from 'react';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import Book from './screens/Book/Book';
import Home from './screens/Home/Home';
import PostVehicle from './screens/PostVehicle/PostVehicle';
import Search from './screens/Search/Search';
import Ride from './screens/Ride/Ride';
import Rides from './screens/Rides/Rides';
import Vehicles from './screens/Vehicles/Vehicles';
import Profile from './screens/Profile/Profile';

class App extends React.Component {
    render() {
        return (
            <BrowserRouter >
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/add-vehicle" element={<PostVehicle />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/book" element={<Book />} />
                    <Route path="/ride" element={<Ride />} />
                    <Route path="/rides" element={<Rides />} />
                    <Route path="/vehicles" element={<Vehicles />} />
                    <Route path="/profile" element={<Profile />} />
                </Routes>
            </BrowserRouter>
        )
    }
}

export default App;