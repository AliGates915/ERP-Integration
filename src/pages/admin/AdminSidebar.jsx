import React, { useEffect, useState } from "react";
import {
  FaChevronDown,
  FaChevronUp,
  FaBox,
  FaReceipt,
  FaUsers,
  FaBarcode,
  FaChartBar,
  FaUserShield,
  FaCogs,
  FaTags,
  FaIndustry,
  FaTruck,
  FaWarehouse,
  FaUsersCog,
  FaBalanceScale,
  FaUserCog,
  FaShoppingCart,
} from "react-icons/fa";
import { FaUserGroup } from "react-icons/fa6";
import { MdOutlineIntegrationInstructions } from "react-icons/md";
import { FcSalesPerformance } from "react-icons/fc";
import { RiLogoutBoxRLine, RiDashboardFill } from "react-icons/ri";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { BiPurchaseTagAlt } from "react-icons/bi";

// 🔹 Link definitions with permission keys
const links = [
  { to: "/admin", label: "Dashboard", icon: <RiDashboardFill /> },
  // {
  //   to: "/admin/item-details",
  //   label: "Item Details",
  //   icon: <FaBox />,
  //   key: "isItemDetails",
  // },
  // {
  //   to: "/admin/purchase",
  //   label: "Purchase",
  //   icon: <FaShoppingCart />,
  // },

  // {
  //   to: "/admin/sales",
  //   label: "Sales ",
  //   icon: <FcSalesPerformance color="#1d4ed8"/>,
  // },
   {
    to: "/admin/fbr-integration",
    label: "Sales ",
    icon: <BiPurchaseTagAlt  color="black"/>,
  },
  // {
  //   to: "/admin/sales-invoice",
  //   label: "Sales Invoice",
  //   icon: <FaReceipt />,
  //   key: "isSales",
  // },
  // {
  //   to: "/admin/customers",
  //   label: "Customers",
  //   icon: <FaUsers />,
  //   key: "isCustomer",
  // },
  // {
  //   to: "/admin/customers-booking",
  //   label: "Booking Customer",
  //   icon: <FaUsers />,
  //   key: "isBookingCustomer",
  // },
  // {
  //   to: "/admin/item-barcode",
  //   label: "Item Barcode",
  //   icon: <FaBarcode />,
  //   key: "isInventory",
  // },
  // { to: "/admin/open-balance", label: "Opening Balance", icon: <FaBarcode /> },
  // {
  //   to: "/admin/expiry-tags",
  //   label: "Expiry Tags",
  //   icon: <FaTags />,
  //   key: "isSettings",
  // },
  // { to: "/admin/report", label: "Report", icon: <FaChartBar />, key: "isReports" },
  {
    label: "Setup",
    icon: <FaCogs />,
    children: [
      { to: "/admin/customers-list", label: "Customers", icon: <FaTags /> },
      { to: "/admin/group", label: "Group", icon: <FaUserGroup /> },
      { to: "/admin/company", label: "Company", icon: <FaTags /> },
      {
        to: "/admin/category-item",
        label: "Item Categories",
        icon: <FaTags />,
        key: "isItemCategory",
      },
      { to: "/admin/item-type", label: "Item Type", icon: <FaTags /> },
      {
        to: "/admin/manufacture",
        label: "Manufacturer",
        icon: <FaIndustry />,
        key: "isItemManufacturer",
      },
      {
        to: "/admin/supplier",
        label: "Supplier",
        icon: <FaTruck />,
        key: "isItemSupplier",
      },
      {
        to: "/admin/shelve-location",
        label: "Shelve Location",
        icon: <FaWarehouse />,
        key: "isItemLocation",
      },
      {
        to: "/admin/item-unit",
        label: "Item Unit",
        icon: <FaBalanceScale />,
        key: "isItemUnit",
      },
      { to: "/admin/promotion", label: "Promotion", icon: <FaBalanceScale /> },
      {
        to: "/admin/promotion-item",
        label: "Promotion Item",
        icon: <FaBalanceScale />,
      },
      { to: "/admin/tax", label: "Tax", icon: <FaBalanceScale /> },
    ],
  },
  {
    label: "Management",
    icon: <FaUserShield />,
    children: [
      { to: "/admin/designation", label: "Designation", icon: <FaUsersCog /> },
      { to: "/admin/employee", label: "Employee", icon: <FaUserCog /> },
      { to: "/admin/departments", label: "Departments", icon: <FaUserShield /> },
    ],
  },
  {
    label: "Security",
    key: "isSecurity",
    icon: <FaUserShield />,
    children: [
      {
        to: "/admin/groups",
        label: "Group Management",
        icon: <FaUsersCog />,
        key: "isGroupManagement",
      },
      { to: "/admin/users", label: "Users", icon: <FaUserCog />, key: "isUsers" },
      {
        to: "/admin/access-rights",
        label: "Access Control",
        icon: <FaUserShield />,
        key: "isAccessControl",
      },
    ],
  },

];

