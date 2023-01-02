import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';

import UserSearch from './components/users-search.component';
import ChatArea from './components/chat-area.component';
import UsersList from './components/users-list.component';
// moved to be global, because it did not work inside the const Home
const socket = io('http://localhost:5000');

const Home = () => {
    const [searchKey, setSearchKey] = useState('');
    const { selectedChat, user } = useSelector((state) => state.userReducer);

    useEffect(() => {
        // (eventName, data, callback)
        if (user) {
            socket.emit('join-room', user._id);
        }
    }, [user]);

    return (
        <div className='flex gap-5'>
            <div className='w-96 '>
                <UserSearch searchKey={searchKey} setSearchKey={setSearchKey} />
                <UsersList searchKey={searchKey} />
            </div>
            <div className='w-full'>{selectedChat && <ChatArea socket={socket} />}</div>
        </div>
    );
};

export default Home;
