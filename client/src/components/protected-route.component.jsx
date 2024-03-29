import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';

import { showLoader, hideLoader } from '../redux/loaderSlice';
import { setAllUsers, setUser, setAllChats } from '../redux/userSlice';
import { getAllUsers, getCurrentUser } from '../api-calls/users';
import { getAllChats } from '../api-calls/chats';

const socket = io(process.env.SOCKET_IO_SERVER_URL);

const ProtectedRoute = ({ children }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { user } = useSelector((state) => state.userReducer);

    const fetchCurrentUser = async () => {
        try {
            // NOTE: showLoader() will create an action for you with type and payload
            // technically you are distaching an action
            dispatch(showLoader());
            const response = await getCurrentUser();
            const allUsersResponse = await getAllUsers();
            const allChatsResponse = await getAllChats();
            dispatch(hideLoader());
            if (response.success) {
                dispatch(setUser(response.data));
                dispatch(setAllUsers(allUsersResponse.data));
                dispatch(setAllChats(allChatsResponse.data));
            } else {
                toast.error(response.message);
                localStorage.removeItem('token');
                navigate('/login');
            }
        } catch (error) {
            dispatch(hideLoader());
            toast.error(error.message);
            localStorage.removeItem('token');
            navigate('/login');
        }
    };

    useEffect(() => {
        if (localStorage.getItem('token')) {
            fetchCurrentUser();
        } else {
            localStorage.removeItem('token');
            navigate('/login');
        }
    }, []);

    return (
        <div className='h-screen w-screen bg-gray-100 p-2'>
            {/** header */}
            <div className='flex justify-between p-5 bg-primary rounded'>
                <div className='flex items-center gap-1'>
                    <i className='ri-message-3-line text-2xl text-white'></i>
                    <h1 className='text-white text-2xl uppercase font-semibold cursor-pointer' onClick={() => navigate('/')}>
                        SHEYCHAT
                    </h1>
                </div>
                <div className='flex gap-2 text-md items-center bg-white p-2 rounded'>
                    {user?.profilePic && <img src={user?.profilePic} alt='profile pic' className='h-8 w-8 rounded-full object-cover' />}
                    {!user?.profilePic && <i className='ri-shield-user-line text-primary'></i>}

                    <h1 className='underline text-primary cursor-pointer' onClick={() => navigate('/profile')}>
                        {user?.name}
                    </h1>
                    <i
                        className='ri-logout-circle-r-line ml-5 text-xl cursor-pointer text-primary'
                        onClick={() => {
                            socket.emit('went-offline', user._id);
                            localStorage.removeItem('token');
                            navigate('/login');
                        }}></i>
                </div>
            </div>
            {/** content (pages) */}
            <div className='py-5'>{children}</div>
        </div>
    );
};

export default ProtectedRoute;
