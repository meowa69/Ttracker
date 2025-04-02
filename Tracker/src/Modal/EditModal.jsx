import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

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

  useEffect(() => {
    if (initialRowData) {
      setLocalRowData({
        ...initialRowData,
        completed: initialRowData.completed ? "true" : "false",
      });
      setRecipientList(initialRowData.editRecord?.transmittedRecipients || initialRowData.transmitted_recipients || []);
    } else {
      setLocalRowData({});
      setRecipientList([]);
    }
  }, [initialRowData]);

  const handleRecipientChange = (e) => {
    const { name, value } = e.target;
    setNewRecipient((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddRecipient = () => {
    if (newRecipient.name && newRecipient.address) {
      setRecipientList((prev) => [...prev, { ...newRecipient }]);
      setNewRecipient({ name: "", designation: "", address: "" });
    }
  };

  const handleRemoveRecipient = (index) => {
    setRecipientList((prev) => prev.filter((_, i) => i !== index));
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
      setVmTimeRemaining(calculateTimeRemaining(localRowData.vmForwarded, localRowData.vmReceived));
      setCmTimeRemaining(calculateTimeRemaining(localRowData.cmForwarded, localRowData.cmReceived));
      setIsVmReceivedEditing(false);
      setIsCmReceivedEditing(false);
    }
  }, [isOpen, localRowData]);

  useEffect(() => {
    if (!isOpen || !localRowData) return;
    const updateTimer = () => {
      setVmTimeRemaining(calculateTimeRemaining(localRowData.vmForwarded, localRowData.vmReceived));
      setCmTimeRemaining(calculateTimeRemaining(localRowData.cmForwarded, localRowData.cmReceived));
    };
    updateTimer();
    const intervalId = setInterval(updateTimer, 1000);
    return () => clearInterval(intervalId);
  }, [isOpen, localRowData]);

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
    setIsVmReceivedEditing(false);
    setIsCmReceivedEditing(false);
    setRecipientList([]);
    setNewRecipient({ name: "", designation: "", address: "" });
    onClose();
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
    const referralData = {
      no: localRowData.no,
      document_type: localRowData.document_type,
      title: localRowData.title,
      sponsor: localRowData.sponsor,
      cmForwarded: localRowData.cmForwarded,
      cmReceived: localRowData.cmReceived,
    };
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Referral Document</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; color: #333; }
            .details { margin: 20px 0; }
            .details p { margin: 5px 0; }
            .meno { font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Referral Document</h1>
          <div class="details">
            <p><span class="meno">No:</span> ${referralData.no || "N/A"}</p>
            <p><span class="meno">Document Type:</span> ${referralData.document_type || "N/A"}</p>
            <p><span class="meno">Title:</span> ${referralData.title || "N/A"}</p>
            <p><span class="meno">Committee Sponsor:</span> ${referralData.sponsor || "N/A"}</p>
            <p><span class="meno">City Mayor Forwarded:</span> ${referralData.cmForwarded || "N/A"}</p>
            <p><span class="meno">City Mayor Received:</span> ${referralData.cmReceived || "N/A"}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const statuses = [
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
    localRowData.vmReceived && new Date(localRowData.vmReceived).toString() !== "Invalid Date";
  const hasValidCmReceived =
    localRowData.cmReceived && new Date(localRowData.cmReceived).toString() !== "Invalid Date";

  const handleSave = async () => {
    try {
      const payload = {
        committee_sponsor: localRowData.sponsor || null,
        status: localRowData.completed === "true" ? "Completed" : localRowData.status || null,
        vm_forwarded: localRowData.vmForwarded || null,
        vm_received: localRowData.vmReceived || null,
        cm_forwarded: localRowData.cmForwarded || null,
        cm_received: localRowData.cmReceived || null,
        date_transmitted: localRowData.dateTransmitted || null,
        remarks: localRowData.remarks || "",
        completed: localRowData.completed === "true",
        completion_date: localRowData.completed === "true" ? localRowData.completion_date || null : null,
        transmitted_recipients: recipientList,
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

      const updatedData = {
        ...localRowData,
        sponsor: response.data.data.committee_sponsor,
        status: response.data.data.status,
        vmForwarded: response.data.data.vm_forwarded,
        vmReceived: response.data.data.vm_received,
        cmForwarded: response.data.data.cm_forwarded,
        cmReceived: response.data.data.cm_received,
        dateTransmitted: response.data.data.date_transmitted,
        remarks: response.data.data.remarks,
        completed: response.data.data.completed ? "true" : "false",
        completion_date: response.data.data.completion_date,
        transmitted_recipients: response.data.data.transmitted_recipients,
      };
      setLocalRowData(updatedData);
      setRowData(updatedData);
      onSave(updatedData);
      onClose();
    } catch (error) {
      console.error("Error updating record:", error.response?.data || error);
      alert("Failed to update record: " + (error.response?.data?.message || error.message));
    }
  };

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
            <textarea
              name="title"
              value={localRowData.title || ""}
              readOnly
              className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed focus:outline-none resize-none font-semibold"
              rows="3"
            />
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
                    name="vmForwarded"
                    value={formatDateForInput(localRowData.vmForwarded)}
                    onChange={handleChange}
                    onFocus={(e) => e.target.showPicker()}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#408286] focus:border-[#408286] cursor-pointer"
                  />
                  <div className="mt-1 text-xs">
                    <span className="block text-gray-500">{formatDateForDisplay(localRowData.vmForwarded)}</span>
                    <span className={getTimerColor(vmTimeRemaining)}>
                      Time Remaining: {vmTimeRemaining}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-600 text-xs font-medium mb-1">Received</label>
                  {isOrdinanceOrResolution && !localRowData.vmForwarded ? (
                    <span className="text-gray-400 text-xs">Set Forwarded Date First</span>
                  ) : isOrdinanceOrResolution && localRowData.vmForwarded && !hasValidVmReceived && !isVmReceivedEditing ? (
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
                        name="vmReceived"
                        value={formatDateForInput(localRowData.vmReceived)}
                        onChange={handleChange}
                        onFocus={(e) => e.target.showPicker()}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#408286] focus:border-[#408286] cursor-pointer"
                      />
                      <div className="mt-1 text-xs">
                        <span className="block text-gray-500">{formatDateForDisplay(localRowData.vmReceived)}</span>
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
                      name="cmForwarded"
                      value={formatDateForInput(localRowData.cmForwarded)}
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
                      <span className="block text-gray-500">{formatDateForDisplay(localRowData.cmForwarded)}</span>
                      <span className={getTimerColor(cmTimeRemaining)}>
                        Time Remaining: {cmTimeRemaining}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-600 text-xs font-medium mb-1">Received</label>
                    {!localRowData.cmForwarded ? (
                      <span className="text-gray-400 text-xs">Set Forwarded Date First</span>
                    ) : !hasValidCmReceived && !isCmReceivedEditing ? (
                      <div className="space-y-2">
                        <button
                          onClick={handleCmSetReceivedClick}
                          className="w-full text-sm font-poppins px-3 py-2 bg-[#408286] text-white rounded-lg hover:bg-[#306466] focus:outline-none focus:ring-2 focus:ring-[#408286] transition-colors duration-200"
                        >
                          Set Received Date
                        </button>
                        {localRowData.cmForwarded && (
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
                          name="cmReceived"
                          value={formatDateForInput(localRowData.cmReceived)}
                          onChange={handleChange}
                          onFocus={(e) => e.target.showPicker()}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#408286] focus:border-[#408286] cursor-pointer"
                        />
                        <div className="mt-1 text-xs">
                          <span className="block text-gray-500">{formatDateForDisplay(localRowData.cmReceived)}</span>
                        </div>
                        {localRowData.cmForwarded && (
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

          <div className="border p-4 rounded-lg">
            <label className="block text-gray-700 text-sm font-medium mb-2">Transmitted To</label>
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-600 text-xs font-medium mb-1">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={newRecipient.name}
                      onChange={handleRecipientChange}
                      placeholder="Enter recipient name"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#408286] focus:border-[#408286]"
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
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#408286] focus:border-[#408286]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-600 text-xs font-medium mb-1">Address</label>
                  <div className="flex gap-2">
                    <textarea
                      name="address"
                      value={newRecipient.address}
                      onChange={handleRecipientChange}
                      placeholder="Enter full address"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#408286] focus:border-[#408286] resize-y"
                      rows="2"
                    />
                    <button
                      onClick={handleAddRecipient}
                      className="self-end px-4 py-2 bg-[#408286] text-white rounded-lg hover:bg-[#306466] focus:outline-none focus:ring-2 focus:ring-[#408286]"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Recipient List */}
              {recipientList.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Added Recipients:</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-700">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                          <th className="px-4 py-2">Name</th>
                          <th className="px-4 py-2">Designation/Office</th>
                          <th className="px-4 py-2">Address</th>
                          <th className="px-4 py-2">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recipientList.map((recipient, index) => (
                          <tr key={index} className="bg-white border-b hover:bg-gray-50">
                            <td className="px-4 py-2">{recipient.name}</td>
                            <td className="px-4 py-2">{recipient.designation || "N/A"}</td>
                            <td className="px-4 py-2">{recipient.address}</td>
                            <td className="px-4 py-2">
                              <button
                                onClick={() => handleRemoveRecipient(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-gray-600 text-xs font-medium mb-1">Date Transmitted</label>
                <input
                  type="date"
                  name="dateTransmitted"
                  value={formatDateForInput(localRowData.dateTransmitted)}
                  onChange={handleChange}
                  onFocus={(e) => e.target.showPicker()}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#408286] focus:border-[#408286] cursor-pointer"
                />
                <div className="mt-1 text-xs">
                  <span className="block text-gray-500">{formatDateForDisplay(localRowData.dateTransmitted)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="">
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
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#408286] focus:border-[#408286] resize-y"
                rows="4"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={handleClose}
            className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#408286] hover:bg-[#306466] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#408286] transition-colors duration-200"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;