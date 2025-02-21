import Sidebar from "./Sidebar";
import { useState, useEffect, useRef } from "react";
import "react-datepicker/dist/react-datepicker.css";
import EditModal from "../Modal/EditModal";

function Dashboard() {
  const [rows, setRows] = useState([
    {
      ordinanceNo: "001-2024",
      dateApproved: "Jan 15, 2024",
      title: "Ordinance Title Here",
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
  const [selectedType, setSelectedType] = useState("Ordinance");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [zoomLevel, setZoomLevel] = useState(1); // Zoom level state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  // Filter states
  const [yearRange, setYearRange] = useState("");
  const [committeeType, setCommitteeType] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [completedStatus, setCompletedStatus] = useState("");

  // Modal
  const handleEditClick = (index) => {
    setSelectedRow({ ...rows[index], index });  // Save the row data with its index
    setIsModalOpen(true);
  };
  
  const handleSave = (updatedRow) => {
    const updatedRows = [...rows];
    updatedRows[updatedRow.index] = updatedRow;  // Update the row in the list
    setRows(updatedRows);
    setIsModalOpen(false);
  };

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
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
    const matchesYearRange =
      !yearRange || row.dateApproved.includes(yearRange);
    const matchesCommitteeType =
      !committeeType || row.sponsor === committeeType;
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
    setZoomLevel((prevZoom) => Math.min(prevZoom + 0.1, 1.5)); // Limit zoom to 150%
  };

  // Function to handle zoom out
  const handleZoomOut = () => {
    setZoomLevel((prevZoom) => Math.max(prevZoom - 0.1, 0.5)); // Limit zoom to 50%
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />
      <div className="flex flex-col w-full h-screen overflow-y-auto p-4">
        {/* Dashboard Header */}
        <div className="font-poppins font-bold uppercase px-4 mb-8 text-[#494444] text-[35px]">
          <h1>Dashboard</h1>
        </div>
        
        <div className="px-4 flex justify-between items-center">
          {/* Ordinance and Resolution Dropdown */}
          <div className="flex gap-2">
            <div className="relative inline-block text-left">
              <button
                type="button"
                className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#5FA8AD]"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {selectedType}
                <svg
                  className="-mr-1 ml-2 h-5 w-5 text-gray-500"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a1 1 0 011.41-.29L10 9.07l3.36-2.15a1 1 0 111.14 1.68l-4 2.5a1 1 0 01-1.14 0l-4-2.5a1 1 0 01-.29-1.41z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div
                  ref={dropdownRef}
                  className="z-10 origin-top-right absolute mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none p-2"
                >
                  <div className="py-1">
                    <a
                      href="#"
                      className="font-poppins text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100 hover:text-[#408286] rounded-sm"
                      onClick={() => {
                        setSelectedType("Ordinance");
                        setIsDropdownOpen(false);
                      }}
                    >
                      Ordinance
                    </a>
                    <a
                      href="#"
                      className="font-poppins text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100 hover:text-[#408286] rounded-sm"
                      onClick={() => {
                        setSelectedType("Resolution");
                        setIsDropdownOpen(false);
                      }}
                    >
                      Resolution
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Filters Section */}
            <div className="">
              <div className="flex gap-2">
                {/* Committee Type Filter */}
                <div>
                  <select
                    value={committeeType}
                    onChange={(e) => setCommitteeType(e.target.value)}
                    className="cursor-pointer inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#5FA8AD]"
                  >
                    <option value="">All Committees</option>
                    <option value="Committee A">Committee A</option>
                    <option value="Committee B">Committee B</option>
                    <option value="Committee C">Committee C</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className=" cursor-pointer inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#5FA8AD]"
                  >
                    <option value="">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="For Vice Mayor's Signature">
                      For Vice Mayor's Signature
                    </option>
                    <option value="For Mailings">For Mailings</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Returned">Returned</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                {/* Completed Status Filter */}
                <div>
                  <select
                    value={completedStatus}
                    onChange={(e) => setCompletedStatus(e.target.value)}
                    className=" cursor-pointer inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#5FA8AD]"
                  >
                    <option value="">All</option>
                    <option value="True">True</option>
                    <option value="False">False</option>
                  </select>
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
                 <div className=" flex justify-end mb-2">
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
            <div className="h-[700px] overflow-auto">
              {/* Table with Zoom Applied */}
              <div style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}>
                <table className="w-full border-collapse rounded-lg overflow-hidden">
                  {/* Table Header */}
                  <thead>
                    <tr className="bg-[#408286] text-white text-left text-[14px]">
                      {/* Conditionally change the column name based on selectedType */}
                      <th rowSpan="2" className="border border-gray-300 px-4 py-2">
                        {selectedType === "Ordinance" ? "Ordinance No." : "Resolution No."}
                      </th>
                      <th rowSpan="2" className="border border-gray-300 px-4 py-2">
                        Date Approved
                      </th>
                      <th rowSpan="2" className="border border-gray-300 px-4 py-2">
                        Title
                      </th>
                      <th rowSpan="2" className="border border-gray-300 px-4 py-2">
                        Committee Sponsor
                      </th>
                      <th rowSpan="2" className="border border-gray-300 px-4 py-2">
                        Status
                      </th>
                      <th colSpan="2" className="border border-gray-300 px-4 py-2 text-center">
                        Vice Mayor's Office
                      </th>
                      {selectedType === "Ordinance" && (
                        <th colSpan="2" className="border border-gray-300 px-4 py-2 text-center">
                          City Mayor
                        </th>
                      )}
                      <th rowSpan="2" className="border border-gray-300 px-4 py-2">
                        Transmitted To
                      </th>
                      <th rowSpan="2" className="border border-gray-300 px-4 py-2">
                        Date Transmitted
                      </th>
                      <th rowSpan="2" className="border border-gray-300 px-4 py-2">
                        Completed
                      </th>
                      <th rowSpan="2" className="border border-gray-300 px-4 py-2">
                        Date of Completion
                      </th>
                      <th rowSpan="2" className="border border-gray-300 px-4 py-2">
                        Remarks
                      </th>
                      <th rowSpan="2" className="border border-gray-300 px-4 py-2">
                        Actions
                      </th>
                    </tr>
                    <tr className="bg-[#408286] text-white text-left text-[14px]">
                      {/* These columns are conditional for Ordinance and should not show for Resolution */}
                      <th className="border border-gray-300 px-4 py-2">
                        {selectedType === "Ordinance" ? "Forwarded (For Signature)" : "Forwarded"}
                      </th>
                      <th className="border border-gray-300 px-4 py-2">
                        {selectedType === "Ordinance" ? "Received (Signed)" : "Received"}
                      </th>
                      {selectedType === "Ordinance" && (
                        <>
                          <th className="border border-gray-300 px-4 py-2">Forwarded</th>
                          <th className="border border-gray-300 px-4 py-2">Received</th>
                        </>
                      )}
                    </tr>
                  </thead>

                  {/* Table Body */}
                  <tbody>
                    {filteredRows.map((row, index) => (
                      <tr key={index} className="border border-gray-300 hover:bg-gray-100 text-[14px]">
                        <td className="border border-gray-300 px-4 py-2">{row.ordinanceNo}</td>
                        <td className="border border-gray-300 px-4 py-2">{row.dateApproved}</td>
                        <td className="border border-gray-300 px-4 py-2">{row.title}</td>
                        <td className="border border-gray-300 px-4 py-2">{row.sponsor}</td>
                        <td className="border border-gray-300 px-4 py-2">{row.status}</td>
                        <td className="border border-gray-300 px-4 py-2">{row.vmForwarded}</td>
                        <td className="border border-gray-300 px-4 py-2">{row.vmReceived}</td>
                        {selectedType === "Ordinance" && (
                          <>
                            <td className="border border-gray-300 px-4 py-2">{row.cmForwarded}</td>
                            <td className="border border-gray-300 px-4 py-2">{row.cmReceived}</td>
                          </>
                        )}
                        <td className="border border-gray-300 px-4 py-2">{row.transmittedTo}</td>
                        <td className="border border-gray-300 px-4 py-2">{row.dateTransmitted}</td>
                        <td className="border border-gray-300 px-4 py-2">{row.completed}</td>
                        <td className="border border-gray-300 px-4 py-2">{row.dateOfCompletion}</td>
                        <td className="border border-gray-300 px-4 py-2">{row.remarks}</td>
                        <td className="px-4 py-2 flex space-x-1">
                          <button className="bg-[#70b8d3] hover:bg-[#3d9fdb] px-4 py-2 rounded-md text-white font-medium">
                            View
                          </button>
                          <button 
                          onClick={() => handleEditClick(index)}
                          className="bg-[#FFCC79] hover:bg-[#ecba69] px-4 py-2 rounded-md text-white font-medium">
                            Edit
                          </button>
                          <button
                            onClick={() => deleteRow(index)}
                            className="bg-[#FF6767] hover:bg-[#f35656] px-4 py-2 rounded-md text-white font-medium"
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
        </div>
      </div>
      <EditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        rowData={selectedRow}
        setRowData={setSelectedRow}
        onSave={handleSave}
      />;
    </div>
  );
}

export default Dashboard;