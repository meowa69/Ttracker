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
  const [isCommitteeDropdownOpen, setIsCommitteeDropdownOpen] = useState(false);
  const committeeDropdownRef = useRef(null);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState({});
  const notifDropdownRef = useRef(null);
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
  const [unviewedNotificationCount, setUnviewedNotificationCount] = useState(() => {
    const storedCount = localStorage.getItem("unviewedNotificationCount");
    return storedCount ? parseInt(storedCount, 10) : 0;
  });
  const [viewedNotificationStatuses, setViewedNotificationStatuses] = useState(() => {
    const storedStatuses = localStorage.getItem("viewedNotificationStatuses");
    return storedStatuses ? JSON.parse(storedStatuses) : {};
  });
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  // Get user role safely
  const userRole = (() => {
    const userDataRaw = localStorage.getItem("userData");
    if (!userDataRaw || userDataRaw === "undefined") {
      console.warn("userData in localStorage is missing or invalid:", userDataRaw);
      return "";
    }
    try {
      const userData = JSON.parse(userDataRaw);
      return userData?.role || "";
    } catch (error) {
      console.error("Failed to parse userData from localStorage:", error);
      return "";
    }
  })();

  // Update localStorage for viewed statuses and unviewed count
  useEffect(() => {
    localStorage.setItem("viewedNotificationStatuses", JSON.stringify(viewedNotificationStatuses));
    localStorage.setItem("unviewedNotificationCount", unviewedNotificationCount.toString());
  }, [viewedNotificationStatuses, unviewedNotificationCount]);

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
        transmitted_recipients: row.transmitted_recipients || [],
        dateTransmitted: row.date_transmitted,
        status: row.completed ? "Completed" : row.status,
      }));
      console.log("Fetched records:", formattedRows);
      setRows(formattedRows);
      setSelectedRow((prev) => (prev ? formattedRows.find((row) => row.id === prev.id) || prev : prev));
    } catch (error) {
      console.error("Error fetching records:", error.response?.data || error);
      alert("Failed to fetch records: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/notifications", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const notifications = response.data
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
        .slice(0, 50); // Limit to 50 for performance
      setNotifications(notifications.slice(0, 9)); // Latest 9 for dropdown

      // Calculate unviewed notifications
      let unviewedCount = 0;
      notifications.forEach((notif) => {
        const viewed = viewedNotificationStatuses[notif.notification_id];
        if (
          !viewed ||
          viewed.vmStatus !== notif.vm_status ||
          viewed.cmStatus !== notif.cm_status
        ) {
          unviewedCount++;
        }
      });
      setUnviewedNotificationCount(unviewedCount);
    } catch (error) {
      console.error("Error fetching notifications:", error.response?.data || error);
      Swal.fire("Error", "Failed to fetch notifications", "error");
    }
  };

  useEffect(() => {
    fetchRecords();
    fetchNotifications();
  }, []);

  const handleEditClick = (index) => {
    if (loading || !paginatedRows[index]) {
      console.warn("Cannot open EditModal: Data is loading or row is invalid");
      return;
    }
    const row = paginatedRows[index];
    setSelectedRow(row);
    setIsEditModalOpen(true);
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
      await updateNotifications([updatedRow]); // Pass only the updated row

      const documentType = updatedRow.document_type?.toLowerCase();
      if (["ordinance", "resolution", "motion"].includes(documentType)) {
        const formattedType = documentType.charAt(0).toUpperCase() + documentType.slice(1);
        showAlert(`${formattedType} No. ${updatedRow.no} has been updated`);
      }
    } catch (error) {
      console.error("Error in handleSave:", error);
      alert("Failed to save changes: " + (error.message || "Unknown error"));
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedRow(null);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (committeeDropdownRef.current && !committeeDropdownRef.current.contains(event.target)) {
        setIsCommitteeDropdownOpen(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setIsNotifDropdownOpen((prev) => {
          const newState = { ...prev, main: false };
          Object.keys(newState).forEach((key) => {
            newState[key] = false;
          });
          return newState;
        });
      } else {
        if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target)) {
          setIsNotifDropdownOpen((prev) => ({
            ...prev,
            main: false,
          }));
        }
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
      confirmButtonColor: "#408286",
      cancelButtonColor: "#6b7280",
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
    if (isNaN(days)) return "fill-red-600"; // Fallback to red if invalid
    if (days >= 8) return "fill-green-600";
    if (days >= 6) return "fill-yellow-600";
    return "fill-red-600";
  };

  const shouldShowBookmark = (row) => {
    const vmTime = calculateTimeRemaining(row.vmForwarded, row.vmReceived);
    const cmTime =
      row.document_type?.toLowerCase() === "ordinance"
        ? calculateTimeRemaining(row.cmForwarded, row.cmReceived)
        : "Not Started";
    const isCompleted = vmTime === "Completed" || cmTime === "Completed";
    const isOverdue = vmTime.includes("Overdue") || cmTime.includes("Overdue");
    const isInProgress =
      (row.vmForwarded && !row.vmReceived) ||
      (row.document_type?.toLowerCase() === "ordinance" && row.cmForwarded && !row.cmReceived);
    const isNotStarted = vmTime === "Not Started" && cmTime === "Not Started";
    return (isInProgress || isOverdue || isCompleted) && !isNotStarted;
  };

  const getStatusColor = (time) => {
    if (time === "Completed") return "bg-blue-600 text-blue-600";
    if (time.includes("Overdue")) return "bg-red-600 text-blue-600";
    const days = parseInt(time.split(" ")[0], 10);
    if (isNaN(days)) return "bg-red-600 text-blue-600"; // Fallback to red if invalid
    if (days >= 8) return "bg-green-600 text-blue-600";
    if (days >= 6) return "bg-yellow-600 text-blue-600";
    return "bg-red-600 text-blue-600";
  };

  const updateNotifications = async (data) => {
    try {
      const newNotifications = data
        .filter((row) => ["Ordinance", "Resolution", "Motion"].includes(row.document_type))
        .map((row) => {
          const vmTime = calculateTimeRemaining(row.vmForwarded, row.vmReceived);
          const cmTime =
            row.document_type.toLowerCase() === "ordinance"
              ? calculateTimeRemaining(row.cmForwarded, row.cmReceived)
              : "Not Started";
  
          const isCompleted = row.status === "Completed";
          const isOverdue = vmTime.includes("Overdue") || cmTime.includes("Overdue");
          const isNotStarted = vmTime === "Not Started" && cmTime === "Not Started";
  
          if (isNotStarted) return null; // Skip notifications for 'Not Started'
  
          let relevantTime, statusColor, notificationStatus;
  
          if (isCompleted || (vmTime === "Completed" && cmTime === "Completed")) {
            relevantTime = "Completed";
            statusColor = "bg-blue-600 text-blue-600";
            notificationStatus = "Completed";
          } else if (isOverdue) {
            relevantTime = vmTime.includes("Overdue") ? vmTime : cmTime;
            statusColor = "bg-red-600 text-red-600"; // Fixed: Match backend validation
            notificationStatus = "Overdue";
          } else {
            relevantTime = vmTime !== "Not Started" ? vmTime : cmTime;
            const days = parseInt(relevantTime.split(" ")[0], 10);
            notificationStatus = "In Progress";
            if (days >= 8) {
              statusColor = "bg-green-600 text-green-600"; // Fixed: Match backend validation
            } else if (days >= 6) {
              statusColor = "bg-yellow-600 text-yellow-600"; // Fixed: Match backend validation
            } else {
              statusColor = "bg-red-600 text-red-600"; // Fixed: Match backend validation
            }
          }
  
          return {
            record_id: row.id,
            notification_id: `${row.id}-${new Date().toISOString()}`,
            document_no: row.no,
            document_type: row.document_type,
            vm_status: vmTime,
            cm_status: row.document_type.toLowerCase() === "ordinance" ? cmTime : null,
            status: notificationStatus,
            status_color: statusColor,
            updated_at: row.updatedAt || new Date().toISOString(),
          };
        })
        .filter((notif) => notif !== null);
  
      // Send new notifications
      for (const notif of newNotifications) {
        await axios.post(
          "http://localhost:8000/api/notifications",
          notif,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      }
  
      // Fetch updated notifications
      await fetchNotifications();
  
      // Animate bell if there are new notifications
      if (newNotifications.length > 0) {
        bellControls.start({
          rotate: [0, 15, -15, 15, -15, 0],
          transition: { duration: 0.6, repeat: 1 },
        });
      }
    } catch (error) {
      console.error("Error updating notifications:", error.response?.data || error);
      Swal.fire("Error", "Failed to create notifications", "error");
    }
  };

  const handleNotificationOpen = () => {
    setIsOpen(true);
    setUnviewedNotificationCount(0);
    const newStatuses = { ...viewedNotificationStatuses };
    notifications.forEach((notif) => {
      newStatuses[notif.notification_id] = { vmStatus: notif.vm_status, cmStatus: notif.cm_status };
    });
    setViewedNotificationStatuses(newStatuses);
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(`http://localhost:8000/api/notifications/${notificationId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setNotifications((prev) => prev.filter((n) => n.notification_id !== notificationId));
      await fetchNotifications();
    } catch (error) {
      console.error("Error deleting notification:", error.response?.data || error);
      Swal.fire("Error", "Failed to delete notification", "error");
    }
  };

  const clearAllNotifications = async () => {
    try {
      await axios.delete("http://localhost:8000/api/notifications", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setNotifications([]);
      setUnviewedNotificationCount(0);
      setViewedNotificationStatuses({});
      localStorage.setItem("viewedNotificationStatuses", JSON.stringify({}));
      localStorage.setItem("unviewedNotificationCount", "0");
    } catch (error) {
      console.error("Error clearing notifications:", error.response?.data || error);
      Swal.fire("Error", "Failed to clear notifications", "error");
    }
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

        <div className="font-poppins font-bold uppercase px-4 mb-5 text-[#494444] text-[35px] flex justify-between">
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
              {unviewedNotificationCount > 0 && (
                <span className="absolute -top-0 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unviewedNotificationCount > 100 ? "99+" : unviewedNotificationCount}
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
                ref={notificationRef}
              >
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                  <div className="flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-900">Notification History</h3>
                    <p className="text-sm text-gray-500">{notifications.length} updates</p>
                  </div>
                  <div className="relative z-20 notification-menu" ref={notifDropdownRef}>
                    <button
                      onClick={() => setIsNotifDropdownOpen((prev) => ({ ...prev, main: !prev.main }))}
                      className="text-gray-600 hover:text-gray-900 focus:outline-none flex items-start hover:bg-gray-200 p-2 rounded-[100%]"
                    >
                      <img
                        src="src/assets/Images/menu.png"
                        alt="Options"
                        className="w-5 h-5"
                      />
                    </button>
                    {isNotifDropdownOpen.main && (
                      <div className="absolute right-0 mt-2 w-[250px] p-2 bg-white border border-gray-200 rounded-md shadow-lg z-30 notification-menu">
                        <button
                          onClick={clearAllNotifications}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                        >
                          <img
                            src="src/assets/Images/delete.png"
                            alt="Delete"
                            className="w-4 h-4"
                          />
                          Clear All Notifications
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {notifications.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {notifications.map((notif) => {
                      const statusColor = notif.status_color;
                      const uniqueKey = notif.notification_id;
                      const isThisDropdownOpen = isNotifDropdownOpen[uniqueKey] || false;
                      return (
                        <div
                          key={uniqueKey}
                          className="p-4 hover:bg-gray-50 transition-colors duration-150 group relative"
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${statusColor.split(" ")[0]}`}></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {notif.document_type} No. {notif.document_no}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                Vice Mayor: <span className="font-medium">{notif.vm_status}</span>
                              </p>
                              {notif.document_type.toLowerCase() === "ordinance" && (
                                <p className="text-xs text-gray-600 mt-1">
                                  City Mayor: <span className="font-medium">{notif.cm_status}</span>
                                </p>
                              )}
                              <p className={`text-xs mt-1 ${statusColor.split(" ")[1]}`}>
                                Status: {notif.status}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">{formatTimestamp(notif.updated_at)}</p>
                            </div>
                            <div
                              className={`absolute right-4 top-1/2 transform -translate-y-1/2 transition-opacity notification-menu z-40 ${
                                isThisDropdownOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                              }`}
                            >
                              <div className="relative">
                                <button
                                  onClick={() => setIsNotifDropdownOpen((prev) => ({
                                    ...prev,
                                    [uniqueKey]: !prev[uniqueKey],
                                  }))}
                                  className="text-gray-600 hover:text-gray-900 focus:outline-none flex items-center hover:bg-gray-200 p-2 rounded-[100%]"
                                >
                                  <img
                                    src="src/assets/Images/menu.png"
                                    alt="Options"
                                    className="w-5 h-5"
                                  />
                                </button>
                                {isThisDropdownOpen && (
                                  <div className="absolute right-0 mt-2 w-[250px] p-2 bg-white border border-gray-200 rounded-md shadow-lg z-60 notification-menu">
                                    <button
                                      onClick={() => {
                                        deleteNotification(notif.notification_id);
                                        setIsNotifDropdownOpen((prev) => ({
                                          ...prev,
                                          [uniqueKey]: false,
                                        }));
                                      }}
                                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                    >
                                      <img
                                        src="src/assets/Images/delete.png"
                                        alt="Delete"
                                        className="w-4 h-4"
                                      />
                                      Delete this notification
                                    </button>
                                  </div>
                                )}
                              </div>
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

            <div className="relative w-40" ref={committeeDropdownRef}>
              <div
                className="cursor-pointer w-full appearance-none rounded-md border border-gray-300 shadow-sm px-4 py-2 pr-10 bg-white text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#5FA8AD] truncate"
                onClick={() => setIsCommitteeDropdownOpen((prev) => !prev)}
              >
                {committeeType || "Committee"}
              </div>
              <img
                src="src/assets/Images/down2.png"
                alt="Dropdown Icon"
                className="absolute top-1/2 right-3 transform -translate-y-1/2 w-4 h-4 pointer-events-none"
              />
              {isCommitteeDropdownOpen && (
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
                          setIsCommitteeDropdownOpen(false);
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
                              <td className={userRole === "user" ? "px-2 py-2 w-[20%] min-w-[200px] border font-poppins text-sm text-gray-700" : "px-2 py-2 w-[27%] min-w-[200px] border font-poppins text-sm text-gray-700"}>
                                <div className={userRole === "user" ? "flex justify-center gap-2" : "md:flex md:flex-wrap md:justify-start gap-2"}>
                                  <button
                                    onClick={() => handleViewClick(index)}
                                    className="bg-[#37ad6c] hover:bg-[#2d8f59] px-4 py-2 rounded-md text-white font-medium flex items-center gap-1 font-poppins text-sm shadow-md"
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
                                    className="bg-[#f5bd64] hover:bg-[#e9b158] px-4 py-2 rounded-md text-white font-medium flex items-center gap-1 font-poppins text-sm shadow-md"
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
                                    className="bg-[#3b7bcf] hover:bg-[#3166ac] px-4 py-2 rounded-md text-white font-medium flex items-center gap-1 font-poppins text-sm shadow-md"
                                  >
                                    <img
                                      src="src/assets/Images/print.png"
                                      alt="Print"
                                      className="w-5 h-5 invert self-center"
                                    />
                                    Print
                                  </button>
                                  {userRole !== "user" && (
                                    <button
                                      onClick={() => deleteRow(index, row.id)}
                                      className="bg-[#FF6767] hover:bg-[#f35656] px-4 py-2 rounded-md text-white font-medium flex items-center gap-1 font-poppins text-sm shadow-md"
                                    >
                                      <img
                                        src="src/assets/Images/delete.png"
                                        alt="Delete"
                                        className="w-5 h-5 invert self-center"
                                      />
                                      Delete
                                    </button>
                                  )}
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
                  className="bg-[#408286] hover:bg-[#5FA8AD] text-white font-bold py-2 px-4 rounded-l-md shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
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
                  className="bg-[#408286] hover:bg-[#5FA8AD] text-white font-bold py-2 px-4 rounded-r-md shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
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