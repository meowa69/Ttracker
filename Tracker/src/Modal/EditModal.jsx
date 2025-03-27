import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const EditModal = ({ isOpen, onClose, rowData: initialRowData, onSave, setRowData }) => {
  const [committeesWithTerms, setCommitteesWithTerms] = useState([]);
  const [localRowData, setLocalRowData] = useState(initialRowData);
  const [showVmReceivedButton, setShowVmReceivedButton] = useState(false);
  const [showCmReceivedButton, setShowCmReceivedButton] = useState(false);
  const [vmDaysRemaining, setVmDaysRemaining] = useState(null);
  const [cmDaysRemaining, setCmDaysRemaining] = useState(null);
  const vmReceivedInputRef = useRef(null);
  const cmReceivedInputRef = useRef(null);

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

  const calculateDaysRemaining = (forwardedDate, receivedDate) => {
    if (!forwardedDate) return "Not Started";
    if (receivedDate) return "Completed";
    const forwarded = new Date(forwardedDate);
    const today = new Date();
    const diffTime = today - forwarded;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const remaining = 10 - diffDays;
    return remaining >= 0 ? remaining : "Overdue";
  };

  const getTimerColor = (days) => {
    if (days === "Not Started" || days === "Completed") return "text-gray-500";
    if (days === "Overdue") return "text-red-600";
    if (days >= 8) return "text-green-600";
    if (days >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  useEffect(() => {
    if (isOpen && initialRowData) {
      console.log("Initial Row Data on Modal Open:", initialRowData);
      setLocalRowData(initialRowData);
      // Show button if forwarded date is set (regardless of received)
      setShowVmReceivedButton(!!initialRowData.vmForwarded);
      setShowCmReceivedButton(!!initialRowData.cmForwarded);
      setVmDaysRemaining(calculateDaysRemaining(initialRowData.vmForwarded, initialRowData.vmReceived));
      setCmDaysRemaining(calculateDaysRemaining(initialRowData.cmForwarded, initialRowData.cmReceived));
    }
  }, [isOpen, initialRowData]);

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

  if (!isOpen || !localRowData) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalRowData((prev) => ({ ...prev, [name]: value || "" }));
    setRowData((prev) => ({ ...prev, [name]: value || "" }));

    if (name === "vmForwarded") {
      setShowVmReceivedButton(!!value); // Show button if forwarded date is set
      setVmDaysRemaining(calculateDaysRemaining(value, localRowData.vmReceived));
    }
    if (name === "vmReceived") {
      setShowVmReceivedButton(true); // Keep button visible even after received is set
      setVmDaysRemaining(calculateDaysRemaining(localRowData.vmForwarded, value));
    }
    if (name === "cmForwarded") {
      setShowCmReceivedButton(!!value); // Show button if forwarded date is set
      setCmDaysRemaining(calculateDaysRemaining(value, localRowData.cmReceived));
    }
    if (name === "cmReceived") {
      setShowCmReceivedButton(true); // Keep button visible even after received is set
      setCmDaysRemaining(calculateDaysRemaining(localRowData.cmForwarded, value));
    }
  };

  const handleVmSetReceivedClick = () => {
    setShowVmReceivedButton(true); // Keep button visible
    if (!localRowData.vmReceived) {
      setLocalRowData((prev) => ({ ...prev, vmReceived: "" }));
    }
    setTimeout(() => {
      if (vmReceivedInputRef.current) {
        vmReceivedInputRef.current.focus();
        vmReceivedInputRef.current.showPicker();
      }
    }, 0);
  };

  const handleCmSetReceivedClick = () => {
    setShowCmReceivedButton(true); // Keep button visible
    if (!localRowData.cmReceived) {
      setLocalRowData((prev) => ({ ...prev, cmReceived: "" }));
    }
    setTimeout(() => {
      if (cmReceivedInputRef.current) {
        cmReceivedInputRef.current.focus();
        cmReceivedInputRef.current.showPicker();
      }
    }, 0);
  };

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
            .label { font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Referral Document</h1>
          <div class="details">
            <p><span class="label">No:</span> ${referralData.no || "N/A"}</p>
            <p><span class="label">Document Type:</span> ${referralData.document_type || "N/A"}</p>
            <p><span class="label">Title:</span> ${referralData.title || "N/A"}</p>
            <p><span class="label">Committee Sponsor:</span> ${referralData.sponsor || "N/A"}</p>
            <p><span class="label">City Mayor Forwarded:</span> ${referralData.cmForwarded || "N/A"}</p>
            <p><span class="label">City Mayor Received:</span> ${referralData.cmReceived || "N/A"}</p>
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
  const transmittedOptions = ["Vice Mayor's Office", "City Mayor's Office", "Other"];
  const documentTypes = ["Select type", "Ordinance", "Resolution", "Motion"];

  const isOrdinanceOrResolution = ["ordinance", "resolution"].includes(
    localRowData.document_type?.toLowerCase()
  );
  const showCityMayorFields = localRowData.document_type?.toLowerCase() === "ordinance";

  const handleSave = async () => {
    try {
      const payload = {
        committee_sponsor: localRowData.sponsor || null,
        status: localRowData.status || null,
        vm_forwarded: localRowData.vmForwarded || null, // Match backend response keys
        vm_received: localRowData.vmReceived || null,
        cm_forwarded: localRowData.cmForwarded || null,
        cm_received: localRowData.cmReceived || null,
        transmitted_to: localRowData.transmittedTo || null,
        date_transmitted: localRowData.dateTransmitted || null,
        remarks: localRowData.remarks || "",
      };

      console.log("Saving payload:", payload);

      const response = await axios.put(
        `http://localhost:8000/api/update-record/${localRowData.id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log("Server response:", response.data);
      // Map response keys back to frontend format
      const updatedData = {
        ...localRowData,
        sponsor: response.data.data.sponsor,
        status: response.data.data.status,
        vmForwarded: response.data.data.vm_forwarded,
        vmReceived: response.data.data.vm_received,
        cmForwarded: response.data.data.cm_forwarded,
        cmReceived: response.data.data.cm_received,
        transmittedTo: response.data.data.transmitted_to,
        dateTransmitted: response.data.data.date_transmitted,
        remarks: response.data.data.remarks,
      };
      setLocalRowData(updatedData);
      onSave(updatedData);
      onClose();
    } catch (error) {
      console.error("Error updating record:", error.response?.data || error);
      alert("Failed to update record");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-[1250px] max-h-[95vh] overflow-y-auto">
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
                    <span className={getTimerColor(vmDaysRemaining)}>
                      Days Remaining: {vmDaysRemaining}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-600 text-xs font-medium mb-1">Received</label>
                  {isOrdinanceOrResolution && !localRowData.vmForwarded ? (
                    <span className="text-gray-400 text-xs">Set Forwarded Date First</span>
                  ) : isOrdinanceOrResolution && showVmReceivedButton ? (
                    <button
                      onClick={handleVmSetReceivedClick}
                      className="w-full px-3 py-2 bg-[#408286] text-white rounded-lg hover:bg-[#306466] focus:outline-none focus:ring-2 focus:ring-[#408286] transition-colors duration-200"
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
                        <span className="text-gray-500">Days Remaining: N/A</span>
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
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#408286] focus:border-[#408286] cursor-pointer"
                    />
                    <div className="mt-1 text-xs">
                      <span className="block text-gray-500">{formatDateForDisplay(localRowData.cmForwarded)}</span>
                      <span className={getTimerColor(cmDaysRemaining)}>
                        Days Remaining: {cmDaysRemaining}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-600 text-xs font-medium mb-1">Received</label>
                    {!localRowData.cmForwarded ? (
                      <span className="text-gray-400 text-xs">Set Forwarded Date First</span>
                    ) : showCmReceivedButton ? (
                      <button
                        onClick={handleCmSetReceivedClick}
                        className="w-full px-3 py-2 bg-[#408286] text-white rounded-lg hover:bg-[#306466] focus:outline-none focus:ring-2 focus:ring-[#408286] transition-colors duration-200"
                      >
                        Set Received Date
                      </button>
                    ) : (
                      <div>
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
                          <span className="text-gray-500">Days Remaining: N/A</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {localRowData.cmForwarded && (
                  <div className="mt-4">
                    <button
                      onClick={handlePrintReferral}
                      className="w-full px-3 py-2 bg-[#408286] text-white rounded-lg hover:bg-[#306466] focus:outline-none focus:ring-2 focus:ring-[#408286] transition-colors duration-200"
                    >
                      Print Referral
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">Transmitted To</label>
              <select
                name="transmittedTo"
                value={localRowData.transmittedTo || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#408286] focus:border-[#408286]"
              >
                {transmittedOptions.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">Date Transmitted</label>
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
                <span className="text-gray-500">Days Remaining: N/A</span>
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

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
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