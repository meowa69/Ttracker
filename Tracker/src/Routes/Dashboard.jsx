import Sidebar from "./Sidebar";
import { useState, useEffect, useRef } from "react";
import "react-datepicker/dist/react-datepicker.css";
import EditModal from "../Modal/EditModal";
import ViewModal from "../Modal/ViewModal"; 
import { motion, AnimatePresence } from "framer-motion";

function Dashboard() {
  const [rows, setRows] = useState([
    {
      ordinanceNo: "001-2024",
      dateApproved: "Jan 15, 2024",
      title: "RESOLUTION RETURNING TO THE BARANGAY COUNCIL OF BARANGAY AGUSAN, THIS CITY, ITS ORDINANCE NO. 02, S. 2024, COVERING ITS SUPPLEMENTAL BUDGET NO. 1 FOR CY 2024 WITH AN ESTIMATED INCOME OF ₱220,000.00, WITH THE INFORMATION THAT SAID ORDINANCE IS OPERATIVE IN ITS ENTIRETY",
      sponsor: "John Doe",
      status: "Pending",
      vmForwarded: "Jan 16, 2024",
      vmReceived: "Jan 18, 2024",
      cmForwarded: "Jan 20, 2024",
      cmReceived: "Jan 22, 2024",
      transmittedTo: "Department A",
      dateTransmitted: "Jan 25, 2024",
      completed: "False",
      dateOfCompletion: "Feb 1, 2024",
      remarks: "No Remarks",
    },

    {
      ordinanceNo: "001-2024",
      dateApproved: "Jan 15, 2024",
      title: "RESOLUTION RETURNING TO THE BARANGAY COUNCIL OF BARANGAY AGUSAN, THIS CITY, ITS ORDINANCE NO. 02, S. 2024, COVERING ITS SUPPLEMENTAL BUDGET NO. 1 FOR CY 2024 WITH AN ESTIMATED INCOME OF ₱220,000.00, WITH THE INFORMATION THAT SAID ORDINANCE IS OPERATIVE IN ITS ENTIRETY",
      sponsor: "John Doe",
      status: "Pending",
      vmForwarded: "Jan 16, 2024",
      vmReceived: "Jan 18, 2024",
      cmForwarded: "Jan 20, 2024",
      cmReceived: "Jan 22, 2024",
      transmittedTo: "Department A",
      dateTransmitted: "Jan 25, 2024",
      completed: "False",
      dateOfCompletion: "Feb 1, 2024",
      remarks: "No Remarks",
    },

    {
      ordinanceNo: "001-2024",
      dateApproved: "Jan 15, 2024",
      title: "RESOLUTION RETURNING TO THE BARANGAY COUNCIL OF BARANGAY AGUSAN, THIS CITY, ITS ORDINANCE NO. 02, S. 2024, COVERING ITS SUPPLEMENTAL BUDGET NO. 1 FOR CY 2024 WITH AN ESTIMATED INCOME OF ₱220,000.00, WITH THE INFORMATION THAT SAID ORDINANCE IS OPERATIVE IN ITS ENTIRETY",
      sponsor: "John Doe",
      status: "Pending",
      vmForwarded: "Jan 16, 2024",
      vmReceived: "Jan 18, 2024",
      cmForwarded: "Jan 20, 2024",
      cmReceived: "Jan 22, 2024",
      transmittedTo: "Department A",
      dateTransmitted: "Jan 25, 2024",
      completed: "False",
      dateOfCompletion: "Feb 1, 2024",
      remarks: "No Remarks",
    },

    {
      ordinanceNo: "001-2024",
      dateApproved: "Jan 15, 2024",
      title: "RESOLUTION RETURNING TO THE BARANGAY COUNCIL OF BARANGAY AGUSAN, THIS CITY, ITS ORDINANCE NO. 02, S. 2024, COVERING ITS SUPPLEMENTAL BUDGET NO. 1 FOR CY 2024 WITH AN ESTIMATED INCOME OF ₱220,000.00, WITH THE INFORMATION THAT SAID ORDINANCE IS OPERATIVE IN ITS ENTIRETY",
      sponsor: "John Doe",
      status: "Pending",
      vmForwarded: "Jan 16, 2024",
      vmReceived: "Jan 18, 2024",
      cmForwarded: "Jan 20, 2024",
      cmReceived: "Jan 22, 2024",
      transmittedTo: "Department A",
      dateTransmitted: "Jan 25, 2024",
      completed: "False",
      dateOfCompletion: "Feb 1, 2024",
      remarks: "No Remarks",
    },

    {
      ordinanceNo: "001-2024",
      dateApproved: "Jan 15, 2024",
      title: "RESOLUTION RETURNING TO THE BARANGAY COUNCIL OF BARANGAY AGUSAN, THIS CITY, ITS ORDINANCE NO. 02, S. 2024, COVERING ITS SUPPLEMENTAL BUDGET NO. 1 FOR CY 2024 WITH AN ESTIMATED INCOME OF ₱220,000.00, WITH THE INFORMATION THAT SAID ORDINANCE IS OPERATIVE IN ITS ENTIRETY",
      sponsor: "John Doe",
      status: "Pending",
      vmForwarded: "Jan 16, 2024",
      vmReceived: "Jan 18, 2024",
      cmForwarded: "Jan 20, 2024",
      cmReceived: "Jan 22, 2024",
      transmittedTo: "Department A",
      dateTransmitted: "Jan 25, 2024",
      completed: "False",
      dateOfCompletion: "Feb 1, 2024",
      remarks: "No Remarks",
    },

    {
      ordinanceNo: "001-2024",
      dateApproved: "Jan 15, 2024",
      title: "RESOLUTION RETURNING TO THE BARANGAY COUNCIL OF BARANGAY AGUSAN, THIS CITY, ITS ORDINANCE NO. 02, S. 2024, COVERING ITS SUPPLEMENTAL BUDGET NO. 1 FOR CY 2024 WITH AN ESTIMATED INCOME OF ₱220,000.00, WITH THE INFORMATION THAT SAID ORDINANCE IS OPERATIVE IN ITS ENTIRETY",
      sponsor: "John Doe",
      status: "Pending",
      vmForwarded: "Jan 16, 2024",
      vmReceived: "Jan 18, 2024",
      cmForwarded: "Jan 20, 2024",
      cmReceived: "Jan 22, 2024",
      transmittedTo: "Department A",
      dateTransmitted: "Jan 25, 2024",
      completed: "False",
      dateOfCompletion: "Feb 1, 2024",
      remarks: "No Remarks",
    },

    {
      ordinanceNo: "001-2024",
      dateApproved: "Jan 15, 2024",
      title: "RESOLUTION RETURNING TO THE BARANGAY COUNCIL OF BARANGAY AGUSAN, THIS CITY, ITS ORDINANCE NO. 02, S. 2024, COVERING ITS SUPPLEMENTAL BUDGET NO. 1 FOR CY 2024 WITH AN ESTIMATED INCOME OF ₱220,000.00, WITH THE INFORMATION THAT SAID ORDINANCE IS OPERATIVE IN ITS ENTIRETY",
      sponsor: "John Doe",
      status: "Pending",
      vmForwarded: "Jan 16, 2024",
      vmReceived: "Jan 18, 2024",
      cmForwarded: "Jan 20, 2024",
      cmReceived: "Jan 22, 2024",
      transmittedTo: "Department A",
      dateTransmitted: "Jan 25, 2024",
      completed: "False",
      dateOfCompletion: "Feb 1, 2024",
      remarks: "No Remarks",
    },

    {
      ordinanceNo: "001-2024",
      dateApproved: "Jan 15, 2024",
      title: "RESOLUTION RETURNING TO THE BARANGAY COUNCIL OF BARANGAY AGUSAN, THIS CITY, ITS ORDINANCE NO. 02, S. 2024, COVERING ITS SUPPLEMENTAL BUDGET NO. 1 FOR CY 2024 WITH AN ESTIMATED INCOME OF ₱220,000.00, WITH THE INFORMATION THAT SAID ORDINANCE IS OPERATIVE IN ITS ENTIRETY",
      sponsor: "John Doe",
      status: "Pending",
      vmForwarded: "Jan 16, 2024",
      vmReceived: "Jan 18, 2024",
      cmForwarded: "Jan 20, 2024",
      cmReceived: "Jan 22, 2024",
      transmittedTo: "Department A",
      dateTransmitted: "Jan 25, 2024",
      completed: "False",
      dateOfCompletion: "Feb 1, 2024",
      remarks: "No Remarks",
    },

  ]);

  const committees = [
    "Agriculture",
    "Arbitration",
    "Barangay Affairs",
    "Climate Change Adaptation & Mitigation And Disaster Risk Reduction",
    "Cooperatives",
    "Cultural Communities",
    "Economic Enterprises",
    "Education",
    "Energy",
    "Environment",
    "Ethics and Blue Ribbon",
    "Finance, Budget and Appropriations",
    "Fisheries and Aquatic Resources",
    "Games & Amusement",
    "Health, Nutrition and Health Insurance",
    "Labor and Employment",
    "Laws and Rules",
    "Planning, Research & Innovation and People’s Organization Accreditation",
    "Public Order and Safety",
    "Public Utilities (Roads & Traffic Management)",
    "Public Works",
    "Senior Citizens",
    "Sister City Relation",
    "Social Services",
    "Sports & Youth Development",
    "Subdivision & Landed Estate",
    "Tourism",
    "Trade & Commerce",
    "Urban & Rural Poor & Housing Development",
    "Ways & Means"
  ];

  
  const [selectedType, setSelectedType] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false); // State for ViewModal
  const [selectedRow, setSelectedRow] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCommittees = committees.filter(committee =>
    committee.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter states
  const [yearRange, setYearRange] = useState("");
  const [committeeType, setCommitteeType] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [completedStatus, setCompletedStatus] = useState("");

  // Modal handlers
  const handleEditClick = (index) => {
    setSelectedRow({ ...rows[index], index });
    setIsEditModalOpen(true);
  };

  const handleViewClick = (index) => {
    setSelectedRow({ ...rows[index], index });
    setIsViewModalOpen(true);
  };

  const handleSave = (updatedRow) => {
    const updatedRows = [...rows];
    updatedRows[updatedRow.index] = updatedRow;
    setRows(updatedRows);
    setIsEditModalOpen(false);
  };

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }

      if (
        notificationRef.current && !notificationRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Function to delete a row
  const deleteRow = (index) => {
    const updatedRows = rows.filter((_, i) => i !== index);
    setRows(updatedRows);
  };

  // Function to filter rows based on selected filters
  const filteredRows = rows.filter((row) => {
    const matchesYearRange = !yearRange || row.dateApproved.includes(yearRange);
    const matchesCommitteeType = !committeeType || row.sponsor === committeeType;
    const matchesStatus = !statusFilter || row.status === statusFilter;
    const matchesCompletedStatus =
      completedStatus === "" || row.completed === completedStatus;

    return (
      matchesYearRange &&
      matchesCommitteeType &&
      matchesStatus &&
      matchesCompletedStatus
    );
  });

  // Function to handle zoom in
  const handleZoomIn = () => {
    setZoomLevel((prevZoom) => Math.min(prevZoom + 0.1, 1.5));
  };

  // Function to handle zoom out
  const handleZoomOut = () => {
    setZoomLevel((prevZoom) => Math.max(prevZoom - 0.1, 0.5));
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />
      <div className="flex flex-col w-full h-screen overflow-y-auto p-4">
        {/* Dashboard Header */}
        <div className="font-poppins font-bold uppercase px-4 mb-8 text-[#494444] text-[35px] flex justify-between">
          <h1>Dashboard</h1>
          {/* Notification Icon */}
          <motion.div
            ref={notificationRef}
            className="bg-[#408286] text-white px-4 py-2 rounded-[100%] flex shadow-md cursor-pointer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(!isOpen)} // Toggle dropdown
          >
            <img
              src="src/assets/Images/notif.png"
              alt="notification"
              className="w-5 h-5 self-center invert shadow-lg"
            />
          </motion.div>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-[50px] top-[65px] mt-2 w-48 bg-white text-black shadow-lg rounded-md p-3 z-10"
              >
                <p className="text-sm">No new notifications</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Filters and Search Bar */}
        <div className="px-4 flex justify-between items-center">
          {/* Filters Section */}
          <div className="flex gap-2">
            {/* Document Type Filter */}
            <div className="relative">
              <select
                className="cursor-pointer inline-flex justify-center w-full appearance-none rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#5FA8AD] pr-10"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="" disabled>Document</option>
                <option value="Ordinance">Ordinance</option>
                <option value="Resolution">Resolution</option>
              </select>

              <img 
                src="src/assets/Images/down2.png" 
                alt="Dropdown Icon" 
                className={`absolute top-1/2 right-3 transform -translate-y-1/2 w-4 h-4 pointer-events-none transition-transform duration-200`}
              />
            </div>

            {/* Committee Type Filter */}
            <div className="relative w-40" ref={dropdownRef}>
              <div
                className="cursor-pointer w-full appearance-none rounded-md border border-gray-300 shadow-sm px-4 py-2 pr-10 bg-white text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#5FA8AD] truncate"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
              >
                {committeeType || "Committee"}
              </div>

              {/* Dropdown Icon */}
              <img 
                src="src/assets/Images/down2.png" 
                alt="Dropdown Icon" 
                className="absolute top-1/2 right-3 transform -translate-y-1/2 w-4 h-4 pointer-events-none"
              />

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute mt-1 w-[450px] h-[500px] bg-white border border-gray-300 rounded-md shadow-lg z-10">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-2 py-2 border-b border-gray-300 focus:outline-none rounded-t-lg"
                  />
                  <div className="max-h-[450px] overflow-y-auto">
                    {filteredCommittees.map((committee, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer font-poppins text-[13px] text-gray-600"
                        onClick={() => {
                          setCommitteeType(committee);
                          setIsDropdownOpen(false);
                        }}
                      >
                        {committee}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="cursor-pointer inline-flex justify-center w-full appearance-none rounded-md border border-gray-300 shadow-sm px-4 py-2 pr-10 bg-white text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#5FA8AD]"
              >
                <option value="">Status</option>
                <option value="Pending">Pending</option>
                <option value="For Vice Mayor's Signature">For Vice Mayor's Signature</option>
                <option value="For Mailings">For Mailings</option>
                <option value="Delivered">Delivered</option>
                <option value="Returned">Returned</option>
                <option value="Completed">Completed</option>
              </select>
              <img 
                src="src/assets/Images/down2.png" 
                alt="Dropdown Icon" 
                className="absolute top-1/2 right-3 transform -translate-y-1/2 w-4 h-4 pointer-events-none"
              />
            </div>

            {/* Completed Status Filter */}
            <div className="relative">
              <select
                value={completedStatus}
                onChange={(e) => setCompletedStatus(e.target.value)}
                className="cursor-pointer inline-flex justify-center w-full appearance-none rounded-md border border-gray-300 shadow-sm px-4 py-2 pr-10 bg-white text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#5FA8AD]"
              >
                <option value="">Completion</option>
                <option value="True">True</option>
                <option value="False">False</option>
              </select>
              <img 
                src="src/assets/Images/down2.png" 
                alt="Dropdown Icon" 
                className="absolute top-1/2 right-3 transform -translate-y-1/2 w-4 h-4 pointer-events-none"
              />
            </div>


            {/* Year Range Filter */}
            <div>
              <input
                type="date"
                value={yearRange}
                onChange={(e) => setYearRange(e.target.value)}
                onFocus={(e) => e.target.showPicker()}
                className="border cursor-pointer border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#5FA8AD] rounded-md"
              />
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-[300px] font-poppins pl-10 pr-4 rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#5FA8AD]"
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

        {/* Table Section */}
        <div className="flex-grow px-4 py-2">
          <div className="bg-white w-full border rounded-md shadow-lg p-8 max-h-[800px] h-full">
            {/* Zoom Controls */}
            <div className="flex justify-end mb-2">
              <button
                onClick={handleZoomIn}
                className="bg-[#408286] hover:bg-[#5FA8AD] text-white font-bold py-2 px-4 rounded-l-md"
              >
                +
              </button>
              <button
                onClick={handleZoomOut}
                className="bg-[#408286] hover:bg-[#5FA8AD] text-white font-bold py-2 px-4 rounded-r-md"
              >
                -
              </button>
            </div>
            <div className="h-[690px] overflow-auto relative rounded-lg shadow-lg">
              {/* Zoom Applied */}
              <div style={{ transform: `scale(${zoomLevel})`, transformOrigin: "top left" }}>
                <table className="w-full ">
                  {/* Fixed Thead with Rounded Top */}
                  <thead className="sticky top-[-1px] bg-[#408286] text-white z-10">
                    <tr className="text-left text-[14px]">
                      <th className="border border-gray-300 px-4 py-4 first:rounded-tl-lg last:rounded-tr-lg">
                        {selectedType === "Ordinance" ? "Ordinance No." : "Resolution No."}
                      </th>
                      <th className="border border-gray-300 px-4 py-4 text-center">Title</th>
                      <th className="border border-gray-300 px-4 py-4">Status</th>
                      <th className="border border-gray-300 px-4 py-4">Remarks</th>
                      <th className="border border-gray-300 px-4 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  {/* Scrollable Tbody */}
                  <tbody>
                    {filteredRows.map((row, index) => (
                      <tr
                        key={index}
                        className={`border border-gray-300 hover:bg-gray-100 text-[14px] ${
                          index === filteredRows.length - 1 ? "last:rounded-b-lg" : ""
                        }`}
                      >
                        <td className="border border-gray-300 px-4 py-2 font-poppins text-sm text-gray-700">{row.ordinanceNo}</td>
                        <td className="border border-gray-300 px-4 py-2 w-[41%] text-justify font-poppins text-sm text-gray-700">{row.title}</td>
                        <td className="border border-gray-300 px-4 py-2 font-poppins text-sm text-gray-700">{row.status}</td>
                        <td className="border border-gray-300 px-4 py-2 font-poppins text-sm text-gray-700">{row.remarks}</td>
                        <td className="px-2 py-2 w-[28%] border font-poppins text-sm text-gray-700">
                          <div className="grid grid-cols-2 gap-1 md:flex md:flex-wrap md:justify-start">
                            <button
                              onClick={() => handleViewClick(index)}
                              className="bg-[#37ad6c] hover:bg-[#2d8f59] px-4 py-2 rounded-md text-white font-medium flex items-center gap-2 font-poppins text-sm"
                            >
                              <img src="src/assets/Images/view.png" alt="View" className="w-5 h-5 invert self-center" />
                              View
                            </button>
                            <button
                              onClick={() => handleEditClick(index)}
                              className="bg-[#f5bd64] hover:bg-[#e9b158] px-4 py-2 rounded-md text-white font-medium flex items-center gap-2 font-poppins text-sm"
                            >
                              <img src="src/assets/Images/edit.png" alt="Edit" className="w-5 h-5 invert self-center" />
                              Edit
                            </button>
                            <button
                              className="bg-[#3b7bcf] hover:bg-[#3166ac] px-4 py-2 rounded-md text-white font-medium flex items-center gap-2 font-poppins text-sm"
                            >
                              <img src="src/assets/Images/print.png" alt="Print" className="w-5 h-5 invert self-center" />
                              Print
                            </button>
                            <button
                              onClick={() => deleteRow(index)}
                              className="bg-[#FF6767] hover:bg-[#f35656] px-4 py-2 rounded-md text-white font-medium flex items-center gap-2 font-poppins text-sm"
                            >
                              <img src="src/assets/Images/delete.png" alt="Delete" className="w-5 h-5 invert self-center" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        rowData={selectedRow}
        setRowData={setSelectedRow}
        onSave={handleSave}
      />

      {/* View Modal */}
      <ViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        rowData={selectedRow}
      />
    </div>
  );
}

export default Dashboard;