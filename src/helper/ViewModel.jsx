import React, { useRef, useState } from "react";
import { Mail, MessageCircle, X } from "lucide-react";

const ViewModel = ({ data, type, onClose }) => {
  const printRef = useRef();
  const [exportOpen, setExportOpen] = useState(false);

  // ✅ Print handler
  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const win = window.open("", "", "width=800,height=600");
    win.document.write(`
      <html>
        <head>
          <title>
            ${
              type === "requisition"
                ? "Purchase Requisition"
                : type === "purchaseOrder"
                ? "Purchase Order"
                : type === "gatepass"
                ? "Gatepass In"
                : type === "qualityCheck"
                ? "Quality Check"
                : type === "grn"
                ? "Goods Received Note"
                : type === "bookingOrder"
                ? "Booking Order"
                : ""
            }
          </title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { text-align: center; margin-bottom: 20px; }
            .info-row { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 14px; }
            .info-row strong { min-width: 120px; display: inline-block; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background: #f3f3f3; }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  // ✅ Dynamic total calculation for booking orders
  const totalAmount =
    type === "bookingOrder"
      ? data.products?.reduce((sum, p) => sum + (p.total || 0), 0) || 0
      : data.totalAmount || 0;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white w-[700px] rounded-xl shadow-lg p-6 relative">
        {/* ❌ Close Button */}
        <button
          className="absolute top-3 right-3 text-gray-600 hover:text-red-500"
          onClick={onClose}
        >
          <X size={20} />
        </button>

        {/* Printable Section */}
        <div ref={printRef}>
          <h2 className="text-2xl font-bold mb-6 text-center border-b pb-2">
            {type === "requisition"
              ? "Purchase Requisition"
              : type === "purchaseOrder"
              ? "Purchase Order"
              : type === "gatepass"
              ? "Gatepass In"
              : type === "qualityCheck"
              ? "Quality Check"
              : type === "grn"
              ? "Goods Received Note"
              : type === "bookingOrder"
              ? "Booking Order"
              : ""}
          </h2>

          {/* Info Section */}
          <div className="grid grid-cols-2 gap-y-3 gap-8 text-base mb-6">
            {type === "bookingOrder" && (
              <>
                <div>
                  <strong>Order No:</strong> {data.orderNo}
                </div>
                <div>
                  <strong>Order Date:</strong>{" "}
                  {new Date(data.orderDate).toLocaleDateString()}
                </div>
                <div>
                  <strong>Customer:</strong> {data.customer?.customerName}
                </div>
                <div>
                  <strong>Phone:</strong> {data.customer?.phoneNumber}
                </div>
                <div>
                  <strong>Address:</strong> {data.customer?.address}
                </div>
                <div>
                  <strong>Delivery Address:</strong> {data.deliveryAddress}
                </div>
                <div>
                  <strong>Delivery Date:</strong>{" "}
                  {new Date(data.deliveryDate).toLocaleDateString()}
                </div>
                <div>
                  <strong>Order Type:</strong> {data.orderType}
                </div>
                <div>
                  <strong>Mode:</strong> {data.mode}
                </div>
                <div>
                  <strong>Payment Method:</strong> {data.paymentMethod}
                </div>
                <div>
                  <strong>Total Items:</strong> {data.products?.length || 0}
                </div>
                <div>
                  <strong>Total Amount:</strong> {totalAmount.toLocaleString()}
                </div>
                <div className="col-span-2">
                  <strong>Remarks:</strong> {data.remarks || "-"}
                </div>
              </>
            )}

            {type === "requisition" && (
              <>
                <div>
                  <strong>Req ID:</strong> {data.requisitionId}
                </div>
                <div>
                  <strong>Date:</strong>{" "}
                  {new Date(data.date).toLocaleDateString()}
                </div>
                <div>
                  <strong>Employee:</strong> {data.employee?.employeeName}
                </div>
                <div>
                  <strong>Department:</strong> {data.department?.departmentName}
                </div>
                <div>
                  <strong>Category:</strong> {data.category?.categoryName}
                </div>
                <div>
                  <strong>Status:</strong> {data.status}
                </div>
              </>
            )}

            {type === "purchaseOrder" && (
              <>
                <div>
                  <strong>PO No:</strong> {data.purchaseOrderId}
                </div>
                <div>
                  <strong>Date:</strong>{" "}
                  {new Date(data.date).toLocaleDateString()}
                </div>
                <div>
                  <strong>Supplier:</strong>{" "}
                  {data.estimation?.demandItem?.supplier?.supplierName}
                </div>
                <div>
                  <strong>Delivery Date:</strong>{" "}
                  {new Date(data.deliveryDate).toLocaleDateString()}
                </div>
                <div>
                  <strong>Tax:</strong> {data.tax}
                </div>
                <div>
                  <strong>Total Amount:</strong> {data.totalAmount}
                </div>
              </>
            )}

            {type === "gatepass" && (
              <>
                <div>
                  <strong>GatePass ID:</strong> {data.gatePassId}
                </div>
                <div>
                  <strong>Date:</strong>{" "}
                  {new Date(data.date).toLocaleDateString()}
                </div>
                <div>
                  <strong>Driver Name:</strong> {data.driverName}
                </div>
                <div>
                  <strong>Status:</strong> {data.status}
                </div>
                <div>
                  <strong>Supplier:</strong>{" "}
                  {data.type === "withPO"
                    ? data.withPO?.supplier?.supplierName
                    : data.withoutPO?.supplier?.supplierName || "-"}
                </div>
                <div>
                  <strong>Type:</strong> {data.type}
                </div>
              </>
            )}

            {type === "qualityCheck" && (
              <>
                <div>
                  <strong>QC ID:</strong> {data.qcId}
                </div>
                <div>
                  <strong>Date:</strong>{" "}
                  {new Date(data.date).toLocaleDateString()}
                </div>
                <div>
                  <strong>Description:</strong> {data.description}
                </div>
                <div>
                  <strong>GatePass ID:</strong> {data.gatePassIn?.gatePassId}
                </div>
                <div>
                  <strong>Driver:</strong> {data.gatePassIn?.driverName}
                </div>
                <div>
                  <strong>Status:</strong> {data.gatePassIn?.status}
                </div>
              </>
            )}

            {type === "grn" && (
              <>
                <div>
                  <strong>GRN ID:</strong> {data.grnId}
                </div>
                <div>
                  <strong>Date:</strong>{" "}
                  {new Date(data.date).toLocaleDateString()}
                </div>
                <div>
                  <strong>Supplier:</strong> {data.supplier?.supplierName}
                </div>
                <div>
                  <strong>Address:</strong> {data.supplier?.address}
                </div>
                <div>
                  <strong>Phone:</strong> {data.supplier?.phoneNumber}
                </div>
              </>
            )}
          </div>

          {/* Items Table */}
          <table className="w-full border text-sm mb-4">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1">Sr #</th>
                <th className="border px-2 py-1">Item</th>
                <th className="border px-2 py-1">Details</th>
                <th className="border px-2 py-1">Qty</th>
                {type === "bookingOrder" && (
                  <>
                    <th className="border px-2 py-1">Rate</th>
                    <th className="border px-2 py-1">Total</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {(type === "bookingOrder" ? data.products || [] : data.items || []
              ).map((item, idx) => (
                <tr key={idx} className="text-center">
                  <td className="border px-2 py-1">{idx + 1}</td>
                  <td className="border px-2 py-1">
                    {item.name || item.itemName}
                  </td>
                  <td className="border px-2 py-1">
                    {item.details || item.description || "-"}
                  </td>
                  <td className="border px-2 py-1">
                    {item.qty || item.quantity || item.orderedQty}
                  </td>
                  {type === "bookingOrder" && (
                    <>
                      <td className="border px-2 py-1">{item.rate}</td>
                      <td className="border px-2 py-1">{item.total}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <div className="relative">
            <button
              onClick={() => setExportOpen(!exportOpen)}
              className="px-4 py-2 bg-green-600 text-white rounded-md"
            >
              Export
            </button>
            {exportOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg border rounded-md z-50">
                <button
                  onClick={() => alert("Export via WhatsApp")}
                  className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 text-left"
                >
                  <MessageCircle size={18} className="text-green-600" />
                  WhatsApp
                </button>
                <button
                  onClick={() => alert("Export via Email")}
                  className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 text-left"
                >
                  <Mail size={18} className="text-blue-600" />
                  Email
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewModel;
