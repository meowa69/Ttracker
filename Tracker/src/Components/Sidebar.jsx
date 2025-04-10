import { useState, useEffect, useRef, useMemo } from "react";
import { HiMenuAlt3 } from "react-icons/hi";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { getFilteredMenus } from "../utils/menuUtils"; 

const Sidebar = () => {
    const navigate = useNavigate();
    const sidebarRef = useRef(null);

    const [open, setOpen] = useState(() => {
        const storedOpenState = localStorage.getItem("sidebarOpen");
        return storedOpenState ? JSON.parse(storedOpenState) : true;
    });

    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem("userData");
        try {
            return storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : { name: "User", role: "default" }; // Fallback user
        } catch (error) {
            console.error("Error parsing user data:", error);
            return { name: "User", role: "default" }; // Fallback user
        }
    });

    const [activeMenu, setActiveMenu] = useState(null);

    // Derive menus from localStorage user data immediately
    const menus = useMemo(() => getFilteredMenus(user?.role), [user?.role]);

    const toggleSidebar = () => {
        setOpen((prev) => {
            const newState = !prev;
            localStorage.setItem("sidebarOpen", newState);
            return newState;
        });
    };

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            try {
                const response = await axios.get("http://127.0.0.1:8000/api/user", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.data) {
                    setUser(response.data);
                    localStorage.setItem("userData", JSON.stringify(response.data));
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                localStorage.removeItem("token");
                navigate("/login");
            }
        };

        // Fetch user data in the background
        fetchUserData();
    }, [navigate]);

    // Close submenus when clicking outside the sidebar
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setActiveMenu(null); // Close all submenus
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Close submenus when the sidebar is toggled
    useEffect(() => {
        setActiveMenu(null); // Close all submenus when the sidebar is toggled
    }, [open]);

    const handleMenuClick = (menuTitle) => {
        setActiveMenu((prev) => (prev === menuTitle ? null : menuTitle));
    };

    const handleNavigation = (path) => {
        navigate(path);
        setActiveMenu(null);
    };

    const getInitials = (name) => {
        if (!name || typeof name !== "string") {
            return ""; // Fallback if name is undefined or not a string
        }
        return name
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase())
            .join("");
    };

    
    return (
        <section className="min-h-screen flex flex-row bg-white">
            <div
                ref={sidebarRef}
                className={`bg-gradient-to-t from-[#135155] to-[#5FA8AD] shadow-lg min-h-screen fixed top-0 left-0 
                ${open ? "w-[300px]" : "w-[85px]"} transition-all duration-300 ease-in-out z-30 flex flex-col justify-between`}
            >
                <div className="w-full">
                    <div className="py-3 flex justify-between items-center border-b w-full border-white">
                        <div className="flex items-center gap-3 ml-3">
                            <div className={`transition-all duration-300 ease-in-out rounded-full ${open ? "w-[70px] h-[70px]" : "w-[40px] h-[40px]"}`}>
                                <div className="w-full h-full text-gray-700 flex items-center justify-center rounded-full font-poppins font-bold">
                                    <img src="src/assets/Images/CityC_logo.png" alt="" />
                                </div>
                            </div>

                            {open && (
                                <div className="flex flex-col">
                                    <h2 className="font-poppins text-white font-semibold text-[14px]">City Council</h2>
                                    <h1 className="font-poppins text-white font-bold text-[17px]">Transmittal Tracker</h1>
                                </div>
                            )}
                        </div>

                        <HiMenuAlt3 size={26} className="cursor-pointer text-white" onClick={toggleSidebar} />
                    </div>

                    <div className="mt-4 flex flex-col gap-4 relative p-6 justify-center">
                        {menus.map((menu, i) => (
                            <div key={i} className="relative">
                                {menu.isSeparated && <div className="border-t border-white my-4"></div>}

                                <button
                                    className="group flex items-center text-white text-md gap-3.5 font-poppins font-sm p-2 hover:bg-[#387174] hover:text-white rounded-md relative w-full"
                                    onClick={() =>
                                        menu.submenus ? handleMenuClick(menu.title) : handleNavigation(menu.path)
                                    }
                                >
                                    <img src={menu.src} alt={menu.title} className="w-5 h-5 transition-colors duration-300 invert" />
                                    <h2 className={`whitespace-pre transition-all duration-500 ease-in-out ${!open ? "opacity-0 translate-x-28 overflow-hidden" : ""}`}>
                                        {menu.title}
                                    </h2>

                                    {/* Submenu Indicator (Dot) */}
                                    {!open && menu.submenus && activeMenu !== menu.title && (
                                        <div className="absolute left-[40px] top-1/2 transform -translate-y-1/2 bg-[#ffd050] rounded-full w-2 h-2 animate-bounce"></div>
                                    )}
                                </button>

                                {user?.role === "user" && menu.title === "Add Record" && (
                                    <div className="border-t border-white my-4"></div>
                                )}

                                {menu.submenus && (
                                    <div
                                        className={`transition-all duration-300 ease-in-out overflow-hidden ${
                                            activeMenu === menu.title ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                                        } ${
                                            open
                                                ? "ml-6 mt-2 space-y-2"
                                                : "absolute left-[70px] top-0 bg-[#135155] rounded-md p-2 shadow-lg z-50"
                                        }`}
                                    >
                                        {menu.submenus.map((submenu, subIndex) => (
                                            <Link
                                                key={subIndex}
                                                to={submenu.path}
                                                className="group flex items-center text-white text-md gap-3.5 font-poppins font-sm p-2 hover:bg-[#387174] hover:text-white rounded-md relative w-full px-2 pr-8"
                                                onClick={() => handleNavigation(submenu.path)}
                                            >
                                                <img src={submenu.src} alt={submenu.title} className="w-5 h-5 transition-colors duration-300 invert" />
                                                {submenu.title}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {user && (
                    <div className="border-t border-white py-3 px-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-white rounded-full flex items-center justify-center w-[37px] h-[37px]">
                                <div className="text-gray-700 font-poppins font-bold text-lg">{getInitials(user.name)}</div>
                            </div>

                            {open && (
                                <div className="flex flex-col">
                                    <h1 className="font-poppins text-white font-bold text-md uppercase">{user.name}</h1>
                                    <h2 className="font-poppins text-gray-100 font-medium text-sm">Role: {user.role}</h2>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Main Content (Unchanged) */}
            <div className={`flex-grow transition-all duration-300 ease-in-out ${open ? "ml-[300px]" : "ml-[85px]"}`}></div>
        </section>
    );
};

export default Sidebar;