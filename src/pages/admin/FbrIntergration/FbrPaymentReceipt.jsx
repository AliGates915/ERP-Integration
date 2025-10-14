import React, { useState, useEffect, useRef, useCallback } from "react";
import { SquarePen, Trash2 } from "lucide-react";
import CommanHeader from "../../../components/CommanHeader";
import TableSkeleton from "../Skeleton";
import Swal from "sweetalert2";

const FbrPaymentReceipt = () => {
  const [vouchers, setVouchers] = useState([
    {
      _id: "1",
      voucherId: "PRV-001",
      payerName: "Acme Corp",
      amount: 1500,
      paymentMethod: "Bank Transfer",
      receiptDate: "2025-09-01",
      receivedBy: "John Doe",
      status: "Processed",
    },
    {
      _id: "2",
      voucherId: "PRV-002",
      payerName: "Tech Solutions",
      amount: 500,
      paymentMethod: "Cash",
      receiptDate: "2025-09-15",
      receivedBy: "Jane Smith",
      status: "Pending",
    },
  ]);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [voucherId, setVoucherId] = useState("");
  const [payerName, setPayerName] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [receiptDate, setReceiptDate] = useState("");
  const [receivedBy, setReceivedBy] = useState("");
  const [status, setStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [errors, setErrors] = useState({});
  const [nextVoucherId, setNextVoucherId] = useState("003");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const sliderRef = useRef(null);
  const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};

  // Simulate fetching vouchers
  const fetchVouchers = useCallback(async () => {
    try {
      setLoading(true);
      // Static data already set in state
    } catch (error) {
      console.error("Failed to fetch vouchers", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  }, []);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  // Voucher search
  useEffect(() => {
    if (!searchTerm || !searchTerm.startsWith("PRV-")) {
      fetchVouchers();
      return;
    }

    const delayDebounce = setTimeout(() => {
      try {
        setLoading(true);
        const filtered = vouchers.filter((voucher) =>
          voucher.voucherId.toUpperCase().includes(searchTerm.toUpperCase())
        );
        setVouchers(filtered);
      } catch (error) {
        console.error("Search voucher failed:", error);
        setVouchers([]);
      } finally {
        setLoading(false);
      }
    }, 1000);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, fetchVouchers, vouchers]);

  // Generate next voucher ID
  useEffect(() => {
    if (vouchers.length > 0) {
      const maxNo = Math.max(
        ...vouchers.map((v) => {
          const match = v.voucherId?.match(/PRV-(\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        })
      );
      setNextVoucherId((maxNo + 1).toString().padStart(3, "0"));
    } else {
      setNextVoucherId("001");
    }
  }, [vouchers]);

  // Reset form fields
  const resetForm = () => {
    setVoucherId("");
    setPayerName("");
    setAmount("");
    setPaymentMethod("");
    setReceiptDate("");
    setReceivedBy(userInfo.employeeName || "");
    setStatus("");
    setEditingVoucher(null);
    setErrors({});
    setIsSliderOpen(false);
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    const trimmedVoucherId = voucherId.trim();
    const trimmedPayerName = payerName.trim();
    const trimmedAmount = amount.trim();
    const trimmedPaymentMethod = paymentMethod.trim();
    const trimmedReceiptDate = receiptDate.trim();
    const trimmedStatus = status.trim();
    const parsedAmount = parseFloat(amount);

    if (!trimmedVoucherId) newErrors.voucherId = "Voucher ID is required";
    if (!trimmedPayerName) newErrors.payerName = "Payer Name is required";
    if (!trimmedAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
      newErrors.amount = "Amount must be a positive number";
    }
    if (!trimmedPaymentMethod)
      newErrors.paymentMethod = "Payment Method is required";
    if (!trimmedReceiptDate) newErrors.receiptDate = "Receipt Date is required";
    if (!trimmedStatus) newErrors.status = "Status is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handlers for form and table actions
  const handleAddVoucher = () => {
    resetForm();
    setIsSliderOpen(true);
  };

  const handleEditClick = (voucher) => {
    setEditingVoucher(voucher);
    setVoucherId(voucher.voucherId || "");
    setPayerName(voucher.payerName || "");
    setAmount(voucher.amount || "");
    setPaymentMethod(voucher.paymentMethod || "");
    setReceiptDate(voucher.receiptDate || "");
    setReceivedBy(voucher.receivedBy || userInfo.employeeName || "");
    setStatus(voucher.status || "");
    setErrors({});
    setIsSliderOpen(true);
  };

  const [paymentType, setPaymentType] = useState("Cash"); // Default to Cash
  const [cashData, setCashData] = useState({
    date: "",
    receiptId: "",
    customer: "",
    balance: 0,
    amountReceived: 0,
    newBalance: 0,
  });
  const [bankData, setBankData] = useState({
    bankName: "",
    accountNumber: "",
    accountHolder: "",
    amount: 0,
  });

  const customers = [
    { name: "Customer A", balance: 1000 },
    { name: "Customer B", balance: 500 },
    { name: "Customer C", balance: 2000 },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (paymentType === "Cash") {
      console.log("Cash Data:", cashData);
    } else {
      console.log("Bank Data:", bankData);
    }

    const newVoucher = {
      voucherId: editingVoucher ? voucherId : `PRV-${nextVoucherId}`,
      payerName: payerName.trim(),
      amount: parseFloat(amount),
      paymentMethod: paymentMethod.trim(),
      receiptDate: receiptDate.trim(),
      receivedBy: receivedBy.trim(),
      status: status.trim(),
    };

    try {
      if (editingVoucher) {
        setVouchers((prev) =>
          prev.map((v) =>
            v._id === editingVoucher._id
              ? { ...v, ...newVoucher, _id: v._id }
              : v
          )
        );
        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Payment Receipt Voucher updated successfully.",
          confirmButtonColor: "#3085d6",
        });
      } else {
        setVouchers((prev) => [
          ...prev,
          { ...newVoucher, _id: `temp-${Date.now()}` },
        ]);
        Swal.fire({
          icon: "success",
          title: "Added!",
          text: "Payment Receipt Voucher added successfully.",
          confirmButtonColor: "#3085d6",
        });
      }
      fetchVouchers();
      resetForm();
    } catch (error) {
      console.error("Error saving voucher:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to save voucher.",
        confirmButtonColor: "#d33",
      });
    }
  };

  const handleDelete = (id) => {
    const swalWithTailwindButtons = Swal.mixin({
      customClass: {
        actions: "space-x-2",
        confirmButton:
          "bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300",
        cancelButton:
          "bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300",
      },
      buttonsStyling: false,
    });

    swalWithTailwindButtons
      .fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, cancel!",
        reverseButtons: true,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          try {
            setVouchers((prev) => prev.filter((v) => v._id !== id));
            swalWithTailwindButtons.fire(
              "Deleted!",
              "Payment Receipt Voucher deleted successfully.",
              "success"
            );
          } catch (error) {
            console.error("Delete error:", error);
            swalWithTailwindButtons.fire(
              "Error!",
              "Failed to delete voucher.",
              "error"
            );
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire(
            "Cancelled",
            "Payment Receipt Voucher is safe 🙂",
            "error"
          );
        }
      });
  };

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = vouchers.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(vouchers.length / recordsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <CommanHeader />
      <div className="px-6 mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-newPrimary">
              Payment Receipt Voucher Details
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Enter Voucher ID eg: PRV-001"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 w-[250px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-newPrimary"
            />
            <button
              className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/80"
              onClick={handleAddVoucher}
            >
              + Add Payment Receipt Voucher
            </button>
          </div>
        </div>

        <div className="rounded-xl shadow border border-gray-200 overflow-hidden">
          <div className="overflow-y-auto lg:overflow-x-auto max-h-[900px]">
            <div className="min-w-[1200px]">
              <div className="hidden lg:grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200">
                <div>Voucher ID</div>
                <div>Payer Name</div>
                <div>Amount</div>
                <div>Payment Method</div>
                <div>Receipt Date</div>
                <div>Received By</div>
                <div>Status</div>
                <div>Actions</div>
              </div>

              <div className="flex flex-col divide-y divide-gray-100">
                {loading ? (
                  <TableSkeleton
                    rows={recordsPerPage}
                    cols={8}
                    className="lg:grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr]"
                  />
                ) : currentRecords.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 bg-white">
                    No vouchers found.
                  </div>
                ) : (
                  currentRecords.map((voucher) => (
                    <div
                      key={voucher._id}
                      className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] items-center gap-4 px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                    >
                      <div className="text-gray-600">{voucher.voucherId}</div>
                      <div className="text-gray-600">{voucher.payerName}</div>
                      <div className="text-gray-600">{voucher.amount}</div>
                      <div className="text-gray-600">
                        {voucher.paymentMethod}
                      </div>
                      <div className="text-gray-600">{voucher.receiptDate}</div>
                      <div className="text-gray-600">{voucher.receivedBy}</div>
                      <div className="text-gray-600">{voucher.status}</div>
                      <div className="flex gap-3 justify-start">
                        <button
                          onClick={() => handleEditClick(voucher)}
                          className="py-1 text-sm rounded text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit"
                        >
                          <SquarePen size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(voucher._id)}
                          className="py-1 text-sm rounded text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between my-4 px-10">
              <div className="text-sm text-gray-600">
                Showing {indexOfFirstRecord + 1} to{" "}
                {Math.min(indexOfLastRecord, vouchers.length)} of{" "}
                {vouchers.length} records
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === 1
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-newPrimary text-white hover:bg-newPrimary/80"
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === totalPages
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-newPrimary text-white hover:bg-newPrimary/80"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {isSliderOpen && (
          <div className="fixed inset-0 bg-gray-600/50 flex items-center justify-center z-50">
            <div
              ref={sliderRef}
              className="w-full md:w-[800px] bg-white rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white rounded-t-2xl">
                <h2 className="text-xl font-bold text-newPrimary">
                  {editingVoucher
                    ? "Update Payment Receipt Voucher"
                    : "Add a New Payment Receipt Voucher"}
                </h2>
                <button
                  className="text-2xl text-gray-500 hover:text-gray-700"
                  onClick={resetForm}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 p-4 md:p-6">
                {/* Payment Type Selection */}
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="paymentType"
                      value="Cash"
                      checked={paymentType === "Cash"}
                      onChange={(e) => setPaymentType(e.target.value)}
                    />
                    Cash
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="paymentType"
                      value="Bank"
                      checked={paymentType === "Bank"}
                      onChange={(e) => setPaymentType(e.target.value)}
                    />
                    Bank
                  </label>
                </div>

                {/* Cash Form */}
                {paymentType === "Cash" && (
                  <div className="space-y-4">
                    {/* Date & Receipt ID */}
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-gray-700 font-medium mb-2">
                          Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={cashData.date}
                          onChange={(e) =>
                            setCashData({ ...cashData, date: e.target.value })
                          }
                          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-gray-700 font-medium mb-2">
                          Receipt ID <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={cashData.receiptId}
                          onChange={(e) =>
                            setCashData({
                              ...cashData,
                              receiptId: e.target.value,
                            })
                          }
                          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>

                    {/* Customer & Balance */}
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-gray-700 font-medium mb-2">
                          Customer Name <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={cashData.customer}
                          onChange={(e) => {
                            const selectedCustomer = customers.find(
                              (c) => c.name === e.target.value
                            );
                            setCashData({
                              ...cashData,
                              customer: e.target.value,
                              balance: selectedCustomer
                                ? selectedCustomer.balance
                                : 0,
                              newBalance: selectedCustomer
                                ? selectedCustomer.balance
                                : 0,
                              amountReceived: 0,
                            });
                          }}
                          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="">Select Customer</option>
                          {customers.map((c) => (
                            <option key={c.name} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Balance field */}
                      <div className="flex-1">
                        <label className="block text-gray-700 font-medium mb-2">
                          Balance
                        </label>
                        <input
                          type="number"
                          value={cashData.balance}
                          readOnly
                          className="w-full p-3 border rounded-md bg-gray-100"
                        />
                      </div>
                    </div>

                    {/* Amount Received & New Balance */}
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-gray-700 font-medium mb-2">
                          Amount Received{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={cashData.amountReceived}
                          onChange={(e) => {
                            const amount = parseFloat(e.target.value) || 0;
                            const newBalance = cashData.balance - amount;
                            setCashData({
                              ...cashData,
                              amountReceived: amount,
                              newBalance,
                            });
                          }}
                          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-gray-700 font-medium mb-2">
                          New Balance
                        </label>
                        <input
                          type="text"
                          value={Math.round(cashData.newBalance)}
                          readOnly
                          className={`w-full p-3 border rounded-md ${
                            cashData.newBalance < 0
                              ? "bg-red-100 text-red-600"
                              : "bg-gray-100"
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Bank Form */}
                {paymentType === "Bank" && (
                  <div className="space-y-4">
                    {/* Bank Name & Account Number */}
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-gray-700 font-medium mb-2">
                          Bank Name <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={bankData.bankName}
                          onChange={(e) =>
                            setBankData({
                              ...bankData,
                              bankName: e.target.value,
                            })
                          }
                          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="">Select Bank</option>
                          <option value="Bank A">Bank A</option>
                          <option value="Bank B">Bank B</option>
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="block text-gray-700 font-medium mb-2">
                          A/C Number <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={bankData.accountNumber}
                          onChange={(e) =>
                            setBankData({
                              ...bankData,
                              accountNumber: e.target.value,
                            })
                          }
                          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="">Select Account</option>
                          <option value="1234567890">1234567890</option>
                          <option value="9876543210">9876543210</option>
                          <option value="1122334455">1122334455</option>
                          {/* Add more account numbers here */}
                        </select>
                      </div>
                    </div>

                    {/* Account Holder & Amount */}
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-gray-700 font-medium mb-2">
                          Account Holder Name{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={bankData.accountHolder}
                          onChange={(e) =>
                            setBankData({
                              ...bankData,
                              accountHolder: e.target.value,
                            })
                          }
                          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-gray-700 font-medium mb-2">
                          Amount <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={bankData.amount}
                          onChange={(e) =>
                            setBankData({
                              ...bankData,
                              amount: parseFloat(e.target.value),
                            })
                          }
                          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-newPrimary text-white px-4 py-3 rounded-lg hover:bg-newPrimary/80 transition-colors disabled:bg-blue-300"
                >
                  Save Payment
                </button>
              </form>
            </div>
          </div>
        )}

        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #edf2f7;
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #a0aec0;
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #718096;
          }
        `}</style>
      </div>
    </div>
  );
};

export default FbrPaymentReceipt;
