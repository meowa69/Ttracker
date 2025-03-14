import Sidebar from "../Components/Sidebar";
import { useState, useEffect } from "react";
import Swal from "sweetalert2"; 
import EditProfileModal from "./../Modal/EditProfileModal";
import PasswordResetModal from "./../Modal/PasswordResetModal";
import axios from "axios";

function Settings() {
  // Load initial user data from localStorage
  const storedUser = JSON.parse(localStorage.getItem("user")) || {};

  const [name, setName] = useState(storedUser.name || "");
  const [username, setUsername] = useState(storedUser.user_name || "");
  const [role, setRole] = useState(storedUser.role || "");
  const [profilePic, setProfilePic] = useState(storedUser.profilePic || "https://via.placeholder.com/150"); 
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Other states
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [theme, setTheme] = useState("light");
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Fetch user data only if not in localStorage
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        Swal.fire("Error", "You are not logged in!", "error");
        return;
      }

      try {
        const response = await axios.get("http://127.0.0.1:8000/api/user", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data) {
          setName(response.data.name);
          setUsername(response.data.user_name);
          setRole(response.data.role);
          setProfilePic(response.data.profilePic || "https://via.placeholder.com/150");

          // Store in localStorage to prevent reload issues
          localStorage.setItem("user", JSON.stringify(response.data));
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        Swal.fire("Error", "Failed to fetch user details", "error");
      }
    };

    // Fetch data only if user info is not in localStorage
    if (!storedUser.name) {
      fetchUserData();
    }
  }, []);

  // Function to get initials of the user
  const getInitials = (name) => {
    if (!name) return "U"; 
    return name.split(" ").map((part) => part[0]).join("").toUpperCase();
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex flex-col w-full overflow-y-auto p-6 bg-gray-50">
        <div className="font-poppins font-bold uppercase p-4 text-[#494444] text-[35px]">
          <h1>Settings</h1>
        </div>

        {/* Profile Section */}
        <div className="w-full border rounded-lg shadow-lg p-8">
          <div className="bg-white shadow-lg rounded-lg p-6 flex items-center justify-between mb-4">
            <div className="flex gap-4">
              {/* Profile Picture or Initials */}
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#408286] flex items-center justify-center bg-[#408286]">
                {profilePic === "https://via.placeholder.com/150" ? (
                  <span className="text-white text-2xl font-semibold font-poppins">
                    {getInitials(name)}
                  </span>
                ) : (
                  <img
                    src={profilePic}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Profile Details */}
              <div className="flex flex-col">
                <h2 className="text-2xl font-semibold text-[#408286]">{name}</h2>
                <p className="text-lg text-gray-600">Username: {username}</p>
                <p className="text-sm text-gray-500 mt-1">Role: {role}</p>
              </div>
            </div>

            {/* Edit Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-white text-sm font-poppins font-semibold bg-[#408286] hover:bg-[#356f6f] rounded-md px-4 py-2"
            >
              Edit
            </button>
          </div>

          <h1 className="font-poppins text-lg font-bold uppercase p-2 text-gray-500">Others</h1>

          {/* Theme Selection */}
          <div className="bg-white shadow-lg rounded-lg p-6 mb-2">
            <div
              className="flex justify-between cursor-pointer"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <h1 className="font-poppins font-medium">Theme</h1>
              <img
                src="src/assets/Images/down.png"
                className={`w-5 h-5 self-center transform transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
                alt="Toggle"
              />
            </div>
            
            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                isDropdownOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
              }`}
              style={{ transitionProperty: "max-height, opacity" }}
            >
              <div className="p-4">
                <div>
                  <label className="font-poppins block text-md font-medium text-gray-700">
                    <input
                      type="radio"
                      name="theme"
                      value="light"
                      checked={theme === "light"}
                      onChange={() => setTheme("light")}
                      className="mr-2"
                    />
                    Light mode
                  </label>
                </div>
                <div>
                  <label className="font-poppins block text-md font-medium text-gray-700">
                    <input
                      type="radio"
                      name="theme"
                      value="dark"
                      checked={theme === "dark"}
                      onChange={() => setTheme("dark")}
                      className="mr-2"
                    />
                    Dark mode
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-white shadow-lg rounded-lg p-6">
            <div className="flex justify-between items-center">
              <h1 className="font-poppins font-medium">Change password</h1>
              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="text-white text-sm font-poppins font-semibold bg-[#408286] hover:bg-[#356f6f] rounded-md px-4 py-2"
              >
                Reset
              </button>
            </div>  
          </div>

          <EditProfileModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} name={name} setName={setName} profilePic={profilePic} getInitials={getInitials} setProfilePic={setProfilePic}/>
          <PasswordResetModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} newPassword={newPassword} setNewPassword={setNewPassword} confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword} />
        </div>
      </div>
    </div>
  );
}

export default Settings;
