import React from 'react';

function UserData({ user }) {
  return (
    <div>
      <h2>Welcome, {user.firstName} {user.lastName}!</h2>
      <p>Email: {user.email}</p>
      {/* You can add more user-specific data or fetch accounts here */}
    </div>
  );
}

export default UserData;