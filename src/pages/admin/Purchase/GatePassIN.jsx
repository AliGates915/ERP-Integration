import React, { useState, useEffect, useRef, useCallback } from "react";
import { Eye, SquarePen, Trash2, X } from "lucide-react";
import CommanHeader from "../../../components/CommanHeader";
import TableSkeleton from "../Skeleton";
import Swal from "sweetalert2";
import axios from "axios";
import { api } from "../../../context/ApiService";
import ViewModel from "./ViewModel";

const GatepassIn = () => {
  const [gatepasses, setGatepasses] = useState([]);
  const [supplierList, setSupplierList] = useState([]);
  const [withOutPoSupplier, setWithOutPoSupplier] = useState("");
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [gatepassId, setGatepassId] = useState("");
  const [driverName, setDriverName] = useState("");
  const [toCompany, setToCompany] = useState("");
  const [poType, setPoType] = useState("withPO"); // Default to "With PO"
  const [itemsList, setItemsList] = useState([]);
  const [itemName, setItemName] = useState("");
  const [itemNameList, setItemNameList] = useState([]);
  const [itemQuantity, setItemQuantity] = useState("");
  const [itemUnits, setItemUnits] = useState("");
  const [isView, setIsView] = useState(false);
  const [selectedGatepass, setSelectedGatepass] = useState(null);
  const [itemUnitsList, setItemUnitsList] = useState([]);
  const [category, setCategory] = useState({ id: "", name: "" });
  const [againstPoNo, setAgainstPoNo] = useState("");
  const [driverNameWithoutPo, setDriverNameWithoutPo] = useState("");
  const [supplier, setSupplier] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("");
  const [selectedPoItems, setselectedPoItems] = useState(null);
  const [editingGatepass, setEditingGatepass] = useState(null);
  const [errors, setErrors] = useState({});
  const sliderRef = useRef(null);
  const [nextGatePassId, setGatePassId] = useState("001");
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  const API_URL = `${import.meta.env.VITE_API_BASE_URL}/gatePassIn`;
  // gate pass inn fetch
  const fetchGatePassInn = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}`);
      setGatepasses(res.data); // store actual categories array
    
    } catch (error) {
      console.error("Failed to fetch Supplier", error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);
  useEffect(() => {
    fetchGatePassInn();
  }, [fetchGatePassInn]);
  // next gass pass id creation
  useEffect(() => {
    if (gatepasses.length > 0) {
      const maxNo = Math.max(
        ...gatepasses.map((r) => {
          const match = r.gatePassId?.match(/GPIN-(\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        })
      );
      setGatePassId((maxNo + 1).toString().padStart(3, "0"));
    } else {
      setGatePassId("001");
    }
  }, [gatepasses]);

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

  // Fetch Categories
  const fetchCategory = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/categories`
      );
      setCategories(res.data);
     
    } catch (error) {
      console.error("Failed to fetch Category", error);
    } finally {
      setTimeout(() => setLoading(false), 2000);
    }
  }, []);

  useEffect(() => {
    fetchCategory();
  }, [fetchCategory]);

  // Fetch suppliers
  const fetchSupplier = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/suppliers`
      );
      setSupplierList(res.data);
     
    } catch (error) {
      console.error("Failed to fetch supplier", error);
    } finally {
      setTimeout(() => setLoading(false), 2000);
    }
  }, []);

  useEffect(() => {
    fetchSupplier();
  }, [fetchSupplier]);

  // Fetch suppliers
  const fetchGetItemNameByCategory = useCallback(async () => {
    if (!category.name) return;

    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/item-details/category/${
          category.name
        }`
      );
      setItemNameList(res.data);

    } catch (error) {
      console.error("Failed to fetch ItemName", error);
    } finally {
      setTimeout(() => setLoading(false), 2000);
    }
  }, [category]);

  useEffect(() => {
    fetchGetItemNameByCategory();
  }, [fetchGetItemNameByCategory]);

  //  Fetch Item Unit
  const fetchItemUnit = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/item-unit`
      );
      setItemUnitsList(res.data);
     
    } catch (error) {
      console.error("Failed to fetch item unit", error);
    } finally {
      setTimeout(() => setLoading(false), 2000);
    }
  }, []);

  useEffect(() => {
    fetchItemUnit();
  }, [fetchItemUnit]);

  // Format date for display
  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };
  // format date for input
  const formatDateForInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`; // yyyy-mm-dd
  };

  // Reset form fields
  const resetForm = () => {
    setGatepassId("");
    setToCompany("");
    setPoType("withPO"); // or default to "withoutPO" if that's your use case
    setItemsList([]);
    setItemName("");
    setItemQuantity("");
    setselectedPoItems(null);
    setItemUnits("");
    setCategory({ id: "", name: "" }); // reset properly
    setAgainstPoNo("");
    setSupplier("");
    setWithOutPoSupplier(""); // clear supplier dropdown
    setDriverName(""); // clear driver name for withPO
    setDriverNameWithoutPo(""); // clear driver name for withoutPO
    setDate("");
    setStatus("Permanent");
    setEditingGatepass(null);
    setErrors({});
    setIsSliderOpen(false);
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    const trimmedGatepassId = gatepassId.trim();
    const trimmedToCompany = toCompany.trim();
    const trimmedAgainstPoNo = againstPoNo.trim();
    const trimmedSupplier = supplier.trim();
    const trimmedWithoutSupplier = withOutPoSupplier.trim();

    // Gatepass ID required
    if (!trimmedGatepassId) newErrors.gatepassId = "Gatepass ID is required";

    // Date required
    if (!date) newErrors.date = "Date is required";

    // Status must be Permanent or Temporary
    if (!["Permanent", "Temporary"].includes(status)) {
      newErrors.status = "Status must be Permanent or Temporary";
    }

    if (poType === "withPO") {
      if (!trimmedAgainstPoNo) newErrors.againstPoNo = "PO Number is required";
      if (!driverName.trim()) newErrors.driverName = "Driver name is required";
    } else if (poType === "withoutPO") {
      if (!trimmedSupplier) newErrors.supplier = "Supplier is required";
      if (!trimmedWithoutSupplier)
        newErrors.withOutPoSupplier = "Supplier is required";
      if (!driverNameWithoutPo.trim())
        newErrors.driverNameWithoutPo = "Driver name is required";
      if (itemsList.length === 0)
        newErrors.itemsList = "At least one item is required";
      if (!category) newErrors.category = "Category is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handlers for form and table actions
  const handleAddClick = () => {
    resetForm();
    setIsSliderOpen(true);
  };

  const handleEditClick = (gatepass) => {
    setEditingGatepass(gatepass);
    setGatepassId(gatepass.gatePassId || "");
    setDate(formatDateForInput(gatepass.date));
    setStatus(gatepass.status || "Permanent");
  

    if (gatepass.type === "withPO") {
      setPoType("withPO");
      const matchedPO = purchaseOrders.find(
        (po) => po.purchaseOrderId === gatepass.withPO?.poNo
      );
      setAgainstPoNo(matchedPO?._id || "");
      setSupplier(gatepass.withPO?.supplier?.supplierName || "");
      setDriverName(gatepass.driverName || "");
      setItemsList(gatepass.withPO?.items || []);
      if (matchedPO) {
        setselectedPoItems(matchedPO);
      }
    } else {
      setPoType("withoutPO");
      setWithOutPoSupplier(gatepass.withoutPO?.supplier?._id || "");
      setDriverNameWithoutPo(gatepass.driverName || "");
      // normalize units for UI
      const normalizedItems = (gatepass.withoutPO?.items || []).map((item) => ({
        ...item,
        unitName: item.unit,
        unitId: "",
      }));

      setItemsList(normalizedItems);

      // set category only if one item exists (or handle multiple)
      if (gatepass.withoutPO?.items?.length > 0) {
        const firstItem = gatepass.withoutPO.items[0];
        setCategory({
          id: firstItem.category?._id || "",
          name: firstItem.category?.categoryName || "", // adjust if you store categoryName separately
        });
      }
    }

    setErrors({});
    setIsSliderOpen(true);
  };

  const handleAddItem = () => {
    const parsedItemQuantity = parseInt(itemQuantity, 10);

    if (
      !itemName ||
      !itemQuantity ||
      isNaN(parsedItemQuantity) ||
      parsedItemQuantity <= 0 ||
      !itemUnits
    ) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Item",
        text: "Please enter a valid item name, positive quantity, and select units.",
        confirmButtonColor: "#d33",
      });
      return;
    }

    // find selected item & unit objects
    const selectedItem = itemNameList.find((i) => i._id === itemName);
    const selectedUnit = itemUnitsList.find((u) => u._id === itemUnits);

    setItemsList([
      ...itemsList,
      {
        itemId: itemName, // ID
        itemName: selectedItem?.itemName, // Name
        qty: parsedItemQuantity,
        unitId: itemUnits, // ID
        unitName: selectedUnit?.unitName, // Name
      },
    ]);

    // reset
    setItemName("");
    setItemQuantity("");
    setItemUnits("");
    setErrors((prev) => ({ ...prev, itemsList: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { token } = userInfo || {};
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    // if (!validateForm()) {
    //   Swal.fire({
    //     icon: "warning",
    //     title: "Missing or Invalid Fields",
    //     html: `Please correct the following errors:<br/><ul class='list-disc pl-5'>${Object.values(
    //       errors
    //     )
    //       .map((err) => `<li>${err}</li>`)
    //       .join("")}</ul>`,
    //     confirmButtonColor: "#d33",
    //   });
    //   return;
    // }

    let newGatepass;

    if (poType === "withPO") {
      newGatepass = {
        gatePassId: editingGatepass ? gatepassId : `GPIN-${nextGatePassId}`,
        type: "withPO",
        driverName: driverName.trim(),
        withPO: {
          poNo: againstPoNo, // PO _id
        },
        status,
        supplierName: supplierId,
      };
    } else {
      newGatepass = {
        gatePassId: editingGatepass ? gatepassId : `GPIN-${nextGatePassId}`,
        type: "withoutPO",
        driverName: driverNameWithoutPo.trim(),
        status,
        withoutPO: {
          supplierName: withOutPoSupplier, // now inside withoutPO
          items: itemsList.map((item) => ({
            category: category.id,
            itemName: item.itemName,
            qty: item.qty,
            unit: item.unitName,
          })),
        },
      };
    }

    if (editingGatepass) {
      await api.put(`/gatePassIn/${editingGatepass._id}`, newGatepass, {
        headers,
      });

      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "Gatepass updated successfully.",
        confirmButtonColor: "#3085d6",
      });
    } else {
      await api.post("/gatePassIn", newGatepass, { headers });
      Swal.fire({
        icon: "success",
        title: "Added!",
        text: "Gatepass added successfully.",
        confirmButtonColor: "#3085d6",
      });
    }
    fetchGatePassInn();
    resetForm();
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
          const { token } = userInfo || {};
          const headers = {
            Authorization: `Bearer ${token}`,
          };
          await api.delete(`/gatePassIn/${id}`, { headers });
          setGatepasses(gatepasses.filter((g) => g._id !== id));
          swalWithTailwindButtons.fire(
            "Deleted!",
            "Gatepass deleted successfully.",
            "success"
          );
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire(
            "Cancelled",
            "Gatepass is safe 🙂",
            "error"
          );
        }
      });
  };

  function handleRemoveItem(index) {
    setItemsList(itemsList.filter((_, i) => i !== index));
  }
  const handleView = (gatepass) => {
    setSelectedGatepass(gatepass);
    setIsView(true);
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <CommanHeader />
      <div className="px-6 mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-newPrimary">
              Gatepass In Details
            </h1>
          </div>
          <button
            className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/80"
            onClick={handleAddClick}
          >
            + Add Gatepass
          </button>
        </div>

        <div className="rounded-xl shadow border border-gray-200 overflow-hidden">
          <div className="overflow-y-auto lg:overflow-x-auto max-h-[400px]">
            <div className="min-w-[1200px]">
              {/* Table Header */}
              <div className="hidden lg:grid grid-cols-[1fr_1fr_1fr_1fr_1fr_auto] gap-6 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200">
                <div>GatePass ID</div>
                <div>Driver Name</div>
                {/* <div>Items Category</div> */}
                <div>Supplier</div>
                {/* <div>Items</div> */}
                <div>Date</div>
                <div>Status</div>
                <div className="text-right">Actions</div>
              </div>

              {/* Table Body */}
              <div className="flex flex-col divide-y divide-gray-100">
                {loading ? (
                  <TableSkeleton
                    rows={gatepasses.length || 5}
                    cols={6}
                    className="lg:grid-cols-[1fr_1fr_1fr_1fr_1fr_auto]"
                  />
                ) : gatepasses.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 bg-white">
                    No gatepasses found.
                  </div>
                ) : (
                  gatepasses.map((gatepass) => {
                    const isWithPO = gatepass.type === "withPO";
                    const poData = gatepass.withPO;
                    const withoutPOData = gatepass.withoutPO;

                    return (
                      <div
                        key={gatepass._id}
                        className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1fr_1fr_1fr_auto] items-center gap-6 px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                      >
                        {/* GatePass ID */}
                        <div className="font-medium text-gray-900">
                          {gatepass.gatePassId}
                        </div>

                        {/* Driver Name */}
                        <div className="text-gray-600">
                          {gatepass.driverName}
                        </div>

                        {/* Supplier */}
                        <div className="text-gray-600">
                          {isWithPO
                            ? poData?.supplier?.supplierName || "-"
                            : withoutPOData?.supplier?.supplierName || "-"}
                        </div>

                        {/* Items */}
                        {/* <div className="text-gray-600">
                          <div className="flex flex-wrap gap-2">
                            {isWithPO
                              ? poData?.items?.map((item, idx) => (
                                  <span
                                    key={idx}
                                    className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                  >
                                    {item.itemName} (Qty: {item.qty}, Price:{" "}
                                    {item.price})
                                  </span>
                                ))
                              : withoutPOData?.map((item, idx) => (
                                  <span
                                    key={idx}
                                    className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                                  >
                                    {item.itemName} (Qty: {item.qty} {item.unit}
                                    )
                                  </span>
                                ))}
                          </div>
                        </div> */}

                        {/* Date */}
                        <div className="text-gray-500">
                          {formatDate(gatepass.date)}
                        </div>

                        {/* Status */}
                        <div className="text-gray-600">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              gatepass.status === "Permanent"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {gatepass.status}
                          </span>
                        </div>

                        {/* Actions */}
                        <div>
                          <button
                            onClick={() => handleEditClick(gatepass)}
                            className="py-1 text-sm rounded text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit"
                          >
                            <SquarePen size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(gatepass._id)}
                            className="px-3 py-1 text-sm rounded text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                          <button
                            onClick={() => handleView(gatepass)}
                            className="py-1 text-sm text-amber-600 hover:bg-amber-50"
                            title="View"
                          >
                            <Eye size={18} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {isSliderOpen && (
          <div className="fixed inset-0 bg-gray-600/50 flex items-center justify-center z-50">
            <div
              ref={sliderRef}
              className="w-full md:w-[650px] bg-white rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white rounded-t-2xl">
                <h2 className="text-xl font-bold text-newPrimary">
                  {editingGatepass ? "Update Gatepass" : "Add Gatepass In"}
                </h2>
                <button
                  className="w-8 h-8 bg-newPrimary text-white rounded-full flex items-center justify-center hover:bg-newPrimary/70"
                  onClick={resetForm}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 p-4 md:p-6">
                <div className="flex gap-4">
                  <div className="flex-1 min-w-0">
                    <label className="block text-gray-700 font-medium mb-2">
                      Gatepass ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={
                        editingGatepass ? gatepassId : `GPIN-${nextGatePassId}`
                      }
                      readOnly
                      onChange={(e) => setGatepassId(e.target.value)}
                      className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                        errors.gatepassId
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-newPrimary"
                      }`}
                      placeholder="Enter gatepass ID"
                      required
                    />

                    {errors.gatepassId && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.gatepassId}
                      </p>
                    )}
                  </div>
                  {/* date */}
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
                      <p className="text-red-500 text-xs mt-1">{errors.date}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Show both radios only in Add mode */}
                  {!editingGatepass ? (
                    <>
                      <label className="block text-gray-700 font-medium">
                        <input
                          type="radio"
                          value="withPO"
                          checked={poType === "withPO"}
                          onChange={(e) => setPoType(e.target.value)}
                          className="mr-2"
                        />
                        With PO
                      </label>
                      <label className="block text-gray-700 font-medium">
                        <input
                          type="radio"
                          value="withoutPO"
                          checked={poType === "withoutPO"}
                          onChange={(e) => setPoType(e.target.value)}
                          className="mr-2"
                        />
                        Without PO
                      </label>
                    </>
                  ) : (
                    // In edit mode, show only the one originally selected
                    <label className="block text-gray-700 font-medium">
                      <input
                        type="radio"
                        value={poType}
                        checked
                        readOnly
                        className="mr-2"
                      />
                      {poType === "withPO" ? "With PO" : "Without PO"}
                    </label>
                  )}
                </div>

                {poType === "withPO" && (
                  <>
                    <div className="flex gap-4">
                      <div className="flex-1 min-w-0">
                        <label className="block text-gray-700 font-medium mb-2">
                          Against PO No. <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={againstPoNo}
                          onChange={(e) => {
                            const selectedId = e.target.value;
                            setAgainstPoNo(selectedId);

                            // 🔑 Find selected PO
                            const selectedPO = purchaseOrders.find(
                              (po) => po._id === selectedId
                            );
                          
                            if (selectedPO) {
                              // supplier is nested inside -> estimation.demandItem.supplier.supplierName
                              setSupplier(
                                selectedPO.estimation?.demandItem?.supplier
                                  ?.supplierName || ""
                              );
                              setSupplierId(
                                selectedPO.estimation?.demandItem?.supplier?._id
                              );
                              setselectedPoItems(selectedPO);
                            }
                          }}
                          className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                            errors.supplier
                              ? "border-red-500 focus:ring-red-500"
                              : "border-gray-300 focus:ring-newPrimary"
                          }`}
                          required
                        >
                          <option value="">Select PO No</option>
                          {purchaseOrders?.map((po) => (
                            <option key={po._id} value={po._id}>
                              {po.purchaseOrderId}
                            </option>
                          ))}
                        </select>

                        {errors.againstPoNo && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.againstPoNo}
                          </p>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <label className="block text-gray-700 font-medium mb-2">
                          Supplier <span className="text-red-500">*</span>
                        </label>
                        <input
                          type=""
                          value={supplier}
                          onChange={(e) => setSupplier(e.target.value)}
                          className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                            errors.supplier
                              ? "border-red-500 focus:ring-red-500"
                              : "border-gray-300 focus:ring-newPrimary"
                          }`}
                          readOnly
                        />
                        {errors.supplier && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.supplier}
                          </p>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <label className="block text-gray-700 font-medium mb-2">
                          Driver Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={driverName}
                          onChange={(e) => setDriverName(e.target.value)}
                          className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                            errors.driverName
                              ? "border-red-500 focus:ring-red-500"
                              : "border-gray-300 focus:ring-newPrimary"
                          }`}
                          placeholder="Enter driver name"
                          required
                        />
                        {errors.driverName && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.driverName}
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}
                {poType === "withPO" &&
                  selectedPoItems &&
                  selectedPoItems.items?.length > 0 && (
                    <div className="mt-4">
                      <div className="overflow-x-auto">
                        <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                          <thead className="bg-gray-100 text-gray-600 text-sm">
                            <tr>
                              <th className="px-4 py-2 border-b text-left">
                                Sr #
                              </th>
                              <th className="px-4 py-2 border-b text-left">
                                Item Name
                              </th>
                              <th className="px-4 py-2 border-b text-left">
                                Quantity
                              </th>
                              <th className="px-4 py-2 border-b text-left">
                                Price
                              </th>
                            </tr>
                          </thead>
                          <tbody className="text-gray-700 text-sm">
                            {selectedPoItems.items.map((item, idx) => (
                              <tr
                                key={item._id || idx}
                                className="hover:bg-gray-50"
                              >
                                <td className="px-4 py-2 border-b">
                                  {idx + 1}
                                </td>
                                <td className="px-4 py-2 border-b">
                                  {item.itemName}
                                </td>
                                <td className="px-4 py-2 border-b">
                                  {item.qty}
                                </td>
                                <td className="px-4 py-2 border-b">
                                  {item.price}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                {poType === "withoutPO" && (
                  <>
                    <div className="flex gap-4">
                      {/* Category */}
                      <div className="flex-1 min-w-0">
                        <label className="block text-gray-700 font-medium mb-2">
                          Category <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={category.id}
                          onChange={(e) => {
                            const selected = categories.find(
                              (cat) => cat._id === e.target.value
                            );
                            setCategory({
                              id: selected?._id || "",
                              name: selected?.categoryName || "",
                            });
                            if (editingGatepass) {
                              setItemsList([]);
                            }
                          }}
                          className="w-full p-3 border rounded-md"
                          required
                        >
                          <option value="">Select Category</option>
                          {categories?.map((cat) => (
                            <option key={cat._id} value={cat._id}>
                              {cat.categoryName}
                            </option>
                          ))}
                        </select>

                        {errors.category && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.category}
                          </p>
                        )}
                      </div>

                      {/* Supplier */}
                      <div className="flex-1 min-w-0">
                        <label className="block text-gray-700 font-medium mb-2">
                          Supplier <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={withOutPoSupplier}
                          onChange={(e) => setWithOutPoSupplier(e.target.value)}
                          className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                            errors.supplier
                              ? "border-red-500 focus:ring-red-500"
                              : "border-gray-300 focus:ring-newPrimary"
                          }`}
                          required
                        >
                          <option value="">Select Supplier</option>

                          {/*supplierr list */}
                          {supplierList.map((s) => (
                            <option key={s._id} value={s._id}>
                              {s.supplierName}
                            </option>
                          ))}
                        </select>

                        {errors.withOutPoSupplier && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.withOutPoSupplier}
                          </p>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <label className="block text-gray-700 font-medium mb-2">
                          Driver Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={driverNameWithoutPo}
                          onChange={(e) =>
                            setDriverNameWithoutPo(e.target.value)
                          }
                          className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                            errors.driverNameWithoutPo
                              ? "border-red-500 focus:ring-red-500"
                              : "border-gray-300 focus:ring-newPrimary"
                          }`}
                          placeholder="Enter driver name"
                          required
                        />
                        {errors.driverNameWithoutPo && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.driverNameWithoutPo}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between gap-2 items-end">
                        <div className="flex-1">
                          <label className="block text-gray-700 font-medium mb-2">
                            Item Name <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={itemName}
                            onChange={(e) => setItemName(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                          >
                            <option value="">Select Item</option>
                            {itemNameList.map((item) => (
                              <option key={item._id} value={item._id}>
                                {item.itemName}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex-1">
                          <label className="block text-gray-700 font-medium mb-2">
                            Quantity <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            value={itemQuantity}
                            onChange={(e) => setItemQuantity(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                            placeholder="Enter quantity"
                            min="1"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-gray-700 font-medium mb-2">
                            Units <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={itemUnits}
                            onChange={(e) => setItemUnits(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                          >
                            <option value="">Select Unit</option>
                            {itemUnitsList.map((item) => (
                              <option key={item._id} value={item._id}>
                                {item.unitName}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <button
                            type="button"
                            onClick={handleAddItem}
                            className="w-16 h-12 bg-newPrimary text-white rounded-lg hover:bg-newPrimary/80 transition"
                          >
                            + Add
                          </button>
                        </div>
                      </div>
                      {errors.itemsList && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.itemsList}
                        </p>
                      )}
                      {itemsList.length > 0 && (
                        <div className="overflow-x-auto">
                          <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                            <thead className="bg-gray-100 text-gray-600 text-sm">
                              <tr>
                                <th className="px-4 py-2 border-b">Sr #</th>
                                <th className="px-4 py-2 border-b">
                                  Item Name
                                </th>
                                <th className="px-4 py-2 border-b">Quantity</th>
                                <th className="px-4 py-2 border-b">Units</th>
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
                                    {item.itemName}
                                  </td>
                                  <td className="px-4 py-2 border-b text-center">
                                    {item.qty}
                                  </td>
                                  <td className="px-4 py-2 border-b text-center">
                                    {item.unitName}
                                  </td>
                                  <td className="px-4 py-2 border-b text-center">
                                    <button
                                      onClick={() => handleRemoveItem(idx)}
                                    >
                                      <X size={18} className="text-red-600" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </>
                )}
                <div className="flex gap-4">
                  <div className="flex-1 min-w-0">
                    <label className="block text-gray-700 font-medium mb-2">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className={`w-[49%] p-3 border rounded-md focus:outline-none focus:ring-2 ${
                        errors.status
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-newPrimary"
                      }`}
                      required
                    >
                      <option value="Permanent">Permanent</option>
                      <option value="Temporary">Temporary</option>
                    </select>
                    {errors.status && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.status}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-newPrimary text-white px-4 py-3 rounded-lg hover:bg-newPrimary/80 transition-colors disabled:bg-blue-300"
                >
                  {loading
                    ? "Saving..."
                    : editingGatepass
                    ? "Update Gatepass"
                    : "Save Gatepass In"}
                </button>
              </form>
            </div>
          </div>
        )}

        {isView && selectedGatepass && (
          <ViewModel
            data={selectedGatepass}
            type="gatepass"
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

export default GatepassIn;