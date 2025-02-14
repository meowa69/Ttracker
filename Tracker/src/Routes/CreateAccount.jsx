import Sidebar from "./Sidebar";

function CreateAccount () {
    return (
        <div className="flex">
            <Sidebar />
            <div className="font-poppins font-bold uppercase flex-grow p-4 text-[#494444] text-[35px]">
                <h1>Create Account</h1>
                {/* Add more dashboard content here */}
            </div>
        </div>
    );
}

export default CreateAccount;