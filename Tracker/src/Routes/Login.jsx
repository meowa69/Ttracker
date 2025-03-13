import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

function Login() {
  const navigate = useNavigate();
  const [user_name, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
  
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/login", {
        user_name,
        password,
      });
  
      console.log("Login Response:", response.data); // Debug response
  
      if (response.status === 200 && response.data.token) {
        localStorage.setItem("token", response.data.token);
        navigate("/dashboard");
      } else {
        setError("Invalid response from server");
      }
    } catch (err) {
      console.error("Error Response:", err.response); // Debug error
  
      // Ensure token is NOT saved on error
      localStorage.removeItem("token");
  
      setError("Invalid username or password");
    }
  };
  
  
  return (
    <div className="w-full h-screen flex justify-center items-center bg-gray-900 relative backdrop-blur">
      <div className="absolute inset-0 bg-cover bg-center opacity-50 backdrop-blur-md" style={{ backgroundImage: "url(src/assets/Images/ysalina_bridge.jpg)" }}></div>
      <div className="relative p-8 inset-0 bg-cover bg-center opacity-95 shadow-lg w-[80%] h-[700px] rounded-lg" style={{backgroundImage: "url(src/assets/Images/ysalina_bridge.jpg)" }}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex rounded-lg">
          
          {/* Left: Login Form */}
          <div className="w-1/2 flex justify-center items-center">
            <div className="bg-white bg-opacity-30 rounded-tl-lg rounded-bl-lg shadow-lg w-full h-full flex justify-center items-center">
              <div className="w-4/5">
                <h2 className="text-[30px] font-bold text-center text-white">LOG IN</h2>
                <form onSubmit={handleLogin}>
                  <div className="mb-4">
                    <label className="block text-white ">Username</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="mb-1">
                    <label className="block text-white">Password</label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center justify-between mb-6">
                    <label className="flex items-center text-white">
                      <input type="checkbox" className="mr-2" />
                      Remember Me
                    </label>
                    <Link to="/forgot-password" className="text-white hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#5FA8AD] text-white font-bold py-2 rounded-lg hover:bg-[#52969b] transition duration-200"
                  >
                    LOG IN
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Right: Logo and Welcome Message */}
          <div className="w-full flex flex-col items-center justify-center text-white text-left px-8">
            <div className="relative top-[-50px]">
              <img src="src/assets/Images/CityC_Logo.png" alt="City Logo" className="w-[250px]" />
            </div>

            <div className="text-center relative top-[-30px]">
              <h1 className="text-xl font-semibold mb-2">WELCOME TO</h1>
              <h2 className="text-[40px] font-bold">TRANSMITTAL TRACKER SYSTEM</h2>
            </div> 
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
