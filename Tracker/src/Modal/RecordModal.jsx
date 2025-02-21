import { useState, useEffect } from "react";

function RecordModal({ formData, onClose, onConfirm }) {
    const [doNotShow, setDoNotShow] = useState(false);

    // Check if the user previously chose not to show the modal
    useEffect(() => {
        const savedPreference = localStorage.getItem("hideModal");
        if (savedPreference === "true") {
            onClose();
        }
    }, [onClose]);

    const handleConfirm = () => {
        if (doNotShow) {
            localStorage.setItem("hideModal", "true");
        }
        onConfirm();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
                <h2 className="text-lg font-semibold mb-4">New Record Summary</h2>

                <div className="text-sm">
                    <p><strong>Document Type:</strong> {formData.documentType}</p>
                    <p><strong>Date Approved:</strong> {formData.dateApproved}</p>
                    <p><strong>Title:</strong> {formData.title}</p>
                    <p><strong>Sponsor:</strong> {formData.sponsor}</p>
                    <p><strong>Status:</strong> {formData.status}</p>
                </div>

                <div className="mt-4 flex items-center">
                    <input
                        type="checkbox"
                        id="doNotShow"
                        className="mr-2"
                        checked={doNotShow}
                        onChange={() => setDoNotShow(!doNotShow)}
                    />
                    <label htmlFor="doNotShow" className="text-sm">Do not show again</label>
                </div>

                <div className="mt-4 flex justify-end space-x-2">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">Close</button>
                    <button onClick={handleConfirm} className="px-4 py-2 bg-green-500 text-white rounded">Confirm</button>
                </div>
            </div>
        </div>
    );
}

export default RecordModal;
