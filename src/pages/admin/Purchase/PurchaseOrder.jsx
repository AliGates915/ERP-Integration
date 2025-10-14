import React, { useState, useEffect, useRef, useCallback } from "react";
import { Eye, Loader, SquarePen, Trash2, X } from "lucide-react";
import CommanHeader from "../../../components/CommanHeader";
import TableSkeleton from "../Skeleton";
import Swal from "sweetalert2";
import axios from "axios";
import ViewModel from "./ViewModel";

const PurchaseOrder = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [demandItems, setDemandItems] = useState([
    {
      _id: "di1",
      itemName: "Laptop Order",
      supplier: { _id: "sup1", supplierName: "ABC Supplies" },
    },
    {
      _id: "di2",
      itemName: "Desk Order",
      supplier: { _id: "sup2", supplierName: "XYZ Corp" },
    },
  ]);
  const [forDemand, setForDemand] = useState("");
  const [estimationItems, setEstimationItems] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [poNo, setPoNo] = useState("");
  const [date, setDate] = useState("");
  const [demandItem, setDemandItem] = useState("");
  const [supplier, setSupplier] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [tax, setTax] = useState("10%");
  const [totalAmount, setTotalAmount] = useState("1000");
  const [itemsList, setItemsList] = useState([]);
  const [itemCategory, setItemCategory] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemRate, setItemRate] = useState("");
  const [itemQty, setItemQty] = useState("");
  const [isEnable, setIsEnable] = useState(true);
  const [isView, setIsView] = useState(false);
  const [editingPurchaseOrder, setEditingPurchaseOrder] = useState(null);
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState(null);
  const [nextRequisitionId, setNextRequisitionId] = useState("001");
  const [purchaseOrderId, setPurchaseOrderId] = useState();
  const sliderRef = useRef(null);
  const [errors, setErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  // Handle adding items to the table in the form
  const handleAddItem = () => {
    if (!itemCategory || !itemName || !itemRate || !itemQty) return;

    const newItem = {
      category: itemCategory,
      name: itemName,
      rate: parseFloat(itemRate),
      qty: parseInt(itemQty, 10),
      total: parseFloat(itemRate) * parseInt(itemQty, 10),
    };

    setItemsList([...itemsList, newItem]);
    setItemCategory("");
    setItemName("");
    setItemRate("");
    setItemQty("");
  };

  // Fetch quotations
  const fetchEstimationList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/estimations`
      );
      setQuotations(res.data);
    } catch (error) {
      console.error("Failed to fetch quotations", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  }, []);

  useEffect(() => {
    fetchEstimationList();
  }, [fetchEstimationList]);

  // Demand Item
  useEffect(() => {
    const fetchQuotationItems = async () => {
      if (!forDemand) {
        setEstimationItems([]);
        return;
      }

      try {
        setLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/estimations/${forDemand}`
        );
        setEstimationItems(res.data.demandItem?.items || []);
        setDemandItem(res.data._id);
      } catch (error) {
        console.error("Error fetching quotation items:", error);
        setEstimationItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuotationItems();
  }, [forDemand]);

  function totalCaulationWithTax() {
    const Calculation =
      estimationItems.reduce(
        (acc, item) => acc + parseInt(item.total || 0),
        0
      ) + (parseInt(tax) || 0);
    setTotalAmount(Calculation);
  }

  useEffect(() => {
    totalCaulationWithTax();
  }, [forDemand, estimationItems, tax]);

  // Fetch purchase orders
  const fetchPurchaseOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/purchaseOrder`
      );
      setPurchaseOrders(res.data);
     
    } catch (error) {
      console.error("Failed to fetch purchase orders", error);
    } finally {
      setTimeout(() => setLoading(false), 2000);
    }
  }, []);

  useEffect(() => {
    fetchPurchaseOrders();
  }, [fetchPurchaseOrders]);

  useEffect(() => {
    if (!searchTerm || !searchTerm.toLowerCase().startsWith("po-")) {
      // if search empty or not starting with REQ-, load all

      fetchPurchaseOrders();
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${
            import.meta.env.VITE_API_BASE_URL
          }/purchaseOrder/search/${searchTerm.toUpperCase()}`
        );
        setPurchaseOrders(Array.isArray(res.data) ? res.data : [res.data]);
        setCurrentPage(1); // Reset to first page on search
      } catch (error) {
        console.error("Search purchaseOrder failed:", error);
        setPurchaseOrders([]);
      } finally {
        setLoading(false);
      }
    }, 1000);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, fetchPurchaseOrders]);

  // Next POId
  useEffect(() => {
    if (purchaseOrders.length > 0) {
      const maxNo = Math.max(
        ...purchaseOrders.map((r) => {
          const match = r.purchaseOrderId?.match(/PO-(\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        })
      );
      setNextRequisitionId((maxNo + 1).toString().padStart(3, "0"));
    } else {
      setNextRequisitionId("001");
    }
  }, [purchaseOrders]);

  // Auto-fill supplier based on demand item
  useEffect(() => {
    if (demandItem) {
      const selectedDemand = demandItems.find(
        (item) => item._id === demandItem
      );
      if (selectedDemand && selectedDemand.supplier) {
        setSupplier(selectedDemand.supplier._id);
      }
    }
  }, [demandItem, demandItems]);

  // Handlers for form and table actions
  const handleAddClick = () => {
    setEditingPurchaseOrder(null);
    setPoNo(
      editingPurchaseOrder
        ? editingPurchaseOrder.poNo
        : `PO-${nextRequisitionId}`
    );
    setDate("");
    setDemandItem("");
    setSupplier("");
    setDeliveryDate("");
    setTax("");
    setTotalAmount("");
    setItemsList([]);
    setIsEnable(true);
    setIsSliderOpen(true);
  };

  const handleEditClick = (order) => {
   
    setEditingPurchaseOrder(order);
    setPoNo(order.purchaseOrderId);
    setPurchaseOrderId(order.purchaseOrderId);
    setDate(formatDate(order.date));
    setDemandItem(order.demandItem?._id || "");
    setSupplier(order.supplier?._id || "");
    setDeliveryDate(formatDate(order.deliveryDate));
    setTax(order.tax);
    setTotalAmount(order.totalAmount);
    setItemsList(order.items || []);
    setIsEnable(order.isEnable);
    setIsSliderOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!demandItem || !deliveryDate || tax === "") {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "⚠️ Please fill in all the fields",
        confirmButtonColor: "#d33",
      });
      return;
    }

    const { token } = userInfo || {};
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const newPurchaseOrder = {
      purchaseOrderId: editingPurchaseOrder
        ? purchaseOrderId
        : `PO-${nextRequisitionId}`,
      estimation: demandItem,
      deliveryDate,
      tax: Number(tax),
    };

    try {
      if (editingPurchaseOrder) {
        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/purchaseOrder/${
            editingPurchaseOrder._id
          }`,
          newPurchaseOrder,
          { headers }
        );
        Swal.fire(
          "Updated!",
          "Purchase order updated successfully.",
          "success"
        );
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/purchaseOrder`,
          newPurchaseOrder,
          { headers }
        );
        Swal.fire("Added!", "Purchase order added successfully.", "success");
      }

      await fetchPurchaseOrders();
      setIsSliderOpen(false);
      setItemsList([]);
      setPurchaseOrderId("");
      setDemandItem("");
      setDeliveryDate("");
      setTax("");
      setCurrentPage(1); // Reset to first page after adding/updating
      window.location.reload();
    } catch (error) {
      console.error(
        "❌ Error saving purchase order",
        error.response?.data || error
      );
      Swal.fire(
        "Error!",
        error.response?.data?.error || "Something went wrong while saving.",
        "error"
      );
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) return "Invalid Date";

    const day = String(parsed.getDate()).padStart(2, "0");
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    const year = parsed.getFullYear();

    return `${day}-${month}-${year}`;
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
            const { token } = userInfo || {};
            const headers = {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            };

            await axios.delete(
              `${import.meta.env.VITE_API_BASE_URL}/purchaseOrder/${id}`,
              { headers }
            );

            setPurchaseOrders(purchaseOrders.filter((p) => p._id !== id));
            setCurrentPage(1); // Reset to first page after deletion

            swalWithTailwindButtons.fire(
              "Deleted!",
              "Purchase order deleted successfully.",
              "success"
            );
          } catch (error) {
            console.error("Delete error:", error);
            swalWithTailwindButtons.fire(
              "Error!",
              "Failed to delete purchase order.",
              "error"
            );
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire(
            "Cancelled",
            "Purchase order is safe 🙂",
            "error"
          );
        }
      });
  };

  const handleView = (order) => {
    setSelectedPurchaseOrder(order);
    setIsView(true);
  };

  const closeModal = () => {
    setIsView(false);
    setSelectedPurchaseOrder(null);
  };

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = purchaseOrders.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(purchaseOrders.length / recordsPerPage);

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
              Purchase Order Details
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Enter PO No eg: PO-001"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-newPrimary"
            />
            <button
              className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/80"
              onClick={handleAddClick}
            >
              + Add Purchase Order
            </button>
          </div>
        </div>

        <div className="rounded-xl shadow border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="max-h-full overflow-y-auto custom-scrollbar">
              <div className="inline-block min-w-[1200px] w-full align-middle">
                <div className="hidden lg:grid grid-cols-6 gap-6 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200">
                  <div>PO No.</div>
                  <div>Employee</div>
                  <div>Supplier</div>
                  <div>Total Amount</div>
                  <div>Delivery Date</div>
                  <div className={`${loading ? "" : "text-right"}`}>
                    Actions
                  </div>
                </div>

                <div className="flex flex-col divide-y divide-gray-100">
                  {loading ? (
                    <TableSkeleton
                      rows={recordsPerPage}
                      cols={6}
                      className="lg:grid-cols-6"
                    />
                  ) : currentRecords.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 bg-white">
                      No purchase orders found.
                    </div>
                  ) : (
                    currentRecords.map((order) => (
                      <div
                        key={order._id}
                        className="grid grid-cols-1 lg:grid-cols-6 items-center gap-6 px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                      >
                        <div className="font-medium text-gray-900">
                          {order.purchaseOrderId}
                        </div>
                        <div className="text-gray-600">
                          {order?.estimation?.demandItem?.createdBy || "N/A"}
                        </div>
                        <div className="text-gray-600">
                          {order?.estimation?.demandItem?.supplier
                            ?.supplierName || "N/A"}
                        </div>
                        <div className="text-gray-600">
                          {order?.totalAmount}
                        </div>
                        <div className="text-gray-500">
                          {formatDate(order?.deliveryDate)}
                        </div>
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => handleEditClick(order)}
                            className="py-1 text-sm rounded text-blue-600"
                            title="Edit"
                          >
                            <SquarePen size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(order._id)}
                            className="py-1 text-sm text-red-600"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                          <button
                            onClick={() => handleView(order)}
                            className="text-amber-600 hover:underline"
                          >
                            <Eye size={18} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between my-4 px-10">
              <div className="text-sm text-gray-600">
                Showing {indexOfFirstRecord + 1} to{" "}
                {Math.min(indexOfLastRecord, purchaseOrders.length)} of{" "}
                {purchaseOrders.length} records
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
                  {editingPurchaseOrder
                    ? "Update Purchase Order"
                    : "Add a New Purchase Order"}
                </h2>
                <button
                  className="w-8 h-8 bg-newPrimary text-white rounded-full flex items-center justify-center hover:bg-newPrimary/70"
                  onClick={() => {
                    setIsSliderOpen(false);
                    setPoNo("");
                    setDate("");
                    setDemandItem("");
                    setSupplier("");
                    setDeliveryDate("");
                    setTax("");
                    setTotalAmount("");
                    setItemsList([]);
                    setIsEnable(true);
                    setEditingPurchaseOrder(null);
                  }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 p-4 md:p-6">
                <div className="flex gap-4">
                  <div className="flex-1 min-w-0">
                    <label className="block text-gray-700 font-medium mb-2">
                      PO No. <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={poNo}
                      onChange={(e) => setPoNo(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder="Enter PO No."
                      required
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="block text-gray-700 font-medium mb-2">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1 min-w-0">
                    <label className="block text-gray-700 font-medium mb-2">
                      For Demand <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={forDemand}
                      onChange={(e) => setForDemand(e.target.value)}
                      className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                        errors.forDemand
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-newPrimary"
                      }`}
                    >
                      <option value="">Select Quotation</option>
                      {quotations.map((q) => (
                        <option key={q._id} value={q._id}>
                          {q.estimationId}
                        </option>
                      ))}
                    </select>
                    {errors.forDemand && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.forDemand}
                      </p>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="block text-gray-700 font-medium mb-2">
                      Supplier <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={supplier?.supplierName || ""}
                      disabled
                      className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                      placeholder="Supplier"
                      required
                    />
                  </div>
                </div>
                {loading ? (
                  <span className="animate-spin flex justify-center">
                    <Loader size={18} />
                  </span>
                ) : (
                  estimationItems.length > 0 && (
                    <div className="overflow-x-auto mt-4">
                      <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-2 border">Item Name</th>
                            <th className="px-4 py-2 border">Quantity</th>
                            <th className="px-4 py-2 border">Price</th>
                            <th className="px-4 py-2 border">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {estimationItems.map((item) => (
                            <tr key={item._id}>
                              <td className="px-4 text-center py-2 border">
                                {item.itemName}
                              </td>
                              <td className="px-4 text-center py-2 border">
                                {item.qty}
                              </td>
                              <td className="px-4 text-center py-2 border">
                                {item.price}
                              </td>
                              <td className="px-4 text-center py-2 border">
                                {item.total}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                )}

                <div className="flex gap-4">
                  <div className="flex-1 min-w-0">
                    <label className="block text-gray-700 font-medium mb-2">
                      Delivery Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                      required
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="block text-gray-700 font-medium mb-2">
                      Tax
                    </label>
                    <input
                      type="number"
                      value={tax}
                      onChange={(e) => setTax(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                      placeholder="Enter tax"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Total Amount
                  </label>
                  <input
                    type="text"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                    placeholder="Enter total amount"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-newPrimary text-white px-4 py-3 rounded-lg hover:bg-newPrimary/80 transition-colors disabled:bg-blue-300"
                >
                  {loading
                    ? "Saving..."
                    : editingPurchaseOrder
                    ? "Update Purchase Order"
                    : "Save Purchase Order"}
                </button>
              </form>
            </div>
          </div>
        )}
        {isView && selectedPurchaseOrder && (
          <ViewModel
            data={selectedPurchaseOrder}
            type="purchaseOrder"
            onClose={() => setIsView(false)}
          />
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

export default PurchaseOrder;
