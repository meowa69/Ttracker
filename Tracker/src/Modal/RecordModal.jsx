import { useState, useEffect } from "react";

function RecordModal({ formData = {}, onClose, onConfirm }) {
    const [shouldShow, setShouldShow] = useState(true);

    // Check if the modal should be hidden based on localStorage
    const handleConfirm = () => {
        onConfirm();
    };

    if (!shouldShow) return null; // Don't render modal if it should be hidden

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center transition-opacity duration-300 z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-[1300px] animate-fadeIn">
                {/* Modal Header */}
                <div className="border-b pb-4 mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 text-center">New Record Summary</h2>
                </div>

                {/* Modal Content */}
                <div className="text-sm space-y-4">
                    {/* Dynamic Data with Fallbacks */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-gray-600 font-medium">No.:</p>
                            <p className="text-gray-800">{formData.No || "N/A"}</p>
                        </div>
                        <div>
                            <p className="text-gray-600 font-medium">Document Type:</p>
                            <p className="text-gray-800">{formData.documentType || "N/A"}</p>
                        </div>
                        <div>
                            <p className="text-gray-600 font-medium">Date Approved:</p>
                            <p className="text-gray-800">{formData.dateApproved || "N/A"}</p>
                        </div>
                        <div>
                            <p className="text-gray-600 font-medium">Title:</p>
                            <p className="text-gray-800 text-justify">{formData.title || "N/A"}</p>
                        </div>
                    </div>

                    <hr className="my-4 border-gray-200" />

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-gray-600 font-medium">Committee Sponsor:</p>
                            <p className="text-gray-800">{formData.sponsor || "N/A"}</p>
                        </div>
                        <div>
                            <p className="text-gray-600 font-medium">Status:</p>
                            <p className="text-gray-800">{formData.status || "N/A"}</p>
                        </div>
                    </div>

                    <hr className="my-4 border-gray-200" />

                    <div>
                        <p className="text-gray-600 font-medium">Vice Mayor's Office</p>
                        <div className="ml-4 mt-2 space-y-2">
                            <div>
                                <p className="text-gray-600 font-medium">Forwarded:</p>
                                <p className="text-gray-800">{formData.viceMayorForwarded || "N/A"}</p>
                            </div>
                            <div>
                                <p className="text-gray-600 font-medium">Received:</p>
                                <p className="text-gray-800">{formData.viceMayorReceived || "N/A"}</p>
                            </div>
                        </div>
                    </div>

                    <hr className="my-4 border-gray-200" />

                    <div>
                        <p className="text-gray-600 font-medium">City Mayor</p>
                        <div className="ml-4 mt-2 space-y-2">
                            <div>
                                <p className="text-gray-600 font-medium">Forwarded:</p>
                                <p className="text-gray-800">{formData.mayorForwarded || "N/A"}</p>
                            </div>
                            <div>
                                <p className="text-gray-600 font-medium">Received:</p>
                                <p className="text-gray-800">{formData.mayorReceived || "N/A"}</p>
                            </div>
                        </div>
                    </div>

                    <hr className="my-4 border-gray-200" />

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-gray-600 font-medium">Transmitted To:</p>
                            <p className="text-gray-800">{formData.transmittedTo || "N/A"}</p>
                        </div>
                        <div>
                            <p className="text-gray-600 font-medium">Date Transmitted:</p>
                            <p className="text-gray-800">{formData.dateTransmitted || "N/A"}</p>
                        </div>
                        <div>
                            <p className="text-gray-600 font-medium">Remarks:</p>
                            <p className="text-gray-800">{formData.remarks || "N/A"}</p>
                        </div>
                    </div>
                </div>

                {/* Do Not Show Again Checkbox */}
                <div className="mt-6 flex items-center">
                    <input
                        type="checkbox"
                        id="doNotShow"
                        className="mr-2"
                    />
                    <label htmlFor="doNotShow" className="text-sm text-gray-600">Do not show again</label>
                </div>

                {/* Modal Footer */}
                <div className="mt-6 flex justify-end space-x-2">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-poppins text-sm rounded-md transition duration-200"
                    >
                        Close
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="px-6 py-2 bg-[#408286] hover:bg-[#357a74] text-white font-poppins text-sm rounded-md transition duration-200"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
}

export default RecordModal;