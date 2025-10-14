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
    <div className="p-6">
      <CommanHeader />
      <h1 className="text-2xl font-bold mb-6">Fbr Integration</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {salesChildren.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="flex flex-col items-center justify-center text-black hover:no-underline group transition-all duration-300 hover:bg-emerald-100 h-40 w-60 rounded-2xl"
          >
            <div className="text-4xl mb-2 text-black group-hover:text-green-500 transition-colors duration-300">
              {item.icon}
            </div>
            <h2 className="text-lg font-semibold text-center">{item.label}</h2>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default FbrPage;
