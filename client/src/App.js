import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useSelector } from 'react-redux';

import Loader from './components/loader.component';
import ProtectedRoute from './components/protected-route.component';
import Home from './routes/home/home.component';
import Login from './routes/login/login.component';
import Register from './routes/register/register.component';

const App = () => {
    const { loader } = useSelector((state) => state.loaderReducer);

    return (
        <div>
            <Toaster position='top-center' reverseOrder={false} />
            {loader && <Loader />}
            <BrowserRouter>
                <Routes>
                    <Route
                        path='/'
                        element={
                            <ProtectedRoute>
                                <Home />
                            </ProtectedRoute>
                        }
                    />
                    <Route path='/login' element={<Login />} />
                    <Route path='/register' element={<Register />} />
                </Routes>
            </BrowserRouter>
        </div>
    );
};

export default App;
