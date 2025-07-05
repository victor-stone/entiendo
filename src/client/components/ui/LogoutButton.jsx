import { useUserStore } from '../../stores';

const LogoutButton = ({className}) => {
  const logout = useUserStore(state => state.logout);
  const css = className || "block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer";
  return <div onClick={logout} className={css}>Logout</div>;
};

export default LogoutButton;