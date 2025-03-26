import React, { useState } from "react";
import axios from "axios";

function AssignMemberModal({ isOpen, onClose, committee, term, fetchMembers, onMembersAdded, terms }) {
  const [chairman, setChairman] = useState("");
  const [viceChairman, setViceChairman] = useState("");
  const [members, setMembers] = useState(["", "", "", "", ""]);

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
      const termId = terms.find((t) => t.term === term)?.id;
      if (!termId) {
        alert("Invalid term selected.");
        return;
      }

      await axios.delete("http://localhost:8000/api/committee-members", {
        data: {
          committee_id: committee.id,
          term_id: termId,
        },
      });

      const membersToAssign = [
        chairman.trim() && { name: chairman, role: "chairman" },
        viceChairman.trim() && { name: viceChairman, role: "vice_chairman" },
        ...members
          .filter((name) => name.trim() !== "")
          .map((name) => ({ name, role: "member" })),
      ].filter(Boolean);

      if (membersToAssign.length === 0) {
        alert("Please enter at least one member.");
        return;
      }

      console.log("Members to assign:", JSON.stringify(membersToAssign, null, 2));

      const results = await Promise.all(
        membersToAssign.map(async (member) => {
          const payload = {
            committee_name: committee.committee_name,
            term: term,
            member_name: member.name,
            role: member.role,
          };
          try {
            console.log(`Sending payload for ${member.name}:`, JSON.stringify(payload, null, 2));
            const response = await axios.post("http://localhost:8000/api/committee-members", payload);
            console.log(`Response for ${member.name}:`, response.data);
            return { success: true, member: member.name, role: member.role };
          } catch (err) {
            console.error(`Failed to add ${member.name} as ${member.role}:`, err.response?.data || err.message);
            return { success: false, member: member.name, error: err.response?.data?.message || err.message };
          }
        })
      );

      const successes = results.filter((r) => r.success).map((r) => r.member);
      const failures = results.filter((r) => !r.success);

      if (successes.length > 0) {
        await fetchMembers();
        onMembersAdded();
        if (failures.length > 0) {
          const failureMessages = failures.map((f) => `${f.member}: ${f.error}`).join(", ");
          alert(`Some members added successfully (${successes.join(", ")}), but others failed: ${failureMessages}`);
        }
      } else {
        alert("No members were added: " + failures.map((f) => `${f.member}: ${f.error}`).join(", "));
      }

      onClose();
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("An unexpected error occurred: " + err.message);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[800px]">
        <h2 className="text-xl font-bold text-gray-800">Assign Members</h2>
        <p className="text-gray-600 text-md mb-4 mt-2 uppercase font-poppins font-semibold">
          {committee?.committee_name || "Select a committee"} - {term || "No term selected"}
        </p>

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

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Members (Max 5)</label>
          {members.map((member, index) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <input
                type="text"
                className="w-full border rounded-md p-2 text-sm"
                value={member}
                onChange={(e) =>
                  setMembers((prev) => prev.map((m, i) => (i === index ? e.target.value : m)))
                }
                placeholder={`Member ${index + 1}`}
              />
            </div>
          ))}
        </div>

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