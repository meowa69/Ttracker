import { useState, useEffect } from "react";
import { HiMenuAlt3 } from "react-icons/hi";
import { Link, useNavigate } from "react-router-dom";

const Sidebar = () => {
    const navigate = useNavigate();

    const menus = [
        { title: "Dashboard", src: "src/assets/Images/dashboard.png", path: "/dashboard" },
        { title: "Add Record", src: "src/assets/Images/add.png", path: "/add-records" },
        { title: "Create Account", src: "src/assets/Images/create.png", path: "/create-account", isSeparated: true },
        { title: "Settings", src: "src/assets/Images/setting.png", path: "/settings" },
        { title: "Logout", src: "src/assets/Images/logout.png", path: "/" },
    ];

    const [open, setOpen] = useState(true);
    const [displayName, setDisplayName] = useState("Admin User");

    const toggleSidebar = () => {
        setOpen((prev) => !prev);
    };

    const handleNavigation = (path) => {
        navigate(path);
    };

    const getInitials = (name) => {
        return name
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase())
            .join("");
    };  

    return (
        <section className="min-h-screen flex flex-row bg-white">
            {/* Sidebar */}
            <div
                className={`bg-gradient-to-t from-[#135155] to-[#5FA8AD] shadow-lg min-h-screen fixed top-0 left-0 ${
                    open ? "w-[300px]" : "w-[85px]"
                } transition-all duration-300 ease-in-out`}
            >
                <div className="w-full">
                    {/* Menu Toggle and Profile */}
                    <div className="py-3 flex justify-between items-center border-b w-full border-white">
                        <div className="flex items-center gap-3 ml-3">
                            <div
                                className={`transition-all duration-300 ease-in-out bg-white rounded-full ${
                                    open ? "w-[70px] h-[70px]" : "w-[40px] h-[40px]"
                                }`}
                            >
                                <div className="w-full h-full bg-white text-gray-700 flex items-center justify-center rounded-full font-poppins font-bold">
                                    {getInitials(displayName)}
                                </div>
                            </div>

                            {open && (
                                <div className="flex flex-col">
                                    <h2 className="font-poppins text-white font-semibold text-md">Admin</h2>
                                    <h1 className="font-poppins text-white font-bold text-xl">{displayName}</h1>
                                </div>
                            )}
                        </div>

                        {/* Sidebar Toggle Button */}
                        <HiMenuAlt3
                            size={26}
                            className="cursor-pointer text-white"
                            onClick={toggleSidebar}
                        />
                    </div>

                    {/* Menu Items */}
                    <div className="mt-4 flex flex-col gap-4 relative p-6 justify-center">
                        {menus.map((menu, i) => (
                            <div key={i}>
                                {menu.isSeparated && <div className="border-t border-white my-4"></div>}

                                <Link
                                    to={menu.path}
                                    className="group flex items-center text-white text-md gap-3.5 font-poppins font-sm p-2 hover:bg-[#387174] hover:text-white rounded-md relative"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleNavigation(menu.path);
                                    }}
                                >
                                    <img
                                        src={menu.src}
                                        alt={menu.title}
                                        className="w-5 h-5 transition-colors duration-300 invert"
                                    />
                                    <h2
                                        className={`whitespace-pre ${
                                            open ? "transition-all duration-500 ease-in-out" : ""
                                        } ${
                                            !open ? "opacity-0 translate-x-28 overflow-hidden" : ""
                                        }`}
                                    >
                                        {menu.title}
                                    </h2>
                                    <h2
                                        className={`${
                                            open && "hidden"
                                        } z-50 absolute left-48 bg-white font-semibold whitespace-pre text-gray-900 rounded-md drop-shadow-lg px-0 py-0 w-0 overflow-hidden group-hover:px-2 group-hover:py-1 group-hover:left-[55px] group-hover:duration-300 group-hover:w-fit`}
                                        style={!open ? { pointerEvents: "none" } : {}}
                                    >
                                        {menu.title}
                                    </h2>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div
                className={`flex-grow transition-all duration-300 ease-in-out ${
                    open ? "ml-[300px]" : "ml-[85px]"
                }`}
            >
                {/* Main content goes here */}
            </div>
        </section>
    );
};

export default Sidebar;