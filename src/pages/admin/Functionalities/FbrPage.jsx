import { NavLink } from "react-router-dom";
import {
  FaListAlt,
  FaShoppingCart,
  FaUndoAlt,
  FaAddressBook,
  FaMoneyBillWave,
  FaReceipt,
} from "react-icons/fa";
import { AiOutlineProduct } from "react-icons/ai";
import { TbFileInvoice } from "react-icons/tb";
import { FaUsersViewfinder } from "react-icons/fa6";

import { FaTruck } from "react-icons/fa";
import CommanHeader from "../../../components/CommanHeader";

const salesChildren = [
  { to: "/admin/fbr-company", label: "Company", icon: <FaListAlt /> },
  {
    to: "/admin/fbr-customers",
    label: "Customers",
    icon: <FaUsersViewfinder />,
  },
  { to: "/admin/fbr-products", label: "Product", icon: <AiOutlineProduct /> },
  {
    to: "/admin/fbr-booking-orders",
    label: "Booking Order",
    icon: <FaShoppingCart />,
  },
  {
    to: "/admin/fbr-delivery-challan",
    label: "Delivery Challan",
    icon: <FaTruck />,
  },
  {
    to: "/admin/fbr-sale-invoice",
    label: "Sale Invoice",
    icon: <TbFileInvoice />,
  },
  { to: "/admin/fbr-sales-return", label: "Sales Return", icon: <FaUndoAlt /> },
  {
    to: "/admin/fbr-payment-receipt",
    label: "Payment Receipt",
    icon: <FaReceipt />,
  },
  { to: "/admin/fbr-ledger", label: "Ledger", icon: <FaAddressBook /> },
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

          <h1 className="text-2xl text-white font-bold mb-6">Functionalities</h1>

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

              {/* Setup */}
              <h1 className="mt-2 text-2xl text-white font-bold mb-6">Setup</h1>

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
          
        </div>
      </div>
    </div>
  );
};


export default FbrPage;
