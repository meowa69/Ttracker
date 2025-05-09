import Sidebar from "../Components/Sidebar";
import { useState } from "react";
import Swal from "sweetalert2";
import RecordModal from "./../Modal/RecordModal";

function AddRecords() {
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        No: "",
        documentType: "Select type", // Added documentType field
        dateApproved: "",
        title: "",
        
    });

    const documentTypes = ["Select type", "Ordinance", "Resolution", "Motion"]; // Document type options

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Prevent empty submission
        if (!formData.No || formData.documentType === "Select type" || !formData.dateApproved || !formData.title) {
            alert("Please fill in all required fields.");
            return;
        }
    
        console.log("Form Submitted:", formData);
        setShowModal(true); // Open the confirmation modal
    };
    

    const handleConfirm = () => {
        setShowModal(false);

        // Show success message
        Swal.fire({
            title: "Success!",
            text: "New record added successfully",
            icon: "success",
            confirmButtonText: "OK",
        });

        // Clear form after submission
        setFormData({
            No: "",
            documentType: "Select type",
            dateApproved: "",
            title: "",

        });
    };

    return (
        <div className="flex">
            <Sidebar />
            <div className="flex flex-col w-full h-screen overflow-y-auto p-6">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="font-poppins font-bold uppercase text-[#494444] text-[35px]">
                        Add Record
                    </h1>
                </div>

                {/* Main content container */}
                <div className="w-full border rounded-lg shadow-lg p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* No., Document Type, and Date Approved */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">No.</label>
                                <input
                                    type="text"
                                    name="No"
                                    placeholder="Ex. 001-2025"
                                    value={formData.No}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#408286] focus:border-transparent"
                                    
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Document Type</label>
                                <select
                                    name="documentType"
                                    value={formData.documentType}
                                    onChange={handleChange}
                                    className="cursor-pointer w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#408286] focus:border-transparent"
                                    
                                >
                                    {documentTypes.map((type, index) => (
                                        <option key={index} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Date Approved</label>
                                <input
                                    type="date"
                                    name="dateApproved"
                                    value={formData.dateApproved}
                                    onFocus={(e) => e.target.showPicker()}
                                    onChange={handleChange}
                                    className="cursor-pointer w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#408286] focus:border-transparent"
                                    
                                />
                            </div>
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Title</label>
                            <textarea
                                name="title"
                                value={formData.title}
                                placeholder="Enter title here..."
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#408286] focus:border-transparent"
                                rows="3"
                                
                            ></textarea>
                        </div>

                        {/* Submit Button */}
                        <div className="text-left flex gap-2">
                            <button type="submit" className="bg-[#408286] hover:bg-[#357a74] text-sm font-poppins text-white font-semibold py-2 px-4 rounded-md transition duration-300">
                                Add Record
                            </button>

                            <button type="clear" className="bg-gray-600 hover:bg-gray-700 text-sm text-white font-poppins font-semibold py-2 px-4 rounded-md transition duration-300">
                                Clear
                            </button>
                        </div>
                    </form>
                </div>
                {showModal && <RecordModal formData={formData} onClose={() => setShowModal(false)} onConfirm={handleConfirm} />}
            </div>
        </div>
    );
}

export default AddRecords;