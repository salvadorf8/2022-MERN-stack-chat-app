import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import moment from 'moment';

import { ShowLoader, HideLoader } from '../../../redux/loaderSlice';
import { SetAllChats, SetSelectedChat } from '../../../redux/userSlice';
import { createNewChat, getAllChats } from '../../../api-calls/chats';
import store from '../../../redux/store';

const UsersList = ({ searchKey, socket, onlineUsers, setSearchKey }) => {
    const dispatch = useDispatch();
    const { allUsers, allChats, user, selectedChat } = useSelector((state) => state.userReducer);

    const handleCreateNewChat = async (recipientUserId) => {
        try {
            dispatch(ShowLoader());
            const response = await createNewChat([user._id, recipientUserId]);
            dispatch(HideLoader());
            if (response.success) {
                toast.success(response.message);
                const newChat = response.data;
                const updatedChats = [...allChats, newChat];
                dispatch(SetAllChats(updatedChats));
                dispatch(SetSelectedChat(newChat));
                setSearchKey('');
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            dispatch(HideLoader());
            toast.error(error.message);
        }
    };

    const handleOpenChat = (recipientUserId) => {
        const chat = allChats.find((chat) => chat.members.map((mem) => mem._id).includes(user._id) && chat.members.map((mem) => mem._id).includes(recipientUserId));

        if (chat) {
            dispatch(SetSelectedChat(chat));
        }
    };

    const getData = () => {
        try {
            // if search key is empty then return all chats else return filtered chats and users
            if (searchKey === '') {
                return allChats || [];
            }

            return allUsers.filter((user) => user.name.toLowerCase().includes(searchKey.toLowerCase()) || []);
        } catch (error) {
            return [];
        }
    };

    const getIsSelectedChatOrNot = (userObj) => {
        if (selectedChat) {
            return selectedChat.members.map((mem) => mem._id).includes(userObj._id);
        }

        return false;
    };

    const getUnreadMessages = (userObj) => {
        const chat = allChats.find((chat) => chat.members.map((mem) => mem._id).includes(userObj._id));

        if (chat && chat?.unreadMessages && chat?.lastMessage?.sender !== user._id) {
            return <div className='bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>{chat?.unreadMessages}</div>;
        }
    };

    const getDateInRegularFormat = (date) => {
        let result = '';

        // if date is today then return time in hh:mm format
        if (moment(date).isSame(moment(), 'day')) {
            result = moment(date).format('hh:mm');
        }

        // if date is yesterday return yesterday and time in hh:mm format
        else if (moment(date).isSame(moment().subtract(1, 'day'), 'day')) {
            result = `Yesterday ${moment(date).format('hh:mm')}`;
        }

        // if date is this year return date and time in MMM DD hh:mm
        else if (moment(date).isSame(moment(), 'year')) {
            result = moment(date).format('MMM DD hh:mm');
        }

        return result;
    };

    const getLastMessage = (userObj) => {
        const chat = allChats.find((chat) => chat.members.map((mem) => mem._id).includes(userObj._id));

        if (!chat || !chat.lastMessage) {
            return '';
        } else {
            const lastMessagePerson = chat?.lastMessage?.sender === user._id ? 'You : ' : '';

            return (
                <div className='flex justify-between w-72'>
                    <h1 className='text-gray-600 text-sm'>
                        {lastMessagePerson}
                        {chat?.lastMessage?.text}
                    </h1>
                    <h1 className='text-gray-500 text-sm'>{getDateInRegularFormat(chat?.lastMessage?.createdAt)}</h1>
                </div>
            );
        }
    };

    /**
     * SF - NOTE:
     * unreadMessages: chat.unreadMessages + 1
     *
     * below means, if chat is not there, then use 0, if there, then +1
     * unreadMessages: (chat?.unreadMessage || 0) +1
     */

    useEffect(() => {
        socket.on('update-chat-list-with-received-message', async (message) => {
            // if the chat area opened is not equal to chat in message,
            // then increase unread messages by 1 and update last message
            const tempSelectedChat = store.getState().userReducer.selectedChat;
            let tempAllChats = store.getState().userReducer.allChats;

            // if user signed in but has not started no chats yet.
            if (!tempAllChats.length) {
                tempAllChats = await getAllChats();
                dispatch(SetAllChats(tempAllChats.data));
            }

            // if the received message is not part of a currently selected chat
            if (tempSelectedChat?._id !== message.chat) {
                // update the count and lastMessage until that chat is opened
                const updatedAllChats = tempAllChats.map((chat) => {
                    if (chat._id === message.chat) {
                        return {
                            ...chat,
                            unreadMessages: (chat?.unreadMessages || 0) + 1,
                            lastMessage: message,
                            updatedAt: message.createdAt
                        };
                    }
                    return chat;
                });
                tempAllChats = updatedAllChats;
            }
            // new logic to sort latest message on top
            const latestChat = tempAllChats.find((chat) => chat._id === message.chat);
            const otherChats = tempAllChats.filter((chat) => chat._id !== message.chat);

            tempAllChats = [latestChat, ...otherChats];

            dispatch(SetAllChats(tempAllChats));
        });
    }, []);

    return (
        <div className='flex flex-col gap-3 mt-5 lg:w-96 xl:w-96 md:w-60 sm:w-60'>
            {getData().map((chatObjOrUserObj) => {
                let userObj = chatObjOrUserObj;

                // if it has members, the its a chat object
                if (chatObjOrUserObj.members) {
                    userObj = chatObjOrUserObj.members.find((mem) => mem._id !== user._id);
                }

                return (
                    <div className={`shadow-sm border p-2 rounded-xl bg-white flex justify-between items-center cursor-pointer ${getIsSelectedChatOrNot(userObj) && 'border-primary border-2'} `} key={userObj._id} onClick={() => handleOpenChat(userObj._id)}>
                        <div className='flex gap-5 items-center'>
                            {userObj.profilePic && (
                                <div className='relative'>
                                    <img src={userObj.profilePic} alt='profile pic' className='rounded-full w-12 h-12' />
                                </div>
                            )}
                            {!userObj.profilePic && (
                                <div className='bg-gray-400 rounded-full h-12 w-12 flex items-center justify-center relative'>
                                    <h1 className='uppercase text-xl font-semibold text-white'>{userObj.name[0]}</h1>
                                </div>
                            )}
                            <div className='flex flex-col gap-1'>
                                <div className='flex gap-1'>
                                    <div className='flex gap-1 items-center'>
                                        <h1>{userObj.name}</h1>
                                        {onlineUsers.includes(userObj._id) && (
                                            <div>
                                                <div className='bg-green-700 h-3 w-3 rounded-full'></div>
                                            </div>
                                        )}
                                    </div>
                                    {getUnreadMessages(userObj)}
                                </div>
                                {getLastMessage(userObj)}
                            </div>
                        </div>
                        <div onClick={() => handleCreateNewChat(userObj._id)}>{!allChats.find((chat) => chat.members.map((mem) => mem._id).includes(userObj._id)) && <button className='border-primary border text-primary bg-white p-1 rounded'>Create Chat</button>}</div>
                    </div>
                );
            })}
        </div>
    );
};

export default UsersList;
