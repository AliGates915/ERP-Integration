import React, { useState, useEffect, useRef, useCallback } from "react";
import { SquarePen, Trash2 } from "lucide-react";
import CommanHeader from "../../../components/CommanHeader";
import TableSkeleton from "../Skeleton";
import Swal from "sweetalert2";

const FbrLedger = () => {
  const [ledgerEntries, setLedgerEntries] = useState([
    {
      _id: "1",
      customerId: "CUS-001",
      customerName: "John Doe",
      transactionDate: "2025-09-01",
      transactionType: "Credit",
      amount: 500,
      balance: 500,
      notes: "Initial deposit",
    },
    {
      _id: "2",
      customerId: "CUS-002",
      customerName: "Jane Smith",
      transactionDate: "2025-09-15",
      transactionType: "Debit",
      amount: 200,
      balance: -200,
      notes: "Purchase of goods",
    },
  ]);
  // New states for CustomerLedger form
  const [ledgerId, setLedgerId] = useState("");
  const [date, setDate] = useState("");
  const [salesInvoice, setSalesInvoice] = useState("");
  const [status, setStatus] = useState("");

  // Already present in your code:
  const [customerName, setCustomerName] = useState("");
  const [amount, setAmount] = useState("");
  const [transactionDate, setTransactionDate] = useState("");
  const [transactionType, setTransactionType] = useState("");

  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [customerId, setCustomerId] = useState("");

  const [notes, setNotes] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingLedgerEntry, setEditingLedgerEntry] = useState(null);
  const [errors, setErrors] = useState({});
  const [customerList, setCustomerList] = useState([
    { _id: "cust1", customerName: "John Doe" },
    { _id: "cust2", customerName: "Jane Smith" },
    { _id: "cust3", customerName: "Alice Johnson" },
  ]);
  const [nextCustomerId, setNextCustomerId] = useState("003");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const sliderRef = useRef(null);
  const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Sample customer list
  const customers = [
    { id: "CUST-001", name: "Customer A" },
    { id: "CUST-002", name: "Customer B" },
    { id: "CUST-003", name: "Customer C" },
  ];

  // Sample ledger data
  const allLedgerData = [
    {
      sr: 1,
      date: "2025-10-01",
      id: "LED-001",
      description: "Payment Received",
      paid: 500,
      received: 0,
      balance: 500,
      total: 500,
      customerId: "CUST-001",
    },
    {
      sr: 2,
      date: "2025-10-05",
      id: "LED-002",
      description: "Invoice Payment",
      paid: 0,
      received: 300,
      balance: 200,
      total: 500,
      customerId: "CUST-001",
    },
    {
      sr: 3,
      date: "2025-10-03",
      id: "LED-003",
      description: "Payment Received",
      paid: 700,
      received: 0,
      balance: 700,
      total: 700,
      customerId: "CUST-002",
    },
  ];

  // Filter ledger data based on selected customer and date range
  const filteredLedger = allLedgerData.filter(
    (entry) =>
      entry.customerId === selectedCustomer &&
      (!dateFrom || entry.date >= dateFrom) &&
      (!dateTo || entry.date <= dateTo)
  );

  // Simulate fetching ledger entries
  const fetchLedgerEntries = useCallback(async () => {
    try {
      setLoading(true);
      // Static data already set in state
    } catch (error) {
      console.error("Failed to fetch ledger entries", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  }, []);

  useEffect(() => {
    fetchLedgerEntries();
  }, [fetchLedgerEntries]);

  // Ledger search
  useEffect(() => {
    if (!searchTerm || !searchTerm.startsWith("CUS-")) {
      fetchLedgerEntries();
      return;
    }

    const delayDebounce = setTimeout(() => {
      try {
        setLoading(true);
        const filtered = ledgerEntries.filter((entry) =>
          entry.customerId.toUpperCase().includes(searchTerm.toUpperCase())
        );
        setLedgerEntries(filtered);
      } catch (error) {
        console.error("Search ledger entries failed:", error);
        setLedgerEntries([]);
      } finally {
        setLoading(false);
      }
    }, 1000);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, fetchLedgerEntries, ledgerEntries]);

  // Generate next customer ID
  useEffect(() => {
    if (ledgerEntries.length > 0) {
      const maxNo = Math.max(
        ...ledgerEntries.map((entry) => {
          const match = entry.customerId?.match(/CUS-(\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        })
      );
      setNextCustomerId((maxNo + 1).toString().padStart(3, "0"));
    } else {
      setNextCustomerId("001");
    }
  }, [ledgerEntries]);

  // Reset form fields
  const resetForm = () => {
    setCustomerId("");
    setCustomerName("");
    setTransactionDate("");
    setTransactionType("");
    setAmount("");
    setNotes("");
    setEditingLedgerEntry(null);
    setErrors({});
    setIsSliderOpen(false);
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    const trimmedCustomerId = customerId.trim();
    const trimmedCustomerName = customerName.trim();
    const trimmedTransactionDate = transactionDate.trim();
    const trimmedTransactionType = transactionType.trim();
    const trimmedAmount = amount.trim();
    const parsedAmount = parseFloat(amount);

    if (!trimmedCustomerId) newErrors.customerId = "Customer ID is required";
    if (!trimmedCustomerName)
      newErrors.customerName = "Customer Name is required";
    if (!trimmedTransactionDate)
      newErrors.transactionDate = "Transaction Date is required";
    if (!trimmedTransactionType)
      newErrors.transactionType = "Transaction Type is required";
    if (!trimmedAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
      newErrors.amount = "Amount must be a positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handlers for form and table actions
  const handleAddLedgerEntry = () => {
    resetForm();
    setIsSliderOpen(true);
  };

  const handleEditClick = (ledgerEntry) => {
    setEditingLedgerEntry(ledgerEntry);
    setCustomerId(ledgerEntry.customerId || "");
    setCustomerName(ledgerEntry.customerName || "");
    setTransactionDate(ledgerEntry.transactionDate || "");
    setTransactionType(ledgerEntry.transactionType || "");
    setAmount(ledgerEntry.amount || "");
    setNotes(ledgerEntry.notes || "");
    setErrors({});
    setIsSliderOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Calculate balance based on transaction type
    const amountValue = parseFloat(amount);
    const balance = transactionType === "Credit" ? amountValue : -amountValue;

    const newLedgerEntry = {
      customerId: editingLedgerEntry ? customerId : `CUS-${nextCustomerId}`,
      customerName: customerName.trim(),
      transactionDate: transactionDate.trim(),
      transactionType: transactionType.trim(),
      amount: amountValue,
      balance: parseFloat(balance.toFixed(2)),
      notes: notes.trim(),
    };

    try {
      if (editingLedgerEntry) {
        setLedgerEntries((prev) =>
          prev.map((entry) =>
            entry._id === editingLedgerEntry._id
              ? { ...entry, ...newLedgerEntry, _id: entry._id }
              : entry
          )
        );
        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Ledger entry updated successfully.",
          confirmButtonColor: "#3085d6",
        });
      } else {
        setLedgerEntries((prev) => [
          ...prev,
          { ...newLedgerEntry, _id: `temp-${Date.now()}` },
        ]);
        Swal.fire({
          icon: "success",
          title: "Added!",
          text: "Ledger entry added successfully.",
          confirmButtonColor: "#3085d6",
        });
      }
      fetchLedgerEntries();
      resetForm();
    } catch (error) {
      console.error("Error saving ledger entry:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to save ledger entry.",
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
            setLedgerEntries((prev) =>
              prev.filter((entry) => entry._id !== id)
            );
            swalWithTailwindButtons.fire(
              "Deleted!",
              "Ledger entry deleted successfully.",
              "success"
            );
          } catch (error) {
            console.error("Delete error:", error);
            swalWithTailwindButtons.fire(
              "Error!",
              "Failed to delete ledger entry.",
              "error"
            );
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire(
            "Cancelled",
            "Ledger entry is safe 🙂",
            "error"
          );
        }
      });
  };

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = ledgerEntries.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(ledgerEntries.length / recordsPerPage);

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
              Customer Ledger Details
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Enter Customer ID eg: CUS-001"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 w-[250px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-newPrimary"
            />
            <button
              className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/80"
              onClick={handleAddLedgerEntry}
            >
              + Add Ledger Entry
            </button>
          </div>
        </div>

        <div className="rounded-xl shadow border border-gray-200 overflow-hidden">
          <div className="overflow-y-auto lg:overflow-x-auto max-h-[900px]">
            <div className="min-w-[1200px]">
              <div className="hidden lg:grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200">
                <div>Customer ID</div>
                <div>Customer Name</div>
                <div>Transaction Date</div>
                <div>Transaction Type</div>
                <div>Amount</div>
                <div>Balance</div>
                <div>Actions</div>
              </div>

              <div className="flex flex-col divide-y divide-gray-100">
                {loading ? (
                  <TableSkeleton
                    rows={recordsPerPage}
                    cols={7}
                    className="lg:grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr]"
                  />
                ) : currentRecords.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 bg-white">
                    No ledger entries found.
                  </div>
                ) : (
                  currentRecords.map((ledgerEntry) => (
                    <div
                      key={ledgerEntry._id}
                      className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr] items-center gap-4 px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                    >
                      <div className="text-gray-600">
                        {ledgerEntry.customerId}
                      </div>
                      <div className="text-gray-600">
                        {ledgerEntry.customerName}
                      </div>
                      <div className="text-gray-600">
                        {ledgerEntry.transactionDate}
                      </div>
                      <div className="text-gray-600">
                        {ledgerEntry.transactionType}
                      </div>
                      <div className="text-gray-600">{ledgerEntry.amount}</div>
                      <div className="text-gray-600">{ledgerEntry.balance}</div>
                      <div className="flex gap-3 justify-start">
                        <button
                          onClick={() => handleEditClick(ledgerEntry)}
                          className="py-1 text-sm rounded text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit"
                        >
                          <SquarePen size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(ledgerEntry._id)}
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
                {Math.min(indexOfLastRecord, ledgerEntries.length)} of{" "}
                {ledgerEntries.length} records
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
                  {editingLedgerEntry
                    ? "Update Ledger Entry"
                    : "Add a New Ledger Entry"}
                </h2>
                <button
                  className="text-2xl text-gray-500 hover:text-gray-700"
                  onClick={resetForm}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 p-4 md:p-6">
                {/* Top Section */}
                <div className="p-4 md:p-6">
                  {/* Selection Form */}
                  <div className="space-y-4 border p-4 rounded-lg bg-gray-100 mb-6">
                    <div className="flex gap-4">
                      {/* Customer Selection */}
                      <div className="flex-1 min-w-0">
                        <label className="block text-gray-700 font-medium mb-2">
                          Customer Name <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={selectedCustomer}
                          onChange={(e) => setSelectedCustomer(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                          required
                        >
                          <option value="">Select Customer</option>
                          {customers.map((cust) => (
                            <option key={cust.id} value={cust.id}>
                              {cust.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      {/* Date From */}
                      <div className="flex-1 min-w-0">
                        <label className="block text-gray-700 font-medium mb-2">
                          Date From
                        </label>
                        <input
                          type="date"
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                        />
                      </div>

                      {/* Date To */}
                      <div className="flex-1 min-w-0">
                        <label className="block text-gray-700 font-medium mb-2">
                          Date To
                        </label>
                        <input
                          type="date"
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Ledger Table */}
                  {selectedCustomer && (
                    <div className="overflow-x-auto border rounded-lg">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-2 border">SR</th>
                            <th className="px-4 py-2 border">Date</th>
                            <th className="px-4 py-2 border">ID</th>
                            <th className="px-4 py-2 border">Description</th>
                            <th className="px-4 py-2 border">Paid</th>
                            <th className="px-4 py-2 border">Received</th>
                            <th className="px-4 py-2 border">Balance</th>
                            <th className="px-4 py-2 border">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredLedger.length > 0 ? (
                            filteredLedger.map((entry) => (
                              <tr
                                key={entry.id}
                                className="odd:bg-white even:bg-gray-50"
                              >
                                <td className="px-4 py-2 border">{entry.sr}</td>
                                <td className="px-4 py-2 border">
                                  {entry.date}
                                </td>
                                <td className="px-4 py-2 border">{entry.id}</td>
                                <td className="px-4 py-2 border">
                                  {entry.description}
                                </td>
                                <td className="px-4 py-2 border">
                                  {entry.paid}
                                </td>
                                <td className="px-4 py-2 border">
                                  {entry.received}
                                </td>
                                <td className="px-4 py-2 border">
                                  {entry.balance}
                                </td>
                                <td className="px-4 py-2 border">
                                  {entry.total}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan="8"
                                className="text-center py-4 text-gray-500"
                              >
                                No ledger entries found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-newPrimary text-white px-4 py-3 rounded-lg hover:bg-newPrimary/80 transition-colors disabled:bg-blue-300"
                >
                  {loading
                    ? "Saving..."
                    : editingLedgerEntry
                    ? "Update Ledger Entry"
                    : "Save Ledger Entry"}
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

export default FbrLedger;
