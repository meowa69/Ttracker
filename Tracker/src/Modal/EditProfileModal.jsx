import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

function EditProfileModal({ isOpen, onClose, name, setName, profilePic, setProfilePic, getInitials }) {
  const [selectedFile, setSelectedFile] = useState(null);

  if (!isOpen) return null;

  // Handle file selection
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (typeof setProfilePic === "function") {
        setProfilePic(URL.createObjectURL(file)); // ✅ Prevents crash
      } else {
        console.error("setProfilePic is not a function");
      }
    }
  };
  

  // Handle saving profile
  const handleSave = async () => {
    const formData = new FormData();
    formData.append("name", name);
    if (selectedFile) {
      formData.append("profile_picture", selectedFile);
    }
  
    const token = localStorage.getItem("token");
  
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/profiles",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`, // ✅ Ensure correct token format
          },
          withCredentials: true, // 🔥 Needed for Sanctum authentication
        }
      );
  
      console.log("Profile update response:", response.data);
      if (response.data.profile_picture) {
        setProfilePic(response.data.profile_picture);
      }
  
      Swal.fire("Success", "Profile updated successfully!", "success");
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error.response || error);
      Swal.fire("Error", "Failed to update profile", "error");
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-96 p-6">
        <h2 className="text-2xl font-semibold text-[#408286] mb-4">Edit Profile</h2>

        <div className="flex justify-center mb-4">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#408286]">
            {profilePic === "https://via.placeholder.com/150" ? (
              <span className="text-white text-2xl font-semibold">
                {getInitials(name)}
              </span>
            ) : (
              <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
            )}
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="name" className="text-sm font-semibold text-gray-600">Full Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#408286]"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="profilePic" className="text-sm font-semibold text-gray-600">Profile Picture</label>
          <input type="file" id="profilePic" accept="image/*" onChange={handleImageUpload} className="w-full p-2 border border-gray-300 rounded-md" />
        </div>

        <div className="flex justify-end space-x-4">
          <button onClick={onClose} className="text-sm text-gray-600 hover:text-gray-800">Cancel</button>
          <button onClick={handleSave} className="text-white bg-[#408286] hover:bg-[#356f6f] rounded-md px-4 py-2">Save</button>
        </div>
      </div>
    </div>
  );
}

export default EditProfileModal;
