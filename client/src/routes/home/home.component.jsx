import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';

import UserSearch from './components/users-search.component';
import ChatArea from './components/chat-area.component';
import UsersList from './components/users-list.component';

// moved to be global, because it did not work inside the "Home" arrow function
const socket = io(process.env.SOCKET_IO_SERVER_URL);

const Home = () => {
    const [searchKey, setSearchKey] = useState('');
    const { selectedChat, user } = useSelector((state) => state.userReducer);
    const [onlineUsers, setOnlineUsers] = useState([]);

    useEffect(() => {
        // (eventName, data, callback)
        if (user) {
            socket.emit('join-room', user._id);
            socket.emit('came-online', user._id);

            socket.on('online-users-updated', (users) => {
                setOnlineUsers(users);
            });
        }
    }, [user]);

    return (
        <div className='flex gap-5'>
            <div className='w-96 '>
                <UserSearch searchKey={searchKey} setSearchKey={setSearchKey} />
                <UsersList searchKey={searchKey} socket={socket} onlineUsers={onlineUsers} setSearchKey={setSearchKey} />
            </div>
            {selectedChat && (
                <div className='w-full'>
                    <ChatArea socket={socket} />
                </div>
            )}
            {!selectedChat && (
                <div className='w-full h-[80vh] items-center justify-center flex bg-white flex-col'>
                    <img src='https://www.pngmart.com/files/16/Speech-Chat-Icon-Transparent-PNG.png' alt='' className='w-96 h-96' />
                    <h1 className='text-2xl font-semibold text-gray-500'>Select a user to chat</h1>
                </div>
            )}
        </div>
    );
};

export default Home;
