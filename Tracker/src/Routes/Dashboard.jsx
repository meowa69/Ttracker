import Sidebar from "./Sidebar";
import { useState } from "react";

function Dashboard() {
  const [rows, setRows] = useState([
    {
      ordinanceNo: "001-2024",
      dateApproved: "Jan 15, 2024",
      title: "Ordinance Title Here",
      sponsor: "John Doe",
      status: "Pending",
      vmForwarded: "Jan 16, 2024",
      vmReceived: "Jan 18, 2024",
      cmForwarded: "Jan 20, 2024",
      cmReceived: "Jan 22, 2024",
      transmittedTo: "Department A",
      dateTransmitted: "Jan 25, 2024",
      completed: "False",
      dateOfCompletion: "Feb 1, 2024",
      remarks: "No Remarks",
    },
  ]);

  // Function to delete a row
  const deleteRow = (index) => {
    const updatedRows = rows.filter((_, i) => i !== index);
    setRows(updatedRows);
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />
      <div className="flex flex-col w-full h-screen overflow-y-auto p-4">
        {/* Dashboard Header */}
        <div className="font-poppins font-bold uppercase px-4 mb-8 text-[#494444] text-[35px]">
          <h1>Dashboard</h1>
        </div>

        {/* Search Bar */}
        <div className="px-4 mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-[300px] font-poppins pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#5FA8AD]"
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

        {/* Table Section */}
        <div className="flex-grow px-4 py-2">
          <div className="bg-white w-full h-full border rounded-md shadow-lg p-8">
            <div className="h-full overflow-auto">
              <table className="w-full border-collapse rounded-lg overflow-hidden">
                {/* Table Header */}
                <thead className="">
                  <tr className="bg-[#408286] text-white text-left text-[14px]">
                    <th rowSpan="2" className="border border-gray-300 px-4 py-2">
                      Ordinance No.
                    </th>
                    <th rowSpan="2" className="border border-gray-300 px-4 py-2">
                      Date Approved
                    </th>
                    <th rowSpan="2" className="border border-gray-300 px-4 py-2">
                      Title
                    </th>
                    <th rowSpan="2" className="border border-gray-300 px-4 py-2">
                      Committee Sponsor
                    </th>
                    <th rowSpan="2" className="border border-gray-300 px-4 py-2">
                      Status
                    </th>
                    <th colSpan="2" className="border border-gray-300 px-4 py-2 text-center">
                      Vice Mayor's Office
                    </th>
                    <th colSpan="2" className="border border-gray-300 px-4 py-2 text-center">
                      City Mayor
                    </th>
                    <th rowSpan="2" className="border border-gray-300 px-4 py-2">
                      Transmitted To
                    </th>
                    <th rowSpan="2" className="border border-gray-300 px-4 py-2">
                      Date Transmitted
                    </th>
                    <th rowSpan="2" className="border border-gray-300 px-4 py-2">
                      Completed
                    </th>
                    <th rowSpan="2" className="border border-gray-300 px-4 py-2">
                      Date of Completion
                    </th>
                    <th rowSpan="2" className="border border-gray-300 px-4 py-2">
                      Remarks
                    </th>
                    <th rowSpan="2" className="border border-gray-300 px-4 py-2">
                      Actions
                    </th>
                  </tr>
                  <tr className="bg-[#408286] text-white text-left text-[14px]">
                    <th className="border border-gray-300 px-4 py-2">Forwarded</th>
                    <th className="border border-gray-300 px-4 py-2">Received</th>
                    <th className="border border-gray-300 px-4 py-2">Forwarded</th>
                    <th className="border border-gray-300 px-4 py-2">Received</th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={index} className="border border-gray-300 hover:bg-gray-100 text-[14px]">
                      <td className="border border-gray-300 px-4 py-2">{row.ordinanceNo}</td>
                      <td className="border border-gray-300 px-4 py-2">{row.dateApproved}</td>
                      <td className="border border-gray-300 px-4 py-2">{row.title}</td>
                      <td className="border border-gray-300 px-4 py-2">{row.sponsor}</td>
                      <td className="border border-gray-300 px-4 py-2">{row.status}</td>
                      <td className="border border-gray-300 px-4 py-2">{row.vmForwarded}</td>
                      <td className="border border-gray-300 px-4 py-2">{row.vmReceived}</td>
                      <td className="border border-gray-300 px-4 py-2">{row.cmForwarded}</td>
                      <td className="border border-gray-300 px-4 py-2">{row.cmReceived}</td>
                      <td className="border border-gray-300 px-4 py-2">{row.transmittedTo}</td>
                      <td className="border border-gray-300 px-4 py-2">{row.dateTransmitted}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        <select
                          value={row.completed}
                          onChange={(e) => {
                            const updatedRows = [...rows];
                            updatedRows[index].completed = e.target.value;
                            setRows(updatedRows);
                          }}
                          className="w-full border border-gray-300 px-2 py-1 rounded-md focus:outline-none focus:ring-1 focus:ring-[#5FA8AD]"
                        >
                          <option value="True">True</option>
                          <option value="False">False</option>
                        </select>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">{row.dateOfCompletion}</td>
                      <td className="border border-gray-300 px-4 py-2">{row.remarks}</td>
                      <td className="px-4 py-2 flex space-x-1">
                        <button className="bg-[#70b8d3] hover:bg-[#3d9fdb] px-4 py-2 rounded-md text-white font-medium">
                          View
                        </button>
                        <button className="bg-[#FFCC79] hover:bg-[#ecba69] px-4 py-2 rounded-md text-white font-medium">
                          Edit
                        </button>
                        <button
                          onClick={() => deleteRow(index)}
                          className="bg-[#FF6767] hover:bg-[#f35656] px-4 py-2 rounded-md text-white font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;