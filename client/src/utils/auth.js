import { jwtDecode } from 'jwt-decode';


export const setToken = (token) => localStorage.setItem('token', token);
export const getToken = () => localStorage.getItem('token');
export const getUser = () => {
  try {
    const token = getToken();
    return token ? jwtDecode(token) : null;
  } catch {
    return null;
  }
};
export const logout = () => localStorage.removeItem('token');
