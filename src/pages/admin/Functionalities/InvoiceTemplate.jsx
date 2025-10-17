
import React from "react";
export const InvoiceTemplate = React.forwardRef(({ invoice }, ref) => {
  if (!invoice) return null;
  const customer = invoice.bookingOrder?.customer || {};
  const taxes = invoice.taxTypes || [];

  const gstRate = taxes.reduce((sum, t) => sum + t.value, 0);
  const gstAmount = (invoice.totalAmount * gstRate) / 100;
  const net = invoice.totalAmount + gstAmount;

  return (
    <div
      ref={ref}
      className="w-[800px] bg-white text-black p-8 border rounded-xl font-sans"
      style={{ fontSize: "12px" }}
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">ERP System Pvt. Ltd.</h1>
          <p>Mall of Lahore</p>
          <p>NTN: 7576450 | STN: Yes w.e.f 16-Oct-17</p>
        </div>
       
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold mb-1">Invoice</h2>
          <p><b>Customer:</b> {customer.customerName}</p>
          <p><b>Address:</b> {customer.address}</p>
          <p><b>Phone:</b> {customer.phoneNumber}</p>
       
        </div>
        <div className="">
            <img src="/images/fbr.png" alt="" className="w-[6rem] h-24 " />
        </div>
        <div>
          <p><b>Invoice No:</b> {invoice.invoiceNo}</p>
          <p><b>Date:</b> {invoice.invoiceDate.split("T")[0]}</p>
          <p><b>DC No:</b> {invoice.deliveryChallan?.dcNo}</p>
          <p><b>Booking No:</b> {invoice.bookingOrder?.orderNo}</p>
        </div>
      </div>

      <table className="w-full border-collapse border border-gray-400 text-sm">
        <thead>
          <tr className="bg-gray-200 border border-gray-400">
            <th className="border border-gray-400 p-1">Sr</th>
            <th className="border border-gray-400 p-1">Product</th>
            <th className="border border-gray-400 p-1">Qty</th>
            <th className="border border-gray-400 p-1">Rate</th>
            <th className="border border-gray-400 p-1">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.products.map((p, i) => (
            <tr key={i}>
              <td className="border border-gray-400 p-1 text-center">{i + 1}</td>
              <td className="border border-gray-400 p-1 text-center">{p.name}</td>
              <td className="border border-gray-400 p-1 text-center">{p.qty}</td>
              <td className="border border-gray-400 p-1 text-center">{p.rate.toFixed(2)}</td>
              <td className="border border-gray-400 p-1 text-center">{p.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 text-right space-y-1">
        <p>Sub Total: {invoice.totalAmount.toLocaleString()}</p>
        <p>GST ({gstRate}%): {gstAmount.toLocaleString()}</p>
        <p className="font-bold text-lg">Total: Rs. {net.toLocaleString()}</p>
      </div>

      <p className="text-xs mt-6 text-center text-gray-500">
        This is a system-generated invoice and does not require any signature.
      </p>
    </div>
  );
});
