import Sidebar from "../Components/Sidebar";
import { useState, useEffect, useRef } from "react";
import EditModal from "../Modal/EditModal";
import ViewModal from "../Modal/ViewModal";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import axios from "axios";

function Dashboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const committees = ["Agriculture", "Arbitration", "Barangay Affairs"];

  const [selectedType, setSelectedType] = useState("Document");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCommittees = committees.filter((committee) =>
    committee.toLowerCase().startsWith(searchTerm.toLowerCase())
  );

  // Filter states
  const [yearRange, setYearRange] = useState("");
  const [committeeType, setCommitteeType] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [completedStatus, setCompletedStatus] = useState("");

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/get-record", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setRows(response.data);
    } catch (error) {
      console.error("Error fetching records:", error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // Modal handlers
  const handleEditClick = (index) => {
    const row = rows[index];
    setSelectedRow(row);
    setIsEditModalOpen(true);
  };

  const handleViewClick = (index) => {
    setSelectedRow({ ...rows[index], index });
    setIsViewModalOpen(true);
  };

  const handleSave = (updatedRow) => {
    setRows((prevRows) =>
      prevRows.map((row) => (row.id === updatedRow.id ? updatedRow : row))
    );
    setSelectedRow(updatedRow); // Update selectedRow to reflect changes
    setIsEditModalOpen(false);
    fetchRecords(); // Refresh from server to ensure sync
  };

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle deletion
  const deleteRow = async (index, id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this document?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.delete(`http://127.0.0.1:8000/api/add-record/${id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          if (response.status === 200) {
            setRows((prevRows) => prevRows.filter((_, i) => i !== index));
            Swal.fire("Deleted!", "The document has been deleted.", "success");
          }
        } catch (error) {
          console.error("Error deleting record:", error);
          Swal.fire("Error", "Failed to delete record.", "error");
        }
      }
    });
  };

  // Filter rows based on selected filters
  const filteredRows = rows.filter((row) => {
    const matchesYearRange = !yearRange || row.date_approved.includes(yearRange);
    const matchesCommitteeType = !committeeType || row.sponsor === committeeType;
    const matchesStatus = !statusFilter || row.status === statusFilter;
    const matchesCompletedStatus = completedStatus === "" || (completedStatus === "True" ? row.status === "Completed" : row.status !== "Completed");
    const matchesDocumentType = selectedType === "Document" || row.document_type === selectedType;

    return (
      matchesYearRange &&
      matchesCommitteeType &&
      matchesStatus &&
      matchesCompletedStatus &&
      matchesDocumentType
    );
  });

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.1, 1.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.1, 0.5));

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex flex-col w-full h-screen overflow-y-auto p-4">
        <div className="font-poppins font-bold uppercase px-4 mb-8 text-[#494444] text-[35px] flex justify-between">
          <h1>Dashboard</h1>
          <motion.div
            ref={notificationRef}
            className="bg-[#408286] text-white px-4 py-2 rounded-[100%] flex shadow-md cursor-pointer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(!isOpen)}
          >
            <img
              src="src/assets/Images/notif.png"
              alt="notification"
              className="w-5 h-5 self-center invert shadow-lg"
            />
          </motion.div>
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
          <div className="flex gap-2">
            <div className="relative">
              <select
                className="cursor-pointer inline-flex justify-center w-full appearance-none rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#5FA8AD] pr-10"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="Document">Document</option>
                <option value="Ordinance">Ordinance</option>
                <option value="Resolution">Resolution</option>
                <option value="Motion">Motion</option>
              </select>
              <img
                src="src/assets/Images/down2.png"
                alt="Dropdown Icon"
                className="absolute top-1/2 right-3 transform -translate-y-1/2 w-4 h-4 pointer-events-none"
              />
            </div>

            <div className="relative w-40" ref={dropdownRef}>
              <div
                className="cursor-pointer w-full appearance-none rounded-md border border-gray-300 shadow-sm px-4 py-2 pr-10 bg-white text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#5FA8AD] truncate"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
              >
                {committeeType || "Committee"}
              </div>
              <img
                src="src/assets/Images/down2.png"
                alt="Dropdown Icon"
                className="absolute top-1/2 right-3 transform -translate-y-1/2 w-4 h-4 pointer-events-none"
              />
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

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="cursor-pointer inline-flex justify-center w-full appearance-none rounded-md border border-gray-300 shadow-sm px-4 py-2 pr-10 bg-white text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#5FA8AD]"
              >
                <option value="">Status</option>
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

            <div className="flex space-x-2 items-center">
              <input
                type="date"
                onChange={(e) => setYearRange(e.target.value)}
                onFocus={(e) => e.target.showPicker()}
                className="border cursor-pointer border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#5FA8AD] rounded-md"
              />
            </div>
          </div>

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

        <div className="flex-grow px-4 py-2">
          <div className="bg-white w-full border rounded-md shadow-lg p-8 min-h-[200px]">
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

            <div className="relative w-full border rounded-lg shadow-lg overflow-hidden">
              <div
                className="overflow-auto"
                style={{
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: "top left",
                  minHeight: filteredRows.length > 0 ? "300px" : "auto",
                  maxHeight: "690px",
                  position: "relative",
                }}
              >
                <table className="w-full border-collapse">
                  <thead className="bg-[#408286] text-white sticky top-0 z-10">
                    <tr className="text-left text-[14px]">
                      {selectedType === "Document" && (
                        <th className="border border-gray-300 px-4 py-4">Document</th>
                      )}
                      <th className="border border-gray-300 px-4 py-4">
                        {selectedType === "Document"
                          ? "No."
                          : selectedType === "Ordinance"
                          ? "Ordinance No."
                          : selectedType === "Motion"
                          ? "Motion No."
                          : "Resolution No."}
                      </th>
                      <th className="border border-gray-300 px-4 py-4 text-center">Title</th>
                      <th className="border border-gray-300 px-4 py-4">Status</th>
                      <th className="border border-gray-300 px-4 py-4">Remarks</th>
                      <th className="border border-gray-300 px-4 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && (
                      <tr>
                        <td colSpan="6" className="text-center py-6">
                          <div className="flex justify-center items-center">
                            <div className="w-7 h-7 border-4 border-[#408286] border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        </td>
                      </tr>
                    )}
                    {!loading && filteredRows.length > 0 ? (
                      filteredRows.map((row, index) => (
                        <tr
                          key={row.id}
                          className="border border-gray-300 hover:bg-gray-100 text-[14px]"
                        >
                          {selectedType === "Document" && (
                            <td className="border border-gray-300 px-4 py-2 font-poppins text-sm text-gray-700">
                              {row.document_type}
                            </td>
                          )}
                          <td className="border border-gray-300 px-4 py-2 font-poppins text-sm text-gray-700">
                            {row.no}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 w-[41%] text-justify font-poppins text-sm text-gray-700">
                            {row.title}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 font-poppins text-sm text-gray-700">
                            {row.status || "None"}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 font-poppins text-sm text-gray-700">
                            {row.remarks || "None"}
                          </td>
                          <td className="px-2 py-2 w-[27%] border font-poppins text-sm text-gray-700">
                            <div className="grid grid-cols-2 gap-1 md:flex md:flex-wrap md:justify-start">
                              <button
                                onClick={() => handleViewClick(index)}
                                className="bg-[#37ad6c] hover:bg-[#2d8f59] px-4 py-2 rounded-md text-white font-medium flex items-center gap-1 font-poppins text-sm"
                              >
                                <img
                                  src="src/assets/Images/view.png"
                                  alt="View"
                                  className="w-5 h-5 invert self-center"
                                />
                                View
                              </button>
                              <button
                                onClick={() => handleEditClick(index)}
                                className="bg-[#f5bd64] hover:bg-[#e9b158] px-4 py-2 rounded-md text-white font-medium flex items-center gap-1 font-poppins text-sm"
                              >
                                <img
                                  src="src/assets/Images/edit.png"
                                  alt="Edit"
                                  className="w-5 h-5 invert self-center"
                                />
                                Edit
                              </button>
                              <button
                                className="bg-[#3b7bcf] hover:bg-[#3166ac] px-4 py-2 rounded-md text-white font-medium flex items-center gap-1 font-poppins text-sm"
                              >
                                <img
                                  src="src/assets/Images/print.png"
                                  alt="Print"
                                  className="w-5 h-5 invert self-center"
                                />
                                Print
                              </button>
                              <button
                                onClick={() => deleteRow(index, row.id)}
                                className="bg-[#FF6767] hover:bg-[#f35656] px-4 py-2 rounded-md text-white font-medium flex items-center gap-1 font-poppins text-sm"
                              >
                                <img
                                  src="src/assets/Images/delete.png"
                                  alt="Delete"
                                  className="w-5 h-5 invert self-center"
                                />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      !loading && (
                        <tr>
                          <td colSpan="6" className="text-center text-gray-500 py-6 text-md font-poppins">
                            No data yet
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        rowData={selectedRow}
        setRowData={setSelectedRow}
        onSave={handleSave}
      />
      <ViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        rowData={selectedRow}
      />
    </div>
  );
}

export default Dashboard;