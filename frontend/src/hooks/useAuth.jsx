import { useSelector, useDispatch } from "react-redux";
import {
  selectUser,
  selectUserId,
  login,
  logout,
  updateUser,
} from "../redux/UsersSlice";

export const useAuth = () => {
  const user = useSelector(selectUser);
  const userId = useSelector(selectUserId);
  const dispatch = useDispatch();

  const handleLogin = (userData) => {
    dispatch(login(userData));
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleUpdateUser = (userData) => {
    dispatch(updateUser(userData));
  };

  return {
    user,
    userId,
    isAuthenticated: !!user,
    login: handleLogin,
    logout: handleLogout,
    updateUser: handleUpdateUser,
  };
};
