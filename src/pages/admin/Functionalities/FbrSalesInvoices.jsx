import React, { useState, useEffect, useRef, useCallback } from "react";
import { SquarePen, Trash2 } from "lucide-react";
import CommanHeader from "../../../components/CommanHeader";
import TableSkeleton from "../Skeleton";
import Swal from "sweetalert2";

const FbrSalesInvoices = () => {
  const [invoices, setInvoices] = useState([
    {
      _id: "1",
      invoiceId: "INV-001",
      invoiceDate: "2025-09-01",
      dcNo: "DC-001",
      deliveryDate: "2025-09-05",
      medicineType: "Tablet",
      bookingNo: "BN-001",
      vendor: "Pharma Corp",
      address: "123 Health St, Med City",
      phoneNo: "555-0101",
      balance: 5000,
      items: [
        {
          srNo: 1,
          item: "Paracetamol",
          packSize: "10x10",
          rate: 50,
          qty: 100,
          total: 5000,
        },
      ],
    },
    {
      _id: "2",
      invoiceId: "INV-002",
      invoiceDate: "2025-09-15",
      dcNo: "DC-002",
      deliveryDate: "2025-09-20",
      medicineType: "Syrup",
      bookingNo: "BN-002",
      vendor: "Health Solutions",
      address: "456 Wellness Ave, Med City",
      phoneNo: "555-0102",
      balance: 3000,
      items: [
        {
          srNo: 1,
          item: "Ibuprofen",
          packSize: "10x10",
          rate: 80,
          qty: 50,
          total: 4000,
        },
      ],
    },
  ]);

  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [invoiceId, setInvoiceId] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [dcNo, setDcNo] = useState([]);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [medicineType, setMedicineType] = useState("");
  const [bookingNo, setBookingNo] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [vendor, setVendor] = useState("");
  const [selectedDcNos, setSelectedDcNos] = useState([]);
  const [showDcDropdown, setShowDcDropdown] = useState(false);
  const [taxes, setTaxes] = useState([{ type: "", value: "", amount: "" }]);
  const [address, setAddress] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [balance, setBalance] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [errors, setErrors] = useState({});
  const [items, setItems] = useState([
    { srNo: 1, DcNo: 1, item: "Cement Bags (50kg)", rate: 1200, qty: 10 },
    { srNo: 2, DcNo: 2, item: "Steel Rod 12mm", rate: 220, qty: 100 },
    { srNo: 3, DcNo: 3, item: "Bricks (1000 pcs)", rate: 15000, qty: 1 },
    { srNo: 4, DcNo: 4, item: "Paint Drum (20L)", rate: 4500, qty: 2 },
    { srNo: 5, DcNo: 5, item: "PVC Pipe 1 inch", rate: 350, qty: 25 },
  ]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [discountAmount, setDiscountAmount] = useState("");
  const [salesTax, setSalesTax] = useState(false);
  const [netAmount, setNetAmount] = useState("");
  const [dcList, setDcList] = useState([
    {
      dcNo: "DC-001",
      deliveryDate: "2025-09-05",
      medicineType: "Tablet",
      bookingNo: "BN-001",
      orderDate: "2025-08-30",
      vendor: "Pharma Corp",
      address: "123 Health St, Med City",
      phoneNo: "555-0101",
      balance: 5000,
      items: [
        {
          srNo: 1,
          item: "Paracetamol",
          packSize: "10x10",
          rate: 50,
          qty: 100,
          total: 5000,
        },
      ],
    },
    {
      dcNo: "DC-002",
      deliveryDate: "2025-09-20",
      medicineType: "Syrup",
      bookingNo: "BN-002",
      orderDate: "2025-09-10",
      vendor: "Health Solutions",
      address: "456 Wellness Ave, Med City",
      phoneNo: "555-0102",
      balance: 3000,
      items: [
        {
          srNo: 1,
          item: "Ibuprofen",
          packSize: "10x10",
          rate: 80,
          qty: 50,
          total: 4000,
        },
      ],
    },
  ]);
  const [nextInvoiceId, setNextInvoiceId] = useState("003");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const sliderRef = useRef(null);
  const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};

  // Simulate fetching invoices
  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      // Static data already set in state
    } catch (error) {
      console.error("Failed to fetch invoices", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // Invoice search
  useEffect(() => {
    if (!searchTerm || !searchTerm.startsWith("INV-")) {
      fetchInvoices();
      return;
    }

    const delayDebounce = setTimeout(() => {
      try {
        setLoading(true);
        const filtered = invoices.filter((invoice) =>
          invoice.invoiceId.toUpperCase().includes(searchTerm.toUpperCase())
        );
        setInvoices(filtered);
      } catch (error) {
        console.error("Search invoice failed:", error);
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    }, 1000);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, fetchInvoices, invoices]);

  // Generate next invoice ID
  useEffect(() => {
    if (invoices.length > 0) {
      const maxNo = Math.max(
        ...invoices.map((inv) => {
          const match = inv.invoiceId?.match(/INV-(\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        })
      );
      setNextInvoiceId((maxNo + 1).toString().padStart(3, "0"));
    } else {
      setNextInvoiceId("001");
    }
  }, [invoices]);

  // Handle DC No. selection
  const handleDcNoChange = (e) => {
    const selectedDcNo = e.target.value;
    setDcNo(selectedDcNo);
    const selectedDc = dcList.find((dc) => dc.dcNo === selectedDcNo);
    if (selectedDc) {
      setDeliveryDate(selectedDc.deliveryDate);
      setMedicineType(selectedDc.medicineType);
      setBookingNo(selectedDc.bookingNo);
      setOrderDate(selectedDc.orderDate);
      setVendor(selectedDc.vendor);
      setAddress(selectedDc.address);
      setPhoneNo(selectedDc.phoneNo);
      setBalance(selectedDc.balance.toString());
      setItems(selectedDc.items || []); // ✅ KEEP THIS HERE
    } else {
      setDeliveryDate("");
      setMedicineType("");
      setBookingNo("");
      setOrderDate("");
      setVendor("");
      setAddress("");
      setPhoneNo("");
      setBalance("");
      setItems([]); // ✅ KEEP THIS HERE
    }
  };

  // Calculate totals
  useEffect(() => {
    const calculatedTotal = items.reduce((sum, item) => sum + item.total, 0);
    setTotalPrice(calculatedTotal);

    const discount = discountPercentage
      ? (calculatedTotal * parseFloat(discountPercentage)) / 100
      : 0;
    setDiscountAmount(discount.toFixed(2));

    const taxAmount = salesTax ? calculatedTotal * 0.035 : 0;
    const net = calculatedTotal - discount + taxAmount;
    setNetAmount(net.toFixed(2));
  }, [items, discountPercentage, salesTax]);

  // Reset form fields
  const resetForm = () => {
    setInvoiceId("");
    setInvoiceDate("");
    setDcNo("");
    setDeliveryDate("");
    setMedicineType("");
    setBookingNo("");
    setOrderDate("");
    setVendor("");
    setAddress("");
    setPhoneNo("");
    setBalance("");
    setItems([]);
    setTotalPrice(0);
    setDiscountPercentage("");
    setDiscountAmount("");
    setSalesTax(false);
    setNetAmount("");
    setEditingInvoice(null);
    setErrors({});
    setIsSliderOpen(false);
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    const trimmedInvoiceId = invoiceId.trim();
    const trimmedInvoiceDate = invoiceDate.trim();
    const trimmedDcNo = dcNo.trim();

    if (!trimmedInvoiceId) newErrors.invoiceId = "Invoice ID is required";
    if (!trimmedInvoiceDate) newErrors.invoiceDate = "Invoice Date is required";
    if (!trimmedDcNo) newErrors.dcNo = "DC No. is required";
    if (items.length === 0) newErrors.items = "At least one item is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handlers for form and table actions
  const handleAddInvoice = () => {
    resetForm();
    setIsSliderOpen(true);
  };

  const handleEditClick = (invoice) => {
    setEditingInvoice(invoice);
    setInvoiceId(invoice.invoiceId || "");
    setInvoiceDate(invoice.invoiceDate || "");
    setDcNo(invoice.dcNo || "");
    setDeliveryDate(invoice.deliveryDate || "");
    setMedicineType(invoice.medicineType || "");
    setBookingNo(invoice.bookingNo || "");
    setOrderDate(invoice.orderDate || "");
    setVendor(invoice.vendor || "");
    setAddress(invoice.address || "");
    setPhoneNo(invoice.phoneNo || "");
    setBalance(invoice.balance?.toString() || "");
    setItems(invoice.items || []);
    setTotalPrice(invoice.totalPrice || 0);
    setDiscountPercentage(invoice.discountPercentage?.toString() || "");
    setDiscountAmount(invoice.discountAmount?.toString() || "");
    setSalesTax(invoice.salesTax || false);
    setNetAmount(invoice.netAmount?.toString() || "");
    setErrors({});
    setIsSliderOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const newInvoice = {
      invoiceId: editingInvoice ? invoiceId : `INV-${nextInvoiceId}`,
      invoiceDate: invoiceDate.trim(),
      dcNo: dcNo.trim(),
      deliveryDate: deliveryDate.trim(),
      medicineType: medicineType.trim(),
      bookingNo: bookingNo.trim(),
      orderDate: orderDate.trim(),
      vendor: vendor.trim(),
      address: address.trim(),
      phoneNo: phoneNo.trim(),
      balance: parseFloat(balance) || 0,
      items,
      totalPrice: parseFloat(totalPrice),
      discountPercentage: parseFloat(discountPercentage) || 0,
      discountAmount: parseFloat(discountAmount) || 0,
      salesTax,
      netAmount: parseFloat(netAmount) || 0,
    };

    try {
      if (editingInvoice) {
        setInvoices((prev) =>
          prev.map((inv) =>
            inv._id === editingInvoice._id
              ? { ...inv, ...newInvoice, _id: inv._id }
              : inv
          )
        );
        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Sales Invoice updated successfully.",
          confirmButtonColor: "#3085d6",
        });
      } else {
        setInvoices((prev) => [
          ...prev,
          { ...newInvoice, _id: `temp-${Date.now()}` },
        ]);
        Swal.fire({
          icon: "success",
          title: "Added!",
          text: "Sales Invoice added successfully.",
          confirmButtonColor: "#3085d6",
        });
      }
      fetchInvoices();
      resetForm();
    } catch (error) {
      console.error("Error saving sales invoice:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to save sales invoice.",
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
            setInvoices((prev) => prev.filter((inv) => inv._id !== id));
            swalWithTailwindButtons.fire(
              "Deleted!",
              "Sales Invoice deleted successfully.",
              "success"
            );
          } catch (error) {
            console.error("Delete error:", error);
            swalWithTailwindButtons.fire(
              "Error!",
              "Failed to delete sales invoice.",
              "error"
            );
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire(
            "Cancelled",
            "Sales Invoice is safe 🙂",
            "error"
          );
        }
      });
  };

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = invoices.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(invoices.length / recordsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleTaxChange = (index, field, value) => {
    setTaxes((prev) =>
      prev.map((tax, i) => {
        if (i === index) {
          const updated = { ...tax, [field]: value };
          if (field === "value" && netAmount) {
            updated.amount = (
              (netAmount * parseFloat(value || 0)) /
              100
            ).toFixed(2);
          }
          return updated;
        }
        return tax;
      })
    );
  };

  const handleAddTax = () => {
    setTaxes((prev) => [...prev, { type: "", value: "", amount: "" }]);
  };
  const handleDcSelect = (dcNo, isChecked) => {
    setSelectedDcNos((prev) =>
      isChecked ? [...prev, dcNo] : prev.filter((item) => item !== dcNo)
    );
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".dc-dropdown-container")) {
        setShowDcDropdown(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <CommanHeader />
      <div className="px-6 mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-newPrimary">
              Sales Invoice Details
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Enter Invoice ID eg: INV-001"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 w-[250px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-newPrimary"
            />
            <button
              className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/80"
              onClick={handleAddInvoice}
            >
              + Add Sales Invoice
            </button>
          </div>
        </div>

        <div className="rounded-xl shadow border border-gray-200 overflow-hidden">
          <div className="overflow-y-auto lg:overflow-x-auto max-h-[900px]">
            <div className="min-w-[1200px]">
              <div className="hidden lg:grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200">
                <div>Invoice No.</div>
                <div>Invoice Date</div>
                <div>DC No.</div>
                <div>Delivery Date</div>
                <div>Item Type</div>
                <div>Booking Number</div>
                <div>Vendor</div>
                <div>Address</div>
                <div>Phone Number</div>
                <div>Balance</div>
                <div>Actions</div>
              </div>

              <div className="flex flex-col divide-y divide-gray-100">
                {loading ? (
                  <TableSkeleton
                    rows={recordsPerPage}
                    cols={11}
                    className="lg:grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr]"
                  />
                ) : currentRecords.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 bg-white">
                    No sales invoices found.
                  </div>
                ) : (
                  currentRecords.map((invoice) => (
                    <div
                      key={invoice._id}
                      className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] items-center gap-4 px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                    >
                      <div className="text-gray-600">{invoice.invoiceId}</div>
                      <div className="text-gray-600">{invoice.invoiceDate}</div>
                      <div className="text-gray-600">{invoice.dcNo}</div>
                      <div className="text-gray-600">
                        {invoice.deliveryDate}
                      </div>
                      <div className="text-gray-600">
                        {invoice.medicineType}
                      </div>
                      <div className="text-gray-600">{invoice.bookingNo}</div>
                      <div className="text-gray-600">{invoice.vendor}</div>
                      <div className="text-gray-600">{invoice.address}</div>
                      <div className="text-gray-600">{invoice.phoneNo}</div>
                      <div className="text-gray-600">{invoice.balance}</div>
                      <div className="flex gap-3 justify-start">
                        <button
                          onClick={() => handleEditClick(invoice)}
                          className="py-1 text-sm rounded text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit"
                        >
                          <SquarePen size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(invoice._id)}
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
                {Math.min(indexOfLastRecord, invoices.length)} of{" "}
                {invoices.length} records
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
                  {editingInvoice
                    ? "Update Sales Invoice"
                    : "Add a New Sales Invoice"}
                </h2>
                <button
                  className="text-2xl text-gray-500 hover:text-gray-700"
                  onClick={resetForm}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 p-4 md:p-6">
                <div className="space-y-3 border p-4 pb-6 rounded-lg bg-gray-100">
                  <div className="flex gap-4">
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        Invoice No. <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={
                          editingInvoice ? invoiceId : `INV-${nextInvoiceId}`
                        }
                        readOnly
                        className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                          errors.invoiceId
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-newPrimary"
                        }`}
                        placeholder="Enter invoice no."
                        required
                      />
                      {errors.invoiceId && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.invoiceId}
                        </p>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        Invoice Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={invoiceDate}
                        onChange={(e) => setInvoiceDate(e.target.value)}
                        className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                          errors.invoiceDate
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-newPrimary"
                        }`}
                        required
                      />
                      {errors.invoiceDate && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.invoiceDate}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Booking No + DC No on same line */}
                  <div className="flex gap-4">
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        Booking No.
                      </label>
                      <select
                        value={bookingNo}
                        onChange={(e) => setBookingNo(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                      >
                        <option value="">Select Booking No.</option>
                        <option value="">BOOK No 001</option>
                      </select>
                    </div>

                    <div className="flex-1 dc-dropdown-container min-w-0 relative">
                      <label className="block text-gray-700 font-medium mb-2">
                        DC No. <span className="text-red-500">*</span>
                      </label>

                      {/* Main dropdown display */}
                      <div
                        onClick={() => setShowDcDropdown((prev) => !prev)}
                        className={`w-full p-3 border rounded-md bg-white cursor-pointer focus:outline-none ${
                          errors.dcNo ? "border-red-500" : "border-gray-300"
                        }`}
                      >
                        {selectedDcNos.length > 0
                          ? selectedDcNos.join(", ")
                          : "Select DC No."}
                      </div>

                      {/* Dropdown panel */}
                      {showDcDropdown && (
                        <div className="absolute z-10  w-full border border-gray-300 rounded-md bg-white shadow-md max-h-48 overflow-y-auto p-2">
                          {dcList?.map((dc) => (
                            <label
                              key={dc.dcNo}
                              className="flex items-center gap-2 mb-1"
                            >
                              <input
                                type="checkbox"
                                value={dc.dcNo}
                                checked={selectedDcNos.includes(dc.dcNo)}
                                onChange={(e) =>
                                  handleDcSelect(
                                    e.target.value,
                                    e.target.checked
                                  )
                                }
                                className="accent-newPrimary"
                              />
                              <span>{dc.dcNo}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {errors.dcNo && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.dcNo}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4"></div>
                  <div className="flex gap-4">
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        Customer
                      </label>
                      <input
                        type="text"
                        value={vendor}
                        readOnly
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                        placeholder="Customer"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        Phone No.
                      </label>
                      <input
                        type="text"
                        value={phoneNo}
                        readOnly
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                        placeholder="Phone number"
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        Delivery Date
                      </label>
                      <input
                        type="date"
                        value={deliveryDate}
                        readOnly
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                        placeholder="Delivery date"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        Address
                      </label>
                      <input
                        type="text"
                        value={address}
                        readOnly
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                        placeholder="Address"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="min-w-[50%]">
                      <label className="block text-gray-700 font-medium mb-2">
                        Balance
                      </label>
                      <input
                        type="number"
                        value={balance}
                        readOnly
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                        placeholder="Balance"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-700 mb-4">
                    Items
                  </h3>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Header */}
                    <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr] bg-gray-200 text-gray-600 text-sm font-semibold uppercase border-b border-gray-300">
                      <div className="px-4 py-2 border-r border-gray-300">
                        SR#.
                      </div>
                      <div className="px-4 py-2 border-r border-gray-300">
                        DC No
                      </div>
                      <div className="px-4 py-2 border-r border-gray-300">
                        Item
                      </div>

                      <div className="px-4 py-2 border-r border-gray-300">
                        Rate
                      </div>
                      <div className="px-4 py-2 border-r border-gray-300">
                        Qty
                      </div>
                      <div className="px-4 py-2">Total</div>
                    </div>

                    {/* Body */}
                    {items.length === 0 ? (
                      <div className="text-center py-4 text-gray-500 bg-white">
                        No items available for this DC No.
                      </div>
                    ) : (
                      items.map((item) => (
                        <div
                          key={item.srNo}
                          className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr] text-sm text-gray-700 bg-gray-100 even:bg-white border-t border-gray-300"
                        >
                          <div className="px-4 py-2 border-r border-gray-300 ">
                            {item.srNo}
                          </div>
                          <div className="px-4 py-2 border-r border-gray-300 ">
                            {item.DcNo}
                          </div>
                          <div className="px-4 py-2 border-r border-gray-300 ">
                            {item.item}
                          </div>

                          <div className="px-4 py-2 border-r border-gray-300 ">
                            <input
                              type="number"
                              value={item.rate}
                              onChange={(e) => {
                                const newRate = parseFloat(e.target.value) || 0;
                                setItems((prevItems) =>
                                  prevItems.map((it) =>
                                    it.srNo === item.srNo
                                      ? {
                                          ...it,
                                          rate: newRate,
                                          total: newRate * it.qty,
                                        }
                                      : it
                                  )
                                );
                              }}
                              className="w-20 p-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-newPrimary"
                            />
                          </div>

                          <div className="px-4 py-2 border-r border-gray-300 ">
                            {item.qty}
                          </div>
                          <div className="px-4 py-2 ">{item.total}</div>
                        </div>
                      ))
                    )}
                  </div>

                  {errors.items && (
                    <p className="text-red-500 text-xs mt-1">{errors.items}</p>
                  )}
                </div>

                <div className="flex gap-4 mt-4">
                  {/* Total Price */}
                  <div className="flex-1 min-w-0">
                    <label className="block text-gray-700 font-medium mb-2">
                      Total Price
                    </label>
                    <input
                      type="number"
                      value={totalPrice}
                      readOnly
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                      placeholder="Total price"
                    />
                  </div>

                  {/* Discount Amount */}
                  <div className="flex-1 min-w-0">
                    <label className="block text-gray-700 font-medium mb-2">
                      Discount Amount
                    </label>
                    <input
                      type="number"
                      value={discountAmount}
                      readOnly
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                      placeholder="Discount amount"
                    />
                  </div>

                  {/* NET Amount */}
                  <div className="flex-1 min-w-0">
                    <label className="block text-gray-700 font-medium mb-2">
                      NET Amount
                    </label>
                    <input
                      type="number"
                      value={netAmount}
                      readOnly
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                      placeholder="NET amount"
                    />
                  </div>
                </div>

                {/* Tax Section (replaces Sales Tax) */}

                <div className="mt-4 space-y-4">
                  {taxes.map((tax, index) => (
                    <div key={index} className="flex items-end gap-4">
                      {/* Tax Type */}
                      <div className="flex-1 min-w-0">
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                          Tax Type
                        </label>
                        <select
                          value={tax.type}
                          onChange={(e) =>
                            handleTaxChange(index, "type", e.target.value)
                          }
                          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                        >
                          <option value="">Select Tax Type</option>
                          <option value="GST">GST</option>
                          <option value="FED">FED</option>
                          <option value="Service Tax">Service Tax</option>
                        </select>
                      </div>

                      {/* Tax Value */}
                      <div className="flex-1 min-w-0">
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                          Value (%)
                        </label>
                        <input
                          type="number"
                          value={tax.value}
                          onChange={(e) =>
                            handleTaxChange(index, "value", e.target.value)
                          }
                          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                          placeholder="Enter value"
                        />
                      </div>

                      {/* Tax Amount (auto-calculated) */}
                      <div className="flex-1 min-w-0">
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                          Amount
                        </label>
                        <input
                          type="number"
                          value={tax.amount}
                          readOnly
                          className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 focus:outline-none"
                          placeholder="Auto"
                        />
                      </div>

                      {/* Add Button */}
                      {index === taxes.length - 1 && (
                        <button
                          type="button"
                          onClick={handleAddTax}
                          className="flex items-center justify-center w-10 h-10 mb-[2px] bg-newPrimary text-white rounded-md hover:bg-newPrimary/90 transition"
                        >
                          +
                        </button>
                      )}
                    </div>
                  ))}

                  {/* Show total tax only if multiple taxes */}
                  {taxes.length > 1 && (
                    <div className="flex justify-end mr-20">
                      <div className="text-right mt-2">
                        <p className="font-medium text-md text-gray-700">
                          Total Tax Amount:{" "}
                          <span className="text-newPrimary font-semibold">
                            {taxes
                              .reduce(
                                (sum, t) => sum + (parseFloat(t.amount) || 0),
                                0
                              )
                              .toFixed(2)}
                          </span>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Summary Section */}
                  <div className="  flex justify-end mr-20">
                    <div className=" space-y-1 text-right">
                      <div>
                        <p className="font-medium text-lg text-gray-700">
                          Net Pay:{" "}
                          <span className="text-newPrimary font-semibold">
                            {parseFloat(netAmount || 0).toFixed(2)}
                          </span>
                        </p>
                      </div>

                      <div>
                        <p className="font-medium text-lg text-gray-700">
                          Total Tax Included:{" "}
                          <span className="text-newPrimary font-semibold">
                            {taxes
                              .reduce(
                                (sum, t) => sum + (parseFloat(t.amount) || 0),
                                0
                              )
                              .toFixed(2)}
                          </span>
                        </p>
                      </div>

                      <div>
                        <p className="font-medium text-lg text-gray-700">
                          Total Payable:{" "}
                          <span className="text-newPrimary font-semibold">
                            {(
                              parseFloat(netAmount || 0) +
                              taxes.reduce(
                                (sum, t) => sum + (parseFloat(t.amount) || 0),
                                0
                              )
                            ).toFixed(2)}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-newPrimary text-white px-4 py-3 rounded-lg hover:bg-newPrimary/80 transition-colors disabled:bg-blue-300"
                >
                  {loading
                    ? "Saving..."
                    : editingInvoice
                    ? "Update Sales Invoice"
                    : "Save Sales Invoice"}
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

export default FbrSalesInvoices;
