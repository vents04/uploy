import React from 'react';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import Book from './screens/Book/Book';
import Profile from './components/Profile/Profile';
import Home from './screens/Home/Home';
import PostVehicle from './screens/PostVehicle/PostVehicle';
import Search from './screens/Search/Search';
import Ride from './screens/Ride/Ride';

class App extends React.Component {
    render() {
        return (
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/add-vehicle" element={<PostVehicle />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/book" element={<Book />} />
                    <Route path="/ride" element={<Ride />} />
                </Routes>
            </BrowserRouter>
        )
    }
}

export default App;