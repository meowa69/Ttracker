import React from "react";

const EditModal = ({ isOpen, onClose, rowData, onSave, setRowData }) => {
  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRowData((prev) => ({ ...prev, [name]: value }));
  };

  const committees = ["Committee A", "Committee B", "Committee C"];
  const statuses = [
    "For Vice Mayor's Signature",
    "For Mailings",
    "For Mayor's & Admin Signature",
    "Delivered",
    "Returned",
    "Completed",
  ];
  const transmittedOptions = [
    "Vice Mayor's Office",
    "City Mayor's Office",
    "Other",
  ];
  const documentTypes = ["Select type", "Ordinance", "Resolution", "Motion"]; // Add "Motion" to the list

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-[1200px] max-h-[80vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4 font-poppins">Edit Record</h2>

        {/* Form Fields */}
        <div className="space-y-3">
          {/* No., Document Type, and Date Approved */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700">No.</label>
              <input
                type="text"
                name="no"
                value={rowData.no}
                readOnly
                className="w-full px-3 py-2 border rounded-lg bg-gray-100 pointer-events-none cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-gray-700">Document Type</label>
              <select
                name="document_type"
                value={rowData.document_type} // Use rowData.document_type
                disabled
                className="w-full px-3 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
              >
                {documentTypes.map((type, index) => (
                  <option key={index} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700">Date Approved</label>
              <input
                type="date"
                name="date_approved"
                value={rowData.date_approved}
                readOnly
                className="w-full px-3 py-2 border rounded-lg bg-gray-100 pointer-events-none cursor-not-allowed"
              />
            </div>
          </div>

          {/* Title */}
          <label className="block">
            <span className="text-gray-700">Title</span>
            <textarea
              name="title"
              value={rowData.title}
              readOnly
              className="w-full px-3 py-2 border rounded-lg bg-gray-100 pointer-events-none cursor-not-allowed focus:outline-none focus:ring-0 focus:border-gray-300"
              rows="3"
            />
          </label>

          {/* Committee Sponsor & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700">Committee Sponsor</label>
              <select
                name="sponsor"
                value={rowData.sponsor}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Select Committee</option>
                {committees.map((committee, index) => (
                  <option key={index} value={committee}>
                    {committee}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700">Status</label>
              <select
                name="status"
                value={rowData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
              >
                {statuses.map((status, index) => (
                  <option key={index} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Vice Mayor's Office and City Mayor's Office */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border p-4 rounded-lg">
              <label className="block text-gray-700">Vice Mayor's Office</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700">Forwarded</label>
                  <input
                    type="date"
                    name="vmForwarded"
                    value={rowData.vmForwarded}
                    onChange={handleChange}
                    onFocus={(e) => e.target.showPicker()}
                    className="cursor-pointer w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700">Received</label>
                  <input
                    type="date"
                    name="vmReceived"
                    value={rowData.vmReceived}
                    onChange={handleChange}
                    onFocus={(e) => e.target.showPicker()}
                    className="cursor-pointer w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
            </div>
            <div className="border p-4 rounded-lg">
              <label className="block text-gray-700">City Mayor's Office</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700">Forwarded</label>
                  <input
                    type="date"
                    name="cmForwarded"
                    value={rowData.cmForwarded}
                    onChange={handleChange}
                    onFocus={(e) => e.target.showPicker()}
                    className="cursor-pointer w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700">Received</label>
                  <input
                    type="date"
                    name="cmReceived"
                    value={rowData.cmReceived}
                    onChange={handleChange}
                    onFocus={(e) => e.target.showPicker()}
                    className="cursor-pointer w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Transmitted To and Date Transmitted */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700">Transmitted To</label>
              <select
                name="transmittedTo"
                value={rowData.transmittedTo}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
              >
                {transmittedOptions.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700">Date Transmitted</label>
              <input
                type="date"
                name="dateTransmitted"
                value={rowData.dateTransmitted}
                onChange={handleChange}
                onFocus={(e) => e.target.showPicker()}
                className="cursor-pointer w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          {/* Remarks */}
          <label className="block">
            <span className="text-gray-700">Remarks</span>
            <textarea
              name="remarks"
              value={rowData.remarks}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg"
              rows="4"
            />
          </label>
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end space-x-3 mt-4">
          <button onClick={onClose} className="ml-2 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
            Cancel
          </button>
          <button onClick={() => onSave(rowData)} className="bg-[#408286] px-4 py-2 rounded-lg text-white">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;