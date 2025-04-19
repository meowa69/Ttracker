import Sidebar from "../Components/Sidebar";
import { useState, useEffect, useRef } from "react";
import EditModal from "../Modal/EditModal";
import ViewModal from "../Modal/ViewModal";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import Swal from "sweetalert2";
import axios from "axios";
import { TransmittalSheet, getTransmittalData } from "../Components/TransmittalSheet";

function Dashboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const committees = [""];
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
  const [yearRange, setYearRange] = useState("");
  const [committeeType, setCommitteeType] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [completedStatus, setCompletedStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const maxVisiblePages = 5;
  const [alert, setAlert] = useState({ show: false, message: "", progress: 100 });
  const [notifications, setNotifications] = useState([]);
  const bellControls = useAnimation();
  const [allNotifications, setAllNotifications] = useState(() => {
  // Initialize from localStorage to persist across refreshes
  const storedNotifications = localStorage.getItem("allNotifications");
  return storedNotifications ? JSON.parse(storedNotifications) : [];
});
  // Initialize states from localStorage
  const [hasViewedNotifications, setHasViewedNotifications] = useState(() => {
    const storedValue = localStorage.getItem("hasViewedNotifications");
    return storedValue ? JSON.parse(storedValue) : false;
  });
  const [viewedNotificationStatuses, setViewedNotificationStatuses] = useState(() => {
    const storedStatuses = localStorage.getItem("viewedNotificationStatuses");
    return storedStatuses ? JSON.parse(storedStatuses) : {};
  });
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  // Update localStorage whenever states change
  useEffect(() => {
    localStorage.setItem("hasViewedNotifications", JSON.stringify(hasViewedNotifications));
    localStorage.setItem("viewedNotificationStatuses", JSON.stringify(viewedNotificationStatuses));
  }, [hasViewedNotifications, viewedNotificationStatuses]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8000/api/get-record", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const formattedRows = response.data.map((row) => ({
        ...row,
        vmForwarded: row.vm_forwarded || row.vice_mayor_forwarded,
        vmReceived: row.vm_received || row.vice_mayor_received,
        cmForwarded: row.cm_forwarded || row.city_mayor_forwarded,
        cmReceived: row.cm_received || row.city_mayor_received,
        transmitted_recipients: row.editRecord?.transmittedRecipients || row.transmitted_recipients || [],
        dateTransmitted: row.date_transmitted,
        status: row.completed ? "Completed" : row.status,
      }));
      setRows(formattedRows);
      setSelectedRow((prev) => (prev ? formattedRows.find((row) => row.id === prev.id) || prev : prev));
      updateNotifications(formattedRows);
    } catch (error) {
      console.error("Error fetching records:", error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleEditClick = (index) => {
    const row = paginatedRows[index];
    setSelectedRow(row);
    setTimeout(() => {
      setIsEditModalOpen(true);
    }, 0);
  };

  const handleViewClick = (index) => {
    const row = paginatedRows[index];
    setSelectedRow(row);
    setIsViewModalOpen(true);
  };

  const handleSave = async (updatedRow) => {
    try {
      setRows((prevRows) =>
        prevRows.map((row) => (row.id === updatedRow.id ? updatedRow : row))
      );
      setSelectedRow(updatedRow);
      setIsEditModalOpen(false);

      await fetchRecords();

      setRows((prevRows) =>
        prevRows.map((row) =>
          row.id === updatedRow.id ? { ...row, transmitted_recipients: updatedRow.transmitted_recipients } : row
        )
      );

      const documentType = updatedRow.document_type?.toLowerCase();
      if (["ordinance", "resolution", "motion"].includes(documentType)) {
        const formattedType = documentType.charAt(0).toUpperCase() + documentType.slice(1);
        showAlert(`${formattedType} No. ${updatedRow.no} has been updated`);
      }
      updateNotifications(rows);
    } catch (error) {
      console.error("Error in handleSave:", error);
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedRow(null);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isOutsideNotification = notificationRef.current && !notificationRef.current.contains(event.target);
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (isOutsideNotification) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
          const response = await axios.delete(`http://localhost:8000/api/delete-record/${id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          if (response.status === 200) {
            setRows((prevRows) => prevRows.filter((row) => row.id !== id));
            Swal.fire("Deleted!", "The document has been deleted.", "success");
            updateNotifications(rows);
          }
        } catch (error) {
          console.error("Error deleting record:", error.response?.data || error);
          Swal.fire("Error", "Failed to delete record: " + (error.response?.data?.error || error.message), "error");
        }
      }
    });
  };

  const filteredRows = rows.filter((row) => {
    const matchesYearRange = !yearRange || row.date_approved?.includes(yearRange);
    const matchesCommitteeType = !committeeType || row.sponsor === committeeType;
    const matchesStatus = !statusFilter || row.status === statusFilter;
    const matchesCompletedStatus =
      completedStatus === "" ||
      (completedStatus === "True" ? row.status === "Completed" : row.status !== "Completed");
    const matchesDocumentType = selectedType === "Document" || row.document_type === selectedType;
    return (
      matchesYearRange &&
      matchesCommitteeType &&
      matchesStatus &&
      matchesCompletedStatus &&
      matchesDocumentType
    );
  });

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const paginatedRows = filteredRows.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredRows.length / recordsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const getVisiblePages = () => {
    const halfRange = Math.floor(maxVisiblePages / 2);
    let startPage = Math.max(1, currentPage - halfRange);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const visiblePages = getVisiblePages();
  const showPrevEllipsis = visiblePages[0] > 1;
  const showNextEllipsis = visiblePages[visiblePages.length - 1] < totalPages;

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.1, 1.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.1, 0.5));

  const calculateTimeRemaining = (forwardedDate, receivedDate) => {
    if (!forwardedDate) return "Not Started";
    if (receivedDate && new Date(receivedDate).toString() !== "Invalid Date") return "Completed";
    const forwarded = new Date(forwardedDate);
    const now = new Date();
    const deadline = new Date(forwarded);
    deadline.setDate(forwarded.getDate() + 10);
    const diffMs = deadline - now;
    if (diffMs <= 0) {
      const overdueMs = now - deadline;
      const overdueDays = Math.floor(overdueMs / (1000 * 60 * 60 * 24));
      return `Overdue ${overdueDays} days`;
    }
    const daysRemaining = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return `${daysRemaining} days remaining`;
  };

  const getBookmarkColor = (time) => {
    if (time === "Completed") return "fill-blue-600";
    if (time.includes("Overdue")) return "fill-red-600";
    const days = parseInt(time.split(" ")[0], 10);
    if (isNaN(days)) return "fill-gray-600";
    if (days >= 8) return "fill-green-600";
    if (days >= 6) return "fill-yellow-300";
    return "fill-red-600";
  };

  const shouldShowBookmark = (row) => {
    const vmTime = calculateTimeRemaining(row.vmForwarded, row.vmReceived);
    const cmTime =
      row.document_type?.toLowerCase() === "ordinance"
        ? calculateTimeRemaining(row.cmForwarded, row.cmReceived)
        : "Not Started";
    const vmPending = row.vmForwarded && !row.vmReceived;
    const cmPending = row.document_type?.toLowerCase() === "ordinance" && row.cmForwarded && !row.cmReceived;
    const isCompleted =
      row.document_type?.toLowerCase() === "ordinance"
        ? vmTime === "Completed" && cmTime === "Completed"
        : vmTime === "Completed";
    const isNotStarted =
      row.document_type?.toLowerCase() === "ordinance"
        ? vmTime === "Not Started" && cmTime === "Not Started"
        : vmTime === "Not Started";
    return (vmPending || cmPending || isCompleted) && !isNotStarted;
  };

  const getStatusColor = (time) => {
    if (time === "Completed") return "bg-blue-600 text-blue-600";
    if (time.includes("Overdue")) return "bg-red-600 text-red-600";
    const days = parseInt(time.split(" ")[0], 10);
    if (isNaN(days)) return "bg-gray-600 text-gray-600";
    if (days >= 8) return "bg-green-600 text-green-600";
    if (days >= 6) return "bg-yellow-300 text-yellow-300";
    return "bg-red-600 text-red-600";
  };

  useEffect(() => {
    localStorage.setItem("allNotifications", JSON.stringify(allNotifications));
  }, [allNotifications]);

  const updateNotifications = (data) => {
    // Original notification list (current state)
    const currentNotificationList = data
      .filter((row) => ["Ordinance", "Resolution", "Motion"].includes(row.document_type))
      .map((row) => {
        const vmTime = calculateTimeRemaining(row.vmForwarded, row.vmReceived);
        const cmTime =
          row.document_type.toLowerCase() === "ordinance"
            ? calculateTimeRemaining(row.cmForwarded, row.cmReceived)
            : "Not Started";
        const vmPending = row.vmForwarded && !row.vmReceived;
        const cmPending = row.document_type.toLowerCase() === "ordinance" && row.cmForwarded && !row.cmReceived;
        const isCompleted = row.status === "Completed";
        const isOverdue = vmTime.includes("Overdue") || cmTime.includes("Overdue");
  
        if (vmPending || cmPending || isCompleted || isOverdue) {
          const relevantTime =
            vmTime !== "Not Started" && vmTime !== "Completed"
              ? vmTime
              : cmTime !== "Not Started" && cmTime !== "Completed"
              ? cmTime
              : vmTime === "Completed" || cmTime === "Completed"
              ? "Completed"
              : "Not Started";
          const statusColor = getStatusColor(relevantTime);
  
          return {
            id: row.id,
            documentNo: row.no,
            documentType: row.document_type,
            vmStatus: vmTime,
            cmStatus: cmTime,
            status: isCompleted ? "Completed" : isOverdue ? "Overdue" : "Pending",
            statusColor: statusColor,
            updatedAt: row.updatedAt || new Date().toISOString(),
          };
        }
        return null;
      })
      .filter((notification) => notification !== null)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 9);
  
    // Set the current notifications (original behavior)
    setNotifications(currentNotificationList);
  
    // Add new notifications to history without updating existing ones
    setAllNotifications((prevAllNotifications) => {
      const newNotifications = currentNotificationList.filter((newNotif) => {
        // Only add if it's a new status change
        const latestForThisId = prevAllNotifications.find(n => n.id === newNotif.id);
        if (!latestForThisId) return true;
        return (
          latestForThisId.vmStatus !== newNotif.vmStatus || 
          latestForThisId.cmStatus !== newNotif.cmStatus
        );
      });
      
      const combinedNotifications = [...newNotifications, ...prevAllNotifications];
      // Limit to 50 items for history
      return combinedNotifications.slice(0, 50);
    });
  
    // Original change detection logic
    const currentStatuses = {};
    currentNotificationList.forEach((notif) => {
      currentStatuses[notif.id] = { vmStatus: notif.vmStatus, cmStatus: notif.cmStatus };
    });
  
    let hasChanges = false;
    for (const id in currentStatuses) {
      if (!viewedNotificationStatuses[id]) {
        hasChanges = true;
        break;
      }
      const viewed = viewedNotificationStatuses[id];
      const current = currentStatuses[id];
      if (viewed.vmStatus !== current.vmStatus || viewed.cmStatus !== current.cmStatus) {
        hasChanges = true;
        break;
      }
    }
  
    if (hasChanges) {
      setHasViewedNotifications(false);
    }
  
    if (currentNotificationList.length > 0) {
      bellControls.start({
        rotate: [0, 15, -15, 15, -15, 0],
        transition: { duration: 0.6, repeat: 1 }
      });
    }
  };

  const handleNotificationOpen = () => {
    setIsOpen(true);
    setHasViewedNotifications(true);
    // Update viewed statuses only for new notifications
    const newStatuses = { ...viewedNotificationStatuses };
    notifications.forEach((notif) => {
      newStatuses[notif.id] = { vmStatus: notif.vmStatus, cmStatus: notif.cmStatus };
    });
    setViewedNotificationStatuses(newStatuses);
  };

  const showAlert = (message) => {
    setAlert({ show: true, message, progress: 100 });
  };

  const closeAlert = () => {
    setAlert({ show: false, message: "", progress: 0 });
  };

  useEffect(() => {
    if (alert.show) {
      const totalDuration = 3000;
      const intervalTime = 30;
      const step = (intervalTime / totalDuration) * 100;
      const progressInterval = setInterval(() => {
        setAlert((prev) => {
          if (prev.progress <= 0) {
            clearInterval(progressInterval);
            return { ...prev, show: false, message: "", progress: 0 };
          }
          return { ...prev, progress: prev.progress - step };
        });
      }, intervalTime);
      return () => clearInterval(progressInterval);
    }
  }, [alert.show]);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handlePrintClick = (index) => {
    const row = paginatedRows[index];
    const transmittalData = getTransmittalData(row);
    setPreviewData(transmittalData);
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setPreviewData(null);
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex flex-col w-full h-screen overflow-y-auto p-4">
        {alert.show && (
          <div className="absolute top-4 right-4 bg-[#408286] text-white px-4 py-3 rounded shadow-lg flex items-center w-80 z-50">
            <svg
              className="mr-2 w-8 h-8 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="flex-grow font-poppins">{alert.message}</span>
            <button onClick={closeAlert} className="ml-4 text-white text-xl">
              ×
            </button>
            <div
              className="absolute bottom-0 left-0 h-1 bg-white transition-all"
              style={{ width: `${alert.progress}%` }}
            ></div>
          </div>
        )}

        <div className="font-poppins font-bold uppercase px-4 mb-8 text-[#494444] text-[35px] flex justify-between">
          <div className="flex justify-between items-center w-full">
            <h1 className="font-bold uppercase text-[#494444] text-[35px]">Dashboard</h1>
          </div>
          <motion.div
            ref={notificationRef}
            className="bg-[#408286] text-white px-4 py-2 rounded-full flex shadow-md cursor-pointer"
            animate={bellControls}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleNotificationOpen}
          >
            <div className="relative flex items-center">
              <img
                src="src/assets/Images/notif.png"
                alt="notification"
                className="w-5 h-5 self-center invert shadow-lg"
              />
              {notifications.length > 0 && !hasViewedNotifications && (
                <span className="absolute -top-0 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications.length > 100 ? "99+" : notifications.length}
                </span>
              )}
            </div>
          </motion.div>
          <AnimatePresence>
            {isOpen && (
              <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-8 top-16 mt-2 w-96 bg-white text-gray-800 shadow-xl rounded-lg z-10 max-h-[800px] overflow-y-auto border border-gray-200"
            >
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900">Notification History</h3>
                <p className="text-sm text-gray-500">{allNotifications.length} updates</p>
              </div>
              {allNotifications.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {allNotifications.map((notif, index) => {
                    const statusColor = notif.statusColor;
            
                    return (
                      <div
                        key={`${notif.id}-${index}`} // Unique key for each notification
                        className="p-4 hover:bg-gray-50 transition-colors duration-150"
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${statusColor.split(" ")[0]}`}></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {notif.documentType} No. {notif.documentNo}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              Vice Mayor: <span className="font-medium">{notif.vmStatus}</span>
                            </p>
                            {notif.documentType.toLowerCase() === "ordinance" && (
                              <p className="text-xs text-gray-600 mt-1">
                                City Mayor: <span className="font-medium">{notif.cmStatus}</span>
                              </p>
                            )}
                            <p className={`text-xs mt-1 ${statusColor.split(" ")[1]}`}>
                              Status: {notif.status}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">{formatTimestamp(notif.updatedAt)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 text-center">
                  <p className="text-sm text-gray-500">No notification history</p>
                </div>
              )}
            </motion.div>
            )}
          </AnimatePresence>
        </div>

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
                          setCommitteeType(committee.committee_name);
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
          <div className="bg-white w-full border rounded-md shadow-lg p-4 min-h-[100px] flex flex-col">
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

            <div className="flex flex-col flex-grow">
              <div className="relative w-full border rounded-lg shadow-lg overflow-hidden flex-grow">
                <div
                  className="overflow-auto"
                  style={{
                    transform: `scale(${zoomLevel})`,
                    transformOrigin: "top left",
                    minHeight: paginatedRows.length > 0 ? "300px" : "auto",
                    maxHeight: "650px",
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
                          <td colSpan={selectedType === "Document" ? 6 : 5} className="text-center py-6">
                            <div className="flex justify-center items-center">
                              <div className="w-7 h-7 border-4 border-[#408286] border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          </td>
                        </tr>
                      )}
                      {!loading && paginatedRows.length > 0 ? (
                        paginatedRows.map((row, index) => {
                          const vmTime = calculateTimeRemaining(row.vmForwarded, row.vmReceived);
                          const cmTime =
                            row.document_type?.toLowerCase() === "ordinance"
                              ? calculateTimeRemaining(row.cmForwarded, row.cmReceived)
                              : "Not Started";
                          const relevantTime =
                            vmTime !== "Not Started" && vmTime !== "Completed"
                              ? vmTime
                              : cmTime !== "Not Started" && cmTime !== "Completed"
                              ? cmTime
                              : vmTime === "Completed" || cmTime === "Completed"
                              ? "Completed"
                              : "Not Started";
                          const bookmarkColor = getBookmarkColor(relevantTime);
                          const showBookmark = shouldShowBookmark(row);

                          return (
                            <tr
                              key={row.id}
                              className="border border-gray-300 hover:bg-gray-100 text-[14px]"
                            >
                              {selectedType === "Document" && (
                                <td className="border border-gray-300 px-4 py-2 font-poppins text-sm text-gray-700 relative">
                                  {showBookmark && (
                                    <motion.div
                                      className="absolute left-0 top-0 flex items-center cursor-pointer"
                                      initial={{ x: -125 }}
                                      whileHover={{ x: 0 }}
                                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    >
                                      <div className="bg-white to-gray-100 border border-gray-300 rounded-lg p-2 text-sm font-semibold font-poppins text-gray-500 w-[120px] text-center shadow-sm hover:shadow-md transition-shadow duration-200">
                                        {relevantTime.toUpperCase()}
                                      </div>
                                      <svg
                                        className={`w-6 h-12 ${bookmarkColor} transform rotate-[-90deg] cursor-pointer`}
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 48"
                                        fill="currentColor"
                                      >
                                        <path d="M2 2H22V42L17 36L12 30L2 42V2Z" />
                                      </svg>
                                    </motion.div>
                                  )}
                                  {row.document_type}
                                </td>
                              )}
                              <td className="border border-gray-300 px-4 py-2 font-poppins text-sm text-gray-700 relative">
                                {selectedType !== "Document" && showBookmark && (
                                  <motion.div
                                    className="absolute left-0 top-0 flex items-center cursor-pointer"
                                    initial={{ x: -125 }}
                                    whileHover={{ x: 0 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                  >
                                    <div className="bg-white to-gray-100 border border-gray-300 rounded-lg p-2 text-sm font-semibold font-poppins text-gray-500 w-[120px] text-center shadow-sm hover:shadow-md transition-shadow duration-200">
                                      {relevantTime.toUpperCase()}
                                    </div>
                                    <svg
                                      className={`w-6 h-12 ${bookmarkColor} transform rotate-[-90deg] cursor-pointer`}
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 24 48"
                                      fill="currentColor"
                                    >
                                      <path d="M2 2H22V42L17 36L12 30L2 42V2Z" />
                                    </svg>
                                  </motion.div>
                                )}
                                {row.no}
                              </td>
                              <td className="border border-gray-300 px-4 py-2 w-[40%] text-justify font-poppins text-sm text-gray-700">
                                {row.title}
                              </td>
                              <td className="border border-gray-300 px-4 py-2 w-[10%] text-justify font-poppins text-sm text-gray-700">
                                {row.status || "None"}
                              </td>
                              <td className="border border-gray-300 px-4 py-2 text-justify font-poppins text-sm text-gray-700">
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
                                    onClick={() => handlePrintClick(index)}
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
                          );
                        })
                      ) : (
                        !loading && (
                          <tr>
                            <td colSpan={selectedType === "Document" ? 6 : 5} className="text-center text-gray-500 py-6 text-md font-poppins">
                              No data yet
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-center mt-4 items-center">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="bg-[#408286] hover:bg-[#5FA8AD] text-white font-bold py-2 px-4 rounded-l-md disabled:bg-gray-300"
                >
                  Previous
                </button>
                {showPrevEllipsis && (
                  <span className="mx-1 py-2 px-4 text-gray-700">...</span>
                )}
                {visiblePages.map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`mx-[2px] py-2 px-4 rounded-md ${
                      currentPage === page
                        ? "bg-[#5FA8AD] text-white"
                        : "bg-[#408286] text-white hover:bg-[#5FA8AD]"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                {showNextEllipsis && (
                  <span className="mx-1 py-2 px-4 text-gray-700">...</span>
                )}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="bg-[#408286] hover:bg-[#5FA8AD] text-white font-bold py-2 px-4 rounded-r-md disabled:bg-gray-300"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        rowData={selectedRow}
        onSave={handleSave}
        setRowData={setSelectedRow} 
      />
      <ViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        rowData={selectedRow}
      />
      <div>
        {isPreviewOpen && previewData && (
          <TransmittalSheet
            documentData={previewData}
            onPrint={() => console.log("Printing...")}
            onClose={handleClosePreview}
          />
        )}
      </div>
      
    </div>
  );
}

export default Dashboard;