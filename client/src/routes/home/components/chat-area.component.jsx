import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import store from '../../../redux/store';

import { ShowLoader, HideLoader } from '../../../redux/loaderSlice';
import { SetAllChats } from '../../../redux/userSlice';
import { sendMessage, GetMessages } from '../../../api-calls/messages';
import { ClearChatMessages } from '../../../api-calls/chats';

const ChatArea = ({ socket }) => {
    const dispatch = useDispatch();
    const [isRecipientTyping, setIsRecipientTyping] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const { selectedChat, user, allChats } = useSelector((state) => state.userReducer);
    const [messages = [], setMessages] = useState([]);
    const recipientUser = selectedChat.members.find((mem) => mem._id !== user._id);

    const sendNewMessage = async () => {
        try {
            const message = {
                chat: selectedChat._id,
                sender: user._id,
                text: newMessage
            };
            console.log('SF - selectedChat', selectedChat);

            // send message to server using socket
            socket.emit('send-message', {
                ...message,
                members: selectedChat.members.map((mem) => mem._id),
                createdAt: moment(selectedChat.createdAt).format('DD-MM-YYYY hh:mm:ss'),
                read: false
            });

            // send message to server to store into the DB
            const response = await sendMessage(message);

            if (response.success) {
                setNewMessage('');
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const clearUnreadMessages = async () => {
        try {
            socket.emit('clear-unread-messages', {
                chat: selectedChat._id,
                members: selectedChat.members.map((mem) => mem._id)
            });

            const response = await ClearChatMessages(selectedChat._id);

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
            dispatch(HideLoader());
            toast.error(error.message);
        }
    };

    useEffect(() => {
        getMessages();

        if (selectedChat?.lastMessage?.sender !== user._id) {
            clearUnreadMessages();
        }

        // receive message from server using socket
        // reason for the .off().on() was to fix issue where multiple messages were being received and printed
        socket.off('receive-message').on('receive-message', (message) => {
            const tempSelectedChat = store.getState().userReducer.selectedChat;

            // reason for the if statement is to fix issue where messages were being sent to everyone....
            // only send to the matching chat
            if (tempSelectedChat._id === message.chat) {
                setMessages((prev) => [...prev, message]);
            }

            // reason for the if statement is to fix issue where reciever has chat opened, but still getting unread notification
            // if selectedCat is equal to message.chat and is not the sender
            if (tempSelectedChat._id === message.chat && message.sender !== user._id) {
                clearUnreadMessages();
            }
        });

        // clear unread messages from server using socket
        socket.on('unread-messages-cleared', (data) => {
            const tempAllChats = store.getState().userReducer.allChats;
            const tempSelectedChat = store.getState().userReducer.selectedChat;

            if (data.chat === tempSelectedChat._id) {
                // update unread messages count in selected chat
                const updatedChats = tempAllChats.map((chat) => {
                    if (chat._id === data.chat) {
                        return {
                            ...chat,
                            unreadMessages: 0
                        };
                    }
                    return chat;
                });
                dispatch(SetAllChats(updatedChats));

                // set all messages as read
                // ------ keep in mind, we cannot access state in socket.io ------
                // const updatedMessages = messages.map((message) => {
                //     return {
                //         ...message,
                //         read: true
                //     };
                // });
                // setMessages(updatedMessages);

                // has to be written like this to get the previous state
                setMessages((prev) => {
                    return prev.map((message) => {
                        return {
                            ...message,
                            read: true
                        };
                    });
                });
            }
        });

        // recipient typing
        socket.on('started-typing', (data) => {
            const selectedChat = store.getState().userReducer.selectedChat;

            if (data.chat === selectedChat._id && data.sender !== user._id) {
                setIsRecipientTyping(true);
            }

            setTimeout(() => {
                setIsRecipientTyping(false);
            }, 1500);
        });
    }, [selectedChat]);

    useEffect(() => {
        // always scroll to bottom for messages id
        const messagesContainer = document.getElementById('messages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, [messages, isRecipientTyping]);

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
            <div className='h-[55vh] overflow-y-scroll p-5' id='messages'>
                <div className='flex flex-col gap-2'>
                    {messages.map((message) => {
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
                    {isRecipientTyping && <h1 className='bg-blue-100 text-primary p-2 rounded-xl w-max'>typing...</h1>}
                </div>
            </div>
            {/** 3rd part chat input */}
            <div>
                <div className='h-18 rounded-xl border-gray-300 shadow border flex justify-between p-2 items-center'>
                    <input
                        type='text'
                        value={newMessage}
                        onChange={(e) => {
                            setNewMessage(e.target.value);
                            socket.emit('typing', {
                                chat: selectedChat._id,
                                members: selectedChat.members.map((mem) => mem._id),
                                sender: user._id
                            });
                        }}
                        placeholder='Type a message'
                        className='w-[90%] border-0 h-full rounded-xl focus:border-none'
                    />
                    <button className='bg-primary text-white py-1 px-5 rounded h-max' onClick={sendNewMessage}>
                        <i className='ri-send-plane-2-line text-white'></i>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatArea;
