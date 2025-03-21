import React, { useState } from "react";

function AssignMemberModal({ isOpen, onClose, committee }) {
  const [chairman, setChairman] = useState("");
  const [viceChairman, setViceChairman] = useState("");
  const [members, setMembers] = useState([]);

  if (!isOpen) return null;

  // Function to add a member (max 4)
  const addMember = () => {
    if (members.length < 5) {
      setMembers([...members, ""]); // Add an empty string for the new input
    }
  };

  // Function to remove a member
  const removeMember = (index) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  // Function to update a member's name
  const updateMember = (index, value) => {
    const updatedMembers = [...members];
    updatedMembers[index] = value;
    setMembers(updatedMembers);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[800px]">
        <h2 className="text-xl font-bold text-gray-800">Assign Members</h2>
        <p className="text-gray-600 text-sm mb-4">{committee?.name || "Select a committee"}</p>

        {/* Chairman Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Chairman</label>
          <input
            type="text"
            className="w-full border rounded-md p-2 text-sm"
            value={chairman}
            onChange={(e) => setChairman(e.target.value)}
            placeholder="Enter Chairman Name"
          />
        </div>

        {/* Vice Chairman Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Vice Chairman</label>
          <input
            type="text"
            className="w-full border rounded-md p-2 text-sm"
            value={viceChairman}
            onChange={(e) => setViceChairman(e.target.value)}
            placeholder="Enter Vice Chairman Name"
          />
        </div>

        {/* Members Inputs */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Members</label>
          {members.map((member, index) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <input
                type="text"
                className="w-full border rounded-md p-2 text-sm"
                value={member}
                onChange={(e) => updateMember(index, e.target.value)}
                placeholder={`Member ${index + 1}`}
              />
              <button
                className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                onClick={() => removeMember(index)}
              >
                ✖
              </button>
            </div>
          ))}
          {members.length < 5 && (
            <button
              className="mt-2 px-4 py-1 bg-[#408286] hover:bg-[#306060] text-white rounded-md text-sm"
              onClick={addMember}
            >
              + Add Member
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            onClick={onClose}
          >
            Cancel
          </button>
          <button className="px-4 py-2 bg-[#408286] text-white rounded-md hover:bg-[#306060]">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default AssignMemberModal;
