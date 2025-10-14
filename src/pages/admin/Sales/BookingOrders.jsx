import React, { useState, useEffect, useRef, useCallback } from "react";
import { SquarePen, Trash2, X } from "lucide-react";
import CommanHeader from "../../../components/CommanHeader";
import TableSkeleton from "../Skeleton";
import Swal from "sweetalert2";

const BookingOrders = () => {
  const [bookingOrders, setBookingOrders] = useState([
    {
      _id: "1",
      orderNo: "ORD-001",
      orderDate: "2025-10-01",
      customer: "cust1",
      person: "John Doe",
      phone: "123-456-7890",
      address: "123 Tech St",
      balance: 500,
      deliveryAddress: "456 Delivery Rd",
      orderType: "Standard",
      deliveryDate: "2025-10-05",
      mode: "Delivery",
      paymentMethod: "Cash",
      items: [
        {
          product: "prod1",
          specification: "15-inch, 16GB RAM",
          weight: 2.5,
          packing: "Box",
          inStock: 10,
          qty: 2,
          rate: 1000,
          total: 2000,
        },
      ],
      totalWeight: 2.5,
      totalAmount: 2000,
      remarks: "Urgent delivery",
    },
    {
      _id: "2",
      orderNo: "ORD-002",
      orderDate: "2025-10-02",
      customer: "cust2",
      person: "Jane Smith",
      phone: "987-654-3210",
      address: "789 Retail Ave",
      balance: 200,
      deliveryAddress: "321 Pickup St",
      orderType: "Express",
      deliveryDate: "2025-10-06",
      mode: "Pickup",
      paymentMethod: "Online",
      items: [
        {
          product: "prod2",
          specification: "Wireless",
          weight: 0.2,
          packing: "Plastic",
          inStock: 50,
          qty: 5,
          rate: 20,
          total: 100,
        },
      ],
      totalWeight: 0.2,
      totalAmount: 100,
      remarks: "Handle with care",
    },
  ]);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [orderNo, setOrderNo] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [customer, setCustomer] = useState("");
  const [person, setPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [orderType, setOrderType] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [mode, setMode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [product, setProduct] = useState("");
  const [rate, setRate] = useState("");
  const [weight, setWeight] = useState("");
  const [packing, setPacking] = useState("");
  const [inStock, setInStock] = useState("");
  const [total, setTotal] = useState("");
  const [specification, setSpecification] = useState("");
  const [itemsList, setItemsList] = useState([]);
  const [totalWeight, setTotalWeight] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [remarks, setRemarks] = useState("");
  const [editingOrder, setEditingOrder] = useState(null);
  const [errors, setErrors] = useState({});
  const [customerList, setCustomerList] = useState([
    { _id: "cust1", customerName: "Tech Corp", contactPerson: "John Doe", phone: "123-456-7890", address: "123 Tech St", balance: 500 },
    { _id: "cust2", customerName: "Retail Inc", contactPerson: "Jane Smith", phone: "987-654-3210", address: "789 Retail Ave", balance: 200 },
    { _id: "cust3", customerName: "Global Traders", contactPerson: "Alice Brown", phone: "555-123-4567", address: "456 Global Rd", balance: 1000 },
  ]);
  const [productList, setProductList] = useState([
    { _id: "prod1", productName: "Laptop", rate: 1000, weight: 2.5, packing: "Box", inStock: 10, total: 1000, specification: "15-inch, 16GB RAM" },
    { _id: "prod2", productName: "Mouse", rate: 20, weight: 0.2, packing: "Plastic", inStock: 50, total: 20, specification: "Wireless" },
    { _id: "prod3", productName: "Keyboard", rate: 50, weight: 0.8, packing: "Box", inStock: 30, total: 50, specification: "Mechanical" },
  ]);
  const [nextOrderNo, setNextOrderNo] = useState("003");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const sliderRef = useRef(null);
  const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};

  const fetchBookingOrders = useCallback(async () => {
    try {
      setLoading(true);
      // Static data already set in state
    } catch (error) {
      console.error("Failed to fetch booking orders", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  }, []);

  useEffect(() => {
    fetchBookingOrders();
  }, [fetchBookingOrders]);

  useEffect(() => {
    if (searchTerm && !searchTerm.startsWith("ORD-")) {
      fetchBookingOrders();
      return;
    }

    const delayDebounce = setTimeout(() => {
      try {
        setLoading(true);
        const filtered = bookingOrders.filter((order) =>
          order.orderNo.toUpperCase().includes(searchTerm.toUpperCase())
        );
        setBookingOrders(filtered);
      } catch (error) {
        console.error("Search booking order failed:", error);
        setBookingOrders([]);
      } finally {
        setLoading(false);
      }
    }, 1000);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, fetchBookingOrders, bookingOrders]);

  useEffect(() => {
    if (bookingOrders.length > 0) {
      const maxNo = Math.max(
        ...bookingOrders.map((o) => {
          const match = o.orderNo?.match(/ORD-(\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        })
      );
      setNextOrderNo((maxNo + 1).toString().padStart(3, "0"));
    } else {
      setNextOrderNo("001");
    }
  }, [bookingOrders]);

  useEffect(() => {
    if (customer && customerList.length > 0) {
      const selectedCustomer = customerList.find((c) => c._id === customer);
      if (selectedCustomer) {
        setPerson(selectedCustomer.contactPerson || "");
        setPhone(selectedCustomer.phone || "");
        setAddress(selectedCustomer.address || "");
        setBalance(selectedCustomer.balance || "");
      }
    }
  }, [customer, customerList]);

  useEffect(() => {
    if (product && productList.length > 0) {
      const selectedProduct = productList.find((p) => p._id === product);
      if (selectedProduct) {
        setRate(selectedProduct.rate || "");
        setWeight(selectedProduct.weight || "");
        setPacking(selectedProduct.packing || "");
        setInStock(selectedProduct.inStock || "");
        setTotal(selectedProduct.total || "");
        setSpecification(selectedProduct.specification || "");
      }
    }
  }, [product, productList]);

  const calculateTotals = () => {
    const weightSum = itemsList.reduce((sum, item) => sum + parseFloat(item.weight || 0), 0);
    const amountSum = itemsList.reduce((sum, item) => sum + parseFloat(item.total || 0), 0);
    setTotalWeight(weightSum.toFixed(2));
    setTotalAmount(amountSum.toFixed(2));
  };

  useEffect(() => {
    calculateTotals();
  }, [itemsList]);

  const handleAddItem = () => {
    if (!product || !rate || !weight || !packing || !inStock || !total || !specification) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please select a product to add.",
        confirmButtonColor: "#d33",
      });
      return;
    }

    const newItem = {
      product,
      rate: parseFloat(rate),
      weight: parseFloat(weight),
      packing,
      inStock,
      total: parseFloat(total),
      specification,
      qty: 1,
    };

    setItemsList([...itemsList, newItem]);
    setProduct("");
    setRate("");
    setWeight("");
    setPacking("");
    setInStock("");
    setTotal("");
    setSpecification("");
  };

  const handleRemoveItem = (index) => {
    setItemsList(itemsList.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setOrderNo("");
    setOrderDate("");
    setCustomer("");
    setPerson("");
    setPhone("");
    setAddress("");
    setBalance("");
    setDeliveryAddress("");
    setOrderType("");
    setDeliveryDate("");
    setMode("");
    setPaymentMethod("");
    setProduct("");
    setRate("");
    setWeight("");
    setPacking("");
    setInStock("");
    setTotal("");
    setSpecification("");
    setItemsList([]);
    setTotalWeight(0);
    setTotalAmount(0);
    setRemarks("");
    setEditingOrder(null);
    setErrors({});
    setIsSliderOpen(false);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!orderNo && !editingOrder) newErrors.orderNo = "Order No is required";
    if (!orderDate) newErrors.orderDate = "Order Date is required";
    if (!customer) newErrors.customer = "Customer is required";
    if (!deliveryAddress) newErrors.deliveryAddress = "Delivery Address is required";
    if (!orderType) newErrors.orderType = "Order Type is required";
    if (!deliveryDate) newErrors.deliveryDate = "Delivery Date is required";
    if (!mode) newErrors.mode = "Mode is required";
    if (!paymentMethod) newErrors.paymentMethod = "Payment Method is required";
    if (itemsList.length === 0) newErrors.items = "At least one item is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddBookingOrder = () => {
    resetForm();
    setIsSliderOpen(true);
  };

  const handleEditClick = (order) => {
    setEditingOrder(order);
    setOrderNo(order.orderNo || "");
    setOrderDate(order.orderDate || "");
    setCustomer(order.customer || "");
    setPerson(order.person || "");
    setPhone(order.phone || "");
    setAddress(order.address || "");
    setBalance(order.balance || "");
    setDeliveryAddress(order.deliveryAddress || "");
    setOrderType(order.orderType || "");
    setDeliveryDate(order.deliveryDate || "");
    setMode(order.mode || "");
    setPaymentMethod(order.paymentMethod || "");
    setItemsList(order.items || []);
    setTotalWeight(order.totalWeight || 0);
    setTotalAmount(order.totalAmount || 0);
    setRemarks(order.remarks || "");
    setErrors({});
    setIsSliderOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const newOrder = {
      orderNo: editingOrder ? orderNo : `ORD-${nextOrderNo}`,
      orderDate,
      customer,
      person,
      phone,
      address,
      balance,
      deliveryAddress,
      orderType,
      deliveryDate,
      mode,
      paymentMethod,
      items: itemsList,
      totalWeight: parseFloat(totalWeight),
      totalAmount: parseFloat(totalAmount),
      remarks,
    };

    try {
      if (editingOrder) {
        setBookingOrders((prev) =>
          prev.map((o) => (o._id === editingOrder._id ? { ...o, ...newOrder, _id: o._id } : o))
        );
        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Booking Order updated successfully.",
          confirmButtonColor: "#3085d6",
        });
      } else {
        setBookingOrders((prev) => [...prev, { ...newOrder, _id: `temp-${Date.now()}` }]);
        Swal.fire({
          icon: "success",
          title: "Added!",
          text: "Booking Order added successfully.",
          confirmButtonColor: "#3085d6",
        });
      }
      fetchBookingOrders();
      resetForm();
    } catch (error) {
      console.error("Error saving booking order:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to save booking order.",
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
            setBookingOrders((prev) => prev.filter((o) => o._id !== id));
            swalWithTailwindButtons.fire(
              "Deleted!",
              "Booking Order deleted successfully.",
              "success"
            );
          } catch (error) {
            console.error("Delete error:", error);
            swalWithTailwindButtons.fire(
              "Error!",
              "Failed to delete booking order.",
              "error"
            );
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire(
            "Cancelled",
            "Booking Order is safe 🙂",
            "error"
          );
        }
      });
  };

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = bookingOrders.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(bookingOrders.length / recordsPerPage);

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
              Booking Order Details
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Enter Order No eg: ORD-001"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 w-[250px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-newPrimary"
            />
            <button
              className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/80"
              onClick={handleAddBookingOrder}
            >
              + Add Booking Order
            </button>
          </div>
        </div>

        <div className="rounded-xl shadow border border-gray-200 overflow-hidden">
          <div className="overflow-y-auto lg:overflow-x-auto max-h-[900px]">
            <div className="min-w-[1400px]">
              <div className="hidden lg:grid grid-cols-[150px,200px,150px,150px,150px,150px,100px] gap-4 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200">
                <div>Order No</div>
                <div>Customer</div>
                <div>Order Date</div>
                <div>Delivery Date</div>
                <div>Order Type</div>
                <div>Payment Method</div>
                <div>Actions</div>
              </div>

              <div className="flex flex-col divide-y divide-gray-100">
                {loading ? (
                  <TableSkeleton
                    rows={recordsPerPage}
                    cols={7}
                    className="lg:grid-cols-[150px,200px,150px,150px,150px,150px,100px]"
                  />
                ) : currentRecords.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 bg-white">
                    No booking orders found.
                  </div>
                ) : (
                  currentRecords.map((order) => (
                    <div
                      key={order._id}
                      className="grid grid-cols-1 lg:grid-cols-[150px,200px,150px,150px,150px,150px,100px] items-center gap-4 px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                    >
                      <div className="text-gray-600">{order.orderNo}</div>
                      <div className="text-gray-600">
                        {customerList.find((c) => c._id === order.customer)?.customerName || "N/A"}
                      </div>
                      <div className="text-gray-600">{order.orderDate}</div>
                      <div className="text-gray-600">{order.deliveryDate}</div>
                      <div className="text-gray-600">{order.orderType}</div>
                      <div className="text-gray-600">{order.paymentMethod}</div>
                      <div className="flex gap-3 justify-start">
                        <button
                          onClick={() => handleEditClick(order)}
                          className="py-1 text-sm rounded text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit"
                        >
                          <SquarePen size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(order._id)}
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

          {totalPages > 1 && (
            <div className="flex justify-between my-4 px-10">
              <div className="text-sm text-gray-600">
                Showing {indexOfLastRecord + 1} to{" "}
                {Math.min(indexOfLastRecord, bookingOrders.length)} of{" "}
                {bookingOrders.length} records
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md ${currentPage === 1
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-newPrimary text-white hover:bg-newPrimary/80"
                    }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-md ${currentPage === totalPages
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
              className="w-full max-w-[900px] pb-2 mx-auto bg-white rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white rounded-t-2xl">
                <h2 className="text-xl font-bold text-newPrimary">
                  {editingOrder ? "Update Booking Order" : "Add a New Booking Order"}
                </h2>
                <button
                  className="text-2xl text-gray-500 hover:text-gray-700"
                  onClick={resetForm}
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 p-6">
                <div className=" rounded-lg space-y-4">
                  {/* order and date */}
                  <div className="flex gap-6">
                    {/* Order No */}
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Order No <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editingOrder ? orderNo : `ORD-${nextOrderNo}`}
                        readOnly
                        className={`w-44 p-3 border rounded-md focus:outline-none focus:ring-2 ${errors.orderNo
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-newPrimary"
                          }`}
                        placeholder="Enter order number"
                        required
                      />
                      {errors.orderNo && (
                        <p className="text-red-500 text-xs mt-1">{errors.orderNo}</p>
                      )}
                    </div>

                    {/* Order Date */}
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Order Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={orderDate}
                        onChange={(e) => setOrderDate(e.target.value)}
                        className={`w-50 p-3 border rounded-md focus:outline-none focus:ring-2 ${errors.orderDate
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-newPrimary"
                          }`}
                        required
                      />
                      {errors.orderDate && (
                        <p className="text-red-500 text-xs mt-1">{errors.orderDate}</p>
                      )}
                    </div>
                  </div>

                </div>
                <div className="border bg-gray-100 p-4 rounded-lg space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        Customer <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={customer}
                        onChange={(e) => setCustomer(e.target.value)}
                        className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${errors.customer
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-newPrimary"
                          }`}
                        required
                      >
                        <option value="">Select Customer</option>
                        {customerList.map((cust) => (
                          <option key={cust._id} value={cust._id}>
                            {cust.customerName}
                          </option>
                        ))}
                      </select>
                      {errors.customer && (
                        <p className="text-red-500 text-xs mt-1">{errors.customer}</p>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        Contact Person
                      </label>
                      <input
                        type="text"
                        value={person}
                        readOnly
                        className="w-full p-3 border border-gray-300 rounded-md bg-gray-100"
                        placeholder="Contact person"
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">

                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        Phone
                      </label>
                      <input
                        type="text"
                        value={phone}
                        readOnly
                        className="w-full p-3 border border-gray-300 rounded-md bg-gray-100"
                        placeholder="Phone number"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        Balance
                      </label>
                      <input
                        type="text"
                        value={balance}
                        readOnly
                        className="w-full p-3 border border-gray-300 rounded-md bg-gray-100"
                        placeholder="Balance"
                      />
                    </div>

                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        Address
                      </label>
                      <input
                        type="text"
                        value={address}
                        readOnly
                        className="w-full p-3 border border-gray-300 rounded-md bg-gray-100"
                        placeholder="Address"
                      />
                    </div>


                  </div>
                </div>
                <div className="border bg-gray-100 p-4 rounded-lg space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        Order Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={orderType}
                        onChange={(e) => setOrderType(e.target.value)}
                        className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${errors.orderType
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-newPrimary"
                          }`}
                        required
                      >
                        <option value="">Select Order Type</option>
                        <option value="Standard">Standard</option>
                        <option value="Express">Express</option>
                      </select>
                      {errors.orderType && (
                        <p className="text-red-500 text-xs mt-1">{errors.orderType}</p>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        Mode <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={mode}
                        onChange={(e) => setMode(e.target.value)}
                        className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${errors.mode
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-newPrimary"
                          }`}
                        required
                      >
                        <option value="">Select Mode</option>
                        <option value="Delivery">Delivery</option>
                        <option value="Pickup">Pickup</option>
                      </select>
                      {errors.mode && (
                        <p className="text-red-500 text-xs mt-1">{errors.mode}</p>
                      )}
                    </div>




                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        Payment Method <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${errors.paymentMethod
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-newPrimary"
                          }`}
                        required
                      >
                        <option value="">Select Payment Method</option>
                        <option value="Cash">Cash</option>
                        <option value="Credit">Credit</option>
                        <option value="Online">Online</option>
                      </select>
                      {errors.paymentMethod && (
                        <p className="text-red-500 text-xs mt-1">{errors.paymentMethod}</p>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        Product <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={product}
                        onChange={(e) => setProduct(e.target.value)}
                        className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${errors.product
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-newPrimary"
                          }`}
                        required
                      >
                        <option value="">Select Product</option>
                        {productList.map((prod) => (
                          <option key={prod._id} value={prod._id}>
                            {prod.productName}
                          </option>
                        ))}
                      </select>
                      {errors.product && (
                        <p className="text-red-500 text-xs mt-1">{errors.product}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        Delivery Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${errors.deliveryDate
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-newPrimary"
                          }`}
                        required
                      />
                      {errors.deliveryDate && (
                        <p className="text-red-500 text-xs mt-1">{errors.deliveryDate}</p>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        Delivery Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${errors.deliveryAddress
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-newPrimary"
                          }`}
                        placeholder="Enter delivery address"
                        required
                      />
                      {errors.deliveryAddress && (
                        <p className="text-red-500 text-xs mt-1">{errors.deliveryAddress}</p>
                      )}
                    </div>

                  </div>
                </div>

                <div className="border bg-gray-100 p-4 rounded-lg space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        Rate
                      </label>
                      <input
                        type="text"
                        value={rate}
                        readOnly
                        className="w-full p-3 border border-gray-300 rounded-md bg-gray-100"
                        placeholder="Rate"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        Weight
                      </label>
                      <input
                        type="text"
                        value={weight}
                        readOnly
                        className="w-full p-3 border border-gray-300 rounded-md bg-gray-100"
                        placeholder="Weight"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        Packing
                      </label>
                      <input
                        type="text"
                        value={packing}
                        readOnly
                        className="w-full p-3 border border-gray-300 rounded-md bg-gray-100"
                        placeholder="Packing"
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1 min-w-0">
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
                  <div className="flex gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        Specification
                      </label>
                      <input
                        type="text"
                        value={specification}
                        readOnly
                        className="w-full p-3 border border-gray-300 rounded-md bg-gray-100"
                        placeholder="Specification"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={handleAddItem}
                        className="w-20 h-12 bg-newPrimary text-white rounded-lg hover:bg-newPrimary/80 transition flex justify-center items-center gap-2"
                      >
                        <span>+</span> Add
                      </button>
                    </div>
                  </div>
                </div>
                {itemsList.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                      <thead className="bg-gray-100 text-gray-600 text-sm">
                        <tr>
                          <th className="px-4 py-2 border-b">Sr #</th>
                          <th className="px-4 py-2 border-b">Item</th>
                          <th className="px-4 py-2 border-b">Specifications</th>
                          <th className="px-4 py-2 border-b">Weight</th>
                          <th className="px-4 py-2 border-b">Packing</th>
                          <th className="px-4 py-2 border-b">Stock</th>
                          <th className="px-4 py-2 border-b">Qty</th>
                          <th className="px-4 py-2 border-b">Rate</th>
                          <th className="px-4 py-2 border-b">Total</th>
                          <th className="px-4 py-2 border-b">Remove</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-700 text-sm">
                        {itemsList.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-2 border-b text-center">{idx + 1}</td>
                            <td className="px-4 py-2 border-b text-center">
                              {productList.find((p) => p._id === item.product)?.productName || "N/A"}
                            </td>
                            <td className="px-4 py-2 border-b text-center">{item.specification}</td>
                            <td className="px-4 py-2 border-b text-center">{item.weight}</td>
                            <td className="px-4 py-2 border-b text-center">{item.packing}</td>
                            <td className="px-4 py-2 border-b text-center">{item.inStock}</td>
                            <td className="px-4 py-2 border-b text-center">{item.qty}</td>
                            <td className="px-4 py-2 border-b text-center">{item.rate}</td>
                            <td className="px-4 py-2 border-b text-center">{item.total}</td>
                            <td className="px-4 py-2 border-b text-center">
                              <button onClick={() => handleRemoveItem(idx)}>
                                <X size={18} className=" text-xl flex-shrink-0 text-red-500 transition-colors"
                                />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {itemsList.length > 0 && (
                  <div className="flex gap-4">
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        Total Weight
                      </label>
                      <input
                        type="text"
                        value={totalWeight}
                        readOnly
                        className="w-full p-3 border border-gray-300 rounded-md bg-gray-100"
                        placeholder="Total Weight"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        Total Amount
                      </label>
                      <input
                        type="text"
                        value={totalAmount}
                        readOnly
                        className="w-full p-3 border border-gray-300 rounded-md bg-gray-100"
                        placeholder="Total Amount"
                      />
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Remarks
                  </label>
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                    placeholder="Enter remarks"
                    rows="3"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-newPrimary text-white px-4 py-3 rounded-lg hover:bg-newPrimary/80 transition-colors disabled:bg-blue-300"
                >
                  {loading ? "Saving..." : editingOrder ? "Update Booking Order" : "Save Booking Order"}
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

export default BookingOrders;