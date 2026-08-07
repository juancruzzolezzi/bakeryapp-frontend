import React from "react";
import { useSelector } from "react-redux";
import NavBar from "../../components/Navs/NavBar/NavBar";
import { useUserHandlers } from "../../handlers/userHandlers";
import styles from "./Profile.module.css";

const Profile = () => {
  const user = useSelector((state) => state.authSlice.user);
  const userName = useSelector((state) => state.authSlice.userName);

  console.log(user, userName);

  const { handleLogOut } = useUserHandlers();

  return (
    <div className={styles.container}>
      <NavBar />
      <div className={styles.profile}>
        <h2>User Profile</h2>
        <div className={styles.profileInfo}>
          <div>
            <strong>Email:</strong> {user}
          </div>
          <div>
            <strong>Username:</strong> {userName}
          </div>
        </div>
        <button onClick={handleLogOut} className={styles.logoutButton}>
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Profile;