import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
    name: 'user',
    initialState: {
        user: null,
        allUsers: [],
        allChats: [],
        selectedChat: null
    },

    reducers: {
        // REMEMBER: Reducers in a slice only 'see' their own part of the overall state object
        // state means 'the state I'm in control of'
        // Everywhere else, 'state' means 'the whole state object in the store'
        setUser: (state, action) => {
            // Inner is used by redux toolkit
            state.user = action.payload;
        },
        setAllUsers: (state, action) => {
            state.allUsers = action.payload;
        },
        setAllChats: (state, action) => {
            state.allChats = action.payload;
        },
        setSelectedChat: (state, action) => {
            state.selectedChat = action.payload;
        }
    }
});

// when calling setUser within the application, it will create an action for you
// example: {type: user.setUser, payload: user}
export const { setUser, setAllUsers, setAllChats, setSelectedChat } = userSlice.actions;
export default userSlice.reducer;
