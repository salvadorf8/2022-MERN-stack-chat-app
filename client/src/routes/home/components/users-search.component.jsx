const UserSearch = ({ searchKey, setSearchKey }) => {
    return (
        <div className='relative'>
            <input className='rounded-xl w-full border-gray-500 pl-10 h-14' type='text' placeholder='Search users / chats' value={searchKey} onChange={(e) => setSearchKey(e.target.value)} />
            <i className='ri-search-line absolute top-4 left-4 text-gray-500'></i>
        </div>
    );
};

export default UserSearch;
