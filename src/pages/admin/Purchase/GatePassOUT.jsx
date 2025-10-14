import React, { useState, useEffect, useRef } from "react";
import { SquarePen, Trash2 } from "lucide-react";
import CommanHeader from "../../../components/CommanHeader";
import TableSkeleton from "../Skeleton";
import Swal from "sweetalert2";

const GatePassOut = () => {
  const [gatepasses, setGatepasses] = useState([
    {
      _id: "1",
      gatepassId: "GPO001",
      driverName: "Bilal Ahmed",
      itemsCategory: "Electronics",
      supplier: "Tech Corp",
      items: [{ name: "Laptop", qty: 2, units: "Units" }],
      date: "2025-09-10",
      status: true,
      createdAt: new Date().toISOString(),
      toCompany: "ABC Corp",
      grnType: "Reject/Damage",
      poNo: "PO001",
    },
    {
      _id: "2",
      gatepassId: "GPO002",
      driverName: "Sara Khan",
      itemsCategory: "Furniture",
      supplier: "WoodWorks Ltd",
      items: [{ name: "Chair", qty: 5, units: "Units" }],
      date: "2025-09-12",
      status: false,
      createdAt: new Date().toISOString(),
      toCompany: "XYZ Ltd",
      grnType: "Success GRN",
      poNo: "PO002",
    },
    {
      _id: "3",
      gatepassId: "GPO003",
      driverName: "Hassan Raza",
      itemsCategory: "Stationery",
      supplier: "Office Supplies",
      items: [{ name: "Pens", qty: 100, units: "Units" }],
      date: "2025-09-15",
      status: true,
      createdAt: new Date().toISOString(),
      toCompany: "Tech Solutions",
      grnType: "Reject/Damage",
      poNo: "PO003",
    },
  ]);

  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [gatepassId, setGatepassId] = useState("");
  const [driverName, setDriverName] = useState("");
  const [toCompany, setToCompany] = useState("");
  const [grnType, setGrnType] = useState("Reject/Damage");
  const [poType, setPoType] = useState("withPO");
  const [itemsList, setItemsList] = useState([]);
  const [itemCategory, setItemCategory] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemQuantity, setItemQuantity] = useState("");
  const [poNo, setPoNo] = useState("");
  const [supplier, setSupplier] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("Pending");
  const [editingGatepass, setEditingGatepass] = useState(null);
  const [errors, setErrors] = useState({});
  const sliderRef = useRef(null);

  const companyOptions = [
    "ABC Corp",
    "XYZ Ltd",
    "Tech Solutions",
    "Global Supplies",
  ];
  const poOptions = ["PO001", "PO002", "PO003"];
  const categoryOptions = [
    "Electronics",
    "Stationery",
    "IT Equipment",
    "Furniture",
  ];
  const itemOptions = ["Laptop", "Desktop", "Printer", "Chair", "Pens"];

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000); // Simulate loading
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sliderRef.current && !sliderRef.current.contains(event.target)) {
        resetForm();
      }
    };
    if (isSliderOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSliderOpen]);

  const resetForm = () => {
    setGatepassId("");
    setDriverName("");
    setToCompany("");
    setGrnType("Reject/Damage");
    setPoType("withPO");
    setItemsList([]);
    setItemCategory("");
    setItemName("");
    setItemQuantity("");
    setPoNo("");
    setSupplier("");
    setDate("");
    setStatus("Pending");
    setEditingGatepass(null);
    setErrors({});
    setIsSliderOpen(false);
  };

  const validateForm = () => {
    const newErrors = {};
    const trimmedGatepassId = gatepassId.trim();
    const trimmedDriverName = driverName.trim();
    const trimmedToCompany = toCompany.trim();
    const trimmedPoNo = poNo.trim();
    const trimmedSupplier = supplier.trim();

    if (!trimmedGatepassId) newErrors.gatepassId = "Gatepass ID is required";
    if (!trimmedDriverName) newErrors.driverName = "Driver Name is required";
    if (!trimmedToCompany) newErrors.toCompany = "To Company is required";
    if (!date) newErrors.date = "Date is required";
    if (!status) newErrors.status = "Status is required";

    if (poType === "withPO") {
      if (!trimmedPoNo) newErrors.poNo = "PO Number is required";
      if (!trimmedSupplier) newErrors.supplier = "Supplier is required";
    } else if (poType === "withoutPO") {
      if (!itemCategory) newErrors.itemCategory = "Item Category is required";
      if (itemsList.length === 0)
        newErrors.itemsList = "At least one item is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddClick = () => {
    resetForm();
    setIsSliderOpen(true);
  };

  const handleEditClick = (gatepass) => {
    setEditingGatepass(gatepass);
    setGatepassId(gatepass.gatepassId);
    setDriverName(gatepass.driverName);
    setToCompany(gatepass.toCompany || "");
    setGrnType(gatepass.grnType || "Reject/Damage");
    setPoType(gatepass.poNo ? "withPO" : "withoutPO");
    setItemsList(gatepass.items || []);
    setItemCategory(gatepass.itemsCategory || "");
    setItemName("");
    setItemQuantity("");
    setPoNo(gatepass.poNo || "");
    setSupplier(gatepass.supplier || "");
    setDate(formatDate(gatepass.date));
    setStatus(gatepass.status ? "Active" : "Inactive");
    setErrors({});
    setIsSliderOpen(true);
  };

  const handleAddItem = () => {
    const trimmedItemName = itemName.trim();
    const parsedItemQuantity = parseInt(itemQuantity, 10);

    if (
      !trimmedItemName ||
      !itemQuantity ||
      isNaN(parsedItemQuantity) ||
      parsedItemQuantity <= 0
    ) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Item",
        text: "Please enter a valid item name and positive quantity.",
        confirmButtonColor: "#d33",
      });
      return;
    }

    setItemsList([
      ...itemsList,
      { name: trimmedItemName, qty: parsedItemQuantity, units: "Units" },
    ]);
    setItemName("");
    setItemQuantity("");
    setErrors((prev) => ({ ...prev, itemsList: null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      Swal.fire({
        icon: "warning",
        title: "Missing or Invalid Fields",
        html: `Please correct the following errors:<br/><ul class='list-disc pl-5'>${Object.values(
          errors
        )
          .map((err) => `<li>${err}</li>`)
          .join("")}</ul>`,
        confirmButtonColor: "#d33",
      });
      return;
    }

    const newGatepass = {
      _id: editingGatepass ? editingGatepass._id : Date.now().toString(),
      gatepassId: gatepassId.trim(),
      driverName: driverName.trim(),
      toCompany: toCompany.trim(),
      grnType,
      itemsCategory: poType === "withoutPO" ? itemCategory : "",
      supplier: poType === "withPO" ? supplier : "",
      items: poType === "withoutPO" ? itemsList : [],
      poNo: poType === "withPO" ? poNo : "",
      date,
      status: status === "Active",
      createdAt: new Date().toISOString(),
    };

    if (editingGatepass) {
      setGatepasses(
        gatepasses.map((g) => (g._id === editingGatepass._id ? newGatepass : g))
      );
      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "Gatepass updated successfully.",
        confirmButtonColor: "#3085d6",
      });
    } else {
      setGatepasses([...gatepasses, newGatepass]);
      Swal.fire({
        icon: "success",
        title: "Added!",
        text: "Gatepass added successfully.",
        confirmButtonColor: "#3085d6",
      });
    }

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
      .then((result) => {
        if (result.isConfirmed) {
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

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <CommanHeader />
      <div className="px-6 mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-newPrimary">
              Gatepass Out Details
            </h1>
          </div>
          <button
            className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/80"
            onClick={handleAddClick}
            aria-label="Add new gatepass"
          >
            + Add Gatepass
          </button>
        </div>

        <div className="rounded-xl shadow border border-gray-200 overflow-hidden">
          <div className="overflow-y-auto lg:overflow-x-auto max-h-[400px] scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
            <div className="min-w-[1200px]">
              {/* Table Header */}
              <div className="hidden lg:grid grid-cols-[1fr_1fr_1fr_1fr_3fr_1fr_1fr_auto] gap-6 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200">
                <div>GatePassOUT ID</div>
                <div>Driver Name</div>
                <div>Items Category</div>
                <div>Supplier</div>
                <div>Items</div>
                <div>Date</div>
                <div>Status</div>
                <div className="text-right">Actions</div>
              </div>

              <div className="flex flex-col divide-y divide-gray-100">
                {loading ? (
                  <TableSkeleton
                    rows={3}
                    cols={8}
                    className="lg:grid-cols-[1fr_1fr_1fr_1fr_3fr_1fr_1fr_auto]"
                  />
                ) : gatepasses.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 bg-white">
                    No gatepasses found.
                  </div>
                ) : (
                  gatepasses.map((gatepass) => (
                    <div
                      key={gatepass._id}
                      className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1fr_1fr_3fr_1fr_1fr_auto] items-center gap-6 px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                    >
                      <div className="font-medium text-gray-900">
                        {gatepass.gatepassId}
                      </div>
                      <div className="text-gray-600">{gatepass.driverName}</div>
                      <div className="text-gray-600">
                        {gatepass.itemsCategory}
                      </div>
                      <div className="text-gray-600">{gatepass.supplier}</div>
                      <div className="text-gray-600">
                        <div className="flex flex-wrap gap-2">
                          {gatepass.items && gatepass.items.length > 0 ? (
                            gatepass.items.map((item, idx) => (
                              <div key={idx} className="flex gap-2">
                                <span
                                  className="px-3 py-1 rounded-full text-xs font-medium"
                                  style={{
                                    backgroundColor: `hsl(${
                                      (idx * 70) % 360
                                    }, 80%, 85%)`,
                                    color: `hsl(${(idx * 70) % 360}, 40%, 25%)`,
                                  }}
                                >
                                  {item.name}
                                </span>
                                <span
                                  className="px-3 py-1 rounded-full text-xs font-medium"
                                  style={{
                                    backgroundColor: `hsl(${
                                      (idx * 70 + 35) % 360
                                    }, 80%, 85%)`,
                                    color: `hsl(${
                                      (idx * 70 + 35) % 360
                                    }, 40%, 25%)`,
                                  }}
                                >
                                  Qty: {item.qty} {item.units}
                                </span>
                              </div>
                            ))
                          ) : (
                            <span className="text-gray-500">No items</span>
                          )}
                        </div>
                      </div>
                      <div className="text-gray-500">
                        {formatDate(gatepass.date)}
                      </div>
                      <div className="text-gray-600">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            gatepass.status
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {gatepass.status ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div>
                        <button
                          onClick={() => handleEditClick(gatepass)}
                          className="py-1 text-sm rounded text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit"
                          aria-label={`Edit gatepass ${gatepass.gatepassId}`}
                        >
                          <SquarePen size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(gatepass._id)}
                          className="px-3 py-1 text-sm rounded text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete"
                          aria-label={`Delete gatepass ${gatepass.gatepassId}`}
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
        </div>

        {isSliderOpen && (
          <div className="fixed inset-0 bg-gray-600/50 flex items-center justify-center z-50">
            <div
              ref={sliderRef}
              className="w-full md:w-[750px] bg-white rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white rounded-t-2xl">
                <h2 className="text-xl font-bold text-newPrimary">
                  {editingGatepass
                    ? "Update Gatepass"
                    : "Add a New GatepassOut"}
                </h2>
                <button
                  className="w-8 h-8 bg-newPrimary text-white rounded-full flex items-center justify-center hover:bg-newPrimary/70"
                  onClick={resetForm}
                  aria-label="Close form"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 p-4 md:p-6">
                <div className="flex items-center gap-4">
                  <label className="block text-gray-700 font-medium">
                    <input
                      type="radio"
                      value="Reject/Damage"
                      checked={grnType === "Reject/Damage"}
                      onChange={(e) => setGrnType(e.target.value)}
                      className="mr-2"
                    />
                    Reject/Damage
                  </label>
                  <label className="block text-gray-700 font-medium">
                    <input
                      type="radio"
                      value="Success GRN"
                      checked={grnType === "Success GRN"}
                      onChange={(e) => setGrnType(e.target.value)}
                      className="mr-2"
                    />
                    Success GRN
                  </label>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1 min-w-0">
                    <label className="block text-gray-700 font-medium mb-2">
                      GatepassOut ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={gatepassId}
                      onChange={(e) => setGatepassId(e.target.value)}
                      className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                        errors.gatepassId
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-newPrimary"
                      }`}
                      placeholder="Enter gatepass ID"
                      required
                      aria-describedby={
                        errors.gatepassId ? "gatepassId-error" : undefined
                      }
                    />
                    {errors.gatepassId && (
                      <p
                        id="gatepassId-error"
                        className="text-red-500 text-xs mt-1"
                      >
                        {errors.gatepassId}
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
                      aria-describedby={errors.date ? "date-error" : undefined}
                    />
                    {errors.date && (
                      <p id="date-error" className="text-red-500 text-xs mt-1">
                        {errors.date}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
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
                </div>

                {poType === "withPO" && (
                  <>
                    <div className="space-y-3 border p-4 pb-6 rounded-lg bg-gray-50">
                      <div className="w-[49%]">
                        <div className="flex-1 min-w-0">
                          <label className="block text-gray-700 font-medium mb-2">
                            PO No. <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={poNo}
                            onChange={(e) => setPoNo(e.target.value)}
                            className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                              errors.poNo
                                ? "border-red-500 focus:ring-red-500"
                                : "border-gray-300 focus:ring-newPrimary"
                            }`}
                            required
                            aria-describedby={
                              errors.poNo ? "poNo-error" : undefined
                            }
                          >
                            <option value="">Select PO Number</option>
                            {poOptions.map((po) => (
                              <option key={po} value={po}>
                                {po}
                              </option>
                            ))}
                          </select>
                          {errors.poNo && (
                            <p
                              id="poNo-error"
                              className="text-red-500 text-xs mt-1"
                            >
                              {errors.poNo}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-1 min-w-0">
                          <label className="block text-gray-700 font-medium mb-2">
                            Supplier <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={supplier}
                            onChange={(e) => setSupplier(e.target.value)}
                            className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                              errors.supplier
                                ? "border-red-500 focus:ring-red-500"
                                : "border-gray-300 focus:ring-newPrimary"
                            }`}
                            placeholder="Enter supplier"
                            required
                            aria-describedby={
                              errors.supplier ? "supplier-error" : undefined
                            }
                          />
                          {errors.supplier && (
                            <p
                              id="supplier-error"
                              className="text-red-500 text-xs mt-1"
                            >
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
                            aria-describedby={
                              errors.driverName ? "driverName-error" : undefined
                            }
                          />
                          {errors.driverName && (
                            <p
                              id="driverName-error"
                              className="text-red-500 text-xs mt-1"
                            >
                              {errors.driverName}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {poType === "withoutPO" && (
                  <div className="space-y-4 border p-4 rounded-lg bg-gray-50 pb-6">
                    <div className="flex gap-4">
                      <div className="flex-1 min-w-0">
                        <label className="block text-gray-700 font-medium mb-2">
                          Supplier <span className="text-red-500">*</span>
                        </label>

                        <select
                          value={supplier}
                          onChange={(e) => setSupplier(e.target.value)}
                          className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                            errors.supplier
                              ? "border-red-500 focus:ring-red-500"
                              : "border-gray-300 focus:ring-newPrimary"
                          }`}
                          required
                          aria-describedby={
                            errors.supplier ? "supplier-error" : undefined
                          }
                        >
                          <option value="">Select Supplier</option>
                          <option value="ABC Supplier">ABC Supplier</option>
                          <option value="XYZ Supplier">XYZ Supplier</option>
                          <option value="PQR Supplier">PQR Supplier</option>
                        </select>

                        {errors.supplier && (
                          <p
                            id="supplier-error"
                            className="text-red-500 text-xs mt-1"
                          >
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
                          aria-describedby={
                            errors.driverName ? "driverName-error" : undefined
                          }
                        />
                        {errors.driverName && (
                          <p
                            id="driverName-error"
                            className="text-red-500 text-xs mt-1"
                          >
                            {errors.driverName}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1 min-w-0">
                        <label className="block text-gray-700 font-medium mb-2">
                          Item Category <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={itemCategory}
                          onChange={(e) => setItemCategory(e.target.value)}
                          className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                            errors.itemCategory
                              ? "border-red-500 focus:ring-red-500"
                              : "border-gray-300 focus:ring-newPrimary"
                          }`}
                          required
                          aria-describedby={
                            errors.itemCategory
                              ? "itemCategory-error"
                              : undefined
                          }
                        >
                          <option value="">Select Category</option>
                          {categoryOptions.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                        {errors.itemCategory && (
                          <p
                            id="itemCategory-error"
                            className="text-red-500 text-xs mt-1"
                          >
                            {errors.itemCategory}
                          </p>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <label className="block text-gray-700 font-medium mb-2">
                          Item Name <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={itemName}
                          onChange={(e) => setItemName(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                        >
                          <option value="">Select Item</option>
                          {itemOptions.map((item) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1 min-w-0">
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
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={handleAddItem}
                          className="w-16 h-12 bg-newPrimary text-white rounded-lg hover:bg-newPrimary/80 transition"
                          aria-label="Add item"
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
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <table className="w-full border-collapse">
                          <thead className="bg-gray-200 text-gray-600 text-sm border border-gray-300">
                            <tr>
                              <th className="px-4 py-2 border border-gray-300">
                                Sr #
                              </th>
                              <th className="px-4 py-2 border border-gray-300">
                                Item Name
                              </th>
                              <th className="px-4 py-2 border border-gray-300">
                                Quantity
                              </th>
                              <th className="px-4 py-2 border border-gray-300">
                                Units
                              </th>
                            </tr>
                          </thead>
                          <tbody className="text-gray-700 text-sm ">
                            {itemsList.map((item, idx) => (
                              <tr
                                key={idx}
                                className="bg-gray-100 text-center border border-gray-300"
                              >
                                <td className="px-4 py-2 text-center border border-gray-300">
                                  {idx + 1}
                                </td>
                                <td className="px-4 py-2 border border-gray-300">
                                  {item.name}
                                </td>
                                <td className="px-4 py-2 text-center border border-gray-300">
                                  {item.qty}
                                </td>
                                <td className="px-4 py-2 border border-gray-300">
                                  {item.units}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex gap-4 w-[49%]">
                  <div className="flex-1 min-w-0">
                    <label className="block text-gray-700 font-medium mb-2">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                        errors.status
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-newPrimary"
                      }`}
                      required
                      aria-describedby={
                        errors.status ? "status-error" : undefined
                      }
                    >
                      <option value="Permanent">Permanent</option>
                      <option value="Temporary">Temporary</option>
                    </select>
                    {errors.status && (
                      <p
                        id="status-error"
                        className="text-red-500 text-xs mt-1"
                      >
                        {errors.status}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-newPrimary text-white px-4 py-3 rounded-lg hover:bg-newPrimary/80 transition-colors disabled:bg-blue-300"
                  aria-label={
                    editingGatepass ? "Update gatepass" : "Save gatepass"
                  }
                >
                  {loading
                    ? "Saving..."
                    : editingGatepass
                    ? "Update Gatepass"
                    : "Save GatepassOut"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GatePassOut;
