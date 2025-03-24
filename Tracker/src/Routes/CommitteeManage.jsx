import Sidebar from "../Components/Sidebar";
import { useState, useEffect, useRef } from "react";
import Modal from "../Modal/ViewCommitteeModal";
import AssignMemberModal from "../Modal/AssignMemberModal";
import axios from "axios";

function CommitteeManage() {
  const [activeTab, setActiveTab] = useState("committees");
  const [selectedCommittee, setSelectedCommittee] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [selectedCommitteeForEdit, setSelectedCommitteeForEdit] = useState("");
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [termPage, setTermPage] = useState(1);
  const termsPerPage = 5;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [committees, setCommittees] = useState([]); // State for storing committees
  const [committeeName, setCommitteeName] = useState(""); // State for input field
  const [terms, setTerms] = useState([]); // Store fetched terms
  const [newTerm, setNewTerm] = useState(""); // Store new term input
  const [error, setError] = useState(""); // ✅ Add this line
  const [loadingTerms, setLoadingTerms] = useState(true);
  const [alert, setAlert] = useState({ show: false, message: "", progress: 100 });


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

  // COMMITTEES
  useEffect(() => {
    fetchCommittees();
  }, []);

  const fetchCommittees = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/committees");
      setCommittees(response.data); // Update state with fetched committees
      showAlert("Committee added successfully!");
    } catch (err) {
      console.error("Error fetching committees:", err);
      showAlert("Failed to fetch committees.");
    }
  };

  // Function to add a new committee
  const addCommittee = async () => {
    if (!committeeName.trim()) {
      showAlert("Committee name cannot be empty.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8000/api/committees", {
        committee_name: committeeName,
      });

      // Update state with the newly added committee
      setCommittees([...committees, response.data.committee]);
      showAlert("Committee added successfully!");
      setCommitteeName(""); // Clear input field
      setError("");
    } catch (err) {
      showAlert(err.response?.data?.message || "An error occurred.");
    }
  };

  // TERMS
  useEffect(() => {
    fetchTerms();
  }, []);

  const fetchTerms = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/terms");
      setTerms(response.data);
      console.log("Success! Showing alert...");
      showAlert("Term added successfully!");
    } catch (err) {
      console.error("Error fetching terms:", err);
    }
  };

  const addTerm = async () => {
    if (!newTerm.trim()) {
      showAlert("Term cannot be empty.");
      return;
    }
  
    try {
      const response = await axios.post("http://localhost:8000/api/terms", {
        term: newTerm,
      });
  
      // Update the term list immediately
      setTerms([...terms, response.data.term]);
      setNewTerm(""); // Clear input field
      showAlert(""); // Clear errors
    } catch (err) {
      showAlert(err.response?.data?.message || "An error occurred.");
    }
  };

  // Assign Mmebers
  const assignMember = async (memberName, role) => {
    if (!selectedCommittee || !selectedTerm) {
      showAlert("Please select a committee and a term first.");
      return;
    }
  
    try {
      const response = await axios.post("http://localhost:8000/api/committee-members", {
        committee_id: selectedCommittee.id,
        term_id: selectedTerm.id,
        member_name: memberName,
        role: role, // "chairman", "vice chairman", or "member"
      });
  
      showAlert("Committee member added successfully!");
    } catch (err) {
      showAlert(err.response?.data?.message || "An error occurred.");
    }
  };
  

  // Static committee data (Demo)
  // const committees = [
  //   { name: "Smartall", term: "20TH CITY COUNCIL (July 1, 2022 – 2025)", members: 135 },
  //   { name: "Malibuh", term: "19TH CITY COUNCIL (July 1, 2019 – 2022)", members: 360 },
  //   { name: "Travel Shot", term: "18TH CITY COUNCIL (July 1, 2016 – 2019)", members: 526 },
  //   { name: "Rosters", term: "17TH CITY COUNCIL (July 1, 2013 – 2016)", members: 93 },
  //   { name: "Top Center", term: "16TH CITY COUNCIL (July 1, 2010 – 2013)", members: 215 },
  //   { name: "Somelop", term: "15TH CITY COUNCIL (July 1, 2007 – 2010)", members: 96 },
  //   { name: "Borber Care", term: "14TH CITY COUNCIL (July 1, 2004 – 2007)", members: 102 },
  //   { name: "Sintrec", term: "13TH CITY COUNCIL (July 1, 2001 – 2004)", members: 85 },
  //   { name: "Zion Store", term: "12TH CITY COUNCIL (July 1, 1998 – 2001)", members: 32 },
  //   { name: "Booblex", term: "11TH CITY COUNCIL (July 1, 1995 – 1998)", members: 135 },
  //   { name: "Venz", term: "10TH CITY COUNCIL (July 1, 1992 – 1995)", members: 32 },
  //   { name: "Pentrix", term: "9TH CITY COUNCIL (July 1, 1989 – 1992)", members: 1085 },
  //   { name: "Extra Committee", term: "8TH CITY COUNCIL (July 1, 1986 – 1989)", members: 500 },
  // ];

  // Open modal with selected committee details
  const openModal = (committee) => {
    setSelectedCommittee(committee);
    setIsModalOpen(true);
  };

  // Apply search filtering
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredCommittees = committees.filter(
    (committee) =>
      committee?.committee_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  


  // Pagination for Committees
  const totalPages = Math.ceil(filteredCommittees.length / itemsPerPage);
  const paginatedCommittees = filteredCommittees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Handle page changes
  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  // Function for paginating terms
  const paginateTerms = (terms, termPage, termsPerPage) => {
    const totalTermPages = Math.ceil(terms.length / termsPerPage);
    const paginatedTerms = terms.slice(
      (termPage - 1) * termsPerPage,
      termPage * termsPerPage
    );

    return { paginatedTerms, totalTermPages };
  };

  const { paginatedTerms, totalTermPages } = paginateTerms(terms, termPage, termsPerPage);
  

  return (
    <div className="flex font-poppins">
      <Sidebar />
      <div className="flex flex-col w-full h-screen overflow-hidden bg-gray-100 p-6">
        {/* Page Header */}
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

        <div className="w-full h-screen bg-white border rounded-lg shadow-lg p-6">
          {/* Tabs */}
          <div className="flex border-b mb-4">
            <button
              className={`p-3 text-sm font-semibold ${
                activeTab === "committees" ? "border-b-2 border-[#408286] text-[#408286]" : "text-gray-600"
              }`}
              onClick={() => setActiveTab("committees")}
            >
              Committees
            </button>

            <button
              className={`p-3 text-sm font-semibold ${
                activeTab === "editCommittee" ? "border-b-2 border-[#408286] text-[#408286]" : "text-gray-600"
              }`}
              onClick={() => setActiveTab("editCommittee")}
            >
             Committee Members
            </button>

            <button
              className={`p-3 text-sm font-semibold ${
                activeTab === "addCommittee" ? "border-b-2 border-[#408286] text-[#408286]" : "text-gray-600"
              }`}
              onClick={() => setActiveTab("addCommittee")}
            >
              Add Committee 
            </button>

            <button
              className={`p-3 text-sm font-semibold ${
                activeTab === "addTerm" ? "border-b-2 border-[#408286] text-[#408286]" : "text-gray-600"
              }`}
              onClick={() => setActiveTab("addTerm")}
            >
              Add Term
            </button>
          </div>

          {/* Active Tab: Committees */}
          {activeTab === "committees" && (
            <>
              {/* Search, Add Committee & Filter */}
              <div className="flex justify-between items-center mb-4">
                {/* Search Bar */}

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-[300px] font-poppins pl-10 pr-4 rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#5FA8AD]"
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1); // Reset to first page when searching
                    }}
                  />
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>

              {/* Committee Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {paginatedCommittees.map((committee, index) => (
                  <div key={index} className="p-6 border rounded-lg shadow-md bg-white flex flex-col justify-between">
                    <div>
                      <h2 className="font-bold text-lg text-gray-800 uppercase">{committee.committee_name}</h2>
                      <p className="text-gray-500 text-sm mt-2">{committee.terms}</p>
                      <div className="flex items-center mt-2 text-gray-700 text-sm">
                        👥 {committee.members} Members
                      </div>
                    </div>
                    <button
                      className="mt-3 px-4 py-2 bg-[#408286] text-white text-sm font-semibold rounded-lg hover:bg-[#306060] transition"
                      onClick={() => openModal(committee)}
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>

              {/* Pagination - Always at Bottom Right */}
              {totalPages > 1 && (
                <div className="flex justify-end items-center mt-6 fixed bottom-16 right-20">
                  <button
                    className={`px-4 py-2 rounded-lg text-white text-sm font-poppins ${
                      currentPage === 1 ? "bg-gray-400 cursor-not-allowed" : "bg-[#408286] hover:bg-[#306060]"
                    }`}
                    disabled={currentPage === 1}
                    onClick={prevPage}
                  >
                    Previous
                  </button>
                  <span className="text-gray-700 font-medium mx-4 text-sm font-poppins">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    className={`px-4 py-2 rounded-lg text-white text-sm ${
                      currentPage === totalPages ? "bg-gray-400 cursor-not-allowed" : "bg-[#408286] hover:bg-[#306060]"
                    }`}
                    disabled={currentPage === totalPages}
                    onClick={nextPage}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}

          {/* editCommittee tab */}
          {activeTab === "editCommittee" && (
            <div className="p-6 bg-white border rounded-lg shadow-md">
              {/* Committee Selection */}
              <div className="relative w-full" ref={dropdownRef}>
                <div
                    className="uppercase cursor-pointer w-full appearance-none rounded-md border border-gray-300 shadow-sm px-4 py-2 pr-10 bg-white text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#5FA8AD] truncate"
                    onClick={() => setIsDropdownOpen((prev) => !prev)}
                  >
                    {selectedCommitteeForEdit || "Select Committee"}
                  </div>

                  {/* Dropdown Icon */}
                  <img 
                    src="src/assets/Images/down2.png" 
                    alt="Dropdown Icon" 
                    className="absolute top-1/2 right-3 transform -translate-y-1/2 w-4 h-4 pointer-events-none"
                  />

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute mt-1 w-full min-h-[250px] bg-white border border-gray-300 rounded-md shadow-lg z-10">
                      <input  
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-2 py-2 border-b border-gray-300 focus:outline-none rounded-t-lg text-sm font-poppins"
                      />
                      <div className="max-h-[250px] overflow-y-auto">
                        {filteredCommittees.map((committee, index) => (
                          <div
                            key={index}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer font-poppins text-[14px] text-gray-600 uppercase"
                            onClick={() => {
                              setSelectedCommittee(committee);  // Ensure this sets correct data
                              setSelectedCommitteeForEdit(committee.committee_name);
                              setIsDropdownOpen(false);
                            }}
                          >
                            {committee.committee_name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              {/* Terms Section */}
              {selectedCommitteeForEdit && (
                <div className="mt-6 border rounded-lg p-6 bg-gray-50 shadow-sm">
                  <h3 className="text-sm font-poppins font-semibold text-gray-700 mb-3">Terms</h3>

                  {/* Paginated Terms Grid */}
                  <div className="grid grid-cols-5 gap-2">
                    {terms.length === 0 ? (
                      <p className="text-gray-500 text-sm italic">Loading terms...</p>
                    ) : (
                      terms
                        .slice((termPage - 1) * 20, termPage * 20) // Show only 20 terms per page
                        .map((term, index) => (
                          <button
                            key={index}
                            className={`p-2 rounded-md transition text-sm uppercase ${
                              selectedTerm === term.term
                                ? "bg-[#408286] text-white font-bold"
                                : "hover:bg-gray-200 bg-white border"
                            }`}
                            onClick={() => setSelectedTerm(term.term)}
                          >
                            {term.term}
                          </button>
                        ))
                    )}
                  </div>

                  {/* Pagination Controls - Same Style as Committees Tab */}
                  <div className="flex justify-end mt-4">
                    <button
                      className={`px-4 py-2 rounded-lg text-white text-sm font-poppins ${
                        termPage === 1 ? "bg-gray-400 cursor-not-allowed" : "bg-[#408286] hover:bg-[#306060]"
                      }`}
                      disabled={termPage === 1}
                      onClick={() => setTermPage((prev) => Math.max(prev - 1, 1))}
                    >
                      Previous
                    </button>
                    <span className="px-4 text-gray-500 font-medium self-center text-sm">
                      Page {termPage} of {Math.ceil(terms.length / 20)}
                    </span>
                    <button
                      className={`px-4 py-2 rounded-lg text-white text-sm font-poppins ${
                        termPage === Math.ceil(terms.length / 20) ? "bg-gray-400 cursor-not-allowed" : "bg-[#408286] hover:bg-[#306060]"
                      }`}
                      disabled={termPage === Math.ceil(terms.length / 20)}
                      onClick={() => setTermPage((prev) => Math.min(prev + 1, Math.ceil(terms.length / 20)))}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}


              {/* Committee Members Section */}
              <div className="mt-6 border rounded-lg p-6 relative shadow-sm bg-gray-50">
                {selectedCommitteeForEdit ? (
                  selectedTerm ? (
                    <>
                      <h3 className="text-lg font-semibold text-gray-700 mb-3">
                        Editing Members for {selectedTerm}
                      </h3>

                      {/* Chairman Section */}
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2 font-poppins">🧑‍⚖️ Chairman</h3>
                        <p className="text-gray-500 text-sm italic">No chairman assigned yet</p>
                      </div>

                      {/* Vice Chairman Section */}
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2 font-poppins">🎖 Vice Chairman</h3>
                        <p className="text-gray-500 text-sm italic">No vice chairman assigned yet</p>
                      </div>

                      {/* Members Section */}
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2 font-poppins">👥 Members</h3>
                        <p className="text-gray-500 text-sm italic">No members assigned yet</p>
                      </div>

                      {/* Floating Add Button */}
                      <button
                        onClick={() => setIsAssignModalOpen(true)}
                        className="absolute top-4 right-4 w-10 h-10 bg-[#408286] text-white rounded-full shadow-md hover:bg-[#306060] transition flex items-center justify-center"
                      >
                        <span className="text-sm font-bold">+</span>
                      </button>
                    </>
                  ) : (
                    <p className="text-gray-500 text-sm italic">Select a term first.</p>
                  )
                ) : (
                  <p className="text-gray-500 text-sm italic">Select a committee first.</p>
                )}
              </div>
            </div>
          )}

          {/* Assign Members Modal */}
          <AssignMemberModal
            isOpen={isAssignModalOpen}
            onClose={() => setIsAssignModalOpen(false)}
            committee={selectedCommittee}
            term={selectedTerm} // Pass selectedTerm to modal
          />



          {/* addCommittee tab */}
          {activeTab === "addCommittee" && (
            <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-200 w-full mx-auto">
              {/* Input & Buttons */}
              <div className="flex items-center space-x-3 mb-5">
                <input
                  type="text"
                  value={committeeName}
                  onChange={(e) => setCommitteeName(e.target.value)}
                  placeholder="Enter committee"
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 font-poppins text-sm focus:outline-none focus:ring-1 focus:ring-[#408286]"
                />
                <button
                  className="bg-[#408286] text-white px-5 py-3 rounded-lg font-poppins font-medium text-sm transition hover:bg-[#306060]"
                  onClick={addCommittee}
                >
                  Add
                </button>
                <button
                  className="bg-gray-300 text-gray-700 px-5 py-3 rounded-lg font-poppins font-medium text-sm transition hover:bg-gray-400"
                  onClick={() => setCommitteeName("")}
                >
                  Cancel
                </button>
              </div>

              {error && <p className="text-red-500">{error}</p>}

              {/* Committee List - Table Format with Delete Button */}
              <div className="border border-gray-300 p-5 rounded-xl bg-gray-50">
                <h2 className="text-sm font-semibold font-poppins text-gray-700 mb-3">Committee List</h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead className="bg-gray-200 text-gray-700">
                      <tr>
                        <th className="p-3 border border-gray-300 text-left">#</th>
                        <th className="p-3 border border-gray-300 text-left">Committee Name</th>
                        <th className="p-3 border border-gray-300 text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {committees.map((committee, index) => (
                        <tr key={committee.id} className="bg-white hover:bg-gray-100">
                          <td className="p-3 border border-gray-300">{index + 1}</td>
                          <td className="p-3 border border-gray-300 uppercase">{committee.committee_name}</td>
                          <td className="p-3 border border-gray-300">
                            <button
                              onClick={() => deleteCommittee(committee.id)}
                              className="bg-[#FF6767] hover:bg-[#f35656] px-4 py-2 rounded-md text-white font-medium flex items-center gap-1 font-poppins text-sm"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* addTerm tab */}
          {activeTab === "addTerm" && (
              <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-200 w-full mx-auto">
                {/* Input & Buttons */}
                <div className="flex items-center space-x-3 mb-5">
                  <input
                    type="text"
                    placeholder="Enter term (e.g., 2024-2026)"
                    value={newTerm}
                    onChange={(e) => setNewTerm(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 font-poppins text-sm focus:outline-none focus:ring-1 focus:ring-[#408286]"
                  />
                  <button
                    onClick={addTerm}
                    className="bg-[#408286] text-white px-5 py-3 rounded-lg font-poppins font-medium text-sm transition hover:bg-[#306060]"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setNewTerm("")}
                    className="bg-gray-300 text-gray-700 px-5 py-3 rounded-lg font-poppins font-medium text-sm transition hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>

                {/* Error message */}
                {error && <p className="text-red-500 text-sm">{error}</p>}

                {/* Term List - Grid View to Fit on One Page */}
                <div className="border border-gray-300 p-5 rounded-xl bg-gray-50">
                  <h2 className="text-sm font-semibold font-poppins text-gray-700 mb-3">Term List</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {terms.map((term, index) => (
                      <div key={index} className="p-3 bg-white rounded-lg shadow-sm border border-gray-200 text-center uppercase">
                        {term.term}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

export default CommitteeManage;