const AdminSidebar = () => {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(null);
  const location = useLocation();

  // 🔹 Get logged-in user info from localStorage with fallback
  const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  useEffect(() => {
    links.forEach((link) => {
      if (link.children) {
        const isChildActive = link.children.some((child) =>
          location.pathname.startsWith(child.to)
        );
        if (isChildActive) {
          setOpenMenu(link.label);
        }
      }
    });
  }, [location.pathname]);

  // 🔹 Permission filter logic with safer property access
  const filterWithPermissions = (link) => {
    if (userInfo.isAdmin === true) return true; // Admin sees everything
    if (!link.key) return true; // Links without key always show
    return userInfo[link.key] === true; // Check permission key
  };

  const filteredLinks = links
    .filter(filterWithPermissions)
    .map((link) =>
      link.children
        ? {
          ...link,
          children: link.children.filter(filterWithPermissions),
        }
        : link
    );

  const toggleMenu = (label) => {
    setOpenMenu(openMenu === label ? null : label);
  };

  return (
    <aside className="bg-white shadow min-h-screen w-16 sm:w-20 md:w-60 flex flex-col py-8 px-2 sm:px-4 justify-between transition-all">
      <div>
        {/* Logo + Title */}
        <div className="flex items-center justify-center sm:justify-start mb-12 space-x-2 sm:space-x-4">
          <h1 className="hidden md:block text-xl font-bold bg-gradient-to-r from-newPrimary to-primaryDark bg-clip-text text-transparent">
            Enterprise Resource Planning (ERP)
          </h1>
        </div>

        {/* Sidebar Links */}
        <nav className="flex flex-col gap-2">
          {filteredLinks.map((link) =>
            link.children && link.children.length > 0 ? (
              <div key={link.label}>
                <button
                  onClick={() => toggleMenu(link.label)}
                  className={`w-full flex items-center justify-center sm:justify-start gap-2 px-2 sm:px-4 py-2 rounded-lg font-medium transition text-gray-700 hover:text-gray-600 hover:bg-newPrimary/30 ${openMenu === link.label ? "bg-newPrimary/20" : ""
                    }`}
                >
                  {link.icon}
                  <span className="hidden sm:inline">{link.label}</span>
                  {openMenu === link.label ? (
                    <FaChevronUp className="ml-auto w-4 h-4 hidden sm:block" />
                  ) : (
                    <FaChevronDown className="ml-auto w-4 h-4 hidden sm:block" />
                  )}
                </button>

                {openMenu === link.label && (
                  <div className="ml-2 sm:ml-4 mt-1 flex flex-col gap-1">
                    {link.children.map((sub) => (
                      <NavLink
                        key={sub.to}
                        to={sub.to}
                        className={({ isActive }) =>
                          `flex items-center gap-2 px-2 sm:px-4 py-2 rounded-lg font-medium transition ${isActive
                            ? "bg-newPrimary/80 text-white"
                            : "text-gray-700 hover:text-gray-600 hover:bg-newPrimary/30"
                          }`
                        }
                      >
                        {sub.icon && <span className="text-lg">{sub.icon}</span>}
                        <span className="hidden sm:inline">{sub.label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center justify-center sm:justify-start gap-2 px-2 sm:px-4 py-2 rounded-lg font-medium transition ${isActive
                    ? "bg-newPrimary/80 text-white"
                    : "text-gray-700 hover:text-gray-600 hover:bg-newPrimary/30"
                  }`
                }
                end={link.to === "/admin"}
              >
                {link.icon}
                <span className="hidden sm:inline">{link.label}</span>
              </NavLink>
            )
          )}
        </nav>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center justify-center sm:justify-start gap-2 px-2 sm:px-4 py-2 rounded font-semibold text-gray-700 hover:bg-red-600 hover:text-white transition"
      >
        <RiLogoutBoxRLine />
        <span className="hidden sm:inline">Logout</span>
      </button>
    </aside>
  );
};

export default AdminSidebar;