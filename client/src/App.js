import React from 'react';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import Home from './screens/Home/Home';
import PostVehicle from './screens/PostVehicle/PostVehicle';

class App extends React.Component {
    render() {
        return (
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/add-vehicle" element={<PostVehicle />} />
                </Routes>
            </BrowserRouter>
        )
    }
}

export default App;