import Sidebar from "./Sidebar";


function ManageRecord() {
  return (
    <div className="flex">
        <Sidebar />
        <div className="flex flex-col w-full h-screen overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="font-poppins font-bold uppercase text-[#494444] text-[35px]">
                    Manage Record
                </h1>
            </div>
        </div>
    </div>
  );
}

export default ManageRecord;
