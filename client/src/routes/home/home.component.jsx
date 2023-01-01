import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';

import UserSearch from './components/users-search.component';
import ChatArea from './components/chat-area.component';
import UsersList from './components/users-list.component';

const Home = () => {
    const socket = io('http://localhost:5000');
    const [searchKey, setSearchKey] = useState('');
    const { selectedChat, user } = useSelector((state) => state.userReducer);

    /**
     * Task
     * 1. Send hi message from one to all users
     * 2. Send hi message from one to one other
     */
    useEffect(() => {
        // (eventName, data, callback)
        if (user) {
            socket.emit('join-room', user._id);

            // send new message to recipient (bob)
            socket.emit('send-message', { text: 'Hi Bob, this is from John', sender: user._id, recipient: '639e5b37c8b659eb1cfd8999' });

            socket.on('receive-message', (data) => {
                console.log('SF - data', data);
            });
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
