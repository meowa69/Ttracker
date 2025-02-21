import Sidebar from "./Sidebar";

function CreateAccount() {
    return (
        <div className="flex">
            <Sidebar />
            <div className="flex flex-col w-full h-screen overflow-y-auto p-8">
                <div className="font-poppins font-bold uppercase text-[#494444] text-[35px] mb-4">
                    <h1>Create Account</h1>
                </div>
                
                <div className="w-full border rounded-lg shadow-lg p-8">
                    <div className="border p-4 rounded-md">
                        <form className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        placeholder="Name"
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                                    <input
                                        type="text"
                                        id="username"
                                        name="username"
                                        placeholder="Username"
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                                    <select
                                        id="role"
                                        name="role"
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="">Select Role</option>
                                        <option value="admin">Admin</option>
                                        <option value="sub-admin">Sub-admin</option>
                                        <option value="user">User</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        placeholder="Password"
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                            </div>
                        </form>
                    </div>
                    <div className="flex justify-between mt-8">
                        <div>
                            <button
                                type="submit"
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-poppins font-semibold rounded-md text-white bg-[#408286] hover:bg-[#357a74] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                                Create Account
                            </button>
                        </div>
                        <div>
                            <button
                                type="button"
                                className="inline-flex justify-center py-2 px-4 border border-transparent font-poppins shadow-sm text-sm font-semibold rounded-md text-white bg-[#408286] hover:bg-[#357a74] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Generate password
                            </button>
                            <button
                                type="button"
                                className="ml-2 inline-flex justify-center py-2 px-4 border border-transparent font-poppins shadow-sm text-sm font-semibold rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                                Clear
                            </button>
                        </div> 
                    </div>   
                </div>
            </div>
        </div>
    );
}

export default CreateAccount;
