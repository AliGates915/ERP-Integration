import React from "react";
import { NavLink } from "react-router-dom";
import {
  FaFileAlt,
  FaCheckCircle,
  FaCommentsDollar,
  FaCalculator,
  FaFileInvoiceDollar,
  FaSignInAlt,
  FaCheckDouble,
  FaFileInvoice,
  FaUndoAlt,
  FaSignOutAlt,
} from "react-icons/fa";
import CommanHeader from "../../../components/CommanHeader";

const purchaseChildren = [
  { to: "/admin/purchase-requisition", label: "Purchase Requisition", icon: <FaFileAlt /> },
  { to: "/admin/purchase-approval", label: "Purchase Approval", icon: <FaCheckCircle /> },
  { to: "/admin/quotation", label: "Market Quotation", icon: <FaCommentsDollar /> },
  { to: "/admin/estimation", label: "Estimation", icon: <FaCalculator /> },
  { to: "/admin/purchase-order", label: "Purchase Order", icon: <FaFileInvoiceDollar /> },
  { to: "/admin/gatepass-in", label: "GatePass IN", icon: <FaSignInAlt /> },
  { to: "/admin/quality-checking", label: "Quality Checking", icon: <FaCheckDouble /> },
  { to: "/admin/grn", label: "Goods Receipt Note", icon: <FaFileInvoice /> },
  { to: "/admin/purchase-return", label: "Purchase Return", icon: <FaUndoAlt /> },
  { to: "/admin/gatepass-out", label: "GatePass OUT", icon: <FaSignOutAlt /> },
];

const PurchasePage = () => {
  return (
    <div className="p-6">
      <CommanHeader />
      <h1 className="text-2xl font-bold mb-6">Purchase Module</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Without cards */}

        {purchaseChildren.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="flex flex-col items-center justify-center text-black hover:no-underline group transition-all duration-300 hover:bg-emerald-100 h-40 w-60 rounded-2xl"

          >
            <div className="text-4xl mb-2 text-black group-hover:text-green-500 transition-colors duration-300">
              {item.icon}
            </div>
            <h2 className="text-base font-medium text-center group-hover:text-green-600">
              {item.label}
            </h2>
          </NavLink>
        ))}

      </div>
    </div>
  );
};

export default PurchasePage;