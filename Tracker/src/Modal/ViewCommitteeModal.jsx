import React from "react";

function ViewCommitteeModal({ isOpen, onClose, committee }) {
  if (!isOpen || !committee) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-2xl font-bold text-gray-800">{committee.name}</h2>
          <button
            className="text-gray-500 hover:text-red-500 transition"
            onClick={onClose}
          >
            ✖
          </button>
        </div>

        {/* Committee Info */}
        <div className="mt-4">
          <p className="text-gray-600 text-sm">
            <strong>Term:</strong> {committee.term}
          </p>
          <p className="text-gray-600 text-sm">
            <strong>Total Members:</strong> {committee.members}
          </p>
        </div>

        {/* Members List */}
        {committee.membersList && committee.membersList.length > 0 ? (
          <div className="mt-4 max-h-60 overflow-y-auto border rounded-lg p-3 bg-gray-50">
            <h3 className="font-semibold text-gray-700 mb-2">Committee Members</h3>
            <ul className="space-y-2">
              {committee.membersList.map((member, index) => (
                <li key={index} className="flex justify-between items-center p-2 bg-white shadow-sm rounded-md">
                  <span className="text-gray-700 font-medium">{member.name}</span>
                  <span className="text-sm text-gray-500">{member.role}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-gray-500 mt-4 text-sm">No members found.</p>
        )}

        {/* Close Button */}
        <div className="mt-6 text-right">
          <button
            className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ViewCommitteeModal;
