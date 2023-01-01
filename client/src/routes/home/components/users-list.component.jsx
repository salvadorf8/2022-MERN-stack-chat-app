import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import moment from 'moment';

import { ShowLoader, HideLoader } from '../../../redux/loaderSlice';
import { SetAllChats, SetSelectedChat } from '../../../redux/userSlice';
import { createNewChat } from '../../../api-calls/chats';

const UsersList = ({ searchKey }) => {
    const dispatch = useDispatch();
    const { allUsers, allChats, user, selectedChat } = useSelector((state) => state.userReducer);

    const handleOnClickCreateChat = async (recipientUserId) => {
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
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            dispatch(HideLoader());
            toast.error(error.message);
        }
    };

    const handleOnClickOpenChat = (recipientUserId) => {
        const chat = allChats.find((chat) => chat.members.map((mem) => mem._id).includes(user._id) && chat.members.map((mem) => mem._id).includes(recipientUserId));
        if (chat) {
            dispatch(SetSelectedChat(chat));
        }
    };

    const getData = () => {
        // if search key is empty then return all chats else return filtered chats and users
        if (searchKey === '') {
            return allChats;
        }

        return allUsers.filter((user) => user.name.toLowerCase().includes(searchKey.toLowerCase()));
    };

    const getIsSelectedChatOrNot = (userObj) => {
        if (selectedChat) {
            return selectedChat.members.map((mem) => mem._id).includes(userObj._id);
        }

        return false;
    };

    const getUnreadMessages = (userObj) => {
        const chat = allChats.find((chat) => chat.members.map((mem) => mem._id).includes(userObj._id));

        if (chat && chat?.unreadMessages && chat?.lastMessage.sender !== user._id) {
            return <div className='bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>{chat?.unreadMessages}</div>;
        }
    };

    const getLastMessage = (userObj) => {
        const chat = allChats.find((chat) => chat.members.map((member) => member._id).includes(userObj._id));

        if (!chat || !chat.lastMessage) {
            return '';
        } else {
            const lastMessagePerson = chat?.lastMessage?.sender === user._id ? 'You : ' : '';
            return (
                <div className='flex justify-between w-72'>
                    <h1 className='text-gray-500 text-sm'>
                        {lastMessagePerson}
                        {chat?.lastMessage?.text}
                    </h1>
                    <h1 className='text-gray-500 text-sm'>{moment(chat?.lastMessage?.createdAt).format('hh:mm A')}</h1>
                </div>
            );
        }
    };

    return (
        <div className='flex flex-col gap-3 mt-5 lg:w-96 xl:w-96 md:w-60 sm:w-60'>
            {getData().map((chatObjOrUserObj) => {
                let userObj = chatObjOrUserObj;
                if (chatObjOrUserObj.members) {
                    userObj = chatObjOrUserObj.members.find((mem) => mem._id !== user._id);
                }

                return (
                    <div className={`shadow-sm border p-2 rounded-xl bg-white flex justify-between items-center cursor-pointer ${getIsSelectedChatOrNot(userObj) && 'border-primary border-2'} `} key={userObj._id} onClick={() => handleOnClickOpenChat(userObj._id)}>
                        <div className='flex gap-5 items-center'>
                            {userObj.profilePic && <img src={userObj.profilePic} alt='profile pic' className='w-10 h-10 rounded-full' />}
                            {!userObj.profilePic && (
                                <div className='bg-gray-400 rounded-full h-12 w-12 flex items-center justify-center relative'>
                                    <h1 className='uppercase text-xl font-semibold text-white'>{userObj.name[0]}</h1>
                                </div>
                            )}
                            <div className='flex flex-col gap-1'>
                                <div className='flex gap-1'>
                                    <h1>{userObj.name}</h1>
                                    {getUnreadMessages(userObj)}
                                </div>
                                {getLastMessage(userObj)}
                            </div>
                        </div>
                        <div onClick={() => handleOnClickCreateChat(userObj._id)}>{!allChats.find((chat) => chat.members.map((mem) => mem._id).includes(userObj._id)) && <button className='border-primary border text-primary bg-white p-1 rounded'>Create Chat</button>}</div>
                    </div>
                );
            })}
        </div>
    );
};

export default UsersList;
