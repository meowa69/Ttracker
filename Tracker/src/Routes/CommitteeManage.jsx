import Sidebar from "../Components/Sidebar";
import { useState } from "react";

function CommitteeManage() {
  const [committeeTypes, setCommitteeTypes] = useState(["Finance", "Accounting"]);
  const [committeeMembers, setCommitteeMembers] = useState([
    { name: "John Doe", type: "Finance", term: "2021-2023" },
    { name: "John Doe", type: "Accounting", term: "2023-2025" },
  ]);
  const [newCommitteeType, setNewCommitteeType] = useState("");
  const [newMember, setNewMember] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [selectedCommitteeType, setSelectedCommitteeType] = useState("");
  const [newTerm, setNewTerm] = useState("");
  const terms = ["2021-2023", "2023-2025", "2025-2027"];

  const handleAddCommitteeType = () => {
    if (newCommitteeType && !committeeTypes.includes(newCommitteeType)) {
      setCommitteeTypes([...committeeTypes, newCommitteeType]);
      setNewCommitteeType("");
    }
  };

  const handleAddMember = () => {
    if (newMember && selectedCommitteeType && selectedTerm) {
      setCommitteeMembers([...committeeMembers, { name: newMember, type: selectedCommitteeType, term: selectedTerm }]);
      setNewMember("");
      setSelectedCommitteeType("");
      setSelectedTerm("");
    }
  };

  const handleAddTerm = () => {
    if (newTerm && !terms.includes(newTerm)) {
      terms.push(newTerm);
      setNewTerm("");
    }
  };

  return (
    <div className="flex font-poppins">
      <Sidebar />
      <div className="flex flex-col w-full h-screen overflow-hidden bg-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="font-bold uppercase text-[#494444] text-[35px]">
            Manage Committees
          </h1>
        </div>

        <div className="w-full border rounded-lg shadow-lg p-8 bg-white border-gray-300">
          <div className="flex space-x-3">
            {/* Add Committee Section */}
            <div className="w-1/3 bg-white p-6 rounded-md shadow-sm mb-6 border flex flex-col">
              <h2 className="text-sm font-semibold text-gray-600 mb-4">ADD COMMITTEE</h2>
              <input
                className="w-full p-2 border rounded mb-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#408286]"
                value={newCommitteeType}
                onChange={(e) => setNewCommitteeType(e.target.value)}
                placeholder="Enter Committee"
              />
              <div className="mt-auto flex justify-start">
                <button
                  className="bg-[#408286] hover:bg-[#5FA8AD] text-sm text-white p-2 rounded w-1/3 transition duration-300"
                  onClick={handleAddCommitteeType}
                >
                  Add
                </button>
              </div>
            </div>

            {/* Add Committee Member Section */}
            <div className="w-1/2 bg-white p-6 rounded-md shadow-sm mb-6 border flex flex-col">
              <h2 className="text-sm font-semibold text-gray-600 mb-4">ADD COMMITTEE MEMBER</h2>
              <div className="flex space-x-2 mb-2">
                <input
                  className="w-1/2 p-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#408286]"
                  value={newMember}
                  onChange={(e) => setNewMember(e.target.value)}
                  placeholder="Enter Member Name"
                />
                <select
                  className="w-1/2 p-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#408286]"
                  value={selectedCommitteeType}
                  onChange={(e) => setSelectedCommitteeType(e.target.value)}
                >
                  <option value="">Select Committee Type</option>
                  {committeeTypes.map((type, idx) => (
                    <option key={idx} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <select
                className="w-full p-2 border rounded mb-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#408286]"
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
              >
                <option value="">Select Term</option>
                {terms.map((term, idx) => (
                  <option key={idx} value={term}>
                    {term}
                  </option>
                ))}
              </select>
              <div className="mt-auto flex justify-start">
                <button
                  className="bg-[#408286] hover:bg-[#5FA8AD] text-sm text-white p-2 rounded w-1/3 transition duration-300"
                  onClick={handleAddMember}
                >
                  Add
                </button>
              </div>
            </div>

            {/* Add Term Section */}
            <div className="w-1/4 bg-white p-6 rounded-md shadow-sm mb-6 border flex flex-col">
                <h2 className="text-sm font-semibold text-gray-600 mb-4">ADD TERM</h2>
                <input
                    className="w-full p-2 border rounded mb-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#408286]"
                    value={newTerm}
                    onChange={(e) => setNewTerm(e.target.value)}
                    placeholder="Add term"
                />
                {/* Dropdown for Viewing Terms (Clickable but Non-Interactive) */} 
                <select
                    className="w-full p-2 border rounded mb-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#408286] bg-gray-100 cursor-pointer"
                >
                    
                    <option value="" disabled>View Term List</option>
                    {terms.map((term, idx) => (
                    <option key={idx} value={term} disabled>
                        {term}
                    </option>
                    ))}
                </select>
                <div className="mt-auto flex justify-start">
                    <button
                    className="bg-[#408286] hover:bg-[#5FA8AD] text-sm text-white p-2 rounded w-1/3 transition duration-300"
                    onClick={handleAddTerm}
                    >
                    Add
                    </button>
                </div>
            </div>
          </div>

          <div className="flex w-full space-x-4">
            <div className="w-1/2">
              {/* Committee Type List */}
              <div className="bg-white p-6 rounded-md shadow-sm min-h-[250px] border mb-6">
                <div className="w-full flex justify-between">
                  <h2 className="text-sm font-semibold text-gray-600 mb-4">COMMITTEE TYPE</h2>
                  <button className="bg-[#408286] hover:bg-[#5FA8AD] text-sm text-white px-4 rounded py-2 mb-2 shadow-md transition duration-300">
                    Remove
                  </button>
                </div>
                <div className="p-4 border min-h-[150px]">
                  {committeeTypes.map((type, idx) => (
                    <div key={idx} className="flex items-center mb-2">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm">{type}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Committee Member List */}
              <div className="bg-white p-6 rounded-md shadow-sm min-h-[250px] border">
                <h2 className="text-sm font-semibold text-gray-600 mb-4">COMMITTEE MEMBER</h2>
                <div className="flex justify-between">
                  <select
                    className="w-[50%] p-2 border rounded mb-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#408286]"
                    value={selectedCommitteeType}
                    onChange={(e) => setSelectedCommitteeType(e.target.value)}
                  >
                    <option value="">Select Committee Type</option>
                    {committeeTypes.map((type, idx) => (
                      <option key={idx} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <div>
                    <button className="bg-[#408286] hover:bg-[#5FA8AD] text-sm text-white px-4 rounded py-2 mb-2 shadow-md transition duration-300">
                      Remove
                    </button>
                  </div>
                </div>
                <div className="p-4 border min-h-[150px]">
                  {committeeMembers.map((member, idx) => (
                    <div key={idx} className="flex items-center mb-2">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm">{member.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Committee List - Table */}
            <div className="w-1/2 bg-white p-6 rounded-md shadow-sm border">
              <h2 className="text-sm font-semibold text-gray-600 mb-4">COMMITTEE LIST</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600">
                  <thead className="bg-[#408286] text-white">
                    <tr>
                      <th className="px-4 py-2">NAME</th>
                      <th className="px-4 py-2">COMMITTEE TYPE</th>
                      <th className="px-4 py-2">TERM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {committeeMembers.map((member, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2">{member.name}</td>
                        <td className="px-4 py-2">{member.type}</td>
                        <td className="px-4 py-2">{member.term}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommitteeManage;