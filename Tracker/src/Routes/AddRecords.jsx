import Sidebar from "./Sidebar";
import { useState } from "react";

function AddRecords() {
    const [formData, setFormData] = useState({
        No: "",
        documentType: "Select type", // Added documentType field
        dateApproved: "",
        title: "",
        sponsor: "",
        status: "",
        vmForwarded: "",
        vmReceived: "",
        cmForwarded: "",
        cmReceived: "",
        transmittedTo: "",
        dateTransmitted: "",
        completed: "False",
        dateOfCompletion: "",
        remarks: ""
    });

    const committees = ["Committee A", "Committee B", "Committee C"];
    const statuses = ["For Vice Mayor's Signature", "For Mailings", "For Mayor's & Admin Signature", "Delivered", "Returned", "Completed"];
    const transmittedOptions = ["Vice Mayor's Office", "City Mayor's Office", "Other"];
    const documentTypes = ["Select type", "Ordinance", "Resolution"]; // Document type options

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Form Submitted:", formData);
    };

    return (
        <div className="flex">
            <Sidebar />
            <div className="flex flex-col w-full h-screen overflow-y-auto p-6">
                <h1 className="font-poppins font-bold uppercase text-[#494444] text-[35px] mb-8">
                    Add Record
                </h1>

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
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Document Type</label>
                                <select
                                    name="documentType"
                                    value={formData.documentType}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#408286] focus:border-transparent"
                                    required
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
                                required
                            ></textarea>
                        </div>

                        {/* Committee Sponsor & Status */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Committee Sponsor</label>
                                <select
                                    name="sponsor"
                                    value={formData.sponsor}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#408286] focus:border-transparent"
                                    
                                >
                                    <option value="">Select Committee</option>
                                    {committees.map((committee, index) => (
                                        <option key={index} value={committee}>{committee}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#408286] focus:border-transparent"
                                    required
                                >
                                    <option value="">Select Status</option>
                                    {statuses.map((status, index) => (
                                        <option key={index} value={status}>{status}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Vice Mayor's Office and City Mayor's Office */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="border p-4 rounded-lg">
                                <label className="block text-gray-700 font-medium mb-2">Vice Mayor's Office</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-700 text-sm">Forwarded</label>
                                        <input
                                            type="date"
                                            name="vmForwarded"
                                            value={formData.vmForwarded}
                                            onChange={handleChange}
                                            className="cursor-pointer w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#408286] focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 text-sm">Received</label>
                                        <input
                                            type="date"
                                            name="vmReceived"
                                            value={formData.vmReceived}
                                            onChange={handleChange}
                                            className="cursor-pointer w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#408286] focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="border p-4 rounded-lg">
                                <label className="block text-gray-700 font-medium mb-2">City Mayor's Office</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-700 text-sm">Forwarded</label>
                                        <input
                                            type="date"
                                            name="cmForwarded"
                                            value={formData.cmForwarded}
                                            onChange={handleChange}
                                            className="cursor-pointer w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#408286] focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 text-sm">Received</label>
                                        <input
                                            type="date"
                                            name="cmReceived"
                                            value={formData.cmReceived}
                                            onChange={handleChange}
                                            className="cursor-pointer w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#408286] focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Transmitted To and Date Transmitted */}
                        <div className="border p-4 rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">Transmitted To</label>
                                    <select
                                        name="transmittedTo"
                                        value={formData.transmittedTo}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#408286] focus:border-transparent"
                                    >
                                        <option value="">Select Office</option>
                                        {transmittedOptions.map((option, index) => (
                                            <option key={index} value={option}>{option}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">Date Transmitted</label>
                                    <input
                                        type="date"
                                        name="dateTransmitted"
                                        value={formData.dateTransmitted}
                                        onChange={handleChange}
                                        className="cursor-pointer w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#408286] focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Date of Completion */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Date of Completion</label>
                            <input
                                type="date"
                                name="dateOfCompletion"
                                value={formData.dateOfCompletion}
                                onChange={handleChange}
                                className="cursor-pointer w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#408286] focus:border-transparent"
                            />
                        </div>

                        {/* Remarks */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Remarks</label>
                            <textarea
                                name="remarks"
                                placeholder="Enter remarks here..."
                                value={formData.remarks}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#408286] focus:border-transparent"
                                rows="4"
                            ></textarea>
                        </div>

                        {/* Submit Button */}
                        <div className="text-left flex gap-2">
                            <button type="submit" className="bg-[#408286] hover:bg-[#357a74] text-sm text-white font-semibold py-2 px-4 rounded-md transition duration-300">
                                Add Record
                            </button>

                            <button type="submit" className="bg-gray-600 hover:bg-gray-700 text-sm text-white font-semibold py-2 px-4 rounded-md transition duration-300">
                                Clear
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AddRecords;