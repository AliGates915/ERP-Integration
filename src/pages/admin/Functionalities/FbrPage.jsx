import { NavLink } from "react-router-dom";
import {
  FaListAlt,
  FaShoppingCart,
  FaUndoAlt,
  FaAddressBook,
  FaMoneyBillWave,
  FaReceipt,
  FaThList,
  FaUsers,
  FaBox,
  FaIndustry,
  FaWarehouse,
  FaBalanceScale,
  FaBoxOpen,
  FaFileInvoiceDollar,
  FaBook,
  FaBuilding,
} from "react-icons/fa";
import { AiOutlineProduct } from "react-icons/ai";
import { TbFileInvoice } from "react-icons/tb";
import { FaMoneyCheckDollar, FaUsersViewfinder } from "react-icons/fa6";

import { FaTruck } from "react-icons/fa";
import CommanHeader from "../../../components/CommanHeader";

// salesChildren
const salesChildren = [
  // {
  //   to: "/admin/fbr-booking-orders",
  //   label: "Booking Order",
  //   icon: <FaShoppingCart />,
  // },
  // {
  //   to: "/admin/fbr-delivery-challan",
  //   label: "Delivery Challan",
  //   icon: <FaTruck />,
  // },
  // {
  //   to: "/admin/fbr-sale-invoice",
  //   label: "Sale Invoice",
  //   icon: <TbFileInvoice />,
  // },
   {
    to: "/admin/fbr-sale-invoice",
    label: "Refine Sale Invoice",
    icon: <TbFileInvoice />,
  },
  { to: "/admin/fbr-sales-return", label: "Sales Return", icon: <FaUndoAlt /> },
];

// setupChildren
const setupChildren = [
  // { to: "/admin/company", label: "Company", icon: <FaBuilding /> },
  { to: "/admin/customers-list", label: "Customer", icon: <FaUsers /> },
  {
    to: "/admin/category-item",
    label: "Item Category",
    icon: <FaThList />,
  },
  { to: "/admin/item-type", label: "Item Type", icon: <FaBox /> },
  {
    to: "/admin/manufacture",
    label: "Manufacture",
    icon: <FaIndustry />,
  },
  // {
  //   to: "/admin/supplier",
  //   label: "Supplier",
  //   icon: <FaTruck />,
  // },
  {
    to: "/admin/shelve-location",
    label: "Shelve Location",
    icon: <FaWarehouse />,
  },
  { to: "/admin/item-unit", label: "Item Unit", icon: <FaBalanceScale /> },
  {
    to: "/admin/tax",
    label: "Tax",
    icon: <FaMoneyCheckDollar />,
  },
  { to: "/admin/bank", label: "Bank", icon: <FaUsersViewfinder /> },
  { to: "/admin/fbr-products", label: "Products", icon: <FaBoxOpen /> },
];

// reportsChildren
const reportsChildren = [
  {
    to: "/admin/fbr-payment-receipt",
    label: "Payment Receipt",
    icon: <FaFileInvoiceDollar />,
  },
  {
    to: "/admin/fbr-ledger",
    label: "Ledger",
    icon: <FaBook />,
  },
  {
    to: "/admin/fbr-receivable",
    label: "Receivable",
    icon: <FaMoneyBillWave />,
  },
];

const FbrPage = () => {
  return (
    <div>
      <CommanHeader />

      <div
        className="p-6 relative min-h-screen  bg-cover bg-center"
        style={{ backgroundImage: "url('/images/sales-invoice1.jpg')" }}
      >
        {/* Transparent overlay */}
        <div className="absolute inset-0 bg-black opacity-50  backdrop-blur-sm"></div>

        {/* Content Layer */}
        <div className="relative z-10">
          <h1 className="text-2xl text-white font-bold mb-6">
            Functionalities
          </h1>

          <div className="bg-gray-400 opacity-80 rounded-xl px-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 ">
              {salesChildren.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className="flex flex-col items-center justify-center text-white hover:text-green-600 hover:no-underline group transition-all duration-300 hover:bg-emerald-100 h-32 w-60 rounded-2xl"
                >
                  <div className="text-4xl mb-2 text-white group-hover:text-green-700 transition-colors duration-300">
                    {item.icon}
                  </div>
                  <h2 className="text-lg font-semibold text-center">
                    {item.label}
                  </h2>
                </NavLink>
              ))}
            </div>
          </div>

          {/* Reposts */}
          <h1 className="mt-2 text-2xl text-white font-bold mb-6">Reports</h1>

          <div className="bg-gray-400 opacity-80 rounded-xl px-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 ">
              {reportsChildren.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className="flex flex-col items-center justify-center text-white hover:text-green-600 hover:no-underline group transition-all duration-300 hover:bg-emerald-100 h-32 w-60 rounded-2xl"
                >
                  <div className="text-4xl mb-2 text-white group-hover:text-green-700 transition-colors duration-300">
                    {item.icon}
                  </div>
                  <h2 className="text-lg font-semibold text-center">
                    {item.label}
                  </h2>
                </NavLink>
              ))}
            </div>
          </div>

          {/* Setup */}
          <h1 className="mt-2 text-2xl text-white font-bold mb-6">Setup</h1>

          <div className="bg-gray-400 opacity-80 rounded-xl px-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 ">
              {setupChildren.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className="flex flex-col items-center justify-center text-white hover:text-green-600 hover:no-underline group transition-all duration-300 hover:bg-emerald-100 h-32 w-60 rounded-2xl"
                >
                  <div className="text-4xl mb-2 text-white group-hover:text-green-700 transition-colors duration-300">
                    {item.icon}
                  </div>
                  <h2 className="text-lg font-semibold text-center">
                    {item.label}
                  </h2>
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FbrPage;
