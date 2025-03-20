import axios from "axios";
import Sidebar from "../Components/Sidebar";
import { useState, useEffect } from "react";

function CommitteeManage() {
  const [committeeTypes, setCommitteeTypes] = useState([]);
  const [committeeMembers, setCommitteeMembers] = useState([]);
  const [newCommitteeType, setNewCommitteeType] = useState("");
  const [newMember, setNewMember] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [selectedCommitteeType, setSelectedCommitteeType] = useState("");
  const [newTerm, setNewTerm] = useState("");
  const [terms, setTerms] = useState([]);
  const [alert, setAlert] = useState({ show: false, message: "", progress: 100 });
  const [selectedCommitteeTypes, setSelectedCommitteeTypes] = useState([]);


  const showAlert = (message) => {
    setAlert({ show: true, message, progress: 100 });
  };

  const closeAlert = () => {
    setAlert({ show: false, message: "", progress: 0 });
  };

  useEffect(() => {
    if (alert.show) {
      const totalDuration = 3000; // 3 seconds
      const intervalTime = 30; // Update every 30ms
      const step = (intervalTime / totalDuration) * 100; // Calculate step size

      const progressInterval = setInterval(() => {
        setAlert((prev) => {
          if (prev.progress <= 0) {
            clearInterval(progressInterval);
            return { ...prev, show: false, message: "", progress: 0 };
          }
          return { ...prev, progress: prev.progress - step };
        });
      }, intervalTime);

      return () => clearInterval(progressInterval); // Cleanup on unmount
    }
  }, [alert.show]);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/committees")
      .then(response => setCommitteeTypes(response.data))
      .catch(error => console.error("Error fetching committees:", error));

    axios.get("http://127.0.0.1:8000/api/terms")
      .then(response => setTerms(response.data))
      .catch(error => console.error("Error fetching terms:", error));

      axios.get("http://127.0.0.1:8000/api/committee-members")
      .then(response => {
        console.log("API Response for Committee Members:", response.data); // Debugging log
        setCommitteeMembers(response.data);
      })
      .catch(error => console.error("Error fetching committee members:", error));
    
  }, []);

  const handleAddCommitteeType = async () => {
    if (newCommitteeType) {
      try {
        const response = await axios.post("http://127.0.0.1:8000/api/committees", {
          committee_name: newCommitteeType,
        });
        setCommitteeTypes([...committeeTypes, response.data.committee]);
        setNewCommitteeType("");
        showAlert("Committee added successfully!");
      } catch (error) {
        console.error("Error adding committee:", error);
      }
    }
  };

  const handleAddMember = async () => {
    if (newMember && selectedCommitteeType && selectedTerm) {
      try {
        const response = await axios.post("http://127.0.0.1:8000/api/committee-members", {
          committee_id: selectedCommitteeType,
          term_id: selectedTerm,
          member_name: newMember,
        });
  
        console.log("New Member API Response:", response.data); // Debugging log
  
        // Ensure response.data.member exists before updating state
        if (!response.data.member) {
          throw new Error("API response is missing 'member' field.");
        }
  
        setCommitteeMembers((prevMembers) => [...prevMembers, response.data.member]);
        setNewMember("");
        setSelectedCommitteeType("");
        setSelectedTerm("");
        showAlert("Committee member added successfully!");
      } catch (error) {
        console.error("Error adding committee member:", error);
        showAlert("Failed to add member.");
      }
    }
  };
  

  const handleAddTerm = async () => {
    if (newTerm) {
      try {
        const response = await axios.post("http://127.0.0.1:8000/api/terms", {
          term: newTerm,
        });
        setTerms([...terms, response.data.term]);
        setNewTerm("");
        showAlert("Term added successfully!");
      } catch (error) {
        console.error("Error adding term:", error);
      }
    }
  };

  const handleCheckboxChange = (committeeId) => {
    setSelectedCommitteeTypes((prev) =>
      prev.includes(committeeId)
        ? prev.filter((id) => id !== committeeId) // Remove if unchecked
        : [...prev, committeeId] // Add if checked
    );
  };
  
  const handleDeleteCommittee = async () => {
    const selectedCommittees = document.querySelectorAll('input[type="checkbox"]:checked');
    const committeeIds = Array.from(selectedCommittees).map(input => input.value);
  
    if (committeeIds.length === 0) {
      showAlert("Please select at least one committee to delete.");
      return;
    }
  
    try {
      for (let id of committeeIds) {
        await axios.delete(`http://127.0.0.1:8000/api/committees/${id}`);
      }
      setCommitteeTypes(prevCommittees => prevCommittees.filter(c => !committeeIds.includes(String(c.id))));
      showAlert("Committee deleted successfully!");
    } catch (error) {
      console.error("Error deleting committee:", error);
      showAlert("Failed to delete committee.");
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

          {alert.show && (
            <div className="absolute top-4 right-4 bg-[#408286] text-white px-4 py-3 rounded shadow-lg flex items-center w-80">
              <span className="mr-2">✔</span>
              <span className="flex-grow">{alert.message}</span>
              <button onClick={closeAlert} className="ml-4 text-white text-xl">
                &times;
              </button>
              <div
                className="absolute bottom-0 left-0 h-1 bg-white transition-all"
                style={{ width: `${alert.progress}%` }}
              ></div>
            </div>
          )}
        </div>

        <div className="w-full border rounded-lg shadow-lg p-6 bg-white border-gray-300">
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
                  {committeeTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.committee_name}
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
                {terms.map((term) => (
                  <option key={term.id} value={term.id}>
                    {term.term}
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
              <select
                className="w-full p-2 border rounded mb-2 text-sm bg-white cursor-pointer"
                defaultValue=""
              >
                <option value="" disabled>
                  View Added Terms
                </option>
                {terms.map((term) => (
                  <option key={term.id} value={term.id} disabled>
                    {term.term}
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
              <div className="bg-white p-6 rounded-md shadow-sm min-h-[280px] border mb-6">
                <div className="w-full flex justify-between">
                  <h2 className="text-sm font-semibold text-gray-600 mb-4">COMMITTEE TYPE</h2>
                  <button 
                    className="bg-[#408286] hover:bg-[#5FA8AD] text-sm text-white px-4 rounded py-2 mb-2 shadow-md transition duration-300"
                    onClick={handleDeleteCommittee}
                    >
                    Remove
                  </button>
                </div>
                <div className="p-4 border max-h-[180px] overflow-y-auto">
                  {committeeTypes.map((type) => (
                    <div key={type.id} className="flex items-center space-x-2 text-sm mb-2">
                      <input
                        type="checkbox"
                        id={`committee-${type.id}`}
                        className="w-4 h-4"
                        value={type.id}
                        checked={selectedCommitteeTypes.includes(type.id)}
                        onChange={() => handleCheckboxChange(type.id)}
                      />
                      <label htmlFor={`committee-${type.id}`}>{type.committee_name}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Committee Member List */}
              <div className="bg-white p-6 rounded-md shadow-sm min-h-[280px] border">
                <h2 className="text-sm font-semibold text-gray-600 mb-4">COMMITTEE MEMBER</h2>
                <div className="flex justify-between">
                  <select
                    className="w-1/2 p-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#408286]"
                    value={selectedCommitteeType}
                    onChange={(e) => setSelectedCommitteeType(e.target.value)}
                  >
                    <option value="">Select Committee Type</option>
                    {committeeTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.committee_name}
                      </option>
                    ))}
                  </select>
                  <div>
                    <button className="bg-[#408286] hover:bg-[#5FA8AD] text-sm text-white px-4 rounded py-2 mb-2 shadow-md transition duration-300">
                      Remove
                    </button>
                  </div>
                </div>
                <div className="p-4 border max-h-[160px] overflow-y-auto mt-2">
                  {committeeMembers.map((member) => (
                    <div key={member.id} className="flex items-center mb-2">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm">{member.member_name}</span>
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
                    {committeeMembers.map((member) => {
                      console.log("Rendering Member:", member); // Log each member
                      return (
                        <tr key={member.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-2">{member.member_name}</td>
                          <td className="px-4 py-2">
                            {member.committee ? member.committee.committee_name : "N/A"}
                          </td>
                          <td className="px-4 py-2">
                            {member.term ? member.term.term : "N/A"}
                          </td>
                        </tr>
                      );
                    })}
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