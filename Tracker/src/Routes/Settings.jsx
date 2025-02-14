import Sidebar from "./Sidebar";


function Settings() {
    return (
        <div className="flex">
            <Sidebar/>
            <div className="font-poppins font-bold uppercase flex-grow p-4 text-[#494444] text-[35px]">
                <h1>Settings</h1>
                {/* Add more dashboard content here */}
            </div>
        </div>
    );
}

export default Settings;