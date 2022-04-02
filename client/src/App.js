import React from 'react';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import Profile from './components/Profile/Profile';
import Home from './screens/Home/Home';
import PostVehicle from './screens/PostVehicle/PostVehicle';

class App extends React.Component {
    render() {
        return (
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/add-vehicle" element={<PostVehicle />} />
                    <Route path="/profile" element={<Profile />} />
                </Routes>
            </BrowserRouter>
        )
    }
}

export default App;