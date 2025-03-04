import Swal from "sweetalert2";
import { useState } from "react";
import Sidebar from "./Sidebar";

const initialData = [
  { id: 1, name: "John Doe", date: "March 3, 2025", documentType: "Ordinance", number: "104-2024", title: "Ordinance Title" },
  { id: 2, name: "John Doe", date: "March 3, 2025", documentType: "Resolution", number: "104-2024", title: "Resolution Title" },
  { id: 3, name: "John Doe", date: "March 3, 2025", documentType: "Ordinance", number: "104-2024", title: "Ordinance Title" },
  { id: 4, name: "John Doe", date: "March 3, 2025", documentType: "Resolution", number: "104-2024", title: "Resolution Title" },
  { id: 5, name: "John Doe", date: "March 3, 2025", documentType: "Ordinance", number: "104-2024", title: "Ordinance Title" },
];

function Request() {
  const [requestData, setRequestData] = useState(initialData);

  function handleDelete(id) {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setRequestData(requestData.filter((item) => item.id !== id)); // Remove the item
        Swal.fire("Deleted!", "The document has been deleted.", "success");
      }
    });
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex flex-col w-full h-screen overflow-hidden p-6 bg-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h1 className="font-poppins font-bold uppercase text-[#333] text-[30px] tracking-wide">
            Requests
          </h1>
        </div>

        {/* Table Container */}
        <div className="w-full border rounded-lg shadow-lg p-8 bg-white border-gray-300">
          <div className={`overflow-auto relative rounded-lg shadow-lg ${requestData.length > 0 ? "h-[700px]" : "h-auto"}`}>
            <table className="w-full border-collapse">
              {/* Table Header */}
              <thead className="sticky top-[-1px] bg-[#408286] text-white z-10">
                <tr className="font-semibold font-poppins text-left text-[14px]">
                  <th className="border border-gray-300 px-4 py-4 first:rounded-tl-lg last:rounded-tr-lg">
                    Details
                  </th>
                  <th className="border border-gray-300 px-4 py-4 text-center w-1/4">
                    Actions
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {requestData.length === 0 ? (
                  <tr>
                    <td colSpan="2" className="text-center py-10 text-gray-500 font-poppins text-lg">
                      No deletion request yet
                    </td>
                  </tr>
                ) : (
                  requestData.map((request) => (
                    <tr key={request.id} className="border border-gray-300 hover:bg-gray-100 text-[14px]">
                      {/* Details Section */}
                      <td className="border border-gray-300 px-4 py-4 align-top">
                        <div className="space-y-3">
                          <p className="font-semibold font-poppins text-gray-700">
                            Name: <span className="font-normal">{request.name}</span>
                          </p>
                          <p className="font-semibold font-poppins text-gray-700">
                            Date of Request: <span className="font-normal">{request.date}</span>
                          </p>
                          <p className="font-semibold font-poppins text-gray-700">
                            Document Type: <span className="font-normal">{request.documentType}</span>
                          </p>
                          <p className="font-semibold font-poppins text-gray-700">
                            No: <span className="font-normal">{request.number}</span>
                          </p>
                          <p className="font-semibold font-poppins text-gray-700">
                            Title: <span className="font-normal">{request.title}</span>
                          </p>
                        </div>
                      </td>

                      {/* Action Section */}
                      <td className="w-1/4 px-4 py-4 text-center align-middle">
                        <div className="flex justify-center">
                          <button
                            onClick={() => handleDelete(request.id)}
                            className="bg-[#FF6767] hover:bg-[#f35656] px-4 py-2 rounded-md text-white font-medium flex items-center gap-2 font-poppins text-sm"
                          >
                            <img src="src/assets/Images/delete.png" alt="Delete" className="w-5 h-5 invert" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div> {/* End of Scrollable Table */}
        </div>
      </div>
    </div>
  );
}

export default Request;
