import { useState, useRef, useEffect } from "react";
import { HiMenuAlt3 } from "react-icons/hi";
import { Link, useNavigate } from "react-router-dom";

const Sidebar = () => {
    const navigate = useNavigate();
    const sidebarRef = useRef(null);

    const menus = [
        { title: "Dashboard", src: "src/assets/Images/dashboard.png", path: "/dashboard" },
        { title: "Add Record", src: "src/assets/Images/add.png", path: "/add-records" },
        { 
            title: "Manage Record", 
            src: "src/assets/Images/manage.png", 
            submenus: [
                { title: "Request", src: "src/assets/Images/request.png", path: "/request" },
                { title: "History", src: "src/assets/Images/history.png", path: "/history" },
            ]
        },
        { title: "Manage Committees", src: "src/assets/Images/management.png", path: "/committee-management" },
        { title: "Create Account", src: "src/assets/Images/create.png", path: "/create-account", isSeparated: true },
        { title: "Settings", src: "src/assets/Images/setting.png", path: "/settings" },
        { title: "Logout", src: "src/assets/Images/logout.png", path: "/" },
    ];

    
    const [displayName, setDisplayName] = useState("Admin User");
    const [activeMenu, setActiveMenu] = useState(null);

    const [open, setOpen] = useState(() => {
        return localStorage.getItem("sidebarOpen") === "false" ? false : true;
    });
    
    const toggleSidebar = () => {
        setOpen((prev) => {
            const newState = !prev;
            localStorage.setItem("sidebarOpen", newState);
            return newState;
        });
    };
    

    const handleNavigation = (path) => {
        navigate(path);
        setActiveMenu(null); // Close submenu after navigating
    };

    const handleMenuClick = (menuTitle) => {
        setActiveMenu(activeMenu === menuTitle ? null : menuTitle);
    };

    // Detect clicks outside of the sidebar
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setActiveMenu(null); // Close submenu when clicking outside
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

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
                ref={sidebarRef}
                className={`bg-gradient-to-t from-[#135155] to-[#5FA8AD] shadow-lg min-h-screen fixed top-0 left-0 ${
                    open ? "w-[300px]" : "w-[85px]"
                } transition-all duration-300 ease-in-out z-30`}
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
                            <div key={i} className="relative">
                                {menu.isSeparated && <div className="border-t border-white my-4"></div>}

                                {/* Main Menu Items */}
                                <button
                                    className="group flex items-center text-white text-md gap-3.5 font-poppins font-sm p-2 hover:bg-[#387174] hover:text-white rounded-md relative w-full"
                                    onClick={() => menu.submenus ? handleMenuClick(menu.title) : handleNavigation(menu.path)}
                                >
                                    <img
                                        src={menu.src}
                                        alt={menu.title}
                                        className="w-5 h-5 transition-colors duration-300 invert"
                                    />
                                    <h2
                                        className={`whitespace-pre transition-all duration-500 ease-in-out ${
                                            !open ? "opacity-0 translate-x-28 overflow-hidden" : ""
                                        }`}
                                    >
                                        {menu.title}
                                    </h2>

                                    {/* Tooltip for minimized mode */}
                                    <h2
                                        className={`${
                                            open && "hidden"
                                        } z-50 absolute left-48 bg-white font-semibold whitespace-pre text-gray-900 rounded-md drop-shadow-lg px-0 py-0 w-0 overflow-hidden group-hover:px-2 group-hover:py-1 group-hover:left-[55px] group-hover:duration-300 group-hover:w-fit`}
                                    >
                                        {menu.title}
                                    </h2>
                                </button>

                                {/* Submenus */}
                                {menu.submenus && (
                                    <div
                                        className={`transition-all duration-300 ease-in-out overflow-hidden ${
                                            activeMenu === menu.title ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                                        } ${open ? "ml-6 mt-2 space-y-2" : "absolute left-[70px] top-0 bg-[#135155] rounded-md p-2 shadow-lg z-50"}`}
                                    >
                                        {menu.submenus.map((submenu, subIndex) => (
                                            <Link
                                                key={subIndex}
                                                to={submenu.path}
                                                className="group flex items-center text-white text-md gap-3.5 font-poppins font-sm p-2 hover:bg-[#387174] hover:text-white rounded-md relative w-full px-2 pr-8"
                                                onClick={() => handleNavigation(submenu.path)}
                                            >
                                                <img
                                                    src={submenu.src}
                                                    alt={submenu.title}
                                                    className="w-5 h-5 transition-colors duration-300 invert"
                                                />
                                                {submenu.title}
                                            </Link>
                                        ))}
                                    </div>
                                )}
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
            </div>
        </section>
    );
};

export default Sidebar;
