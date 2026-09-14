import { useEffect, useState } from "react";
import axios from "axios";
import "./UserManagement.css";

function UserManagement() {

const [users, setUsers] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

// =========================================================
// FETCH USERS - USED BY REFRESH / TRY AGAIN BUTTON
// =========================================================

const fetchUsers = async () => {


try {

  setLoading(true);
  setError("");

  const token = localStorage.getItem("token");

  if (!token) {

    setError(
      "Please login as Administrator first."
    );

    setLoading(false);

    return;
  }

  const response = await axios.get(
    "http://localhost:8080/admin/users",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  console.log(
    "Users received:",
    response.data
  );

  if (Array.isArray(response.data)) {

    setUsers(response.data);

  } else {

    setUsers([]);

  }

} catch (err) {

  console.error(
    "User loading error:",
    err
  );

  if (err.response?.status === 403) {

    setError(
      "Access denied. Please login as Administrator."
    );

  } else if (err.response?.status === 401) {

    setError(
      "Your session has expired. Please login again."
    );

  } else {

    setError(
      "Unable to load users. Make sure the backend is running."
    );

  }

} finally {

  setLoading(false);

}

};

// =========================================================
// INITIAL LOAD
// =========================================================

useEffect(() => {


let cancelled = false;

const loadInitialUsers = async () => {

  try {

    const token =
      localStorage.getItem("token");

    if (!token) {

      if (!cancelled) {

        setError(
          "Please login as Administrator first."
        );

        setLoading(false);

      }

      return;
    }

    const response = await axios.get(
      "http://localhost:8080/admin/users",
      {
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      }
    );

    if (!cancelled) {

      if (Array.isArray(response.data)) {

        setUsers(response.data);

      } else {

        setUsers([]);

      }

    }

  } catch (err) {

    console.error(
      "Initial user loading error:",
      err
    );

    if (!cancelled) {

      if (err.response?.status === 403) {

        setError(
          "Access denied. Please login as Administrator."
        );

      } else if (
        err.response?.status === 401
      ) {

        setError(
          "Your session has expired. Please login again."
        );

      } else {

        setError(
          "Unable to load users. Make sure the backend is running."
        );

      }

    }

  } finally {

    if (!cancelled) {

      setLoading(false);

    }

  }

};

loadInitialUsers();

return () => {

  cancelled = true;

};


}, []);

// =========================================================
// LOADING
// =========================================================

if (loading) {

return (

  <div className="user-management">

    <div className="loading-container">

      <div className="loading-spinner"></div>

      <p>
        Loading users...
      </p>

    </div>

  </div>

);


}

// =========================================================
// ERROR
// =========================================================

if (error) {


return (

  <div className="user-management">

    <div className="error-container">

      <div className="error-icon">
        ⚠️
      </div>

      <h2>
        Unable to Load Users
      </h2>

      <p>
        {error}
      </p>

      <button
        className="retry-button"
        onClick={fetchUsers}
      >
        Try Again
      </button>

    </div>

  </div>

);


}

// =========================================================
// MAIN UI
// =========================================================

return (


<div className="user-management">


  {/* HEADER */}

  <div className="user-header">

    <div>

      <p className="page-label">
        ADMIN PANEL
      </p>

      <h1>
        User Management
      </h1>

      <p className="page-subtitle">
        Manage and monitor registered customers.
      </p>

    </div>


    {/* CUSTOMER COUNT */}

    <div className="user-count">

      <span className="count-number">
        {users.length}
      </span>

      <span className="count-label">
        Customers
      </span>

    </div>

  </div>


  {/* USER CARD */}

  <div className="user-card">


    {/* TABLE HEADER */}

    <div className="table-header">

      <div>

        <h2>
          Registered Customers
        </h2>

        <p>
          Customers registered on ShopStack
        </p>

      </div>


      <button
        className="refresh-button"
        onClick={fetchUsers}
      >
        ↻ Refresh
      </button>

    </div>


    {/* EMPTY STATE */}

    {users.length === 0 ? (

      <div className="empty-state">

        <div className="empty-icon">
          👥
        </div>

        <h3>
          No Customers Found
        </h3>

        <p>
          There are currently no registered customers.
        </p>

      </div>

    ) : (

      /* =================================================
         USERS TABLE
      ================================================= */

      <div className="table-wrapper">

        <table>

          <thead>

            <tr>

              <th>
                ID
              </th>

              <th>
                Customer
              </th>

              <th>
                Email
              </th>

              <th>
                Role
              </th>

              <th>
                Status
              </th>

            </tr>

          </thead>


          <tbody>

            {users.map((user) => (

              <tr key={user.id}>


                {/* ID */}

                <td>

                  <span className="user-id">
                    #{user.id}
                  </span>

                </td>


                {/* CUSTOMER */}

                <td>

                  <div className="customer-info">

                    <div className="avatar">

                      {user.fullName
                        ? user.fullName
                            .charAt(0)
                            .toUpperCase()
                        : "U"}

                    </div>

                    <span>
                      {user.fullName ||
                        "Unknown User"}
                    </span>

                  </div>

                </td>


                {/* EMAIL */}

                <td>

                  <span className="email">
                    {user.email}
                  </span>

                </td>


                {/* ROLE */}

                <td>

                  <span className="role-badge">
                    {user.role}
                  </span>

                </td>


                {/* STATUS */}

                <td>

                  <span className="status-badge active">

                    {user.status ||
                      "ACTIVE"}

                  </span>

                </td>


              </tr>

            ))}

          </tbody>

        </table>

      </div>

    )}

  </div>

</div>


);

}

export default UserManagement;
