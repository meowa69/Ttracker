import React, { useState } from "react";
import axios from "axios";

function AssignMemberModal({ isOpen, onClose, committee, term }) {
  const [chairman, setChairman] = useState("");
  const [viceChairman, setViceChairman] = useState("");
  const [members, setMembers] = useState([]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!committee || !committee.committee_name) {
      alert("Please select a committee first.");
      return;
    }
    if (!term) {
      alert("Please select a term first.");
      return;
    }

    try {
      const membersToAssign = [
        { name: chairman, role: "Chairman" },
        { name: viceChairman, role: "Vice Chairman" },
        ...members.map((name) => ({ name, role: "Member" })),
      ].filter((member) => member.name.trim() !== "");

      if (membersToAssign.length === 0) {
        alert("Please enter at least one member.");
        return;
      }

      // Send API requests for each member
      for (const member of membersToAssign) {
        const payload = {
          committee_name: committee.committee_name, 
          term: term, 
          member_name: member.name,
          role: member.role.toLowerCase(),
        };
        console.log("Sending payload:", payload);
      
        await axios.post("http://localhost:8000/api/committee-members", payload);
      }
      

      alert("Members assigned successfully!");
      onClose();
    } catch (err) {
      console.error("Error assigning members:", err.response?.data || err.message);
      alert("Failed to assign members. Error: " + (err.response?.data?.message || err.message));
    }    
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[800px]">
        <h2 className="text-xl font-bold text-gray-800">Assign Members</h2>
        <p className="text-gray-600 text-md mb-4 mt-2 uppercase font-poppins font-semibold">
          {committee?.committee_name || "Select a committee"}
        </p>

        {/* Chairman Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Chairman
          </label>
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
          <label className="block text-sm font-medium text-gray-700">
            Vice Chairman
          </label>
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
          <label className="block text-sm font-medium text-gray-700">
            Members
          </label>
          {members.map((member, index) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <input
                type="text"
                className="w-full border rounded-md p-2 text-sm"
                value={member}
                onChange={(e) =>
                  setMembers((prev) =>
                    prev.map((m, i) => (i === index ? e.target.value : m))
                  )
                }
                placeholder={`Member ${index + 1}`}
              />
              <button
                className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                onClick={() =>
                  setMembers((prev) => prev.filter((_, i) => i !== index))
                }
              >
                ✖
              </button>
            </div>
          ))}
          {members.length < 5 && (
            <button
              className="mt-2 px-4 py-1 bg-[#408286] hover:bg-[#306060] text-white rounded-md text-sm"
              onClick={() => setMembers((prev) => [...prev, ""])}
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
          <button
            className="px-4 py-2 bg-[#408286] text-white rounded-md hover:bg-[#306060]"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default AssignMemberModal;
