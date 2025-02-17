import Sidebar from "./Sidebar";


function Settings() {
    return (
        <div className="flex">
            <Sidebar/>
            <div className="flex flex-col w-full h-screen overflow-y-auto p-4">
                <div className="font-poppins font-bold uppercase flex-grow p-4 text-[#494444] text-[35px]">
                    <h1>Settings</h1>
                    {/* Add more dashboard content here */}
                </div>
            </div>
        </div>
    );
}

export default Settings;