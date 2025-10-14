import React, { useState, useEffect, useRef, useCallback } from "react";
import { SquarePen, Trash2, CheckCircle, XCircle, X } from "lucide-react";
import CommanHeader from "../../../components/CommanHeader";
import TableSkeleton from "../Skeleton";
import Swal from "sweetalert2";

const FbrDeliveryChallan = () => {
  const [deliveryChallans, setDeliveryChallans] = useState([
    {
      _id: "1",
      dcNo: "DC-001",
      date: "2025-10-01",
      orderNo: "ORD-001",
      orderDate: "2025-09-25",
      orderDetails: {
        customer: "Acme Corp",
        person: "John Smith",
        phone: "123-456-7890",
        address: "123 Main St",
        orderType: "Standard",
        mode: "Truck",
        deliveryAddress: "456 Elm St",
        deliveryDate: "2025-10-05",
        totalWeight: 500,
      },
      vehicleDetails: {
        truckNo: "TRK-001",
        driverName: "Mike Johnson",
        father: "Robert Johnson",
        cnic: "12345-6789012-3",
        mobileNo: "987-654-3210",
        containerNo1: "CNT-001",
        batchNo1: "BAT-001",
        forLocation1: "Warehouse A",
        containerNo2: "CNT-002",
        batchNo2: "BAT-002",
        forLocation2: "Warehouse B",
        firstWeight: 450,
        weightBridgeName: "City Weigh",
        weightBridgeSlipNo: "WBS-001",
      },
      remarks: "Handle with care",
      approvalRemarks: "Approved by manager",
      status: "Approved",
    },
    {
      _id: "2",
      dcNo: "DC-002",
      date: "2025-10-02",
      orderNo: "ORD-002",
      orderDate: "2025-09-26",
      orderDetails: {
        customer: "Beta Inc",
        person: "Sarah Brown",
        phone: "234-567-8901",
        address: "789 Oak St",
        orderType: "Express",
        mode: "Van",
        deliveryAddress: "101 Pine St",
        deliveryDate: "2025-10-06",
        totalWeight: 300,
      },
      vehicleDetails: {
        truckNo: "TRK-002",
        driverName: "Tom Wilson",
        father: "James Wilson",
        cnic: "23456-7890123-4",
        mobileNo: "876-543-2109",
        containerNo1: "CNT-003",
        batchNo1: "BAT-003",
        forLocation1: "Warehouse C",
        containerNo2: "",
        batchNo2: "",
        forLocation2: "",
        firstWeight: 280,
        weightBridgeName: "North Weigh",
        weightBridgeSlipNo: "WBS-002",
      },
      remarks: "Urgent delivery",
      approvalRemarks: "Pending review",
      status: "Pending",
    },
  ]);

  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dcNo, setDcNo] = useState("");
  const [date, setDate] = useState("");
  const [productList, setProductList] = useState([]);
  const [product, setProduct] = useState("");
  const [rate, setRate] = useState("");
  const [inStock, setInStock] = useState("");
  const [specification, setSpecification] = useState("");
  const [itemsList, setItemsList] = useState([]);
  const [totalWeight, setTotalWeight] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [qty, setQty] = useState(1);
  const [total, setTotal] = useState(0);

  const handleAddItem = () => {
    if (!product) return;
    const newItem = {
      product,
      specification,
      weight: 0,
      packing: "",
      inStock,
      qty: 1,
      rate,
      total: rate,
    };
    setItemsList([...itemsList, newItem]);
  };

  const handleRemoveItem = (idx) => {
    setItemsList(itemsList.filter((_, i) => i !== idx));
  };

  const [orderNo, setOrderNo] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [orderDetails, setOrderDetails] = useState({
    customer: "",
    person: "",
    phone: "",
    address: "",
    orderType: "",
    mode: "",
    deliveryAddress: "",
    deliveryDate: "",
    totalWeight: "",
  });
  const [vehicleDetails, setVehicleDetails] = useState({
    truckNo: "",
    driverName: "",
    father: "",
    cnic: "",
    mobileNo: "",
    containerNo1: "",
    batchNo1: "",
    forLocation1: "",
    containerNo2: "",
    batchNo2: "",
    forLocation2: "",
    firstWeight: "",
    weightBridgeName: "",
    weightBridgeSlipNo: "",
  });
  const [remarks, setRemarks] = useState("");
  const [approvalRemarks, setApprovalRemarks] = useState("");
  const [status, setStatus] = useState("Pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingChallan, setEditingChallan] = useState(null);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState("orderDetails");
  const [nextDcNo, setNextDcNo] = useState("003");
  const [currentPage, setCurrentPage] = useState(1);

  const recordsPerPage = 10;
  const sliderRef = useRef(null);
  const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};

  // Simulate fetching delivery challans
  const fetchDeliveryChallans = useCallback(async () => {
    try {
      setLoading(true);
      // Static data already set in state
    } catch (error) {
      console.error("Failed to fetch delivery challans", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  }, []);

  useEffect(() => {
    fetchDeliveryChallans();
  }, [fetchDeliveryChallans]);

  useEffect(() => {
    const totalValue = (parseFloat(rate) || 0) * (parseInt(qty) || 0);
    setTotal(totalValue.toFixed(2));
  }, [rate, qty]);

  // Delivery challan search
  useEffect(() => {
    if (!searchTerm || !searchTerm.startsWith("DC-")) {
      fetchDeliveryChallans();
      return;
    }

    const delayDebounce = setTimeout(() => {
      try {
        setLoading(true);
        const filtered = deliveryChallans.filter((challan) =>
          challan.dcNo.toUpperCase().includes(searchTerm.toUpperCase())
        );
        setDeliveryChallans(filtered);
      } catch (error) {
        console.error("Search delivery challan failed:", error);
        setDeliveryChallans([]);
      } finally {
        setLoading(false);
      }
    }, 1000);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, fetchDeliveryChallans, deliveryChallans]);

  // Generate next DC No
  useEffect(() => {
    if (deliveryChallans.length > 0) {
      const maxNo = Math.max(
        ...deliveryChallans.map((c) => {
          const match = c.dcNo?.match(/DC-(\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        })
      );
      setNextDcNo((maxNo + 1).toString().padStart(3, "0"));
    } else {
      setNextDcNo("001");
    }
  }, [deliveryChallans]);

  // Reset form fields
  const resetForm = () => {
    setDcNo("");
    setDate("");
    setOrderNo("");
    setOrderDate("");
    setOrderDetails({
      customer: "",
      person: "",
      phone: "",
      address: "",
      orderType: "",
      mode: "",
      deliveryAddress: "",
      deliveryDate: "",
      totalWeight: "",
    });
    setVehicleDetails({
      truckNo: "",
      driverName: "",
      father: "",
      cnic: "",
      mobileNo: "",
      containerNo1: "",
      batchNo1: "",
      forLocation1: "",
      containerNo2: "",
      batchNo2: "",
      forLocation2: "",
      firstWeight: "",
      weightBridgeName: "",
      weightBridgeSlipNo: "",
    });
    setRemarks("");
    setApprovalRemarks("");
    setStatus("Pending");
    setEditingChallan(null);
    setErrors({});
    setActiveTab("orderDetails");
    setIsSliderOpen(false);
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    const trimmedDcNo = dcNo.trim();
    const trimmedDate = date.trim();
    const trimmedOrderNo = orderNo.trim();
    const trimmedOrderDate = orderDate.trim();
    const {
      customer,
      person,
      phone,
      address,
      orderType,
      mode,
      deliveryAddress,
      deliveryDate,
      totalWeight,
    } = orderDetails;
    const {
      truckNo,
      driverName,
      cnic,
      mobileNo,
      containerNo1,
      batchNo1,
      forLocation1,
      firstWeight,
      weightBridgeName,
      weightBridgeSlipNo,
    } = vehicleDetails;

    if (!trimmedDcNo) newErrors.dcNo = "DC No is required";
    if (!trimmedDate) newErrors.date = "Date is required";
    if (!trimmedOrderNo) newErrors.orderNo = "Order No is required";
    if (!trimmedOrderDate) newErrors.orderDate = "Order Date is required";

    if (!customer.trim()) newErrors.customer = "Customer is required";
    if (!person.trim()) newErrors.person = "Person is required";
    if (!phone.trim()) newErrors.phone = "Phone is required";
    if (!address.trim()) newErrors.address = "Address is required";
    if (!orderType.trim()) newErrors.orderType = "Order Type is required";
    if (!mode.trim()) newErrors.mode = "Mode is required";
    if (!deliveryAddress.trim())
      newErrors.deliveryAddress = "Delivery Address is required";
    if (!deliveryDate.trim())
      newErrors.deliveryDate = "Delivery Date is required";
    if (!totalWeight || isNaN(totalWeight) || totalWeight <= 0) {
      newErrors.totalWeight = "Total Weight must be a positive number";
    }

    if (!truckNo.trim()) newErrors.truckNo = "Truck No is required";
    if (!driverName.trim()) newErrors.driverName = "Driver Name is required";
    if (!cnic.trim()) newErrors.cnic = "CNIC is required";
    if (!mobileNo.trim()) newErrors.mobileNo = "Mobile No is required";
    if (!containerNo1.trim())
      newErrors.containerNo1 = "Container No 1 is required";
    if (!batchNo1.trim()) newErrors.batchNo1 = "Batch No 1 is required";
    if (!forLocation1.trim())
      newErrors.forLocation1 = "For Location 1 is required";
    if (!firstWeight || isNaN(firstWeight) || firstWeight <= 0) {
      newErrors.firstWeight = "First Weight must be a positive number";
    }
    if (!weightBridgeName.trim())
      newErrors.weightBridgeName = "Weight Bridge Name is required";
    if (!weightBridgeSlipNo.trim())
      newErrors.weightBridgeSlipNo = "Weight Bridge Slip No is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handlers for form and table actions
  const handleAddChallan = () => {
    resetForm();
    setIsSliderOpen(true);
  };

  const handleEditClick = (challan) => {
    setEditingChallan(challan);
    setDcNo(challan.dcNo || "");
    setDate(challan.date || "");
    setOrderNo(challan.orderNo || "");
    setOrderDate(challan.orderDate || "");
    setOrderDetails(challan.orderDetails || {});
    setVehicleDetails(challan.vehicleDetails || {});
    setRemarks(challan.remarks || "");
    setApprovalRemarks(challan.approvalRemarks || "");
    setStatus(challan.status || "Pending");
    setErrors({});
    setIsSliderOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const newChallan = {
      dcNo: editingChallan ? dcNo : `DC-${nextDcNo}`,
      date: date.trim(),
      orderNo: orderNo.trim(),
      orderDate: orderDate.trim(),
      orderDetails: {
        ...orderDetails,
        totalWeight: parseFloat(orderDetails.totalWeight),
      },
      vehicleDetails: {
        ...vehicleDetails,
        firstWeight: parseFloat(vehicleDetails.firstWeight),
      },
      remarks: remarks.trim(),
      approvalRemarks: approvalRemarks.trim(),
      status,
    };

    try {
      if (editingChallan) {
        setDeliveryChallans((prev) =>
          prev.map((c) =>
            c._id === editingChallan._id
              ? { ...c, ...newChallan, _id: c._id }
              : c
          )
        );
        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Delivery Challan updated successfully.",
          confirmButtonColor: "#3085d6",
        });
      } else {
        setDeliveryChallans((prev) => [
          ...prev,
          { ...newChallan, _id: `temp-${Date.now()}` },
        ]);
        Swal.fire({
          icon: "success",
          title: "Added!",
          text: "Delivery Challan added successfully.",
          confirmButtonColor: "#3085d6",
        });
      }
      fetchDeliveryChallans();
      resetForm();
    } catch (error) {
      console.error("Error saving delivery challan:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to save delivery challan.",
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
            setDeliveryChallans((prev) => prev.filter((c) => c._id !== id));
            swalWithTailwindButtons.fire(
              "Deleted!",
              "Delivery Challan deleted successfully.",
              "success"
            );
          } catch (error) {
            console.error("Delete error:", error);
            swalWithTailwindButtons.fire(
              "Error!",
              "Failed to delete delivery challan.",
              "error"
            );
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire(
            "Cancelled",
            "Delivery Challan is safe 🙂",
            "error"
          );
        }
      });
  };

  const handleStatusChange = (id, newStatus) => {
    setDeliveryChallans((prev) =>
      prev.map((c) => (c._id === id ? { ...c, status: newStatus } : c))
    );
    Swal.fire({
      icon: "success",
      title: `${newStatus}!`,
      text: `Delivery Challan ${newStatus.toLowerCase()} successfully.`,
      confirmButtonColor: "#3085d6",
    });
  };

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = deliveryChallans.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(deliveryChallans.length / recordsPerPage);

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
              Delivery Challan Details
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Enter DC No eg: DC-001"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 w-[250px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-newPrimary"
            />
            <button
              className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/80"
              onClick={handleAddChallan}
            >
              + Add Delivery Challan
            </button>
          </div>
        </div>

        <div className="rounded-xl shadow border border-gray-200 overflow-hidden">
          <div className="overflow-y-auto lg:overflow-x-auto max-h-[900px]">
            <div className="min-w-[1400px]">
              <div className="hidden lg:grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200">
                <div>DC No</div>
                <div>Date</div>
                <div>Order No</div>
                <div>Customer</div>
                <div>Delivery Date</div>
                <div>Total Weight</div>
                <div>Truck No</div>
                <div>Status</div>
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
                    No delivery challans found.
                  </div>
                ) : (
                  currentRecords.map((challan) => (
                    <div
                      key={challan._id}
                      className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] items-center gap-4 px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                    >
                      <div className="text-gray-600">{challan.dcNo}</div>
                      <div className="text-gray-600">{challan.date}</div>
                      <div className="text-gray-600">{challan.orderNo}</div>
                      <div className="text-gray-600">
                        {challan.orderDetails.customer}
                      </div>
                      <div className="text-gray-600">
                        {challan.orderDetails.deliveryDate}
                      </div>
                      <div className="text-gray-600">
                        {challan.orderDetails.totalWeight}
                      </div>
                      <div className="text-gray-600">
                        {challan.vehicleDetails.truckNo}
                      </div>
                      <div className="text-gray-600">{challan.status}</div>
                      <div className="flex gap-3 justify-start">
                        <button
                          onClick={() => handleEditClick(challan)}
                          className="py-1 text-sm rounded text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit"
                        >
                          <SquarePen size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(challan._id)}
                          className="py-1 text-sm rounded text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(challan._id, "Approved")
                          }
                          className="py-1 text-sm rounded text-green-600 hover:bg-green-50 transition-colors"
                          title="Approve"
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(challan._id, "Rejected")
                          }
                          className="py-1 text-sm rounded text-red-600 hover:bg-red-50 transition-colors"
                          title="Reject"
                        >
                          <XCircle size={18} />
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
                {Math.min(indexOfLastRecord, deliveryChallans.length)} of{" "}
                {deliveryChallans.length} records
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
              className="w-full md:w-[900px] bg-white rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white rounded-t-2xl">
                <h2 className="text-xl font-bold text-newPrimary">
                  {editingChallan
                    ? "Update Delivery Challan"
                    : "Add a New Delivery Challan"}
                </h2>
                <button
                  className="text-2xl text-gray-500 hover:text-gray-700"
                  onClick={resetForm}
                >
                  ×
                </button>
              </div>

              {/* ================= FORM ================= */}
              <form onSubmit={handleSubmit} className="space-y-4 p-4 md:p-6">
                {/* 1️⃣ SECTION — BASIC INFO */}
                <div className="border bg-gray-100 p-4 rounded-lg space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-gray-700 font-medium mb-2">
                        DC No <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editingChallan ? dcNo : `DC-${nextDcNo}`}
                        readOnly
                        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                      />
                    </div>

                    <div className="flex-1">
                      <label className="block text-gray-700 font-medium mb-2">
                        Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-gray-700 font-medium mb-2">
                        Booking Order <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={orderNo}
                        onChange={(e) => setOrderNo(e.target.value)}
                        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                      >
                        <option value="">Select Booking Order</option>
                        <option value="001">001</option>
                        <option value="002">002</option>
                      
                      </select>
                    </div>

                    <div className="flex-1">
                      <label className="block text-gray-700 font-medium mb-2">
                        Order Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={orderDate}
                        onChange={(e) => setOrderDate(e.target.value)}
                        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                      />
                    </div>
                  </div>
                </div>

                {/* 2️⃣ SECTION — CUSTOMER / DELIVERY DETAILS */}
                <div className="border bg-gray-100 p-4 rounded-lg space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-gray-700 font-medium mb-2">
                        Customer <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={orderDetails.customer}
                        onChange={(e) =>
                          setOrderDetails({
                            ...orderDetails,
                            customer: e.target.value,
                          })
                        }
                        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                      />
                    </div>

                    <div className="flex-1">
                      <label className="block text-gray-700 font-medium mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={orderDetails.phone}
                        onChange={(e) =>
                          setOrderDetails({
                            ...orderDetails,
                            phone: e.target.value,
                          })
                        }
                        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={orderDetails.address}
                      onChange={(e) =>
                        setOrderDetails({
                          ...orderDetails,
                          address: e.target.value,
                        })
                      }
                      className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                    />
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-gray-700 font-medium mb-2">
                        Delivery Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={orderDetails.deliveryDate}
                        onChange={(e) =>
                          setOrderDetails({
                            ...orderDetails,
                            deliveryDate: e.target.value,
                          })
                        }
                        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                      />
                    </div>

                    <div className="flex-1">
                      <label className="block text-gray-700 font-medium mb-2">
                        Delivery Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={orderDetails.deliveryAddress}
                        onChange={(e) =>
                          setOrderDetails({
                            ...orderDetails,
                            deliveryAddress: e.target.value,
                          })
                        }
                        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                      />
                    </div>
                  </div>
                </div>

                {/* 3️⃣ SECTION — PRODUCT ITEMS */}
                <div className="border bg-gray-100 p-4 rounded-lg space-y-4">
                  {/* Line 1 */}
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-gray-700 font-medium mb-2">
                        Product
                      </label>
                      <select
                        value={product}
                        onChange={(e) => setProduct(e.target.value)}
                        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                      >
                        <option value="">Select Product</option>
                        <option value="Laptop">Laptop</option>
                        <option value="Mobile">Mobile</option>
                      </select>
                    </div>

                    <div className="flex-1">
                      <label className="block text-gray-700 font-medium mb-2">
                        Rate
                      </label>
                      <input
                        type="number"
                        value={rate}
                        onChange={(e) => setRate(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                        placeholder="Enter rate"
                      />
                    </div>

                    <div className="flex-1">
                      <label className="block text-gray-700 font-medium mb-2">
                        Qty
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={qty}
                        onChange={(e) => setQty(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                        placeholder="Enter quantity"
                      />
                    </div>

                    <div className="flex-1">
                      <label className="block text-gray-700 font-medium mb-2">
                        Total
                      </label>
                      <input
                        type="text"
                        value={total}
                        readOnly
                        className="w-full p-3 border border-gray-300 rounded-md bg-gray-100"
                      />
                    </div>
                  </div>

                  {/* Line 2 */}
                  <div className="flex gap-4 items-end">
                    <div className="flex-1">
                      <label className="block text-gray-700 font-medium mb-2">
                        In Stock
                      </label>
                      <input
                        type="text"
                        value={inStock}
                        onChange={(e) => setInStock(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                        placeholder="Enter in stock"
                      />
                    </div>

                    <div className="flex-1">
                      <label className="block text-gray-700 font-medium mb-2">
                        Specifications
                      </label>
                      <input
                        type="text"
                        value={specification}
                        onChange={(e) => setSpecification(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                        placeholder="Enter specifications"
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

                  {/* Table */}
                  {itemsList.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                        <thead className="bg-gray-100 text-gray-600 text-sm">
                          <tr>
                            <th className="px-4 py-2 border-b">Sr #</th>
                            <th className="px-4 py-2 border-b">Item</th>
                            <th className="px-4 py-2 border-b">
                              Specifications
                            </th>

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
                              <td className="px-4 py-2 border-b text-center">
                                {idx + 1}
                              </td>
                              <td className="px-4 py-2 border-b text-center">
                                {productList.find((p) => p._id === item.product)
                                  ?.productName || "N/A"}
                              </td>
                              <td className="px-4 py-2 border-b text-center">
                                {item.specification}
                              </td>

                              <td className="px-4 py-2 border-b text-center">
                                {item.inStock}
                              </td>
                              <td className="px-4 py-2 border-b text-center">
                                {item.qty}
                              </td>
                              <td className="px-4 py-2 border-b text-center">
                                {item.rate}
                              </td>
                              <td className="px-4 py-2 border-b text-center">
                                {item.total}
                              </td>
                              <td className="px-4 py-2 border-b text-center">
                                <button onClick={() => handleRemoveItem(idx)}>
                                  <X size={18} className="text-red-500" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* 4️⃣ SECTION — REMARKS */}
                <div className="border bg-gray-100 p-4 rounded-lg space-y-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Remarks
                    </label>
                    <textarea
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                      placeholder="Enter Remarks"
                      rows="3"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Approval Remarks
                    </label>
                    <textarea
                      value={approvalRemarks}
                      onChange={(e) => setApprovalRemarks(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                      placeholder="Enter Approval Remarks"
                      rows="3"
                    />
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-newPrimary text-white px-4 py-3 rounded-lg hover:bg-newPrimary/80 transition-colors disabled:bg-blue-300"
                >
                  {loading
                    ? "Saving..."
                    : editingChallan
                    ? "Update Delivery Challan"
                    : "Save Delivery Challan"}
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

export default FbrDeliveryChallan;
