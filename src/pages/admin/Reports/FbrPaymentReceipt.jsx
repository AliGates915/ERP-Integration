import React, { useState, useEffect, useRef, useCallback } from "react";
import { HashLoader } from "react-spinners";
import gsap from "gsap";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import CommanHeader from "../../../components/CommanHeader";
import { SquarePen, Trash2 } from "lucide-react";
import TableSkeleton from "../Skeleton";

const FbrPaymentReceipt = () => {
  const [vouchers, setVouchers] = useState([]);
  const [filteredVouchers, setFilteredVouchers] = useState([]); // NEW: Separate state for filtered data
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [paymentType, setPaymentType] = useState("Cash");
  const [cashData, setCashData] = useState({
    receiptId: "",
    date: "",
    customer: "", // store customer _id (not name)
    amountReceived: 0,
    newBalance: 0,
    remarks: "",
  });

  const [bankData, setBankData] = useState({
    receiptId: "",
    date: "",
    bankName: "",
    accountNumber: "",
    accountHolderName: "",
    amountReceived: 0,
    remarks: "",
  });

  const [customers, setCustomers] = useState([]); // Example, replace with API
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [receiptId, setReceiptId] = useState("");
  const [remarks, setRemarks] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [balance, setBalance] = useState("");
  const [mode, setMode] = useState("");
  const [date, setDate] = useState("");
  const [receivedBy, setReceivedBy] = useState("");
  const [status, setStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingVoucher, setEditingVoucher] = useState(null); // Fixed: was editingReceipt
  const [errors, setErrors] = useState({});
  const [nextReceiptId, setNextReceiptId] = useState("001");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const sliderRef = useRef(null);
  const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};

  const API_URL = `${
    import.meta.env.VITE_API_BASE_URL
  }/payment-receipt-voucher`;

  // Fixed fetchVouchers - remove useCallback or add proper dependencies
  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      const fetchedVouchers = res?.data?.data || res?.data || [];

      setVouchers(fetchedVouchers);
      setFilteredVouchers(fetchedVouchers); // Initialize filtered vouchers
    } catch (error) {
      console.error("Failed to fetch vouchers:", error);
      toast.error("Failed to fetch vouchers");
      setVouchers([]);
      setFilteredVouchers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []); // Empty dependency array - fetch only on mount
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/customers/status`
      );
      setCustomers(res.data);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      toast.error("Failed to fetch customers");
      setVouchers([]);
      setFilteredVouchers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchBanks = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/payment-receipt-voucher`
      );
      const vouchers = res.data?.data || [];
      console.log("Res ", res.data.data);

      // Extract unique bank names from vouchers that have a bankSection
      const uniqueBanks = vouchers
        .filter((v) => v.bankSection)
        .map((v) => ({
          bankName: v.bankSection.bankName,
          accountNumber: v.bankSection.accountNumber,
          accountHolderName: v.bankSection.accountHolderName,
        }))
        .filter(
          (b, index, self) =>
            index === self.findIndex((t) => t.bankName === b.bankName)
        );

      setBanks(uniqueBanks);
    } catch (error) {
      console.error("Failed to fetch bank data:", error);
      toast.error("Failed to fetch bank data");
      setBanks([]);
    }
  };
  useEffect(() => {
    fetchBanks();
  }, []);
  // FIXED: Voucher search - doesn't modify main vouchers state
  useEffect(() => {
    if (!searchTerm) {
      setFilteredVouchers(vouchers);
      setCurrentPage(1); // Reset to first page when search is cleared
      return;
    }

    const delayDebounce = setTimeout(() => {
      const filtered = vouchers.filter((voucher) =>
        voucher.receiptId?.toUpperCase().includes(searchTerm.toUpperCase())
      );
      setFilteredVouchers(filtered);
      setCurrentPage(1); // Reset to first page when search changes
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, vouchers]); // Only depends on searchTerm and vouchers

  // Generate next voucher ID - FIXED
  useEffect(() => {
    if (vouchers.length > 0) {
      const maxNo = Math.max(
        ...vouchers.map((v) => {
          const match = v.receiptId?.match(/RV-(\d+)/); // Changed to match your API (RV-)
          return match ? parseInt(match[1], 10) : 0;
        })
      );
      setNextReceiptId("RV-" + (maxNo + 1).toString().padStart(3, "0"));
    } else {
      setNextReceiptId("RV-001");
    }
  }, [vouchers]);

  // Reset form fields
  const resetForm = () => {
    setReceiptId("");
    setCustomerName("");
    setBalance("");
    setBankData("");
    setMode("");
    setDate("");
    setReceivedBy(userInfo.employeeName || "");
    setStatus("");
    setRemarks("");
    setEditingVoucher(null);
    setErrors({});
    setIsSliderOpen(false);
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    const trimmedCustomerName = customerName.trim();
    const trimmedBalance = balance.trim();
    const trimmedMode = mode.trim();
    const trimmedDate = date.trim();
    const parsedBalance = parseFloat(balance);

    if (!trimmedCustomerName)
      newErrors.customerName = "Customer Name is required";
    if (!trimmedBalance || isNaN(parsedBalance) || parsedBalance <= 0) {
      newErrors.balance = "Balance must be a positive number";
    }
    if (!trimmedMode) newErrors.mode = "Mode is required";
    if (!trimmedDate) newErrors.date = "Date is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handlers for form and table actions
  const handleAddVoucher = () => {
    resetForm();
    setIsSliderOpen(true);
  };

  const handleEditClick = (voucher) => {
    setEditingVoucher(voucher); // Keep the full object (must include _id)
    setErrors({});
    setIsSliderOpen(true);

    if (voucher.mode === "Cash") {
      setPaymentType("Cash");
      setCashData({
        receiptId: voucher.receiptId || "",
        date: voucher.date ? voucher.date.split("T")[0] : "",
        customer: voucher.customer?._id || "",
        amountReceived: voucher.amountReceived || "",
        newBalance: voucher.newBalance || "",
        remarks: voucher.remarks || "",
      });
    } else {
      setPaymentType("Bank");
      setBankData({
        receiptId: voucher.receiptId || "",
        date: voucher.date ? voucher.date.split("T")[0] : "",
        amountReceived: voucher.amountReceived || "",
        bankName: voucher.bankSection?.bankName || "",
        accountNumber: voucher.bankSection?.accountNumber || "",
        accountHolderName: voucher.bankSection?.accountHolderName || "",
        remarks: voucher.remarks || "",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let voucherData;

      if (paymentType === "Cash") {
        voucherData = {
          receiptId: editingVoucher ? cashData.receiptId : nextReceiptId,
          date: cashData.date,
          mode: "Cash",
          customer: cashData.customer,
          amountReceived: cashData.amountReceived,
          newBalance: cashData.newBalance,
          remarks: cashData.remarks,
        };
      } else {
        voucherData = {
          receiptId: editingVoucher ? bankData.receiptId : nextReceiptId,
          date: bankData.date || new Date().toISOString().split("T")[0],
          mode: "Bank",
          amountReceived: bankData.amountReceived,
          bankSection: {
            bankName: bankData.bankName,
            accountNumber: bankData.accountNumber,
            accountHolderName: bankData.accountHolderName,
          },
          remarks: bankData.remarks,
        };
      }

      console.log("Submitting data:", voucherData);

      const isUpdate = Boolean(editingVoucher?._id);

      // ✅ FIXED: Added missing slash before ID
      const url = isUpdate ? `${API_URL}/${editingVoucher._id}` : API_URL;

      const method = isUpdate ? "put" : "post";

      const response = await axios({
        method,
        url,
        data: voucherData,
        headers: {
          Authorization: `Bearer ${userInfo?.token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.success) {
        toast.success(
          isUpdate
            ? "Voucher updated successfully!"
            : "Voucher added successfully!"
        );
        resetForm();
        fetchVouchers();
        setEditingVoucher(null);
      } else {
        toast.error(response.data.message || "Failed to save voucher");
      }
    } catch (error) {
      console.error("Submit Error:", error.response?.data || error);
      toast.error(
        error.response?.data?.message || "Server error while saving voucher."
      );
    }
  };

  const handleDelete = async (id) => {
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
        text: "This action cannot be undone!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, cancel!",
        reverseButtons: true,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          try {
            const response = await axios.delete(`${API_URL}/${id}`, {
              headers: {
                Authorization: `Bearer ${userInfo?.token}`,
                "Content-Type": "application/json",
              },
            });

            if (response.data.success) {
              setVouchers((prev) => prev.filter((v) => v._id !== id));
              setFilteredVouchers((prev) => prev.filter((v) => v._id !== id));

              swalWithTailwindButtons.fire(
                "Deleted!",
                "Payment Receipt Voucher deleted successfully.",
                "success"
              );
            } else {
              swalWithTailwindButtons.fire(
                "Error!",
                response.data.message || "Failed to delete voucher.",
                "error"
              );
            }
          } catch (error) {
            console.error("Delete error:", error);
            swalWithTailwindButtons.fire(
              "Error!",
              "Server error while deleting voucher.",
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

  // Pagination logic - UPDATED to use filteredVouchers
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredVouchers.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(filteredVouchers.length / recordsPerPage);

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
            <p className="text-sm text-gray-600 mt-1">
              Showing {filteredVouchers.length} of {vouchers.length} vouchers
              {searchTerm && " (filtered)"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Enter Voucher ID eg: RV-001" // Changed to RV-
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
              <div className="hidden lg:grid grid-cols-[0.4fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200">
                <div>SR</div>
                <div>Voucher ID</div>
                <div>Payer Name</div>
                <div>Amount</div>
                <div>Payment Method</div>
                <div>Receipt Date</div>
                <div>Balance</div>
                <div>Remarks</div>
                <div>Actions</div>
              </div>

              <div className="flex flex-col divide-y divide-gray-100">
                {loading ? (
                  <TableSkeleton
                    rows={recordsPerPage}
                    cols={9}
                    className="lg:grid-cols-[0.4fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr]"
                  />
                ) : currentRecords.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 bg-white">
                    {searchTerm
                      ? "No vouchers found matching your search."
                      : "No vouchers found."}
                  </div>
                ) : (
                  currentRecords.map((voucher, index) => (
                    <div
                      key={voucher._id}
                      className="grid grid-cols-1 lg:grid-cols-[0.4fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] items-center gap-4 px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                    >
                      <div className="text-gray-600">
                        {indexOfFirstRecord + index + 1}
                      </div>
                      <div className="text-gray-600">{voucher.receiptId}</div>
                      <div className="text-gray-600">
                        {voucher.customer?.customerName ||
                          voucher.bankSection.accountHolderName ||
                          "-"}
                      </div>
                      <div className="text-gray-600">
                        Rs.{voucher.amountReceived || "-"}
                      </div>
                      <div className="text-gray-600">{voucher.mode}</div>
                      <div className="text-gray-600">
                        {voucher.date
                          ? new Date(voucher.date).toLocaleDateString()
                          : "-"}
                      </div>
                      <div className="text-gray-600">
                        Rs.{voucher.newBalance || "-"}
                      </div>
                      <div className="text-gray-600">
                        {voucher.remarks || "-"}
                      </div>
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

          {/* Pagination Controls - UPDATED to use filteredVouchers */}
          {totalPages > 1 && (
            <div className="flex justify-between my-4 px-10">
              <div className="text-sm text-gray-600">
                Showing {indexOfFirstRecord + 1} to{" "}
                {Math.min(indexOfLastRecord, filteredVouchers.length)} of{" "}
                {filteredVouchers.length} records
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
                          value={nextReceiptId}
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
                            const selectedId = e.target.value;
                            const selectedCustomer = customers.find(
                              (c) => c._id === selectedId
                            );

                            setCashData({
                              ...cashData,
                              customer: selectedCustomer?._id || "",
                              balance: selectedCustomer?.balance || 0, // ✅ store actual balance
                              newBalance: selectedCustomer?.balance || 0,
                              amountReceived: 0, // reset when new customer selected
                            });
                          }}
                          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="">Select Customer</option>
                          {customers.map((c) => (
                            <option key={c._id} value={c._id}>
                              {c.customerName}
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
                            const newBalance = cashData.balance - amount; // ✅ live calculation
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
                          value={Math.max(0, Math.round(cashData.newBalance))} // prevent negative display
                          readOnly
                          className={`w-full p-3 border rounded-md ${
                            cashData.newBalance < 0
                              ? "bg-red-100 text-red-600"
                              : "bg-gray-100"
                          }`}
                        />
                      </div>
                    </div>
                    {/* Remarks Field */}
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Remarks
                      </label>
                      <textarea
                        value={cashData.remarks}
                        onChange={(e) =>
                          setCashData({
                            ...cashData,
                            remarks: e.target.value,
                          })
                        }
                        placeholder="Enter any remarks or notes"
                        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="3"
                      />
                    </div>
                  </div>
                )}

                {/* Bank Form */}
                {paymentType === "Bank" && (
                  <div className="space-y-4">
                    {/* Bank Name & Account Number */}
                    <div className="flex gap-4">
                      {/* Bank Name */}
                      <div className="flex-1">
                        <label className="block text-gray-700 font-medium mb-2">
                          Bank Name <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={bankData?.bankName || ""} // ensure controlled value
                          onChange={(e) =>
                            setBankData((prev) => ({
                              ...prev,
                              bankName: e.target.value,
                            }))
                          }
                          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="">Select Bank</option>
                          {banks.map((b, index) => (
                            <option key={index} value={b.bankName}>
                              {b.bankName}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Account Number */}
                      <div className="flex-1">
                        <label className="block text-gray-700 font-medium mb-2">
                          A/C Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={bankData?.accountNumber || ""} // ensure controlled input
                          onChange={(e) =>
                            setBankData((prev) => ({
                              ...prev,
                              accountNumber: e.target.value,
                            }))
                          }
                          placeholder="Enter Account Number"
                          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
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
                          value={bankData.accountHolderName}
                          onChange={(e) =>
                            setBankData({
                              ...bankData,
                              accountHolderName: e.target.value,
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
                          value={bankData.amountReceived}
                          onChange={(e) =>
                            setBankData({
                              ...bankData,
                              amountReceived: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>

                    {/* Remarks Field */}
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Remarks
                      </label>
                      <textarea
                        value={bankData.remarks}
                        onChange={(e) =>
                          setBankData({
                            ...bankData,
                            remarks: e.target.value,
                          })
                        }
                        placeholder="Enter any remarks or notes"
                        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="3"
                      />
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
      </div>
    </div>
  );
};

export default FbrPaymentReceipt;
