import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";


function ChangePassword() {
    const navigate = useNavigate(); // Hook for navigation

    const handleChangePassword = () => {
        Swal.fire({
        title: "Success!",
        text: "Your password has been successfully reset.",
        icon: "success",
        confirmButtonText: "OK",
        allowOutsideClick: false
        }).then(() => {
        navigate("/"); // Redirect to login page after confirmation
        });
    };

    return (
        <div className="w-full h-screen flex justify-center items-center bg-gray-900 relative backdrop-blur">
        {/* Background Image */}
        <div
        className="absolute inset-0 bg-cover bg-center opacity-50 backdrop-blur-md"
        style={{ backgroundImage: "url(src/assets/Images/ysalina_bridge.jpg)" }}
        ></div>

        {/* Main Content */}
        <div className="relative p-8 inset-0 bg-cover bg-center opacity-95 shadow-lg w-[80%] h-[700px] rounded-lg" 
            style={{ backgroundImage: "url(src/assets/Images/ysalina_bridge.jpg)" }}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex rounded-lg justify-center items-center">
            <div>
            {/* Logo */}
            <div className="flex justify-center items-center">
                <img
                src="src/assets/Images/CityC_Logo.png"
                alt="City Logo"
                className="w-[250px] mb-4"
                />
            </div>

            {/* Title & Description */}
            <h1 className="text-white text-2xl font-bold uppercase mb-2">
                Change Your Password
            </h1>
            <p className="text-white text-md mb-4">
                Enter a new password below to change your password
            </p>

            {/* Email Input */}
            <div className="w-full mb-2">
                <label className="block text-white text-left mb-1">New password</label>
                <input
                type="text"
                placeholder="Enter your new password"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                />
            </div>

            <div className="w-full mb-4">
                <label className="block text-white text-left mb-1">Confirm password</label>
                <input
                type="text"
                placeholder="Confirm new password"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                />
            </div>

            {/* Reset Password Button */}
            <button
                onClick={handleChangePassword}
                className="w-full bg-[#5FA8AD] text-white font-bold py-2 rounded-lg hover:bg-[#52969b] transition duration-200"
            >
                RESET PASSWORD
            </button>

            {/* Back to Login Link */}
            <Link to="/" className="text-white text-sm mt-4 hover:underline">
                &lt; Back to log in page
            </Link>
            </div>
        </div>
        </div>
    </div>
    );
}

export default ChangePassword;