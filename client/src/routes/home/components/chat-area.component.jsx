import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';

import { ShowLoader, HideLoader } from '../../../redux/loaderSlice';
import { SetAllChats } from '../../../redux/userSlice';
import { sendMessage, GetMessages } from '../../../api-calls/messages';
import { ClearChatMessages } from '../../../api-calls/chats';

const ChatArea = () => {
    const dispatch = useDispatch();
    const [newMessage, setNewMessage] = useState('');
    const { selectedChat, user, allChats } = useSelector((state) => state.userReducer);
    const [messages = [], setMessages] = useState([]);
    const recipientUser = selectedChat.members.find((mem) => mem._id !== user._id);

    const sendNewMessage = async () => {
        try {
            dispatch(ShowLoader());
            const message = {
                chat: selectedChat._id,
                sender: user._id,
                text: newMessage
            };

            const response = await sendMessage(message);
            dispatch(HideLoader());
            if (response.success) {
                setNewMessage('');
            }
        } catch (error) {
            dispatch(HideLoader());
            toast.error(error.message);
        }
    };

    const clearUnreadMessages = async () => {
        try {
            dispatch(ShowLoader());
            const response = await ClearChatMessages(selectedChat._id);
            dispatch(HideLoader);
            if (response.success) {
                const updatedChats = allChats.map((chat) => {
                    if (chat._id === selectedChat._id) {
                        return response.data;
                    }

                    return chat;
                });

                dispatch(SetAllChats(updatedChats));
            }
        } catch (error) {
            dispatch(HideLoader);
            toast.error(error.message);
        }
    };

    const getMessages = async () => {
        try {
            dispatch(ShowLoader());
            const response = await GetMessages(selectedChat._id);

            dispatch(HideLoader());
            setMessages(response.data);
        } catch (error) {
            dispatch(ShowLoader());
            toast.error(error.message);
        }
    };

    useEffect(() => {
        getMessages();

        if (selectedChat?.lastMessage?.sender !== user._id) {
            clearUnreadMessages();
        }
    }, [selectedChat]);

    return (
        <div className='bg-white h-[82vh] border rounded-2xl w-full flex flex-col justify-between p-5'>
            {/** 1st part receipient user */}
            <div>
                <div className='flex gap-5 items-center mb-2'>
                    {recipientUser.profilePic && <img src={recipientUser.profilePic} alt='profile pic' className='w-10 h-10 rounded-full' />}
                    {!recipientUser.profilePic && (
                        <div className='bg-gray-400 rounded-full h-12 w-12 flex items-center justify-center relative'>
                            <h1 className='uppercase text-xl font-semibold text-white'>{recipientUser.name[0]}</h1>
                        </div>
                    )}
                    <h1 className='upperCase'>{recipientUser.name}</h1>
                </div>
                <hr />
            </div>

            {/** 2nd part chat messages */}
            <div className='h-[55vh] overflow-y-scroll p-5'>
                <div className='flex flex-col gap-2'>
                    {messages.map((message) => {
                        console.log('SF - wtf', message);
                        const isCurrentUserASender = message.sender === user._id;

                        return (
                            <div className={`flex ${isCurrentUserASender && 'justify-end'}`} key={message._id}>
                                <div className='flex flex-col gap-1'>
                                    <h1 className={`${isCurrentUserASender ? 'bg-primary text-white rounded-bl-none' : 'bg-gray-300 text-primary rounded-tr-none'} p-2 rounded-xl `}>{message.text}</h1>
                                    <h1 className='text-gray-500 text-sm '>{moment(message.createdAt).format('hh:mm A')}</h1>
                                </div>
                                {isCurrentUserASender && <i className={`ri-check-double-line text-lg p-1 ${message.read ? 'text-green-700' : 'text-gray-400'}`}></i>}
                            </div>
                        );
                    })}
                </div>
            </div>
            {/** 3rd part chat input */}
            <div>
                <div className='h-18 rounded-xl border-gray-300 shadow border flex justify-between p-2 items-center'>
                    <input type='text' value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder='Type a message' className='w-[90%] border-0 h-full rounded-xl focus:border-none' />
                    <button className='bg-primary text-white py-1 px-5 rounded h-max' onClick={sendNewMessage}>
                        <i className='ri-send-plane-2-line text-white'></i>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatArea;
