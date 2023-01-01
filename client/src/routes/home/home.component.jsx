import { useState } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';

import UserSearch from './components/users-search.component';
import ChatArea from './components/chat-area.component';
import UsersList from './components/users-list.component';

const Home = () => {
    const socket = io('http://localhost:5000');
    const [searchKey, setSearchKey] = useState('');
    const { selectedChat } = useSelector((state) => state.userReducer);

    return (
        <div className='flex gap-5'>
            <div className='w-96 '>
                <UserSearch searchKey={searchKey} setSearchKey={setSearchKey} />
                <UsersList searchKey={searchKey} />
            </div>
            <div className='w-full'>{selectedChat && <ChatArea />}</div>
        </div>
    );
};

export default Home;
