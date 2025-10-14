import React, { useState, useEffect, useRef, useCallback } from "react";
import { SquarePen, Trash2 } from "lucide-react";
import CommanHeader from "../../../components/CommanHeader";
import TableSkeleton from "../Skeleton";
import Swal from "sweetalert2";

const SalesReturn = () => {
  const [salesReturns, setSalesReturns] = useState([
    {
      _id: "1",
      returnId: "RET-001",
      customerName: "John Doe",
      invoiceNumber: "INV-001",
      returnDate: "2025-09-05",
      itemName: "Laptop",
      quantity: 1,
      refundAmount: 900,
      reason: "Defective product",
      status: "Processed",
    },
    {
      _id: "2",
      returnId: "RET-002",
      customerName: "Jane Smith",
      invoiceNumber: "INV-002",
      returnDate: "2025-09-20",
      itemName: "Mouse",
      quantity: 2,
      refundAmount: 38,
      reason: "Wrong item shipped",
      status: "Pending",
    },
  ]);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [returnId, setReturnId] = useState("");
  // New Top Section fields
  const [dcId, setDcId] = useState("");
  const [driverName, setDriverName] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  // Item entry fields
  const [price, setPrice] = useState("");
  const [total, setTotal] = useState("");

  // Items list (array of added items)
  const [items, setItems] = useState([]);

  const [customerName, setCustomerName] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingSalesReturn, setEditingSalesReturn] = useState(null);
  const [errors, setErrors] = useState({});
  const [customerList, setCustomerList] = useState([
    { _id: "cust1", customerName: "John Doe" },
    { _id: "cust2", customerName: "Jane Smith" },
    { _id: "cust3", customerName: "Alice Johnson" },
  ]);
  const [itemList, setItemList] = useState([
    { _id: "item1", itemName: "Laptop" },
    { _id: "item2", itemName: "Mouse" },
    { _id: "item3", itemName: "Keyboard" },
  ]);
  const [nextReturnId, setNextReturnId] = useState("003");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const sliderRef = useRef(null);
  const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};

  // Simulate fetching sales returns
  const fetchSalesReturns = useCallback(async () => {
    try {
      setLoading(true);
      // Static data already set in state
    } catch (error) {
      console.error("Failed to fetch sales returns", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  }, []);

  useEffect(() => {
    fetchSalesReturns();
  }, [fetchSalesReturns]);

  // Sales return search
  useEffect(() => {
    if (!searchTerm || !searchTerm.startsWith("RET-")) {
      fetchSalesReturns();
      return;
    }

    const delayDebounce = setTimeout(() => {
      try {
        setLoading(true);
        const filtered = salesReturns.filter((returnItem) =>
          returnItem.returnId.toUpperCase().includes(searchTerm.toUpperCase())
        );
        setSalesReturns(filtered);
      } catch (error) {
        console.error("Search sales returns failed:", error);
        setSalesReturns([]);
      } finally {
        setLoading(false);
      }
    }, 1000);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, fetchSalesReturns, salesReturns]);

  // Generate next return ID
  useEffect(() => {
    if (salesReturns.length > 0) {
      const maxNo = Math.max(
        ...salesReturns.map((r) => {
          const match = r.returnId?.match(/RET-(\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        })
      );
      setNextReturnId((maxNo + 1).toString().padStart(3, "0"));
    } else {
      setNextReturnId("001");
    }
  }, [salesReturns]);

  // Reset form fields
  const resetForm = () => {
    setReturnId("");
    setCustomerName("");
    setInvoiceNumber("");
    setReturnDate("");
    setItemName("");
    setQuantity("");
    setRefundAmount("");
    setReason("");
    setStatus("");
    setEditingSalesReturn(null);
    setErrors({});
    setIsSliderOpen(false);
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    const trimmedReturnId = returnId.trim();
    const trimmedCustomerName = customerName.trim();
    const trimmedInvoiceNumber = invoiceNumber.trim();
    const trimmedReturnDate = returnDate.trim();
    const trimmedItemName = itemName.trim();
    const trimmedQuantity = quantity.trim();
    const trimmedRefundAmount = refundAmount.trim();
    const trimmedStatus = status.trim();
    const parsedQuantity = parseInt(quantity);
    const parsedRefundAmount = parseFloat(refundAmount);

    if (!trimmedReturnId) newErrors.returnId = "Return ID is required";
    if (!trimmedCustomerName)
      newErrors.customerName = "Customer Name is required";
    if (!trimmedInvoiceNumber)
      newErrors.invoiceNumber = "Invoice Number is required";
    if (!trimmedReturnDate) newErrors.returnDate = "Return Date is required";
    if (!trimmedItemName) newErrors.itemName = "Item Name is required";
    if (!trimmedQuantity || isNaN(parsedQuantity) || parsedQuantity <= 0) {
      newErrors.quantity = "Quantity must be a positive number";
    }
    if (
      !trimmedRefundAmount ||
      isNaN(parsedRefundAmount) ||
      parsedRefundAmount <= 0
    ) {
      newErrors.refundAmount = "Refund Amount must be a positive number";
    }
    if (!trimmedStatus) newErrors.status = "Status is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handlers for form and table actions
  const handleAddSalesReturn = () => {
    resetForm();
    setIsSliderOpen(true);
  };

  const handleEditClick = (salesReturn) => {
    setEditingSalesReturn(salesReturn);
    setReturnId(salesReturn.returnId || "");
    setCustomerName(salesReturn.customerName || "");
    setInvoiceNumber(salesReturn.invoiceNumber || "");
    setReturnDate(salesReturn.returnDate || "");
    setItemName(salesReturn.itemName || "");
    setQuantity(salesReturn.quantity || "");
    setRefundAmount(salesReturn.refundAmount || "");
    setReason(salesReturn.reason || "");
    setStatus(salesReturn.status || "");
    setErrors({});
    setIsSliderOpen(true);
  };
  // Calculate total whenever qty or price changes
  useEffect(() => {
    if (quantity && price) {
      setTotal((parseFloat(quantity) * parseFloat(price)).toFixed(2));
    } else {
      setTotal("");
    }
  }, [quantity, price]);

  // Add new item to list
  const handleAddItem = () => {
    if (!itemName || !quantity || !price) {
      Swal.fire("Error", "Please fill item, quantity and price", "error");
      return;
    }

    const newItem = {
      itemName,
      quantity: parseInt(quantity),
      price: parseFloat(price),
      total: parseFloat(total),
    };

    setItems((prev) => [...prev, newItem]);

    // reset item input fields
    setItemName("");
    setQuantity("");
    setPrice("");
    setTotal("");
  };

  // Remove item from list
  const handleRemoveItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const newSalesReturn = {
      returnId: editingSalesReturn ? returnId : `RET-${nextReturnId}`,
      customerName: customerName.trim(),
      invoiceNumber: invoiceNumber.trim(),
      returnDate: returnDate.trim(),
      itemName: itemName.trim(),
      quantity: parseInt(quantity),
      refundAmount: parseFloat(refundAmount),
      reason: reason.trim(),
      status: status.trim(),
    };

    try {
      if (editingSalesReturn) {
        setSalesReturns((prev) =>
          prev.map((r) =>
            r._id === editingSalesReturn._id
              ? { ...r, ...newSalesReturn, _id: r._id }
              : r
          )
        );
        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Sales Return updated successfully.",
          confirmButtonColor: "#3085d6",
        });
      } else {
        setSalesReturns((prev) => [
          ...prev,
          { ...newSalesReturn, _id: `temp-${Date.now()}` },
        ]);
        Swal.fire({
          icon: "success",
          title: "Added!",
          text: "Sales Return added successfully.",
          confirmButtonColor: "#3085d6",
        });
      }
      fetchSalesReturns();
      resetForm();
    } catch (error) {
      console.error("Error saving sales return:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to save sales return.",
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
            setSalesReturns((prev) => prev.filter((r) => r._id !== id));
            swalWithTailwindButtons.fire(
              "Deleted!",
              "Sales Return deleted successfully.",
              "success"
            );
          } catch (error) {
            console.error("Delete error:", error);
            swalWithTailwindButtons.fire(
              "Error!",
              "Failed to delete sales return.",
              "error"
            );
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire(
            "Cancelled",
            "Sales Return is safe 🙂",
            "error"
          );
        }
      });
  };

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = salesReturns.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(salesReturns.length / recordsPerPage);

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
              Sales Return Details
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Enter Return ID eg: RET-001"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 w-[250px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-newPrimary"
            />
            <button
              className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/80"
              onClick={handleAddSalesReturn}
            >
              + Add Sales Return
            </button>
          </div>
        </div>

        <div className="rounded-xl shadow border border-gray-200 overflow-hidden">
          <div className="overflow-y-auto lg:overflow-x-auto max-h-[900px]">
            <div className="min-w-[1200px]">
              <div className="hidden lg:grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200">
                <div>Return ID</div>
                <div>Customer Name</div>
                <div>Invoice Number</div>
                <div>Return Date</div>
                <div>Item Name</div>
                <div>Quantity</div>
                <div>Refund Amount</div>
                <div>Reason</div>
                <div>Actions</div>
              </div>

              <div className="flex flex-col divide-y divide-gray-100">
                {loading ? (
                  <TableSkeleton
                    rows={recordsPerPage}
                    cols={9}
                    className="lg:grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr]"
                  />
                ) : currentRecords.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 bg-white">
                    No sales returns found.
                  </div>
                ) : (
                  currentRecords.map((salesReturn) => (
                    <div
                      key={salesReturn._id}
                      className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] items-center gap-4 px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                    >
                      <div className="text-gray-600">
                        {salesReturn.returnId}
                      </div>
                      <div className="text-gray-600">
                        {salesReturn.customerName}
                      </div>
                      <div className="text-gray-600">
                        {salesReturn.invoiceNumber}
                      </div>
                      <div className="text-gray-600">
                        {salesReturn.returnDate}
                      </div>
                      <div className="text-gray-600">
                        {salesReturn.itemName}
                      </div>
                      <div className="text-gray-600">
                        {salesReturn.quantity}
                      </div>
                      <div className="text-gray-600">
                        {salesReturn.refundAmount}
                      </div>
                      <div className="text-gray-600">{salesReturn.reason}</div>
                      <div className="flex gap-3 justify-start">
                        <button
                          onClick={() => handleEditClick(salesReturn)}
                          className="py-1 text-sm rounded text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit"
                        >
                          <SquarePen size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(salesReturn._id)}
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
                {Math.min(indexOfLastRecord, salesReturns.length)} of{" "}
                {salesReturns.length} records
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
                  {editingSalesReturn
                    ? "Update Sales Return"
                    : "Add a New Sales Return"}
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
                <div className="space-y-3 border p-4 pb-6 rounded-lg bg-gray-100">
                  <div className="flex gap-4">
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        Return ID
                      </label>
                      <input
                        type="text"
                        value={
                          editingSalesReturn ? returnId : `RET-${nextReturnId}`
                        }
                        readOnly
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        Return Date
                      </label>
                      <input
                        type="date"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        DC ID
                      </label>
                      <select
                        value={dcId}
                        onChange={(e) => setDcId(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                      >
                        <option value="">Select DC</option>
                        <option value="DC-001">DC-001</option>
                        <option value="DC-002">DC-002</option>
                      </select>
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        Invoice No
                      </label>
                      <input
                        type="text"
                        value={invoiceNumber}
                        readOnly
                        onChange={(e) => setInvoiceNumber(e.target.value)}
                        className="w-full p-3 border bg-gray-50 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        Customer Name
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        readOnly
                        disabled
                        className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        Driver Name
                      </label>
                      <input
                        type="text"
                        value={driverName}
                        readOnly
                        onChange={(e) => setDriverName(e.target.value)}
                        className="w-full p-3 border border-gray-300 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Delivery Address
                    </label>
                    <textarea
                      rows={2}
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                    />
                  </div>
                </div>

                {/* Items Section */}
              <div className="mt-6">
  <h3 className="text-lg font-medium text-gray-700 mb-4">Items</h3>

  <div className="border p-4 rounded-lg bg-formBgGray space-y-4">
    {/* Add Row */}
    <div className="flex flex-wrap gap-4 items-end">
      <div className="flex-1 min-w-[180px]">
        <label className="block text-gray-700 font-medium mb-2">
          Item
        </label>
        <select
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          className="w-full p-3 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
        >
          <option value="">Select Item</option>
          {itemList.map((item) => (
            <option key={item._id} value={item.itemName}>
              {item.itemName}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 min-w-[120px]">
        <label className="block text-gray-700 font-medium mb-2">
          Quantity
        </label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
          placeholder="Enter quantity"
        />
      </div>

      <div className="flex-1 min-w-[120px]">
        <label className="block text-gray-700 font-medium mb-2">
          Price
        </label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
          placeholder="Enter price"
        />
      </div>

      <div className="flex-1 min-w-[120px]">
        <label className="block text-gray-700 font-medium mb-2">
          Total
        </label>
        <input
          type="number"
          value={total}
          readOnly
          className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
        />
      </div>

      <div className="flex-shrink-0">
        <button
          type="button"
          onClick={handleAddItem}
          className="px-6 py-3 bg-lime-500 text-white font-medium rounded-lg hover:bg-lime-600 transition flex items-center gap-2"
        >
          <span className="text-lg font-bold">+</span> Add
        </button>
      </div>
    </div>

    {/* Items Table */}
    {items.length > 0 ? (
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-gray-200 text-gray-600 text-sm border border-gray-300">
            <tr>
              <th className="px-4 py-2 border border-gray-300">Sr #</th>
              <th className="px-4 py-2 border border-gray-300">Item Name</th>
              <th className="px-4 py-2 border border-gray-300">Quantity</th>
              <th className="px-4 py-2 border border-gray-300">Price</th>
              <th className="px-4 py-2 border border-gray-300">Total</th>
              <th className="px-4 py-2 border border-gray-300">Action</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 text-sm">
            {items.map((item, idx) => (
              <tr key={idx} className="bg-gray-50 even:bg-white text-center border border-gray-300">
                <td className="px-4 py-2 border border-gray-300">{idx + 1}</td>
                <td className="px-4 py-2 border border-gray-300">{item.itemName}</td>
                <td className="px-4 py-2 border border-gray-300">{item.quantity}</td>
                <td className="px-4 py-2 border border-gray-300">{item.price}</td>
                <td className="px-4 py-2 border border-gray-300">{item.total}</td>
                <td className="px-4 py-2 border border-gray-300">
                  <button
                    onClick={() => handleRemoveItem(idx)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <div className="text-center py-4 text-gray-500 bg-white rounded-lg border border-gray-200">
        No items added
      </div>
    )}
  </div>
</div>


                {/* Bottom Section */}
                <div className="space-y-3 border p-4 pb-6 rounded-lg bg-gray-100">
                  <div className="flex gap-4">
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        Reason
                      </label>
                      <input
                        type="text"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-newPrimary"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        Status
                      </label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-newPrimary"
                      >
                        <option value="">Select Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Processed">Processed</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full bg-newPrimary text-white px-4 py-3 rounded-lg hover:bg-newPrimary/80 transition-colors"
                >
                  {editingSalesReturn
                    ? "Update Sales Return"
                    : "Save Sales Return"}
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

export default SalesReturn;
