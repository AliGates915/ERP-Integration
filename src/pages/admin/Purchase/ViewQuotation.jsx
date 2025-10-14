import React, { useRef, useState } from "react";
import { Mail, MessageCircle, X } from "lucide-react";

const ViewQuotation = ({ quotation, onClose }) => {
  const printRef = useRef();
 const [exportOpen, setExportOpen] = useState(false);
  // ✅ Handle print
  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const win = window.open("", "", "width=800,height=600");
    win.document.write(`
      <html>
        <head>
          <title>Quotation</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { text-align: center; margin-bottom: 20px; }
            .info-row { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 14px; }
            .info-row strong { min-width: 120px; display: inline-block; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
            th { background: #f3f3f3; }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  // ✅ Handle PDF (placeholder for future integration)
  const handlePDF = () => {
    alert("PDF export coming soon 🚀 (use html2pdf.js or jsPDF here)");
  };

  if (!quotation) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white w-[650px] rounded-xl shadow-lg p-6 relative">
        {/* Close Button */}
        <button
          className="absolute top-3 right-3 text-gray-600 hover:text-red-500"
          onClick={onClose}
        >
          <X size={20} />
        </button>

        {/* Printable Section */}
        <div ref={printRef}>
          {/* Header */}
          <h2 className="text-2xl font-bold mb-6 text-center border-b pb-2">
            Quotation Details
          </h2>

          {/* Info Section */}
          <div className="grid grid-cols-2 gap-y-3 gap-8 text-base mb-6">
            <div className="flex gap-3">
              <p><strong>Quotation No:</strong></p>
              <p>{quotation.quotationNo}</p>
            </div>
            <div className="flex gap-3">
              <p><strong>Supplier:</strong></p>
              <p>{quotation.supplier?.supplierName || "-"}</p>
            </div>
            <div className="flex gap-3">
              <p><strong>Person:</strong></p>
              <p>{quotation.person}</p>
            </div>
            <div className="flex gap-3">
              <p><strong>Created By:</strong></p>
              <p>{quotation.createdBy}</p>
            </div>
            <div className="flex gap-3">
              <p><strong>Designation:</strong></p>
              <p>{quotation.designation}</p>
            </div>
            <div className="flex gap-3">
              <p><strong>Date:</strong></p>
              <p>{new Date(quotation.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full border text-sm mb-4">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1">Sr #</th>
                <th className="border px-2 py-1">Item</th>
                <th className="border px-2 py-1">Quantity</th>
                <th className="border px-2 py-1">Price</th>
                <th className="border px-2 py-1">Total</th>
              </tr>
            </thead>
            <tbody>
              {quotation.items?.map((item, idx) => (
                <tr key={idx}>
                  <td className="border text-center px-2 py-1">{idx + 1}</td>
                  <td className="border text-center px-2 py-1">{item.itemName}</td>
                  <td className="border text-center px-2 py-1">{item.qty}</td>
                  <td className="border text-center px-2 py-1">{item.price}</td>
                  <td className="border text-center px-2 py-1">{item.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Actions */}
      <div className="flex justify-end gap-3 mt-6">
                {/* Export Button */}
                <div className="relative">
                  <button
                    onClick={() => setExportOpen(!exportOpen)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md"
                  >
                    Export
                  </button>
      
                  {/* Popup Menu */}
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

export default ViewQuotation;
