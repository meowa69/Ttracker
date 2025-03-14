import { useState } from "react";
import Sidebar from "../Components/Sidebar";
import axios from "axios";

function CreateAccount() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Function to generate a random password
  const generatePassword = () => {
    const randomPass = Math.random().toString(36).slice(-8); // 8-character random password
    setPassword(randomPass);
  };

  // Handle form submission
  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name || !username || !role || !password) {
      setError("All fields are required.");
      return;
    }

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/register", {
        name,
        user_name: username,
        role,
        password,
      });

      if (response.status === 201) {
        setSuccess("Account created successfully!");
        setName("");
        setUsername("");
        setRole("");
        setPassword("");
      }
    } catch (err) {
      console.error("Error creating account:", err.response);
      setError(err.response?.data?.message || "Failed to create account.");
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex flex-col w-full h-screen overflow-y-auto p-8">
            <div className="font-poppins font-bold uppercase text-[#494444] text-[35px] mb-4">
                <h1>Create Account</h1>
            </div>

            <div className="w-full border rounded-lg shadow-lg p-8">
                <div className="border p-4 rounded-md">
                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                    {success && <p className="text-green-500 text-sm mb-4">{success}</p>}
                    <form className="space-y-4" onSubmit={handleCreateAccount}>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Name"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                                <input
                                    type="text"
                                    id="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Username"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                                <select
                                    id="role"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
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
                                    id="password"
                                    value={password}
                                    readOnly
                                    name="password"
                                    placeholder="Password"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
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
                                    onClick={generatePassword}
                                    className="inline-flex justify-center py-2 px-4 border border-transparent font-poppins shadow-sm text-sm font-semibold rounded-md text-white bg-[#408286] hover:bg-[#357a74] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Generate password
                                </button>
                                <button
                                type="button"
                                onClick={() => {
                                    setName("");
                                    setUsername("");
                                    setRole("");
                                    setPassword("");
                                    setError("");
                                    setSuccess("");
                                }}
                                    className="ml-2 inline-flex justify-center py-2 px-4 border border-transparent font-poppins shadow-sm text-sm font-semibold rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                >
                                    Clear
                                </button>
                            </div> 
                        </div>  
                    </form>
                </div> 
            </div>
        </div>
    </div>
  );
}

export default CreateAccount;
