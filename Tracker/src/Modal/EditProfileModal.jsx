import React from "react";

function EditProfileModal({ isOpen, onClose, name, setName, profilePic, handleImageUpload, getInitials }) {
  if (!isOpen) return null;

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
          <button onClick={onClose} className="text-white bg-[#408286] hover:bg-[#356f6f] rounded-md px-4 py-2">Save</button>
        </div>
      </div>
    </div>
  );
}

export default EditProfileModal;
