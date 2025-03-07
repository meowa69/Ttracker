import Sidebar from "../Components/Sidebar";
import { useState } from "react";
import Swal from "sweetalert2"; // Import SweetAlert2
import EditProfileModal from "./../Modal/EditProfileModal";
import PasswordResetModal from "./../Modal/PasswordResetModal";

function Settings() {
  // State for managing user info, edit mode, modal visibility
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("John Doe");
  const [username, setUsername] = useState("@johndoe");
  const [role, setRole] = useState("Admin");
  const [profilePic, setProfilePic] = useState("https://via.placeholder.com/150"); // Placeholder image
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State for dropdown and theme selection
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [theme, setTheme] = useState("light");

  // State for password reset modal
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Function to handle image upload (mock function for demonstration)
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfilePic(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Function to get the initials of the user
  const getInitials = (name) => {
    const nameParts = name.split(" ");
    const initials = nameParts.map((part) => part[0]).join("");
    return initials.toUpperCase();
  };

  // Handle password reset
  const handlePasswordReset = () => {
    if (newPassword === confirmPassword) {
      // Display SweetAlert notification for success
      Swal.fire({
        title: "Success!",
        text: "Your password has been successfully changed.",
        icon: "success",
        confirmButtonText: "OK"
      }).then(() => {
        // After user clicks OK, automatically log out (for simulation, we will just alert)
        // You would replace this with actual logout logic like clearing cookies or tokens
        alert("Logging out..."); // Simulate logout
        // Add any logout logic here, for example: clearSession() or redirect to login page
        setIsPasswordModalOpen(false);
        setNewPassword("");
        setConfirmPassword("");
      });
    } else {
      alert("Passwords do not match!");
    }
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
                        <p className="text-lg text-gray-600">{username}</p>
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
            {/* Theme Dropdown */}
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
                
                {/* options */}
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

            <EditProfileModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} name={name} setName={setName} profilePic={profilePic} handleImageUpload={handleImageUpload} getInitials={getInitials} />
            <PasswordResetModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} newPassword={newPassword} setNewPassword={setNewPassword} confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword} handlePasswordReset={handlePasswordReset} />
        </div>
      </div>
    </div>
  );
}

export default Settings;
