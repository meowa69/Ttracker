import { useState, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";

function EditProfileModal({ isOpen, onClose, name, setName, profilePic, setProfilePic, fetchUserData}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedAvatar, setSelectedAvatar] = useState(profilePic);
  const [activeTab, setActiveTab] = useState("avatar"); // "avatar" or "upload"
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // List of default avatars (Replace with actual image URLs)
  const defaultAvatars = [
    // man
    "/avatars/man1.png",
    "/avatars/man2.png",
    "/avatars/man3.png",
    "/avatars/man4.png",
    "/avatars/man5.png",
    "/avatars/man6.png",
    // woman
    "/avatars/woman1.png",
    "/avatars/woman2.png",
    "/avatars/woman3.png",
    "/avatars/woman4.png",
    "/avatars/woman5.png",
    "/avatars/woman6.png",
    
  ];

  if (!isOpen) return null;

  // Handle avatar selection
  const handleAvatarSelect = (avatar) => {
    setSelectedAvatar(avatar);
    setProfilePic(avatar); // Update profile picture state
    setSelectedFile(null); // Clear the selected file
    console.log("Avatar selected:", avatar); // Debugging
  };

  // Handle file upload from input
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    processFile(file);
  };

  // Handle file drop
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  // Process uploaded file
  const processFile = (file) => {
    if (file) {
      if (!file.type.startsWith("image/")) {
        Swal.fire("Error", "Please upload a valid image file.", "error");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        Swal.fire("Error", "File size must be less than 10MB.", "error");
        return;
      }
  
      const objectURL = URL.createObjectURL(file);
      setSelectedFile(file);
      setSelectedAvatar(objectURL);
      setProfilePic(objectURL);  // Update profile pic immediately
    }
  };
  

  // Handle saving profile
  const handleSave = async () => {
    const formData = new FormData();
    formData.append("name", name);
    
    if (selectedFile) {
      formData.append("profile_picture", selectedFile);
    } else {
      formData.append("profile_picture_url", profilePic); // Keep existing pic
    }
  
    const token = localStorage.getItem("token");
  
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/profiles",
        formData,
        { headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` } }
      );
  
      if (response.data) {
        const userId = response.data.user.id;
  
        // Save updated profile details in localStorage
        const updatedProfilePic = response.data.user.profile_picture
        ? `http://127.0.0.1:8000${response.data.user.profile_picture}`
        : profilePic;

        localStorage.setItem("user_profile", JSON.stringify({
          name: response.data.user.name,
          profilePic: updatedProfilePic
        }));
        
        setName(response.data.user.name);
        setProfilePic(updatedProfilePic);
      }
  
      Swal.fire("Success", "Profile updated!", "success");
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
      Swal.fire("Error", "Failed to update profile", "error");
    }
  };
  

  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-[550px] p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 font-poppins">Edit Profile</h2>

        {/* Name Input at the Top */}
        <div className="mb-4">
          <label className="text-sm font-semibold text-gray-600">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#408286] uppercase"
          />
        </div>

        {/* Tabs for Avatar & Upload */}
        <div className="border-b flex mb-4">
          <button
            className={`w-1/2 text-center py-2 ${activeTab === "avatar" ? "border-b-2 border-[#408286] font-semibold" : "text-gray-500"}`}
            onClick={() => setActiveTab("avatar")}
          >
            Select Avatar
          </button>
          <button
            className={`w-1/2 text-center py-2 ${activeTab === "upload" ? "border-b-2 border-[#408286] font-semibold" : "text-gray-500"}`}
            onClick={() => setActiveTab("upload")}
          >
            Upload Photo
          </button>
        </div>

        {/* Avatar Selection Tab */}
        {activeTab === "avatar" && (
          <div className="mb-4 grid grid-cols-5 gap-5 place-items-center">
            {defaultAvatars.map((avatar, index) => (
              <div key={index} className="flex items-center justify-center">
                <img
                  src={avatar}
                  alt={`Avatar ${index + 1}`}
                  className={`w-12 h-12 rounded-full cursor-pointer border-2 ${
                    selectedAvatar === avatar ? "border-[#408286]" : "border-transparent"
                  }`}
                  onClick={() => handleAvatarSelect(avatar)}
                />
              </div>
            ))}
          </div>
        )}


        {/* Upload Photo Tab */}
        {activeTab === "upload" && (
          <div className="mb-4">
            <div
              className={`mt-2 border-2 ${
                dragOver ? "border-[#408286]" : "border-gray-300"
              } border-dashed rounded-lg p-6 text-center cursor-pointer`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
            >
              {selectedFile ? (
                <img src={URL.createObjectURL(selectedFile)} alt="Uploaded" className="w-24 h-24 rounded-full mx-auto" />
              ) : (
                <>
                  <div className="flex justify-center mb-2">
                    <span className="w-10 h-10 border border-gray-400 rounded-full flex items-center justify-center text-gray-500 text-xl">
                      +
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm">
                    Upload a photo or drag and drop
                  </p>
                  <p className="text-gray-400 text-xs">
                    Supports JPG, PNG and GIF. Max file size: 10MB
                  </p>
                </>
              )}
            </div>
            <input type="file" ref={fileInputRef} accept="image/*" hidden onChange={handleImageUpload} />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="text-sm font-poppins font-semibold text-gray-600 hover:text-gray-800 px-3 py-1">Cancel</button>
          <button
            onClick={handleSave}
            className={`text-white text-sm font-poppins font-semibold bg-[#408286] hover:bg-[#356f6f] rounded-md px-4 py-2 ${
              selectedAvatar || selectedFile ? "" : "opacity-50 cursor-not-allowed"
            }`}
            disabled={!selectedAvatar && !selectedFile}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditProfileModal;