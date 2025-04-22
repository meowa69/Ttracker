import { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import axios from "axios";
import Swal from "sweetalert2";

function CreateAccount() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [alert, setAlert] = useState({ show: false, message: "", progress: 100 });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Function to generate a random password
  const generatePassword = () => {
    const randomPass = Math.random().toString(36).slice(-8);
    setPassword(randomPass);
  };

  // Alert handling
  const showAlert = (message) => {
    setAlert({ show: true, message, progress: 100 });
  };

  const closeAlert = () => {
    setAlert((prev) => ({ ...prev, show: false, message: "", progress: 0 }));
  };

  useEffect(() => {
    if (alert.show) {
      const totalDuration = 3000;
      const intervalTime = 30;
      const steps = totalDuration / intervalTime;
      const step = 100 / steps;

      let currentProgress = 100;
      const progressInterval = setInterval(() => {
        currentProgress -= step;
        setAlert((prev) => {
          if (currentProgress <= 0) {
            clearInterval(progressInterval);
            return { show: false, message: "", progress: 0 };
          }
          return { ...prev, progress: currentProgress };
        });
      }, intervalTime);

      return () => clearInterval(progressInterval);
    }
  }, [alert.show]);

  // Fetch users with pagination
  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/users?page=${page}`);
      setUsers(response.data.data); // No status or offlineSince mapping
      setCurrentPage(response.data.current_page);
      setTotalPages(response.data.total_pages);
    } catch (err) {
      console.error("Error fetching users:", err);
      showAlert("Failed to load user list.");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch only, no real-time updates
  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  // Handle form submission
  const handleCreateAccount = async (e) => {
    e.preventDefault();
    if (!name || !username || !role || !password) {
      showAlert("All fields are required.");
      return;
    }
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/register", {
        name,
        user_name: username,
        role,
        password,
      });
      if (response.status === 201) {
        showAlert("Account created successfully!");
        setName("");
        setUsername("");
        setRole("");
        setPassword("");
        fetchUsers(currentPage);
      }
    } catch (err) {
      console.error("Error creating account:", err.response);
      showAlert(err.response?.data?.message || "Failed to create account.");
    }
  };

  // Handle role update with SweetAlert confirmation
  const handleRoleUpdate = async (userId, newRole, currentRole) => {
    if (newRole === currentRole) return;
    Swal.fire({
      title: "Are you sure?",
      text: `Do you want to change this user's role to "${newRole}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#408286",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, update it!",
      cancelButtonText: "No, cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.patch(`http://127.0.0.1:8000/api/users/${userId}/role`, {
            role: newRole,
          });
          if (response.status === 200) {
            showAlert("Role updated successfully!");
            fetchUsers(currentPage);
          }
        } catch (err) {
          console.error("Error updating role:", err.response);
          showAlert(err.response?.data?.message || "Failed to update role.");
        }
      }
    });
  };

  // Handle user deletion with SweetAlert confirmation
  const handleDeleteUser = async (userId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this user? This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#408286",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.delete(`http://127.0.0.1:8000/api/users/${userId}`);
          if (response.status === 200) {
            showAlert("User deleted successfully!");
            fetchUsers(currentPage);
          }
        } catch (err) {
          console.error("Error deleting user:", err.response);
          showAlert(err.response?.data?.message || "Failed to delete user.");
        }
      }
    });
  };

  // Pagination handlers
  const prevPage = () => {
    if (currentPage > 1) fetchUsers(currentPage - 1);
  };

  const nextPage = () => {
    if (currentPage < totalPages) fetchUsers(currentPage + 1);
  };

  return (
    <div className="flex font-poppins">
      <Sidebar />
      <div className="flex flex-col w-full h-screen overflow-y-auto p-8 bg-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-[35px] font-bold uppercase text-[#494444]">
            Create Account
          </h1>
          {alert.show && (
            <div className="absolute top-4 right-4 bg-[#408286] text-white px-4 py-3 rounded shadow-lg flex items-center w-80">
              <span className="mr-2">✔</span>
              <span className="flex-grow">{alert.message}</span>
              <button onClick={closeAlert} className="ml-4 text-white text-xl">
                ×
              </button>
              <div
                className="absolute bottom-0 left-0 h-1 bg-white transition-all"
                style={{ width: `${alert.progress}%` }}
              ></div>
            </div>
          )}
        </div>

        <div className="w-full bg-white border rounded-lg shadow-lg p-8">
          <div className="border border-gray-200 p-6 rounded-lg bg-white">
            <h2 className="text-lg font-bold font-poppins uppercase text-gray-600 mb-4">Create account</h2>
            <form onSubmit={handleCreateAccount} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#408286] focus:border-[#408286] text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#408286] focus:border-[#408286] text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#408286] focus:border-[#408286] text-sm"
                  >
                    <option value="">Select a role</option>
                    <option value="admin">Admin</option>
                    <option value="sub-admin">Sub-Admin</option>
                    <option value="user">User</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    id="password"
                    value={password}
                    readOnly
                    placeholder="Generated password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#408286] text-sm text-white font-medium rounded-md shadow-md hover:bg-[#357a74] focus:outline-none focus:ring-2 focus:ring-[#408286] focus:ring-offset-2 transition duration-150"
                >
                  Create Account
                </button>
                <div className="space-x-3">
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="px-6 py-2 bg-[#408286] text-sm text-white font-medium rounded-md shadow-md hover:bg-[#357a74] focus:outline-none focus:ring-2 focus:ring-[#408286] focus:ring-offset-2 transition duration-150"
                  >
                    Generate Password
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setName("");
                      setUsername("");
                      setRole("");
                      setPassword("");
                      closeAlert();
                    }}
                    className="px-6 py-2 bg-gray-600 text-sm text-white font-medium rounded-md shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-150"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="mt-8 border border-gray-200 p-6 rounded-lg bg-white">
            <h2 className="text-lg font-bold font-poppins uppercase text-gray-600 mb-4">Registered Accounts</h2>
            {loading ? (
              <p className="text-gray-500 text-sm italic">Loading users...</p>
            ) : users.length === 0 ? (
              <p className="text-gray-500 text-sm italic">No accounts registered yet.</p>
            ) : (
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead className="bg-[#408286] text-white">
                      <tr>
                        <th className="p-3 text-left text-sm font-semibold uppercase tracking-wide">#</th>
                        <th className="p-3 text-left text-sm font-semibold uppercase tracking-wide">Name</th>
                        <th className="p-3 text-left text-sm font-semibold uppercase tracking-wide">Username</th>
                        <th className="p-3 text-left text-sm font-semibold uppercase tracking-wide">Role</th>
                        <th className="p-3 text-left text-sm font-semibold uppercase tracking-wide">Created At</th>
                        <th className="p-3 text-left text-sm font-semibold uppercase tracking-wide">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user, index) => (
                        <tr
                          key={user.id}
                          className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100 transition duration-150`}
                        >
                          <td className="p-3 text-gray-600 text-sm border-b border-gray-200">
                            {(currentPage - 1) * 6 + index + 1}
                          </td>
                          <td className="p-3 text-gray-800 text-sm border-b border-gray-200">{user.name}</td>
                          <td className="p-3 text-gray-800 text-sm border-b border-gray-200">{user.user_name}</td>
                          <td className="p-3 text-gray-800 text-sm border-b border-gray-200">{user.role}</td>
                          <td className="p-3 text-gray-600 text-sm border-b border-gray-200">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="p-3 border-b border-gray-200 flex space-x-2">
                            <select
                              value={user.role}
                              onChange={(e) => handleRoleUpdate(user.id, e.target.value, user.role)}
                              className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#408286] focus:border-[#408286]"
                            >
                              <option value="admin">Admin</option>
                              <option value="sub-admin">Sub-Admin</option>
                              <option value="user">User</option>
                            </select>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="bg-[#FF6767] hover:bg-[#f35656] shadow-md px-4 py-2 rounded-md text-white font-medium flex items-center gap-1 font-poppins text-sm"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end items-center mt-6 space-x-4">
                  <button
                    className={`px-4 py-2 rounded-md text-white text-sm font-medium shadow-md ${
                      currentPage === 1 ? "bg-gray-400 cursor-not-allowed" : "bg-[#408286] hover:bg-[#306060]"
                    } transition duration-150 ease-in-out`}
                    disabled={currentPage === 1}
                    onClick={prevPage}
                  >
                    Previous
                  </button>
                  <span className="text-gray-700 font-medium text-sm">
                    Page {currentPage} of {totalPages || 1}
                  </span>
                  <button
                    className={`px-4 py-2 rounded-md text-white text-sm font-medium shadow-md ${
                      currentPage === totalPages || totalPages === 0
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-[#408286] hover:bg-[#306060]"
                    } transition duration-150 ease-in-out`}
                    disabled={currentPage === totalPages || totalPages === 0}
                    onClick={nextPage}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateAccount;