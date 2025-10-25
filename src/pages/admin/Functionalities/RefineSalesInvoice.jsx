import React, { useState, useEffect, useRef, useCallback } from "react";
import { Download, SquarePen, Trash2 } from "lucide-react";
import CommanHeader from "../../../components/CommanHeader";
import TableSkeleton from "../Skeleton";
import Swal from "sweetalert2";
import { api } from "../../../context/ApiService";
import toast from "react-hot-toast";
import { InvoiceTemplate } from "./InvoiceTemplate";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const RefineSalesInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [product, setProduct] = useState("");
  const [rate, setRate] = useState("");
  const [qty, setQty] = useState("");
  const [inStock, setInStock] = useState("");
  const [total, setTotal] = useState("");
  const [specification, setSpecification] = useState("");
  const [productList, setProductList] = useState([]);

  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [invoiceId, setInvoiceId] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [dcNo, setDcNo] = useState([]);
  const [taxOptions, setTaxOptions] = useState([]);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [medicineType, setMedicineType] = useState("");
  const [bookingNo, setBookingNo] = useState("");
  const invoiceRef = useRef(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [orderDate, setOrderDate] = useState("");
  const [customer, setCustomer] = useState("");
  const [customerList, setCustomerList] = useState("");
  const [selectedDcNos, setSelectedDcNos] = useState([]);
  const [showDcDropdown, setShowDcDropdown] = useState(false);
  const [taxes, setTaxes] = useState([{ type: "", value: "", amount: "" }]);
  const [address, setAddress] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [balance, setBalance] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const [errors, setErrors] = useState({});
  const [bookingOrders, setBookingOrders] = useState([]);
  const [items, setItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [discountAmount, setDiscountAmount] = useState("");
  const [salesTax, setSalesTax] = useState(false);

  const [netAmount, setNetAmount] = useState("");
  const [dcList, setDcList] = useState([]);
  const [nextInvoiceId, setNextInvoiceId] = useState("003");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const sliderRef = useRef(null);
  const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};

  const handleAddItem = () => {
    // Simple validation
    if (!product || !qty) {
      toast.error("Please select a product and enter quantity");
      return;
    }

    // Optional: compute total
    const totalValue = parseFloat(rate || 0) * parseFloat(qty || 0);

    // Add new product item to table
    const newItem = {
      srNo: items.length + 1,
      item: productList.find((p) => p._id === product)?.itemName || "Unknown",
      rate: parseFloat(rate) || 0,
      qty: parseFloat(qty) || 0,
      total: totalValue,
      specification: specification || "",
      inStock: inStock || "N/A",
    };

    setItems((prev) => [...prev, newItem]);

    // Reset product input fields
    setProduct("");
    setRate("");
    setQty("");
    setInStock("");
    setSpecification("");
    setTotal("");
  };

  // ✅ Fetch Product List
  const fetchProductList = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/item-details/booking-products");
      setProductList(response);
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setTimeout(() => setLoading(false), 2000);
    }
  }, []);

  useEffect(() => {
    fetchProductList();
  }, [fetchProductList]);

  // ✅ Auto-fill product details when selected
  useEffect(() => {
    if (product && productList.length > 0) {
      const selectedProduct = productList.find((p) => p._id === product);
      if (selectedProduct) {
        setRate(selectedProduct.price || "");
        setInStock(selectedProduct.stock || "");
        setTotal(
          qty ? parseFloat(qty) * parseFloat(selectedProduct.price || 0) : ""
        );
      }
    }
  }, [product, qty, productList]);

  // ✅ Fetch Product List
  const fetchCustomerList = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/customers/booking-customer");
      setCustomerList(response);
    } catch (error) {
      console.error("Failed to fetch customer", error);
    } finally {
      setTimeout(() => setLoading(false), 2000);
    }
  }, []);

  useEffect(() => {
    fetchCustomerList();
  }, [fetchCustomerList]);

  // ✅ Auto-fill customer details when customer is selected
  useEffect(() => {
    if (customer && Array.isArray(customerList) && customerList.length > 0) {
      const selectedCustomer = customerList.find(
        (c) => c.customerName === customer
      );
      if (selectedCustomer) {
        setAddress(selectedCustomer.address || "");
        setPhoneNo(selectedCustomer.phoneNumber || "");
        setBalance(selectedCustomer.balance?.toString() || "0");
      } else {
        setAddress("");
        setPhoneNo("");
        setBalance("");
      }
    }
  }, [customer, customerList]);

  // Simulate fetching invoices
  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/sales-invoice");
      setInvoices(response.data);
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

  const fetchTaxes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/taxes");
      setTaxOptions(response || []); // ✅ store options here
      console.log("Fetched taxes:", response.data);
    } catch (error) {
      console.error("Failed to fetch booking orders", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  }, []);

  useEffect(() => {
    fetchTaxes();
  }, [fetchTaxes]);

  // fetch Dc Number
  const fetchDcNO = useCallback(async (orderId) => {
    if (!orderId) return;
    try {
      // 🧹 clear before fetching
      setSelectedDcNos([]);
      setCustomer("");
      setAddress("");
      setPhoneNo("");
      setBalance("");
      setDeliveryDate("");
      setItems([]);
      setDcList([]);

      setLoading(true);
      const response = await api.get(`/delivery-challan/DC-Order/${orderId}`);
      setDcList(response.data);
    } catch (error) {
      console.error("Failed to fetch DC numbers", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedOrderId) {
      fetchDcNO(selectedOrderId);
    }
  }, [selectedOrderId, fetchDcNO, isSliderOpen]);

  // Invoice search
  // 🔍 Sales Invoice Search (same logic as Delivery Challan search)
  useEffect(() => {
    if (searchTerm.trim() === "") {
      fetchInvoices(); // only when cleared
      return;
    }

    const delayDebounce = setTimeout(() => {
      setLoading(true);
      const filtered = invoices.filter((inv) =>
        inv?.invoiceNo?.toUpperCase().includes(searchTerm.toUpperCase())
      );
      setInvoices(filtered);
      setLoading(false);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, fetchInvoices]);

  // Generate next invoice ID

  // Generate next Invoice ID
  useEffect(() => {
    if (invoices.length > 0) {
      const maxNo = Math.max(
        ...invoices.map((inv) => {
          const match = inv.invoiceNo?.match(/INV-(\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        })
      );
      setNextInvoiceId((maxNo + 1).toString().padStart(3, "0"));
    } else {
      setNextInvoiceId("001");
    }
  }, [invoices]);

  // Handle DC No. selection

  // Calculate totals
  useEffect(() => {
    const calculatedTotal = items.reduce((sum, item) => sum + item.total, 0);
    setTotalPrice(calculatedTotal);

    const discount =
      discountPercentage !== ""
        ? (calculatedTotal * parseFloat(discountPercentage)) / 100
        : parseFloat(discountAmount) || 0;

    const taxAmount = salesTax ? calculatedTotal * 0.035 : 0;
    const net = calculatedTotal - discount + taxAmount;
    setNetAmount(net.toFixed(2));
  }, [items, discountPercentage, discountAmount, salesTax]);

  // Reset form fields
  const resetForm = () => {
    setInvoiceId("");
    setInvoiceDate("");
    setDcNo("");
    setSelectedDcNos([]);
    setDeliveryDate("");
    setMedicineType("");
    setBookingNo("");
    setOrderDate("");
    setCustomer("");
    setAddress("");
    setPhoneNo("");
    setBalance("");
    setItems([]);
    setTotalPrice(0);
    setDiscountPercentage("");
    setDiscountAmount("");
    setSalesTax(false);
    setDcList([]);
    setNetAmount("");
    setEditingInvoice(null);
    setErrors({});
    setTaxes([{ type: "", value: "", amount: "" }]); // ✅ ADD THIS LINE
    setIsSliderOpen(false);
  };

  // Validate form fields
 const validateForm = () => {
  const newErrors = {};

  if (!invoiceDate?.trim()) newErrors.invoiceDate = "Invoice Date is required";
  if (!customer?.trim()) newErrors.customer = "Customer is required";
  if (items.length === 0) newErrors.items = "At least one item is required";
  if (!totalPrice || totalPrice <= 0) newErrors.totalPrice = "Total price must be greater than zero";

  // Optional validations for clarity
  if (taxes.some(t => !t.type)) newErrors.taxType = "Please select all tax types";
  if (taxes.some(t => t.type && (!t.value || isNaN(t.value)))) newErrors.taxValue = "Tax value must be numeric";

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};


  // Handlers for form and table actions
  const handleAddInvoice = () => {
    resetForm();
    setIsSliderOpen(true);
    setInvoiceDate(new Date().toLocaleDateString("en-CA"));
  };

  const handleEditClick = (invoice) => {
    console.log({ invoice });

    setEditingInvoice(invoice);

    // ✅ Core invoice info
    setInvoiceId(invoice.invoiceNo || "");
    setInvoiceDate(invoice.invoiceDate?.split("T")[0] || "");

    // ✅ Booking order details
    setSelectedOrderId(invoice.bookingOrder?._id || null);
    setBookingNo(invoice.bookingOrder?.orderNo || "");
    setDeliveryDate(
      invoice.bookingOrder?.deliveryDate
        ? invoice.bookingOrder.deliveryDate.split("T")[0]
        : ""
    );

    // ✅ Customer info
    const customer = invoice.bookingOrder?.customer || {};
    setCustomer(customer.customerName || "");
    setAddress(customer.address || "");
    setPhoneNo(customer.phoneNumber || "");
    setBalance(customer.balance?.toString() || "0");

    // ✅ Delivery Challan info
    setSelectedDcNos(
      invoice.deliveryChallan ? [invoice.deliveryChallan.dcNo] : []
    );

    // ✅ Product items
    setItems(
      invoice.products?.map((p, index) => ({
        srNo: index + 1,
        DcNo: invoice.deliveryChallan?.dcNo || "",
        item: p.name,
        rate: p.rate,
        qty: p.qty,
        total: p.total,
      })) || []
    );

    // ✅ Total calculations
    setTotalPrice(invoice.totalAmount || 0);
    setDiscountPercentage(invoice.discountPercentage?.toString() || "");
    setDiscountAmount(invoice.discountAmount?.toString() || "");
    setSalesTax(invoice.salesTax || false);
    setNetAmount(invoice.netAmount?.toString() || "");

    // ✅ Reset errors and open form
    setErrors({});
    setIsSliderOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

   const newInvoice = {
  invoiceNo: editingInvoice ? invoiceId : `INV-${nextInvoiceId}`,
  invoiceDate: invoiceDate.trim(),

  // ✅ Directly include customer ObjectId
  customer: customerList.find((c) => c.customerName === customer)?._id || null,

  // ✅ Product list
  products: items.map((item) => ({
    name: item.item,
    rate: Number(item.rate),
    qty: Number(item.qty),
    total: Number(item.total),
  })),

  // ✅ Tax IDs
  taxTypes: taxOptions
    .filter((opt) => taxes.some((t) => t.type === opt.taxName))
    .map((opt) => opt._id),

  // ✅ Total Amount
  totalAmount:
    parseInt(totalPrice || 0) -
    parseInt(discountAmount || 0) +
    taxes.reduce((sum, t) => sum + (parseInt(t.amount) || 0), 0),
};

    console.log({ newInvoice });
  

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
        try {
          await api.post("/sales-invoice", newInvoice, {
            headers: {
              Authorization: `Bearer ${userInfo?.token}`,
            },
          });
        } catch (error) {
          toast.error(error.response.data.message);
        }
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
            await api.delete(`/sales-invoice/${id}`, {
              headers: {
                Authorization: `Bearer ${userInfo?.token}`,
              },
            });
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
    setSelectedDcNos((prev) => {
      const updated = isChecked
        ? [...prev, dcNo]
        : prev.filter((item) => item !== dcNo);

      // Filter selected DC objects
      const selectedDCs = dcList.filter((dc) => updated.includes(dc.dcNo));

      if (selectedDCs.length > 0) {
        const firstCustomer = selectedDCs[0].bookingOrder?.customer || {};

        setCustomer(firstCustomer.customerName || "");
        setAddress(firstCustomer.address || "");
        setPhoneNo(firstCustomer.phoneNumber || "");
        setBalance(firstCustomer.balance?.toString() || "0");

        const combinedItems = selectedDCs.flatMap((dc, index) =>
          dc.products.map((p, i) => ({
            srNo: index * 100 + i + 1,
            DcNo: dc.dcNo,
            item: p.name,
            rate: p.rate || 0,
            qty: p.qty,
            total: p.total || p.qty * (p.invoiceRate || 0),
          }))
        );

        setItems(combinedItems);
        setDeliveryDate(
          selectedDCs[0]?.bookingOrder?.deliveryDate
            ? selectedDCs[0].bookingOrder.deliveryDate.split("T")[0]
            : ""
        );
      } else {
        setCustomer("");
        setAddress("");
        setPhoneNo("");
        setBalance("");
        setDeliveryDate("");
        setItems([]);
      }

      // ✅ ADD THIS LINE HERE:
      if (isChecked) setShowDcDropdown(false);

      return updated;
    });
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

  async function handleDownlode(invoice) {
    // Store selected invoice for rendering
    setSelectedInvoice(invoice);

    // Wait a bit to ensure the hidden invoice template is rendered
    setTimeout(async () => {
      if (!invoiceRef.current) return;

      try {
        // Capture the invoice as an image
        const canvas = await html2canvas(invoiceRef.current, {
          scale: 2, // Higher scale = sharper PDF
          useCORS: true, // Allow external images (like logos)
          scrollX: 0,
          scrollY: 0,
        });

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        // Add image to PDF
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

        // Save file with invoice number as name
        pdf.save(
          `${invoice.customer?.customerName || "Customer"}-${
            invoice.invoiceNo || "Invoice"
          }.pdf`
        );

        toast.success(`Invoice ${invoice.invoiceNo} downloaded successfully!`);
      } catch (error) {
        console.error("Error generating PDF:", error);
        toast.error("Failed to generate invoice PDF.");
      }
    }, 400); // Wait a short delay for DOM render
  }
  console.log({ currentRecords });

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
              <div className="hidden lg:grid grid-cols-[0.4fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200">
                <div>SR</div>
                <div>Invoice No.</div>
                <div>Invoice Date</div>
                <div>Customer</div>
                <div>Phone No</div>
                <div>Balance</div>
                <div>Tax</div>
                <div>Total Amount</div>
                <div>Actions</div>
              </div>

              <div className="flex flex-col divide-y divide-gray-100">
                {loading ? (
                  <TableSkeleton
                    rows={currentRecords.length || 5}
                    cols={9}
                    className="lg:grid-cols-[0.4fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr]"
                  />
                ) : currentRecords.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 bg-white">
                    No sales invoices found.
                  </div>
                ) : (
                  currentRecords.map((invoice, index) => (
                    <div
                      key={invoice._id}
                      className="grid grid-cols-1 lg:grid-cols-[0.4fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] items-center gap-4 px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                    >
                      <div className="text-gray-600">
                        {indexOfFirstRecord + index + 1}
                      </div>
                      <div className="text-gray-600">{invoice.invoiceNo}</div>
                      <div className="text-gray-600">
                        {new Date(invoice.invoiceDate).toLocaleDateString()}
                      </div>
                      <div className="text-gray-600">
                        {invoice.customer?.customerName || "-"}
                      </div>
                      <div className="text-gray-600">
                        {invoice.customer?.phoneNumber || "-"}
                      </div>
                      <div className="text-gray-600">
                        {invoice.customer?.balance || "-"}
                      </div>
                      <div className="text-gray-600">
                        {invoice.taxTypes?.length
                          ? invoice.taxTypes
                              .map((tax) => tax.taxName)
                              .join(", ")
                          : "-"}
                      </div>

                      <div className="text-gray-600">
                        {invoice?.totalAmount || "-"}
                      </div>
                      <div className="flex gap-3 justify-start">
                        <button
                          onClick={() => handleDownlode(invoice)}
                          className="py-1 text-sm rounded text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit"
                        >
                          <Download size={18} />
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

                  <div className="flex gap-4"></div>
                  <div className="flex gap-4">
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        Customer
                      </label>
                      <select
                        value={customer}
                        onChange={(e) => setCustomer(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                      >
                        <option value="">Select Customer</option>
                        {customerList.map((cust) => (
                          <option key={cust._id} value={cust.customerName}>
                            {cust.customerName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        Phone No.
                      </label>
                      <input
                        type="text"
                        value={phoneNo}
                        readOnly
                        disabled
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                        placeholder="Phone number"
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        Balance
                      </label>
                      <input
                        type="number"
                        value={balance}
                        readOnly
                        disabled
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                        placeholder="Balance"
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
                        disabled
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                        placeholder="Address"
                      />
                    </div>
                  </div>
                </div>

                {/* Product Add Section — copied from Booking Order */}
                <div className="border p-4 rounded-lg space-y-4">
                  {/* Line 1: Product, Rate, Qty, Total */}
                  <div className="flex gap-4">
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        Product
                      </label>
                      <select
                        value={product}
                        onChange={(e) => setProduct(e.target.value)}
                        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                      >
                        <option value="">Select Product</option>
                        {productList.map((prod) => (
                          <option key={prod._id} value={prod._id}>
                            {prod.itemName}
                          </option>
                        ))}
                      </select>

                      {errors.product && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.product}
                        </p>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        Rate
                      </label>
                      <input
                        type="text"
                        value={rate}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (/^\d*\.?\d*$/.test(val)) setRate(val); // only numbers and optional dot
                        }}
                        className="w-full p-3 border border-gray-300 rounded-md"
                        placeholder="Rate"
                        inputMode="numeric"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        Qty
                      </label>
                      <input
                        type="number"
                        value={qty}
                        onChange={(e) => setQty(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md "
                        placeholder="Qty"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        Total
                      </label>
                      <input
                        type="text"
                        value={total}
                        readOnly
                        className="w-full p-3 border border-gray-300 rounded-md bg-gray-100"
                        placeholder="Total"
                      />
                    </div>
                  </div>

                  {/* Line 2: In Stock, Specification, Add Button */}
                  <div className="flex gap-4 items-end">
                    <div className="w-[150px]">
                      <label className="block text-gray-700 font-medium mb-2">
                        In Stock
                      </label>
                      <input
                        type="text"
                        value={inStock}
                        readOnly
                        className="w-full p-3 border border-gray-300 rounded-md bg-gray-100"
                        placeholder="In Stock"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        Specifications
                      </label>
                      <input
                        type="text"
                        value={specification}
                        onChange={(e) => setSpecification(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md"
                        placeholder="Specifications"
                      />
                    </div>

                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={handleAddItem}
                        className="w-24 h-12 bg-newPrimary text-white rounded-lg hover:bg-newPrimary/80 transition flex justify-center items-center gap-2"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                </div>
                {/* Items Table */}
                {items.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-700 mb-4">
                      Items
                    </h3>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="grid grid-cols-[60px_1fr_1fr_1fr_1fr_2fr] bg-gray-200 text-gray-600 text-sm font-semibold uppercase border-b border-gray-300">
                        <div className="px-4 py-2 border-r border-gray-300">
                          SR#
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
                        <div className="px-4 py-2 border-r border-gray-300">
                          Total
                        </div>
                        <div className="px-4 py-2">Specification</div>
                      </div>

                      {items.length > 0 ? (
                        items.map((item, index) => (
                          <div
                            key={index}
                            className="grid grid-cols-[60px_1fr_1fr_1fr_1fr_2fr] border-b text-sm"
                          >
                            <div className="px-4 py-2 border-r border-gray-200">
                              {index + 1}
                            </div>
                            <div className="px-4 py-2 border-r border-gray-200">
                              {item.item}
                            </div>
                            <div className="px-4 py-2 border-r border-gray-200">
                              {item.rate}
                            </div>
                            <div className="px-4 py-2 border-r border-gray-200">
                              {item.qty}
                            </div>
                            <div className="px-4 py-2 border-r border-gray-200">
                              {item.total}
                            </div>
                            <div className="px-4 py-2">
                              {item.specification}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-gray-500 py-3">
                          No items added yet.
                        </div>
                      )}
                    </div>
                  </div>
                )}

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
                      onChange={(e) => setDiscountAmount(e.target.value)}
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
                          onChange={(e) => {
                            const selectedTax = taxOptions.find(
                              (t) => t.taxName === e.target.value
                            );
                            handleTaxChange(index, "type", e.target.value);

                            // ✅ Only set value when user actually selects something
                            if (selectedTax && e.target.value !== "") {
                              handleTaxChange(
                                index,
                                "value",
                                selectedTax.value
                              );
                            }
                          }}
                          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                        >
                          <option value="">Select Tax Type</option>
                          {taxOptions.map((opt) => (
                            <option key={opt._id} value={opt.taxName}>
                              {opt.taxName}
                            </option>
                          ))}
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
                          readOnly
                          onChange={(e) =>
                            handleTaxChange(index, "value", e.target.value)
                          }
                          className="w-full p-3 border bg-gray-50 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
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
                            {taxes.reduce(
                              (sum, t) => sum + (parseFloat(t.amount) || 0),
                              0
                            )}
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
                            {parseFloat(netAmount || 0)}
                          </span>
                        </p>
                      </div>

                      <div>
                        <p className="font-medium text-lg text-gray-700">
                          Total Tax Included:{" "}
                          <span className="text-newPrimary font-semibold">
                            {taxes.reduce(
                              (sum, t) => sum + (parseFloat(t.amount) || 0),
                              0
                            )}
                          </span>
                        </p>
                      </div>

                      <div>
                        <p className="font-medium text-lg text-gray-700">
                          Total Payable:{" "}
                          <span className="text-newPrimary font-semibold">
                            {parseFloat(netAmount || 0) +
                              taxes.reduce(
                                (sum, t) => sum + (parseFloat(t.amount) || 0),
                                0
                              )}
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
          .dc-dropdown-container {
            position: relative;
            z-index: 1;
          }

          .dc-dropdown-container .absolute {
            top: 100%;
            left: 0;
            margin-top: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #718096;
          }
        `}</style>
      </div>
      {/* Hidden Invoice Template for Download */}
      <div style={{ position: "absolute", left: "-9999px", top: "0" }}>
        <InvoiceTemplate ref={invoiceRef} invoice={selectedInvoice} />
      </div>
    </div>
  );
};

export default RefineSalesInvoices;
