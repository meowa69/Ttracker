import { useState, useMemo } from "react";
import Sidebar from "../Components/Sidebar";

const History = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [filterBy, setFilterBy] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const categories = [
    "All",
    "Account Creation",
    "Add Document",
    "Update Document",
    "Request Document",
    "Delete Document",
    
  ];

  // Dummy data for audit logs
  const logs = [
    { id: 1, username: "john_doe", action: "Deleted Resolution Document", timestamp: "2024-03-04 10:30 AM" },
    { id: 2, username: "jane_smith", action: "Deleted Resolution Document", timestamp: "2024-03-03 08:15 AM"},
    { id: 3, username: "alice_wong", action: "Deleted Resolution Document", timestamp: "2024-03-02 02:45 PM"},
    { id: 4, username: "mike_tyson", action: "Deleted Resolution Document", timestamp: "2024-03-01 04:20 PM"},
  ];

  const filteredLogs = useMemo(() => {
    return logs
      .filter((log) => {
        // Filter by category
        if (selectedCategory !== "All" && log.category !== selectedCategory) return false;
        // Search by username or action
        if (filterBy === "username" && !log.username.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        if (filterBy === "action" && !log.action.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
      })
      .filter((log) => {
        if (dateFrom && dateTo) return moment(log.timestamp, "YYYY-MM-DD h:mm A").isBetween(dateFrom, dateTo, undefined, "[]");
        if (dateFrom) return moment(log.timestamp, "YYYY-MM-DD h:mm A").isSameOrAfter(dateFrom);
        if (dateTo) return moment(log.timestamp, "YYYY-MM-DD h:mm A").isSameOrBefore(dateTo);
        return true;
      });
  }, [logs, searchQuery, filterBy, dateFrom, dateTo, selectedCategory]);

  return (
    <div className="flex bg-gray-100">
      <Sidebar />
      <div className="flex flex-col w-full h-screen overflow-y-auto p-6">
        <h1 className="font-poppins font-bold uppercase text-[#494444] text-[35px] mb-6">History</h1>

       

        {/* Category Tabs */}
        <div className="flex space-x-6 mb-4 border-b pb-2 text-sm font-poppins font-semibold">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-2 ${
                selectedCategory === category
                  ? "border-[#408286] text-[#408286] font-semibold border-b-2"
                  : "text-gray-600"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Logs List */}
        <div className="bg-white p-6 shadow-lg rounded-lg overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-[#408286] text-white">
              <tr>
                <th className="px-4 py-3 text-left">Username</th>
                <th className="px-4 py-3 text-left">Action</th>
                <th className="px-4 py-3 text-left">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b hover:bg-gray-100">
                    <td className="px-4 py-3">{log.username}</td>
                    <td className="px-4 py-3">{log.action}</td>
                    <td className="px-4 py-3">{log.timestamp}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center py-4 text-gray-500">
                    No logs match the filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History;
