import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { printReferral, getReferralData } from "../Components/PrintReferral";
import DeletionRequestModal from "../Modal/DeleteRequestModal";

const EditModal = ({ isOpen, onClose, rowData: initialRowData, onSave, setRowData }) => {
  const [committeesWithTerms, setCommitteesWithTerms] = useState([]);
  const [localRowData, setLocalRowData] = useState({});
  const [vmTimeRemaining, setVmTimeRemaining] = useState("Not Started");
  const [cmTimeRemaining, setCmTimeRemaining] = useState("Not Started");
  const [isVmReceivedEditing, setIsVmReceivedEditing] = useState(false);
  const [isCmReceivedEditing, setIsCmReceivedEditing] = useState(false);
  const vmReceivedInputRef = useRef(null);
  const cmReceivedInputRef = useRef(null);
  const [newRecipient, setNewRecipient] = useState({ name: "", designation: "", address: "" });
  const [recipientList, setRecipientList] = useState([]);
  const [recipientsToRemove, setRecipientsToRemove] = useState([]);
  const [isDeletionModalOpen, setIsDeletionModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataCommitted, setIsDataCommitted] = useState(false);

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

  // Fetch record data including recipients when modal opens
  useEffect(() => {
    if (isOpen && initialRowData?.id) {
      const fetchRecordData = async () => {
        setIsLoading(true);
        try {
          const response = await axios.get(`http://localhost:8000/api/update-record/${initialRowData.id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          const fetchedData = response.data.data;
          const updatedRowData = {
            ...initialRowData,
            ...fetchedData,
            completed: fetchedData.completed ? "true" : "false",
            transmitted_recipients: fetchedData.transmitted_recipients || [],
          };
          setLocalRowData(updatedRowData);
          setRecipientList(fetchedData.transmitted_recipients || []);
          setRecipientsToRemove([]);
          setIsDataCommitted(true);
          // Trigger notification update after fetching
          onSave(updatedRowData); // Call onSave to trigger notification
        } catch (error) {
          console.error("Error fetching record data:", error);
          setLocalRowData({
            ...initialRowData,
            completed: initialRowData.completed ? "true" : "false",
          });
          setRecipientList(initialRowData.transmitted_recipients || []);
          setIsDataCommitted(true);
        } finally {
          setIsLoading(false);
        }
      };
      fetchRecordData();
    }
  }, [isOpen, initialRowData]);

  // Log recipientList changes
  useEffect(() => {
    console.log("3. recipientList updated:", recipientList);
  }, [recipientList]);

  const handleRecipientChange = (e) => {
    const { name, value } = e.target;
    setNewRecipient((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddRecipient = () => {
    if (newRecipient.name && newRecipient.address) {
      const recipientToAdd = { ...newRecipient, id: null };
      setRecipientList((prev) => {
        const newList = [...prev, recipientToAdd];
        console.log("4. After adding recipient - new recipientList:", newList);
        return newList;
      });
      setNewRecipient({ name: "", designation: "", address: "" });
    } else {
      console.log("Cannot add recipient - missing name or address:", newRecipient);
    }
  };

  const handleRecipientKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddRecipient();
    }
  };

  const handleRemoveRecipient = (index) => {
    setRecipientList((prev) => {
      const recipient = prev[index];
      if (recipient.id) {
        setRecipientsToRemove((prevRemove) => {
          const updatedRemove = prevRemove.includes(recipient.id)
            ? prevRemove
            : [...prevRemove, recipient.id];
          console.log("5. Recipient marked for removal - recipientsToRemove:", updatedRemove);
          return updatedRemove;
        });
        return prev;
      }
      const newList = prev.filter((_, i) => i !== index);
      console.log("6. After removing unsaved recipient - new recipientList:", newList);
      return newList;
    });
  };

  const formatDateForInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
  };

  const formatDateForDisplay = (date) => {
    if (!date) return "Date: Not Set";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "Date: Invalid";
    return `Date: ${d.toLocaleString("default", { month: "long" })} ${d.getDate()}, ${d.getFullYear()}`;
  };

  const calculateTimeRemaining = (forwardedDate, receivedDate) => {
    if (!forwardedDate) return "Not Started";
    if (receivedDate && new Date(receivedDate).toString() !== "Invalid Date") return "Completed";
    const forwarded = new Date(forwardedDate);
    const now = new Date();
    const deadline = new Date(forwarded);
    deadline.setDate(forwarded.getDate() + 10);
    const diffMs = deadline - now;
    if (diffMs <= 0) return "Overdue";
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    return `${days.toString().padStart(2, "0")} days ${hours.toString().padStart(2, "0")} hours: ${minutes.toString().padStart(2, "0")} minutes: ${seconds.toString().padStart(2, "0")} seconds`;
  };

  const getTimerColor = (time) => {
    if (!time || time === "Not Started") return "text-gray-500";
    if (time === "Completed") return "text-blue-600";
    if (time === "Overdue") return "text-red-600";
    const days = parseInt(time.split(" ")[0], 10);
    if (isNaN(days)) return "text-gray-500";
    if (days >= 8) return "text-green-600";
    if (days >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  useEffect(() => {
    if (isOpen) {
      setVmTimeRemaining(calculateTimeRemaining(localRowData.vm_forwarded, localRowData.vm_received));
      setCmTimeRemaining(calculateTimeRemaining(localRowData.cm_forwarded, localRowData.cm_received));
      setIsVmReceivedEditing(false);
      setIsCmReceivedEditing(false);
    }
  }, [isOpen, localRowData]);

  useEffect(() => {
    if (!isOpen || !localRowData || !isDataCommitted) return; // Only run timer if data is committed
    const updateTimer = () => {
      setVmTimeRemaining(calculateTimeRemaining(localRowData.vm_forwarded, localRowData.vm_received));
      setCmTimeRemaining(calculateTimeRemaining(localRowData.cm_forwarded, localRowData.cm_received));
    };
    updateTimer();
    const intervalId = setInterval(updateTimer, 1000);
    return () => clearInterval(intervalId);
  }, [isOpen, localRowData, isDataCommitted]);

  
  useEffect(() => {
    const fetchCommitteesAndTerms = async () => {
      try {
        const [committeesResponse, termsResponse] = await Promise.all([
          axios.get("http://localhost:8000/api/committees"),
          axios.get("http://localhost:8000/api/terms"),
        ]);
        const committees = committeesResponse.data;
        const terms = termsResponse.data;
        const enrichedCommittees = committees.map((committee) => ({
          name: committee.committee_name,
          id: committee.id,
          terms: terms.map((term) => term.term),
        }));
        setCommitteesWithTerms(enrichedCommittees);
      } catch (error) {
        console.error("Error fetching committees and terms:", error);
      }
    };
    fetchCommitteesAndTerms();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newValue = name === "completed" ? value : value;
    setLocalRowData((prev) => ({ ...prev, [name]: newValue || "" }));
    setRowData((prev) => ({ ...prev, [name]: newValue || "" }));
  };

  const handleVmSetReceivedClick = () => {
    setIsVmReceivedEditing(true);
    setTimeout(() => {
      if (vmReceivedInputRef.current) {
        vmReceivedInputRef.current.focus();
        vmReceivedInputRef.current.showPicker();
      }
    }, 0);
  };

  const handleCmSetReceivedClick = () => {
    setIsCmReceivedEditing(true);
    setTimeout(() => {
      if (cmReceivedInputRef.current) {
        cmReceivedInputRef.current.focus();
        cmReceivedInputRef.current.showPicker();
      }
    }, 0);
  };

  const handleClose = () => {
    console.log("13. Closing modal - Current recipientList:", recipientList);
    setIsVmReceivedEditing(false);
    setIsCmReceivedEditing(false);
    setNewRecipient({ name: "", designation: "", address: "" });
    setIsDeletionModalOpen(false);
    onClose();
  };

  const handleCancel = () => {
    console.log("14. Cancel - Resetting to current recipientList:", recipientList);
    setRecipientsToRemove([]);
    handleClose();
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const handlePrintReferral = () => {
    const referralData = getReferralData(localRowData);
    printReferral(referralData);
  };
  

  const handleSave = async () => {
    try {
      const newRecipients = recipientList.filter((r) => !r.id);
      const payload = {
        committee_sponsor: localRowData.sponsor || null,
        status: localRowData.status || null,
        vm_forwarded: localRowData.vm_forwarded || null,
        vm_received: localRowData.vm_received || null,
        cm_forwarded: localRowData.cm_forwarded || null,
        cm_received: localRowData.cm_received || null,
        date_transmitted: localRowData.date_transmitted || null,
        remarks: localRowData.remarks || "",
        completed: localRowData.completed === "true",
        completion_date: localRowData.completed === "true" ? localRowData.completion_date || null : null,
        new_recipients: newRecipients,
        recipients_to_remove: recipientsToRemove,
      };

      const response = await axios.put(
        `http://localhost:8000/api/update-record/${localRowData.id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const updatedRecipients = response.data.data.transmitted_recipients.map((rec) => ({
        id: rec.id,
        name: rec.name,
        designation: rec.designation_office || rec.designation || "",
        address: rec.address,
      }));

      const updatedData = {
        ...localRowData,
        sponsor: response.data.data.committee_sponsor,
        status: response.data.data.status,
        vm_forwarded: response.data.data.vice_mayor_forwarded,
        vm_received: response.data.data.vice_mayor_received,
        cm_forwarded: response.data.data.city_mayor_forwarded,
        cm_received: response.data.data.city_mayor_received,
        date_transmitted: response.data.data.date_transmitted,
        remarks: response.data.data.remarks,
        completed: response.data.data.completed ? "true" : "false",
        completion_date: response.data.data.completion_date,
        transmitted_recipients: updatedRecipients,
      };

      setLocalRowData(updatedData);
      setRecipientList(updatedRecipients);
      setRecipientsToRemove([]);
      setIsDataCommitted(true); // Mark data as committed
      onSave(updatedData);
      handleClose();
    } catch (error) {
      console.error("Save error:", error.response?.data || error);
      alert("Failed to update record: " + (error.response?.data?.message || error.message));
    }
  };

  const handleRequestDeletion = () => {
    setIsDeletionModalOpen(true);
  };

  const handleDeletionSubmit = () => {
    setIsDeletionModalOpen(false);
    handleClose();
  };

  const statuses = [
    "Select status",
    "For Vice Mayor's Signature",
    "For Mailings",
    "For Mayor's & Admin Signature",
    "Delivered",
    "Returned",
    "Completed",
  ];
  const documentTypes = ["Select type", "Ordinance", "Resolution", "Motion"];

  const isOrdinanceOrResolution = ["ordinance", "resolution"].includes(
    localRowData.document_type?.toLowerCase()
  );
  const showCityMayorFields = localRowData.document_type?.toLowerCase() === "ordinance";
  const hasValidVmReceived =
    localRowData.vm_received && new Date(localRowData.vm_received).toString() !== "Invalid Date";
  const hasValidCmReceived =
    localRowData.cm_received && new Date(localRowData.cm_received).toString() !== "Invalid Date";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-[1300px] max-h-[96vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4 font-poppins">Edit Record</h2>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">No.</label>
              <input
                type="text"
                name="no"
                value={localRowData.no || ""}
                readOnly
                className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">Document Type</label>
              <select
                name="document_type"
                value={localRowData.document_type || ""}
                disabled
                className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed focus:outline-none"
              >
                {documentTypes.map((type, index) => (
                  <option key={index} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">Date Approved</label>
              <input
                type="date"
                name="date_approved"
                value={formatDateForInput(localRowData.date_approved)}
                readOnly
                className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Title</label>
            <div
              className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-600 font-semibold whitespace-pre-wrap cursor-not-allowed focus:outline-none resize-none"
            >
              {localRowData.title || ""}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">Committee Sponsor</label>
              <select
                name="sponsor"
                value={localRowData.sponsor || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#408286] focus:border-[#408286] cursor-pointer"
              >
                <option value="">Select Committee</option>
                {committeesWithTerms.map((committee) => (
                  <optgroup key={committee.id} label={committee.name}>
                    {committee.terms.map((term, index) => (
                      <option key={`${committee.id}-${index}`} value={`${committee.name} (${term})`}>
                        {`${committee.name} (${term})`}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">Status</label>
              <select
                name="status"
                value={localRowData.status || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#408286] focus:border-[#408286] cursor-pointer"
              >
                {statuses.map((status, index) => (
                  <option key={index} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`border p-4 rounded-lg ${!showCityMayorFields ? "col-span-1 md:col-span-2" : "col-span-1"}`}>
              <label className="block text-gray-700 text-sm font-medium mb-2">Vice Mayor's Office</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 text-xs font-medium mb-1">Forwarded</label>
                  <input
                    type="date"
                    name="vm_forwarded"
                    value={formatDateForInput(localRowData.vm_forwarded)}
                    onChange={handleChange}
                    onFocus={(e) => e.target.showPicker()}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#408286] focus:border-[#408286] cursor-pointer"
                  />
                  <div className="mt-1 text-xs">
                    <span className="block text-gray-500">{formatDateForDisplay(localRowData.vm_forwarded)}</span>
                    <span className={getTimerColor(vmTimeRemaining)}>
                      Time Remaining: {vmTimeRemaining}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-600 text-xs font-medium mb-1">Received</label>
                  {isOrdinanceOrResolution && !localRowData.vm_forwarded ? (
                    <span className="text-gray-400 text-xs">Set Forwarded Date First</span>
                  ) : isOrdinanceOrResolution && localRowData.vm_forwarded && !hasValidVmReceived && !isVmReceivedEditing ? (
                    <button
                      onClick={handleVmSetReceivedClick}
                      className="w-full text-sm font-poppins px-3 py-2 bg-[#408286] text-white rounded-lg hover:bg-[#306466] focus:outline-none focus:ring-2 focus:ring-[#408286] transition-colors duration-200"
                    >
                      Set Received Date
                    </button>
                  ) : (
                    <div>
                      <input
                        ref={vmReceivedInputRef}
                        type="date"
                        name="vm_received"
                        value={formatDateForInput(localRowData.vm_received)}
                        onChange={handleChange}
                        onFocus={(e) => e.target.showPicker()}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#408286] focus:border-[#408286] cursor-pointer"
                      />
                      <div className="mt-1 text-xs">
                        <span className="block text-gray-500">{formatDateForDisplay(localRowData.vm_received)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {showCityMayorFields && (
              <div className="border p-4 rounded-lg col-span-1">
                <label className="block text-gray-700 text-sm font-medium mb-2">City Mayor's Office</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-600 text-xs font-medium mb-1">Forwarded</label>
                    <input
                      type="date"
                      name="cm_forwarded"
                      value={formatDateForInput(localRowData.cm_forwarded)}
                      onChange={handleChange}
                      onFocus={(e) => e.target.showPicker()}
                      disabled={showCityMayorFields && !hasValidVmReceived}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#408286] focus:border-[#408286] ${
                        showCityMayorFields && !hasValidVmReceived
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "cursor-pointer"
                      }`}
                    />
                    <div className="mt-1 text-xs">
                      <span className="block text-gray-500">{formatDateForDisplay(localRowData.cm_forwarded)}</span>
                      <span className={getTimerColor(cmTimeRemaining)}>
                        Time Remaining: {cmTimeRemaining}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-600 text-xs font-medium mb-1">Received</label>
                    {!localRowData.cm_forwarded ? (
                      <span className="text-gray-400 text-xs">Set Forwarded Date First</span>
                    ) : !hasValidCmReceived && !isCmReceivedEditing ? (
                      <div className="space-y-2">
                        <button
                          onClick={handleCmSetReceivedClick}
                          className="w-full text-sm font-poppins px-3 py-2 bg-[#408286] text-white rounded-lg hover:bg-[#306466] focus:outline-none focus:ring-2 focus:ring-[#408286] transition-colors duration-200"
                        >
                          Set Received Date
                        </button>
                        {localRowData.cm_forwarded && (
                          <button
                            onClick={handlePrintReferral}
                            className="w-full text-sm font-poppins px-3 py-2 bg-[#408286] text-white rounded-lg hover:bg-[#306466] focus:outline-none focus:ring-2 focus:ring-[#408286] transition-colors duration-200"
                          >
                            Print Referral
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <input
                          ref={cmReceivedInputRef}
                          type="date"
                          name="cm_received"
                          value={formatDateForInput(localRowData.cm_received)}
                          onChange={handleChange}
                          onFocus={(e) => e.target.showPicker()}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#408286] focus:border-[#408286] cursor-pointer"
                        />
                        <div className="mt-1 text-xs">
                          <span className="block text-gray-500">{formatDateForDisplay(localRowData.cm_received)}</span>
                        </div>
                        {localRowData.cm_forwarded && (
                          <button
                            onClick={handlePrintReferral}
                            className="w-full px-3 py-2 bg-[#408286] text-white rounded-lg hover:bg-[#306466] focus:outline-none focus:ring-2 focus:ring-[#408286] transition-colors duration-200"
                          >
                            Print Referral
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="border border-gray-200 p-6 rounded-lg shadow-sm bg-white">
            <label className="block text-gray-800 text-sm font-semibold mb-4">Transmitted To</label>
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-600 text-xs font-medium mb-1">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={newRecipient.name}
                      onChange={handleRecipientChange}
                      placeholder="Enter recipient name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#408286] focus:border-[#408286] text-sm text-gray-900 placeholder-gray-400 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 text-xs font-medium mb-1">Designation/Office</label>
                    <input
                      type="text"
                      name="designation"
                      value={newRecipient.designation}
                      onChange={handleRecipientChange}
                      placeholder="Enter designation or office"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#408286] focus:border-[#408286] text-sm text-gray-900 placeholder-gray-400 transition-all duration-200"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="block text-gray-600 text-xs font-medium mb-1">Address</label>
                    <div className="flex gap-3">
                      <textarea
                        name="address"
                        value={newRecipient.address}
                        onChange={handleRecipientChange}
                        onKeyDown={handleRecipientKeyDown}
                        placeholder="Enter full address"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#408286] focus:border-[#408286] text-sm text-gray-900 placeholder-gray-400 resize-y transition-all duration-200"
                        rows="1"
                      />
                      <button
                        onClick={handleAddRecipient}
                        className="px-6 py-2 bg-[#408286] text-white text-sm font-medium rounded-md shadow-md hover:bg-[#306466] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#408286] transition-all duration-200 whitespace-nowrap"
                      >
                        Add Recipient
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="mt-6 text-gray-500 text-sm">Loading recipients...</div>
              ) : recipientList.length > 0 ? (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">Added Recipients</h4>
                  <div className="overflow-x-auto border border-gray-200 rounded-md shadow-sm">
                    <table className="w-full text-sm text-left text-gray-700">
                      <thead className="text-xs font-semibold text-gray-600 uppercase bg-gray-100 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3">Name</th>
                          <th className="px-6 py-3">Designation/Office</th>
                          <th className="px-6 py-3">Address</th>
                          <th className="px-6 py-3">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recipientList.map((recipient, index) => (
                          <tr
                            key={recipient.id || `temp-${index}`}
                            className={`border-b border-gray-200 hover:bg-gray-50 transition-colors duration-100 ${
                              recipientsToRemove.includes(recipient.id) ? "opacity-60 line-through text-gray-500" : ""
                            }`}
                          >
                            <td className="px-6 py-3">{recipient.name}</td>
                            <td className="px-6 py-3">{recipient.designation || "N/A"}</td>
                            <td className="px-6 py-3">{recipient.address}</td>
                            <td className="px-6 py-3">
                              <button
                                onClick={() => handleRemoveRecipient(index)}
                                className={`text-sm font-medium transition-colors duration-200 ${
                                  recipientsToRemove.includes(recipient.id)
                                    ? "text-blue-600 hover:text-blue-800"
                                    : "text-red-600 hover:text-red-800"
                                }`}
                              >
                                {recipientsToRemove.includes(recipient.id) ? "Undo" : "Remove"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="mt-6 text-gray-500 text-sm">No recipients added yet.</div>
              )}

              <div>
                <label className="block text-gray-700 text-xs font-medium mb-1">Date Transmitted</label>
                <input
                  type="date"
                  name="date_transmitted"
                  value={formatDateForInput(localRowData.date_transmitted)}
                  onChange={handleChange}
                  onFocus={(e) => e.target.showPicker()}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#408286] focus:border-[#408286] text-sm text-gray-900 cursor-pointer transition-all duration-200"
                />
                <div className="mt-1 text-xs">
                  <span className="block text-gray-500">{formatDateForDisplay(localRowData.date_transmitted)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Completed</label>
                <select
                  name="completed"
                  value={localRowData.completed}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#408286] focus:border-[#408286] cursor-pointer"
                >
                  <option value="false">False</option>
                  <option value="true">True</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Completion Date</label>
                <input
                  type="date"
                  name="completion_date"
                  value={formatDateForInput(localRowData.completion_date)}
                  onChange={handleChange}
                  onFocus={(e) => e.target.showPicker()}
                  disabled={localRowData.completed !== "true"}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#408286] focus:border-[#408286] ${
                    localRowData.completed !== "true" ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "cursor-pointer"
                  }`}
                />
                <div className="mt-1 text-xs">
                  <span className="block text-gray-500">{formatDateForDisplay(localRowData.completion_date)}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">Remarks</label>
              <textarea
                name="remarks"
                value={localRowData.remarks || ""}
                onChange={handleChange}
                className="w-full text-sm font-poppins text-gray-700 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#408286] focus:border-[#408286] resize-y"
                rows="4"
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          {userRole === "admin" || userRole === "sub-admin" ? (
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancel}
                className="inline-flex justify-center py-2 px-6 border border-transparent shadow-md text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="inline-flex justify-center py-2 px-6 border border-transparent shadow-md text-sm font-medium rounded-md text-white bg-[#408286] hover:bg-[#306466] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#408286] transition-colors duration-200"
              >
                Save
              </button>
            </div>
          ) : (
            <div className="flex justify-between space-x-3">
              {userRole === "user" && (
                <button
                  onClick={handleRequestDeletion}
                  className="inline-flex justify-center py-2 px-6 border border-transparent shadow-md text-sm font-medium rounded-md text-white bg-[#FF6767] hover:bg-[#f35656] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                >
                  Request for Deletion
                </button>
              )}
              <div className="flex space-x-3">
                <button
                  onClick={handleCancel}
                  className="inline-flex justify-center py-2 px-6 border border-transparent shadow-md text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="inline-flex justify-center py-2 px-6 border border-transparent shadow-md text-sm font-medium rounded-md text-white bg-[#408286] hover:bg-[#306466] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#408286] transition-colors duration-200"
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>

        <DeletionRequestModal
          isOpen={isDeletionModalOpen}
          onClose={() => setIsDeletionModalOpen(false)}
          recordData={localRowData}
          onSubmit={handleDeletionSubmit}
        />
      </div>
    </div>
  );
};

export default EditModal;