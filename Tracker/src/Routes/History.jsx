import { useState, useEffect, useMemo, useCallback } from "react";
import Sidebar from "../Components/Sidebar";
import moment from "moment-timezone";
import axios from "axios";

const History = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [filterBy, setFilterBy] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    "All",
    "Add Document",
    "Update Document",
    "Delete Document",
    "Request Delete Document",
  ];

  const perPage = 12; // Fetch 12 logs per page

  // Fetch logs from backend
  const fetchLogs = useCallback(
    async (pageNumber, reset = false) => {
      setIsLoading(true);
      try {
        console.log("Fetching logs with params:", {
          page: pageNumber,
          per_page: perPage,
          category: selectedCategory,
          search: searchQuery,
          filter_by: filterBy,
          date_from: dateFrom,
          date_to: dateTo,
          token: localStorage.getItem("token"),
        });

        const response = await axios.get("http://localhost:8000/api/history", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          params: {
            page: pageNumber,
            per_page: perPage,
            category: selectedCategory,
            search: searchQuery,
            filter_by: filterBy,
            date_from: dateFrom,
            date_to: dateTo,
          },
        });

        console.log("API Response:", response.data);

        const newLogs = Array.isArray(response.data.data) ? response.data.data : [];
        setLogs((prevLogs) => {
          if (reset) return newLogs;
          // Avoid duplicates by filtering out logs with IDs already in prevLogs
          const existingIds = new Set(prevLogs.map((log) => log.id));
          return [...prevLogs, ...newLogs.filter((log) => !existingIds.has(log.id))];
        });
        setHasMore(newLogs.length === perPage && response.data.current_page < response.data.total_pages);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch logs:", err.response ? err.response.data : err.message);
        setError("Failed to fetch logs. Please try again.");
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      } finally {
        setIsLoading(false);
      }
    },
    [selectedCategory, searchQuery, filterBy, dateFrom, dateTo]
  );

  // Fetch logs when filters change or on initial load
  useEffect(() => {
    setPage(1);
    setLogs([]);
    setHasMore(true);
    fetchLogs(1, true);
  }, [selectedCategory, searchQuery, filterBy, dateFrom, dateTo, fetchLogs]);

  // Handle Load More button click
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchLogs(nextPage);
  };

  // Filter logs in frontend
  const filteredLogs = useMemo(() => {
    console.log("Filtering logs:", logs);
    if (!Array.isArray(logs)) return [];

    return logs.filter((log) => {
      if (selectedCategory !== "All" && log.action !== selectedCategory) return false;
      if (
        filterBy === "username" &&
        !log.username?.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      if (
        filterBy === "document_type" &&
        !log.document_type?.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      if (
        filterBy === "document_no" &&
        !log.document_no?.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      if (
        filterBy === "action" &&
        !log.action?.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      return true;
    }).filter((log) => {
      const logTime = moment.tz(log.timestamp, "YYYY-MM-DD h:mm A", "Asia/Manila");
      if (dateFrom && dateTo) {
        return logTime.isBetween(
          moment(dateFrom, "YYYY-MM-DD"),
          moment(dateTo, "YYYY-MM-DD").endOf("day"),
          undefined,
          "[]"
        );
      }
      if (dateFrom) {
        return logTime.isSameOrAfter(moment(dateFrom, "YYYY-MM-DD"));
      }
      if (dateTo) {
        return logTime.isSameOrBefore(moment(dateTo, "YYYY-MM-DD").endOf("day"));
      }
      return true;
    });
  }, [logs, searchQuery, filterBy, dateFrom, dateTo, selectedCategory]);

  return (
    <div className="flex bg-gray-100 font-poppins">
      <Sidebar />
      <div className="flex flex-col w-full h-screen overflow-y-auto p-6">
        <h1 className="font-bold uppercase text-[#494444] text-[35px] mb-6">History</h1>

        {/* Category Tabs */}
        <div className="flex border-b mb-4">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`p-3 text-sm font-semibold ${
                selectedCategory === category
                  ? "border-b-2 border-[#408286] text-[#408286]"
                  : "text-gray-600 hover:text-[#408286]"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Filter Section */}
        <div className="mb-6 flex flex-wrap gap-4">
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="border p-2 rounded text-sm"
          >
            <option value="all">All</option>
            <option value="username">Username</option>
            <option value="document_type">Document Type</option>
            <option value="document_no">Document No.</option>
            <option value="action">Action</option>
          </select>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border p-2 rounded text-sm w-64"
          />
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="border p-2 rounded text-sm"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="border p-2 rounded text-sm"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 text-red-500 text-sm text-center">{error}</div>
        )}

        {/* Logs Table */}
        <div className="bg-white p-6 shadow-lg rounded-lg overflow-x-auto">
          <div className="max-h-[650px] overflow-y-auto">
            <table className="w-full border-collapse">
              <thead className="bg-[#408286] text-white sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wide">
                    Username
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wide">
                    Document Type
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wide">
                    Document No.
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wide">
                    Action
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wide">
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length > 0 ? (
                  <>
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="border-b hover:bg-gray-100">
                        <td className="px-4 py-3 text-gray-700 text-sm">{log.username}</td>
                        <td className="px-4 py-3 text-gray-700 text-sm">{log.document_type}</td>
                        <td className="px-4 py-3 text-gray-700 text-sm">{log.document_no}</td>
                        <td className="px-4 py-3 text-gray-700 text-sm">{log.action}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{log.timestamp}</td>
                      </tr>
                    ))}
                    {hasMore && !isLoading && (
                      <tr>
                        <td colSpan="5" className="px-4 py-3 text-center">
                          <button
                            onClick={handleLoadMore}
                            className="px-4 py-2 bg-[#408286] text-white text-sm rounded hover:bg-[#306466] w-full max-w-xs mx-auto"
                          >
                            Load More
                          </button>
                        </td>
                      </tr>
                    )}
                    {isLoading && (
                      <tr>
                        <td colSpan="5" className="px-4 py-3 text-center">
                          <div className="inline-block h-6 w-6 border-4 border-t-[#408286] border-r-transparent border-b-[#408286] border-l-transparent rounded-full animate-spin"></div>
                        </td>
                      </tr>
                    )}
                  </>
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-gray-500 text-sm">
                      No logs match the filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;