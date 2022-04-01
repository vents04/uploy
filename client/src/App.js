import React from 'react';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import Home from './screens/Home/Home';

class App extends React.Component {
    render() {
        return (
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                </Routes>
            </BrowserRouter>
        )
    }
}

export default App;