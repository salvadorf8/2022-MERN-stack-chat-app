import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

import { showLoader, hideLoader } from '../../redux/loaderSlice';
import { loginUser } from '../../api-calls/users';

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [user, setUser] = useState({
        email: '',
        password: ''
    });

    const login = async () => {
        try {
            dispatch(showLoader());
            const response = await loginUser(user);
            dispatch(hideLoader());
            if (response.success) {
                toast.success(response.message);
                localStorage.setItem('token', response.data);
                window.location.href = '/';
                // navigate('/');
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            dispatch(hideLoader());
            toast.error(error.message);
        }
    };

    useEffect(() => {
        if (localStorage.getItem('token')) {
            navigate('/');
        }
    }, []);

    return (
        <div className='h-screen bg-primary flex items-center justify-center'>
            <div className='bg-white shadow-md p-5 flex flex-col gap-5 w-96'>
                <div className='flex gap-2'>
                    <i className='ri-message-3-line text-2xl text-primary'></i>
                    <h1 className='text-2xl uppercase font-semibold text-primary'>SheyChat Login</h1>
                </div>
                <hr />
                <input type='email' value={user.email} onChange={(e) => setUser({ ...user, email: e.target.value })} placeholder='Enter your email' />
                <input type='password' value={user.password} onChange={(e) => setUser({ ...user, password: e.target.value })} placeholder='Enter your password' />
                <button className={user.email && user.password ? 'contained-btn' : 'disabled-btn'} onClick={login}>
                    Login
                </button>

                <Link className='underline' to='/register'>
                    Don't have an account? Register
                </Link>
            </div>
        </div>
    );
};

export default Login;
