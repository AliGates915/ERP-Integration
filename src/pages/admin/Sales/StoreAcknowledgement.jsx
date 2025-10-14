import React, { useState, useEffect, useRef, useCallback } from "react";
import { SquarePen, Trash2, X } from "lucide-react";
import CommanHeader from "../../../components/CommanHeader";
import TableSkeleton from "../Skeleton";
import Swal from "sweetalert2";

const StoreAcknowledgement = () => {
  const [acknowledgements, setAcknowledgements] = useState([
    {
      _id: "1",
      storeId: "ACK-001",
      date: "2025-10-02",
      bookingOrderNo: "ORD-001",
      customer: "cust1",
      acknowledgedQty: 2,
    },
    {
      _id: "2",
      storeId: "ACK-002",
      date: "2025-10-03",
      bookingOrderNo: "ORD-002",
      customer: "cust2",
      acknowledgedQty: 5,
    },
  ]);
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
  const [customerList, setCustomerList] = useState([
    { _id: "cust1", customerName: "Tech Corp", contactPerson: "John Doe", phone: "123-456-7890", address: "123 Tech St", balance: 500 },
    { _id: "cust2", customerName: "Retail Inc", contactPerson: "Jane Smith", phone: "987-654-3210", address: "789 Retail Ave", balance: 200 },
    { _id: "cust3", customerName: "Global Traders", contactPerson: "Alice Brown", phone: "555-123-4567", address: "456 Global Rd", balance: 1000 },
  ]);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [storeId, setStoreId] = useState("");
  const [date, setDate] = useState("");
  const [bookingOrderNo, setBookingOrderNo] = useState("");
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
  const [itemsList, setItemsList] = useState([]);
  const [acknowledgedQty, setAcknowledgedQty] = useState("");
  const [editingAcknowledgement, setEditingAcknowledgement] = useState(null);
  const [errors, setErrors] = useState({});
  const [nextStoreId, setNextStoreId] = useState("003");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const sliderRef = useRef(null);
  const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};

  const fetchAcknowledgements = useCallback(async () => {
    try {
      setLoading(true);
      // Static data already set in state
    } catch (error) {
      console.error("Failed to fetch acknowledgements", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  }, []);

  useEffect(() => {
    fetchAcknowledgements();
  }, [fetchAcknowledgements]);

  useEffect(() => {
    if (searchTerm && !searchTerm.startsWith("ACK-")) {
      fetchAcknowledgements();
      return;
    }

    const delayDebounce = setTimeout(() => {
      try {
        setLoading(true);
        const filtered = acknowledgements.filter((ack) =>
          ack.storeId.toUpperCase().includes(searchTerm.toUpperCase())
        );
        setAcknowledgements(filtered);
      } catch (error) {
        console.error("Search acknowledgement failed:", error);
        setAcknowledgements([]);
      } finally {
        setLoading(false);
      }
    }, 1000);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, fetchAcknowledgements, acknowledgements]);

  useEffect(() => {
    if (acknowledgements.length > 0) {
      const maxNo = Math.max(
        ...acknowledgements.map((ack) => {
          const match = ack.storeId?.match(/ACK-(\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        })
      );
      setNextStoreId((maxNo + 1).toString().padStart(3, "0"));
    } else {
      setNextStoreId("001");
    }
  }, [acknowledgements]);

  useEffect(() => {
    if (bookingOrderNo && bookingOrders.length > 0) {
      const selectedOrder = bookingOrders.find((order) => order.orderNo === bookingOrderNo);
      if (selectedOrder) {
        setCustomer(selectedOrder.customer || "");
        setPerson(selectedOrder.person || "");
        setPhone(selectedOrder.phone || "");
        setAddress(selectedOrder.address || "");
        setBalance(selectedOrder.balance || "");
        setDeliveryAddress(selectedOrder.deliveryAddress || "");
        setOrderType(selectedOrder.orderType || "");
        setDeliveryDate(selectedOrder.deliveryDate || "");
        setMode(selectedOrder.mode || "");
        setPaymentMethod(selectedOrder.paymentMethod || "");
        setItemsList(selectedOrder.items || []);
      }
    }
  }, [bookingOrderNo, bookingOrders]);

  const resetForm = () => {
    setStoreId("");
    setDate("");
    setBookingOrderNo("");
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
    setItemsList([]);
    setAcknowledgedQty("");
    setEditingAcknowledgement(null);
    setErrors({});
    setIsSliderOpen(false);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!storeId && !editingAcknowledgement) newErrors.storeId = "ID is required";
    if (!date) newErrors.date = "Date is required";
    if (!bookingOrderNo) newErrors.bookingOrderNo = "Booking Order # is required";
    if (!acknowledgedQty || isNaN(parseInt(acknowledgedQty)) || parseInt(acknowledgedQty) <= 0) {
      newErrors.acknowledgedQty = "Acknowledged Quantity must be a positive number";
    }
    if (itemsList.length === 0) newErrors.items = "At least one item is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddAcknowledgement = () => {
    resetForm();
    setIsSliderOpen(true);
  };

  const handleEditClick = (acknowledgement) => {
    setEditingAcknowledgement(acknowledgement);
    setStoreId(acknowledgement.storeId || "");
    setDate(acknowledgement.date || "");
    setBookingOrderNo(acknowledgement.bookingOrderNo || "");
    setAcknowledgedQty(acknowledgement.acknowledgedQty || "");
    const selectedOrder = bookingOrders.find((order) => order.orderNo === acknowledgement.bookingOrderNo);
    if (selectedOrder) {
      setCustomer(selectedOrder.customer || "");
      setPerson(selectedOrder.person || "");
      setPhone(selectedOrder.phone || "");
      setAddress(selectedOrder.address || "");
      setBalance(selectedOrder.balance || "");
      setDeliveryAddress(selectedOrder.deliveryAddress || "");
      setOrderType(selectedOrder.orderType || "");
      setDeliveryDate(selectedOrder.deliveryDate || "");
      setMode(selectedOrder.mode || "");
      setPaymentMethod(selectedOrder.paymentMethod || "");
      setItemsList(selectedOrder.items || []);
    }
    setErrors({});
    setIsSliderOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const newAcknowledgement = {
      storeId: editingAcknowledgement ? storeId : `ACK-${nextStoreId}`,
      date,
      bookingOrderNo,
      customer,
      acknowledgedQty: parseInt(acknowledgedQty),
    };

    try {
      if (editingAcknowledgement) {
        setAcknowledgements((prev) =>
          prev.map((ack) => (ack._id === editingAcknowledgement._id ? { ...ack, ...newAcknowledgement, _id: ack._id } : ack))
        );
        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Acknowledgement updated successfully.",
          confirmButtonColor: "#3085d6",
        });
      } else {
        setAcknowledgements((prev) => [...prev, { ...newAcknowledgement, _id: `temp-${Date.now()}` }]);
        Swal.fire({
          icon: "success",
          title: "Added!",
          text: "Acknowledgement added successfully.",
          confirmButtonColor: "#3085d6",
        });
      }
      fetchAcknowledgements();
      resetForm();
    } catch (error) {
      console.error("Error saving acknowledgement:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to save acknowledgement.",
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
            setAcknowledgements((prev) => prev.filter((ack) => ack._id !== id));
            swalWithTailwindButtons.fire(
              "Deleted!",
              "Acknowledgement deleted successfully.",
              "success"
            );
          } catch (error) {
            console.error("Delete error:", error);
            swalWithTailwindButtons.fire(
              "Error!",
              "Failed to delete acknowledgement.",
              "error"
            );
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire(
            "Cancelled",
            "Acknowledgement is safe 🙂",
            "error"
          );
        }
      });
  };

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = acknowledgements.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(acknowledgements.length / recordsPerPage);

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
              Store Acknowledgement Details
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Enter Store ID eg: ACK-001"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 w-[250px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-newPrimary"
            />
            <button
              className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/80"
              onClick={handleAddAcknowledgement}
            >
              + Add Acknowledgement
            </button>
          </div>
        </div>

        <div className="rounded-xl shadow border border-gray-200 overflow-hidden">
          <div className="overflow-y-auto lg:overflow-x-auto max-h-[900px]">
            <div className="min-w-[1000px]">
              <div className="hidden lg:grid grid-cols-5 gap-4 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200">
                <div>Store ID</div>
                <div>Date</div>
                <div>Booking Order #</div>
                <div>Acknowledged Qty</div>
                <div>Actions</div>
              </div>

              <div className="flex flex-col divide-y divide-gray-100">
                {loading ? (
                  <TableSkeleton
                    rows={currentRecords.length || 5}
                    cols={5}
                    className="lg:grid-cols-5"
                  />
                ) : currentRecords.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 bg-white">
                    No acknowledgements found.
                  </div>
                ) : (
                  currentRecords.map((ack) => (
                    <div
                      key={ack._id}
                      className="grid grid-cols-1 lg:grid-cols-5 items-center gap-4 px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                    >
                      <div className="text-gray-600">{ack.storeId}</div>
                      <div className="text-gray-600">{ack.date}</div>
                      <div className="text-gray-600">{ack.bookingOrderNo}</div>
                      <div className="text-gray-600">{ack.acknowledgedQty}</div>
                      <div className="flex gap-3 justify-start">
                        <button
                          onClick={() => handleEditClick(ack)}
                          className="py-1 text-sm rounded text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit"
                        >
                          <SquarePen size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(ack._id)}
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
                Showing {indexOfFirstRecord + 1} to{" "}
                {Math.min(indexOfLastRecord, acknowledgements.length)} of{" "}
                {acknowledgements.length} records
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
              className="w-full max-w-[800px] mx-auto bg-white rounded-2xl shadow-2xl overflow-y-auto max-h-[80vh]"
            >
              <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white rounded-t-2xl">
                <h2 className="text-xl font-bold text-newPrimary">
                  {editingAcknowledgement ? "Update Acknowledgement" : "Add a New Acknowledgement"}
                </h2>
                <button
                  className="text-2xl text-gray-500 hover:text-gray-700"
                  onClick={resetForm}
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 p-6">

                <div className="flex gap-6">
                  {/* ID */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editingAcknowledgement ? storeId : `ACK-${nextStoreId}`}
                      readOnly
                      className={`w-48 p-3 border rounded-md focus:outline-none focus:ring-2 ${errors.storeId
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-newPrimary"
                        }`}
                      placeholder="Enter store ID"
                      required
                    />
                    {errors.storeId && (
                      <p className="text-red-500 text-xs mt-1">{errors.storeId}</p>
                    )}
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className={`w-56 p-3 border rounded-md focus:outline-none focus:ring-2 ${errors.date
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-newPrimary"
                        }`}
                      required
                    />
                    {errors.date && (
                      <p className="text-red-500 text-xs mt-1">{errors.date}</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1 min-w-0">
                    <label className="block text-gray-700 font-medium mb-2">
                      Booking Order # <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={bookingOrderNo}
                      onChange={(e) => setBookingOrderNo(e.target.value)}
                      className={`w-90 p-3 border rounded-md focus:outline-none focus:ring-2 ${errors.bookingOrderNo
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-newPrimary"
                        }`}
                      required
                    >
                      <option value="">Select Booking Order</option>
                      {bookingOrders.map((order) => (
                        <option key={order._id} value={order.orderNo}>
                          {order.orderNo}
                        </option>
                      ))}
                    </select>
                    {errors.bookingOrderNo && (
                      <p className="text-red-500 text-xs mt-1">{errors.bookingOrderNo}</p>
                    )}
                  </div>

                </div>
                <div className="border p-4 rounded-xl bg-gray-100">
                  <div className="flex gap-4">
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        Customer
                      </label>
                      <input
                        type="text"
                        value={customerList.find((c) => c._id === customer)?.customerName || ""}
                        readOnly
                        className="w-full p-3 border border-gray-300 rounded-md bg-gray-100"
                        placeholder="Customer"
                      />
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
                  <div className="flex gap-4">
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
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        Delivery Address
                      </label>
                      <input
                        type="text"
                        value={deliveryAddress}
                        readOnly
                        className="w-full p-3 border border-gray-300 rounded-md bg-gray-100"
                        placeholder="Delivery Address"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        Order Type
                      </label>
                      <input
                        type="text"
                        value={orderType}
                        readOnly
                        className="w-full p-3 border border-gray-300 rounded-md bg-gray-100"
                        placeholder="Order Type"
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">

                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        Delivery Date
                      </label>
                      <input
                        type="text"
                        value={deliveryDate}
                        readOnly
                        className="w-full p-3 border border-gray-300 rounded-md bg-gray-100"
                        placeholder="Delivery Date"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        Mode
                      </label>
                      <input
                        type="text"
                        value={mode}
                        readOnly
                        className="w-full p-3 border border-gray-300 rounded-md bg-gray-100"
                        placeholder="Mode"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        Payment Method
                      </label>
                      <input
                        type="text"
                        value={paymentMethod}
                        readOnly
                        className="w-full p-3 border border-gray-300 rounded-md bg-gray-100"
                        placeholder="Payment Method"
                      />
                    </div>
                  </div>
                </div>
                {itemsList.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-200 rounded-xl">
                      <thead className="bg-gray-500 text-white text-sm uppercase tracking-wide">
                        <tr>
                          <th className="px-4 py-2 border-b text-center">Sr #</th>
                          <th className="px-4 py-2 border-b text-left">Item</th>
                          <th className="px-4 py-2 border-b text-left">Specifications</th>
                          <th className="px-4 py-2 border-b text-center">Weight</th>
                          <th className="px-4 py-2 border-b text-center">Packing</th>
                          <th className="px-4 py-2 border-b text-center">Stock</th>
                          <th className="px-4 py-2 border-b text-center">Qty</th>
                          <th className="px-4 py-2 border-b text-center">Rate</th>
                          <th className="px-4 py-2 border-b text-center">Total</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-800 text-sm divide-y divide-gray-200">
                        {itemsList.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 transition">
                            <td className="px-4 py-2 text-center font-medium">{idx + 1}</td>
                            <td className="px-4 py-2">{item.product}</td>
                            <td className="px-4 py-2">{item.specification}</td>
                            <td className="px-4 py-2 text-center">{item.weight}</td>
                            <td className="px-4 py-2 text-center">{item.packing}</td>
                            <td className="px-4 py-2 text-center">{item.inStock}</td>
                            <td className="px-4 py-2 text-center">{item.qty}</td>
                            <td className="px-4 py-2 text-center">{item.rate}</td>
                            <td className="px-4 py-2 text-center font-semibold">{item.total}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}



                <div className="flex gap-4">
                  <div className="flex-1 min-w-0">
                    <label className="block text-gray-700 font-medium mb-2">
                      Acknowledged Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={acknowledgedQty}
                      onChange={(e) => setAcknowledgedQty(e.target.value)}
                      className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${errors.acknowledgedQty
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-newPrimary"
                        }`}
                      placeholder="Enter acknowledged quantity"
                      min="0"
                      step="1"
                      required
                    />
                    {errors.acknowledgedQty && (
                      <p className="text-red-500 text-xs mt-1">{errors.acknowledgedQty}</p>
                    )}
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-newPrimary text-white px-4 py-3 rounded-lg hover:bg-newPrimary/80 transition-colors disabled:bg-blue-300"
                >
                  {loading ? "Saving..." : editingAcknowledgement ? "Update Acknowledgement" : "Save Acknowledgement"}
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

export default StoreAcknowledgement;