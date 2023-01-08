import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import moment from 'moment';

import { updateProfilePicture } from '../../api-calls/users';
import { ShowLoader, HideLoader } from '../../redux/loaderSlice';
import { SetUser } from '../../redux/userSlice';

const Profile = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.userReducer);
    const [image = '', setImage] = useState('');

    const onFileSelect = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader(file);
        reader.readAsDataURL(file);

        reader.onloadend = async () => {
            setImage(reader.result);
        };
    };

    const updateProfilePic = async () => {
        try {
            dispatch(ShowLoader());
            const response = await updateProfilePicture(image);
            dispatch(HideLoader());
            if (response.success) {
                toast.success('Profile Pic updated');
                dispatch(SetUser(response.data));
            } else {
                toast.error(response.error);
            }
        } catch (error) {
            dispatch(HideLoader());
            toast.error(error.message);
        }
    };

    useEffect(() => {
        if (user?.profilePic) {
            setImage(user.profilePic);
        }
    }, [user]);

    return (
        user && (
            <div className='flex items-center justify-center h-[80vh]'>
                <div className='text-xl font-semibold uppercase text-gray-500 flex flex-col gap-2 p-2 shadow-md border w-max border-gray-300 rounded'>
                    <h1>{user.name}</h1>
                    <h1>{user.email}</h1>
                    <h1>createdAt: {moment(user.createdAt).format('MMM Do YYYY, h:mm:ss a')}</h1>
                    {image && <img src={image} alt='profile pic' className='w-32 h-32 rounded-full' />}

                    <div className='flex gap-2'>
                        <label htmlFor='file-input' className='cursor-pointer'>
                            Update Profile Pic
                        </label>
                        <input type='file' id='file-input' className='file-input' onChange={onFileSelect} />
                        <button className='contained-btn' onClick={updateProfilePic}>
                            Update
                        </button>
                    </div>
                </div>
            </div>
        )
    );
};

export default Profile;
