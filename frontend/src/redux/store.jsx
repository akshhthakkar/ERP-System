// import { configureStore } from "@reduxjs/toolkit";
// import userReducer from "./UsersSlice";

// const store = configureStore({
//   reducer: {
//     user: userReducer,
//   },
// });

// export default store;
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./UsersSlice";

// Function to load state from local storage
const loadState = () => {
  try {
    const serializedState = localStorage.getItem("reduxState");
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (error) {
    return undefined;
  }
};

// Function to save state to local storage
const saveState = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem("reduxState", serializedState);
  } catch (error) {
    // Ignore write errors
  }
};

const preloadedState = loadState();

const store = configureStore({
  reducer: {
    user: userReducer,
  },
  preloadedState, // Provide preloaded state
});

// Subscribe to store updates and save state to local storage
store.subscribe(() => {
  saveState(store.getState());
});

export default store;
