import Sidebar from "../Components/Sidebar";
import { useState, useEffect } from "react";
import Swal from "sweetalert2"; 
import EditProfileModal from "./../Modal/EditProfileModal";
import PasswordResetModal from "./../Modal/PasswordResetModal";
import axios from "axios";

function Settings() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [profilePic, setProfilePic] = useState("https://via.placeholder.com/150");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [theme, setTheme] = useState("light");
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const storedName = localStorage.getItem("name");
    const storedUsername = localStorage.getItem("username");
    const storedRole = localStorage.getItem("role");
    const storedProfilePic = localStorage.getItem("profilePic");
    if (storedProfilePic) {
      console.log("Loaded Profile Pic:", storedProfilePic); // Debugging log
      setProfilePic(storedProfilePic);
    }
  
    if (storedName && storedUsername && storedRole && storedProfilePic) {
      setName(storedName);
      setUsername(storedUsername);
      setRole(storedRole);
      setProfilePic(storedProfilePic);
    } else {
      fetchUserData();
    }
  }, []);
  
  const fetchUserData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("Error", "You are not logged in!", "error");
      return;
    }
  
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      console.log("API Response:", response.data); // Debugging log
  
      if (response.data) {
        setName(response.data.name);
        setUsername(response.data.user_name);
        setRole(response.data.role);
  
        const updatedProfilePic = response.data.profile_picture 
          ? "http://127.0.0.1:8000" + response.data.profile_picture
          : "/default-profile.png"; 
  
        setProfilePic(updatedProfilePic);
        localStorage.setItem("profilePic", updatedProfilePic);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      Swal.fire("Error", "Failed to fetch user details", "error");
    }
  };
  
  // Function to get user initials
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
                {profilePic && profilePic !== "https://via.placeholder.com/150" ? (
                    <img
                      src={profilePic}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => { 
                          e.target.onerror = null; 
                          e.target.src = "/default-profile.png"; // Fallback image
                      }}
                  />
                  
                  ) : (
                    <span className="text-white text-2xl font-semibold font-poppins">
                      {getInitials(name)}
                    </span>
                  )}
              </div>

              {/* Profile Details */}
              <div className="flex flex-col">
                <h2 className="text-2xl font-bold text-[#408286] font-poppins uppercase">{name}</h2>
                <p className="text-sm text-gray-600 flex gap-2 font-poppins">Username: <span className="font-medium font-poppins">{username}</span></p>
                <p className="text-sm text-gray-500 mt-1 flex gap-2 font-poppins">Role: <span className="font-medium font-poppins text-[#408286]">{role}</span></p>
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
