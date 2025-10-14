import React, { useState, useEffect, useRef, useCallback } from "react";
import { SquarePen, Trash2, CheckCircle, XCircle } from "lucide-react";
import CommanHeader from "../../../components/CommanHeader";
import TableSkeleton from "../Skeleton";
import Swal from "sweetalert2";

const DeliveryChallan = () => {
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

              <form onSubmit={handleSubmit} className="space-y-4 p-4 md:p-6">
                <div className="space-y-3 border p-4 pb-6 rounded-lg bg-gray-100">
                  <div className="flex gap-4">
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        DC No <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editingChallan ? dcNo : `DC-${nextDcNo}`}
                        readOnly
                        className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                          errors.dcNo
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-newPrimary"
                        }`}
                        placeholder="Enter DC No"
                        required
                      />
                      {errors.dcNo && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.dcNo}
                        </p>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                          errors.date
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-newPrimary"
                        }`}
                        required
                      />
                      {errors.date && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.date}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        Order No <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={orderNo}
                        onChange={(e) => setOrderNo(e.target.value)}
                        className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                          errors.orderNo
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-newPrimary"
                        }`}
                        placeholder="Enter Order No"
                        required
                      />
                      {errors.orderNo && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.orderNo}
                        </p>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        Order Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={orderDate}
                        onChange={(e) => setOrderDate(e.target.value)}
                        className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                          errors.orderDate
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-newPrimary"
                        }`}
                        required
                      />
                      {errors.orderDate && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.orderDate}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 mb-4">
                  <div className="flex-1">
                    <button
                      type="button"
                      className={`w-full py-2 rounded-md ${
                        activeTab === "orderDetails"
                          ? "bg-newPrimary text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                      onClick={() => setActiveTab("orderDetails")}
                    >
                      Order Details
                    </button>
                  </div>
                  <div className="flex-1">
                    <button
                      type="button"
                      className={`w-full py-2 rounded-md ${
                        activeTab === "vehicleDetails"
                          ? "bg-newPrimary text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                      onClick={() => setActiveTab("vehicleDetails")}
                    >
                      Vehicle Details
                    </button>
                  </div>
                </div>
              
                {activeTab === "orderDetails" && (
                  <div className="space-y-3 border p-4 pb-6 rounded-lg bg-gray-100">
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-1 min-w-0">
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
                          className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                            errors.customer
                              ? "border-red-500 focus:ring-red-500"
                              : "border-gray-300 focus:ring-newPrimary"
                          }`}
                          placeholder="Enter Customer"
                          required
                        />
                        {errors.customer && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.customer}
                          </p>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <label className="block text-gray-700 font-medium mb-2">
                          Person <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={orderDetails.person}
                          onChange={(e) =>
                            setOrderDetails({
                              ...orderDetails,
                              person: e.target.value,
                            })
                          }
                          className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                            errors.person
                              ? "border-red-500 focus:ring-red-500"
                              : "border-gray-300 focus:ring-newPrimary"
                          }`}
                          placeholder="Enter Person"
                          required
                        />
                        {errors.person && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.person}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1 min-w-0">
                        <label className="block text-gray-700 font-medium mb-2">
                          Phone <span className="text-red-500">*</span>
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
                          className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                            errors.phone
                              ? "border-red-500 focus:ring-red-500"
                              : "border-gray-300 focus:ring-newPrimary"
                          }`}
                          placeholder="Enter Phone"
                          required
                        />
                        {errors.phone && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.phone}
                          </p>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
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
                          className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                            errors.address
                              ? "border-red-500 focus:ring-red-500"
                              : "border-gray-300 focus:ring-newPrimary"
                          }`}
                          placeholder="Enter Address"
                          required
                        />
                        {errors.address && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.address}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1 min-w-0">
                        <label className="block text-gray-700 font-medium mb-2">
                          Order Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={orderDetails.orderType}
                          onChange={(e) =>
                            setOrderDetails({
                              ...orderDetails,
                              orderType: e.target.value,
                            })
                          }
                          className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                            errors.orderType
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
                          <p className="text-red-500 text-xs mt-1">
                            {errors.orderType}
                          </p>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <label className="block text-gray-700 font-medium mb-2">
                          Mode <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={orderDetails.mode}
                          onChange={(e) =>
                            setOrderDetails({
                              ...orderDetails,
                              mode: e.target.value,
                            })
                          }
                          className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                            errors.mode
                              ? "border-red-500 focus:ring-red-500"
                              : "border-gray-300 focus:ring-newPrimary"
                          }`}
                          required
                        >
                          <option value="">Select Mode</option>
                          <option value="Truck">Truck</option>
                          <option value="Van">Van</option>
                        </select>
                        {errors.mode && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.mode}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1 min-w-0">
                        <label className="block text-gray-700 font-medium mb-2">
                          Total Weight <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={orderDetails.totalWeight}
                          onChange={(e) =>
                            setOrderDetails({
                              ...orderDetails,
                              totalWeight: e.target.value,
                            })
                          }
                          className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                            errors.totalWeight
                              ? "border-red-500 focus:ring-red-500"
                              : "border-gray-300 focus:ring-newPrimary"
                          }`}
                          placeholder="Enter Total Weight"
                          min="0"
                          step="0.01"
                          required
                        />
                        {errors.totalWeight && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.totalWeight}
                          </p>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
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
                          className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                            errors.deliveryDate
                              ? "border-red-500 focus:ring-red-500"
                              : "border-gray-300 focus:ring-newPrimary"
                          }`}
                          required
                        />
                        {errors.deliveryDate && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.deliveryDate}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1 min-w-0">
                        <label className="block text-gray-700 font-medium mb-2">
                          Delivery Address{" "}
                          <span className="text-red-500">*</span>
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
                          className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                            errors.deliveryAddress
                              ? "border-red-500 focus:ring-red-500"
                              : "border-gray-300 focus:ring-newPrimary"
                          }`}
                          placeholder="Enter Delivery Address"
                          required
                        />
                        {errors.deliveryAddress && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.deliveryAddress}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  </div>
                )}
            
              
                  {activeTab === "vehicleDetails" && (
                    <div className="space-y-3 border p-4 pb-6 rounded-lg bg-gray-100">
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-1 min-w-0">
                        <label className="block text-gray-700 font-medium mb-2">
                          Truck No <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={vehicleDetails.truckNo}
                          onChange={(e) =>
                            setVehicleDetails({
                              ...vehicleDetails,
                              truckNo: e.target.value,
                            })
                          }
                          className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                            errors.truckNo
                              ? "border-red-500 focus:ring-red-500"
                              : "border-gray-300 focus:ring-newPrimary"
                          }`}
                          placeholder="Enter Truck No"
                          required
                        />
                        {errors.truckNo && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.truckNo}
                          </p>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <label className="block text-gray-700 font-medium mb-2">
                          Driver Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={vehicleDetails.driverName}
                          onChange={(e) =>
                            setVehicleDetails({
                              ...vehicleDetails,
                              driverName: e.target.value,
                            })
                          }
                          className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                            errors.driverName
                              ? "border-red-500 focus:ring-red-500"
                              : "border-gray-300 focus:ring-newPrimary"
                          }`}
                          placeholder="Enter Driver Name"
                          required
                        />
                        {errors.driverName && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.driverName}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1 min-w-0">
                        <label className="block text-gray-700 font-medium mb-2">
                          Father <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={vehicleDetails.father}
                          onChange={(e) =>
                            setVehicleDetails({
                              ...vehicleDetails,
                              father: e.target.value,
                            })
                          }
                          className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                            errors.father
                              ? "border-red-500 focus:ring-red-500"
                              : "border-gray-300 focus:ring-newPrimary"
                          }`}
                          placeholder="Enter Father's Name"
                          required
                        />
                        {errors.father && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.father}
                          </p>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <label className="block text-gray-700 font-medium mb-2">
                          CNIC <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={vehicleDetails.cnic}
                          onChange={(e) =>
                            setVehicleDetails({
                              ...vehicleDetails,
                              cnic: e.target.value,
                            })
                          }
                          className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                            errors.cnic
                              ? "border-red-500 focus:ring-red-500"
                              : "border-gray-300 focus:ring-newPrimary"
                          }`}
                          placeholder="Enter CNIC"
                          required
                        />
                        {errors.cnic && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.cnic}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1 min-w-0">
                        <label className="block text-gray-700 font-medium mb-2">
                          Mobile No <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={vehicleDetails.mobileNo}
                          onChange={(e) =>
                            setVehicleDetails({
                              ...vehicleDetails,
                              mobileNo: e.target.value,
                            })
                          }
                          className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                            errors.mobileNo
                              ? "border-red-500 focus:ring-red-500"
                              : "border-gray-300 focus:ring-newPrimary"
                          }`}
                          placeholder="Enter Mobile No"
                          required
                        />
                        {errors.mobileNo && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.mobileNo}
                          </p>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <label className="block text-gray-700 font-medium mb-2">
                          Container No 1 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={vehicleDetails.containerNo1}
                          onChange={(e) =>
                            setVehicleDetails({
                              ...vehicleDetails,
                              containerNo1: e.target.value,
                            })
                          }
                          className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                            errors.containerNo1
                              ? "border-red-500 focus:ring-red-500"
                              : "border-gray-300 focus:ring-newPrimary"
                          }`}
                          placeholder="Enter Container No 1"
                          required
                        />
                        {errors.containerNo1 && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.containerNo1}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1 min-w-0">
                        <label className="block text-gray-700 font-medium mb-2">
                          Batch No 1 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={vehicleDetails.batchNo1}
                          onChange={(e) =>
                            setVehicleDetails({
                              ...vehicleDetails,
                              batchNo1: e.target.value,
                            })
                          }
                          className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                            errors.batchNo1
                              ? "border-red-500 focus:ring-red-500"
                              : "border-gray-300 focus:ring-newPrimary"
                          }`}
                          placeholder="Enter Batch No 1"
                          required
                        />
                        {errors.batchNo1 && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.batchNo1}
                          </p>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <label className="block text-gray-700 font-medium mb-2">
                          For Location 1 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={vehicleDetails.forLocation1}
                          onChange={(e) =>
                            setVehicleDetails({
                              ...vehicleDetails,
                              forLocation1: e.target.value,
                            })
                          }
                          className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                            errors.forLocation1
                              ? "border-red-500 focus:ring-red-500"
                              : "border-gray-300 focus:ring-newPrimary"
                          }`}
                          placeholder="Enter For Location 1"
                          required
                        />
                        {errors.forLocation1 && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.forLocation1}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1 min-w-0">
                        <label className="block text-gray-700 font-medium mb-2">
                          Container No 2
                        </label>
                        <input
                          type="text"
                          value={vehicleDetails.containerNo2}
                          onChange={(e) =>
                            setVehicleDetails({
                              ...vehicleDetails,
                              containerNo2: e.target.value,
                            })
                          }
                          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                          placeholder="Enter Container No 2"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <label className="block text-gray-700 font-medium mb-2">
                          Batch No 2
                        </label>
                        <input
                          type="text"
                          value={vehicleDetails.batchNo2}
                          onChange={(e) =>
                            setVehicleDetails({
                              ...vehicleDetails,
                              batchNo2: e.target.value,
                            })
                          }
                          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                          placeholder="Enter Batch No 2"
                        />
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1 min-w-0">
                        <label className="block text-gray-700 font-medium mb-2">
                          For Location 2
                        </label>
                        <input
                          type="text"
                          value={vehicleDetails.forLocation2}
                          onChange={(e) =>
                            setVehicleDetails({
                              ...vehicleDetails,
                              forLocation2: e.target.value,
                            })
                          }
                          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                          placeholder="Enter For Location 2"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <label className="block text-gray-700 font-medium mb-2">
                          First Weight <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={vehicleDetails.firstWeight}
                          onChange={(e) =>
                            setVehicleDetails({
                              ...vehicleDetails,
                              firstWeight: e.target.value,
                            })
                          }
                          className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                            errors.firstWeight
                              ? "border-red-500 focus:ring-red-500"
                              : "border-gray-300 focus:ring-newPrimary"
                          }`}
                          placeholder="Enter First Weight"
                          min="0"
                          step="0.01"
                          required
                        />
                        {errors.firstWeight && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.firstWeight}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1 min-w-0">
                        <label className="block text-gray-700 font-medium mb-2">
                          Weight Bridge Name{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={vehicleDetails.weightBridgeName}
                          onChange={(e) =>
                            setVehicleDetails({
                              ...vehicleDetails,
                              weightBridgeName: e.target.value,
                            })
                          }
                          className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                            errors.weightBridgeName
                              ? "border-red-500 focus:ring-red-500"
                              : "border-gray-300 focus:ring-newPrimary"
                          }`}
                          placeholder="Enter Weight Bridge Name"
                          required
                        />
                        {errors.weightBridgeName && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.weightBridgeName}
                          </p>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <label className="block text-gray-700 font-medium mb-2">
                          Weight Bridge Slip No{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={vehicleDetails.weightBridgeSlipNo}
                          onChange={(e) =>
                            setVehicleDetails({
                              ...vehicleDetails,
                              weightBridgeSlipNo: e.target.value,
                            })
                          }
                          className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                            errors.weightBridgeSlipNo
                              ? "border-red-500 focus:ring-red-500"
                              : "border-gray-300 focus:ring-newPrimary"
                          }`}
                          placeholder="Enter Weight Bridge Slip No"
                          required
                        />
                        {errors.weightBridgeSlipNo && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.weightBridgeSlipNo}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  </div>
                )}
              
              
              <div className="space-y-3 border p-4 pb-6 rounded-lg bg-gray-100">
                <div className="flex gap-4">
                  <div className="flex-1 min-w-0">
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
                </div>
                <div className="flex gap-4">
                  <div className="flex-1 min-w-0">
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
                </div>
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

export default DeliveryChallan;
