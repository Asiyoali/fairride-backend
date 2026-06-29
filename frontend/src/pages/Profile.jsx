import { useEffect, useState } from "react";
import { getProfile } from "../services/authService";

function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getProfile();

        setUser(data.user);

      } catch (error) {
        console.log(error);
      }
    };

    loadProfile();
  }, []);

  if (!user) {
    return (
      <div className="profile-page">
        <h1>Loading Profile...</h1>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-card">

        <h1>My Profile</h1>

        <p>
          <strong>Name:</strong> {user.name}
        </p>

        <p>
          <strong>Email:</strong> {user.email}
        </p>

        <p>
          <strong>Phone:</strong> {user.phone}
        </p>

        <p>
          <strong>Role:</strong> {user.role}
        </p>

      </div>
    </div>
  );
}

export default Profile;