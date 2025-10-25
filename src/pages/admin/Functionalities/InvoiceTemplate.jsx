import React from "react";

export const InvoiceTemplate = React.forwardRef(({ invoice }, ref) => {
  if (!invoice) return null;

  // ✅ Direct structure from API
  const customer = invoice.customer || {};
  const taxes = invoice.taxTypes || [];

  // ✅ Calculate totals
  const gstRate = parseInt(taxes.reduce((sum, t) => sum + (t.value || 0), 0));
  const gstAmount = parseInt(((invoice.totalAmount || 0) * gstRate) / 100);
  const net = parseInt((invoice.totalAmount || 0) + gstAmount);

  return (
    <div
      ref={ref}
      className="w-[800px] bg-white text-black p-8 border rounded-xl font-sans"
      style={{ fontSize: "12px" }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">ERP System Pvt. Ltd.</h1>
          <p>Mall of Lahore</p>
          <p>NTN: 7576450 | STN: Yes w.e.f 16-Oct-17</p>
        </div>
        <div>
          <img src="/images/fbr.png" alt="FBR Logo" className="w-[6rem] h-24" />
        </div>
      </div>

      {/* Invoice Info */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-lg font-bold mb-1">Invoice</h2>
          <p>
            <b>Customer:</b> {customer.customerName}
          </p>
          <p>
            <b>Address:</b> {customer.address}
          </p>
          <p>
            <b>Phone:</b> {customer.phoneNumber}
          </p>
        </div>
        <div>
          <p>
            <b>Invoice No:</b> {invoice.invoiceNo}
          </p>
          <p>
            <b>Date:</b> {invoice.invoiceDate}
          </p>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-xl shadow border border-gray-200 overflow-hidden mt-4">
        <div className="overflow-y-auto lg:overflow-x-auto max-h-[600px]">
          <div className="min-w-[100%]">
            <div className="hidden lg:grid grid-cols-[0.4fr_1fr_1fr_1fr_1fr] gap-4 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200">
              <div>SR</div>
              <div>Product</div>
              <div>Qty</div>
              <div>Rate</div>
              <div>Amount</div>
            </div>

            <div className="flex flex-col divide-y divide-gray-100 bg-white text-sm">
              {invoice.products.map((p, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[0.4fr_1fr_1fr_1fr_1fr] items-center gap-4 px-6 py-3 text-gray-700 hover:bg-gray-50 transition"
                >
                  <div>{i + 1}</div>
                  <div>{p.name}</div>
                  <div>{p.qty}</div>
                  <div>{p.rate}</div>
                  <div>{p.total}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Totals Section */}
      <div className="mt-6 text-right space-y-1">
        <p>Sub Total: Rs. {invoice.totalAmount.toLocaleString()}</p>
        <p>
          GST ({gstRate}%): Rs. {gstAmount.toLocaleString()}
        </p>
        <p className="font-bold text-lg">Total: Rs. {net.toLocaleString()}</p>
      </div>

      {/* Taxes Summary */}
      {taxes.length > 0 && (
        <div className="mt-3 text-sm text-right text-gray-600">
          <p>
            Applied Taxes:{" "}
            {taxes.map((t) => `${t.taxName} (${t.value}%)`).join(", ")}
          </p>
        </div>
      )}

      <p className="text-xs mt-6 text-center text-gray-500">
        This is a system-generated invoice and does not require any signature.
      </p>
    </div>
  );
});
