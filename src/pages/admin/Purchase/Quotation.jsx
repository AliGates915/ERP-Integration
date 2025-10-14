import React, { useState, useEffect, useRef, useCallback } from "react";
import { Eye, SquarePen, Trash2, X } from "lucide-react";
import CommanHeader from "../../../components/CommanHeader";
import TableSkeleton from "../Skeleton";
import Swal from "sweetalert2";
import axios from "axios";
import ViewQuotation from "./ViewQuotation";

const Quotation = () => {
  const [quotations, setQuotations] = useState([]);
  const [viewingQuotation, setViewingQuotation] = useState(null);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [quotationNo, setQuotationNo] = useState("");
  const [supplier, setSupplier] = useState("");
  const [forDemand, setForDemand] = useState("");
  const [person, setPerson] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [designation, setDesignation] = useState("");
  const [itemsList, setItemsList] = useState([]);
  const [demandList, setDemandList] = useState([]);
  const [itemName, setItemName] = useState("");
  const [itemQuantity, setItemQuantity] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [price, setPrice] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [total, setTotal] = useState("");
  const [editingQuotation, setEditingQuotation] = useState(null);
  const [errors, setErrors] = useState({});
  const [supplierList, setSupplierList] = useState([]);
  const [nextQuatation, setNextQuatation] = useState("001");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const sliderRef = useRef(null);
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  // Fetch quotation list
  const fetchQuatationList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/quotations`
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
    fetchQuatationList();
  }, [fetchQuatationList]);

  // Quotation search

  // ✅ Quotation Search
  useEffect(() => {
    if (!searchTerm || !searchTerm.startsWith("quotno-")) {
      // If search is empty or not starting with QuotNo-, load all
      fetchQuatationList();
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${
            import.meta.env.VITE_API_BASE_URL
          }/quotations/search/${searchTerm.toUpperCase()}`
        );
        setQuotations(Array.isArray(res.data) ? res.data : [res.data]);
      } catch (error) {
        console.error("Search quotation failed:", error);
        setQuotations([]);
      } finally {
        setLoading(false);
      }
    }, 1000);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, fetchQuatationList]);

  // Generate next quotation number
  useEffect(() => {
    if (quotations.length > 0) {
      const maxNo = Math.max(
        ...quotations.map((q) => {
          const match = q.quotationNo?.match(/QuotNo-(\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        })
      );
      setNextQuatation((maxNo + 1).toString().padStart(3, "0"));
    } else {
      setNextQuatation("001");
    }
  }, [quotations]);

  // Supplier List Fetch
  const fetchSupplierList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/suppliers`
      );
      setSupplierList(res.data);
    } catch (error) {
      console.error("Failed to fetch suppliers", error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);

  useEffect(() => {
    fetchSupplierList();
  }, [fetchSupplierList]);

  // Demand List Fetch
  const fetchDemandList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/requisitions/approved`
      );
      setDemandList(res.data);
    } catch (error) {
      console.error("Failed to fetch demands", error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);

  useEffect(() => {
    fetchDemandList();
  }, [fetchDemandList]);

  // Reset form fields
  const resetForm = () => {
    setQuotationNo("");
    setSupplier("");
    setForDemand("");
    setPerson("");
    setCreatedBy("");
    setDesignation("");
    setItemsList([]);
    setItemName("");
    setItemQuantity("");
    setPrice("");
    setTotal("");
    setEditingQuotation(null);
    setErrors({});
    setIsSliderOpen(false);
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    const trimmedQuotationNo = quotationNo.trim();
    const trimmedSupplier = supplier.trim();
    const trimmedForDemand = forDemand.trim();
    const trimmedPerson = person.trim();
    const trimmedCreatedBy = createdBy.trim();
    const trimmedDesignation = designation.trim();
    const trimmedPrice = price.trim();
    const trimmedTotal = total.trim();
    const parsedPrice = parseFloat(price);
    const parsedTotal = parseFloat(total);

    if (!trimmedQuotationNo)
      newErrors.quotationNo = "Quotation No. is required";
    if (!trimmedSupplier) newErrors.supplier = "Supplier is required";
    if (!trimmedForDemand) newErrors.forDemand = "For Demand is required";
    if (!trimmedPerson) newErrors.person = "Person is required";
    if (!trimmedCreatedBy) newErrors.createdBy = "Created By is required";
    if (!trimmedDesignation) newErrors.designation = "Designation is required";
    if (itemsList.length === 0)
      newErrors.itemsList = "At least one item is required";
    if (!trimmedPrice || isNaN(parsedPrice) || parsedPrice <= 0) {
      newErrors.price = "Price must be a positive number";
    }
    if (!trimmedTotal || isNaN(parsedTotal) || parsedTotal <= 0) {
      newErrors.total = "Total must be a positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handlers for form and table actions
  const handleAddQuotation = () => {
    resetForm();
    setIsSliderOpen(true);
  };

  const handleEditClick = (quotation) => {
    setEditingQuotation(quotation);
    setQuotationNo(quotation.quotationNo || "");
    setSupplier(quotation.supplier?._id || "");
    setForDemand(quotation.demandItem?._id || "");
    setPerson(quotation.person || "");
    setCreatedBy(quotation.createdBy || "");
    setDesignation(quotation.designation || "");
    setItemsList(quotation.items || []);
    setItemName("");
    setItemQuantity("");
    setErrors({});
    setIsSliderOpen(true);
  };

  const handleAddItem = () => {
    const selected = demandItems.find((i) => i._id === selectedItem);

    if (!selected) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Item",
        text: "Please select a valid item.",
        confirmButtonColor: "#d33",
      });
      return;
    }

    const parsedItemQuantity = parseInt(selected.quantity, 10);

    if (isNaN(parsedItemQuantity) || parsedItemQuantity <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Quantity",
        text: "Quantity must be a positive number.",
        confirmButtonColor: "#d33",
      });
      return;
    }

    setItemsList([
      ...itemsList,
      {
        itemName: selected.itemName,
        qty: parsedItemQuantity,
        price: parseFloat(price),
        total: parsedItemQuantity * parseFloat(price),
      },
    ]);

    setSelectedItem("");
    setItemQuantity("");
    setPrice("");
    setTotal("");
    setErrors((prev) => ({ ...prev, itemsList: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { token } = userInfo || {};
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    if (itemsList.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Item",
        text: "First add an item",
        confirmButtonColor: "#d33",
      });
      return;
    }

    const newQuotation = {
      quotationNo: editingQuotation ? quotationNo : `QuotNo-${nextQuatation}`,
      supplier: supplier.trim(),
      demandItem: forDemand.trim(),
      person: person.trim(),
      createdBy: createdBy.trim(),
      designation: designation.trim(),
      items: itemsList,
    };

    try {
      if (editingQuotation) {
        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/quotations/${
            editingQuotation._id
          }`,
          newQuotation,
          { headers }
        );
        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Quotation updated successfully.",
          confirmButtonColor: "#3085d6",
        });
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/quotations`,
          newQuotation,
          { headers }
        );
        Swal.fire({
          icon: "success",
          title: "Added!",
          text: "Quotation added successfully.",
          confirmButtonColor: "#3085d6",
        });
      }
      fetchQuatationList();
      resetForm();
    } catch (error) {
      console.error("Error saving quotation:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.response?.data?.message || "Failed to save quotation.",
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
            const { token } = userInfo || {};
            const headers = {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            };

            await axios.delete(
              `${import.meta.env.VITE_API_BASE_URL}/quotations/${id}`,
              { headers }
            );

            setQuotations((prev) => prev.filter((q) => q._id !== id));
            swalWithTailwindButtons.fire(
              "Deleted!",
              "Quotation deleted successfully.",
              "success"
            );
          } catch (error) {
            console.error("Delete error:", error);
            swalWithTailwindButtons.fire(
              "Error!",
              "Failed to delete promotion.",
              "error"
            );
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire(
            "Cancelled",
            "Quotation is safe 🙂",
            "error"
          );
        }
      });
  };

  const selectedDemand = demandList.find((d) => d._id === forDemand);
  const demandItems = selectedDemand ? selectedDemand.items : [];
  const demandItemQuantity =
    demandItems.find((item) => item._id === selectedItem)?.quantity || "";
  const totalAmount = demandItems.reduce(
    (sum, item) => sum + price * (item.quantity || 0),
    0
  );
  const grandTotal = itemsList.reduce((sum, item) => sum + item.total, 0);

  useEffect(() => {
    if (selectedDemand) {
      setCreatedBy(selectedDemand.employee?.employeeName || "");
    }
  }, [selectedDemand]);

  useEffect(() => {
    if (editingQuotation && demandList.length > 0) {
      setForDemand(editingQuotation.demandItem?._id || "");
    }
  }, [editingQuotation, demandList]);

  function handleRemoveItem(index) {
    setItemsList(itemsList.filter((_, i) => i !== index));
  }

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = quotations.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(quotations.length / recordsPerPage);

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
              Quotation Details
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Enter Quot No eg: QuotNo-001"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 w-[250px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-newPrimary"
            />
            <button
              className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/80"
              onClick={handleAddQuotation}
            >
              + Add Quotation
            </button>
          </div>
        </div>

        <div className="rounded-xl shadow border border-gray-200 overflow-hidden">
          <div className="overflow-y-auto lg:overflow-x-auto max-h-[900px]">
            <div className="min-w-[1200px]">
              <div className="hidden lg:grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200">
                <div>Quotation No.</div>
                <div>Supplier</div>
                <div>For Demand</div>
                <div>Person</div>
                <div>Created By</div>
                <div>Designation</div>
                <div>Price</div>
                <div>Actions</div>
              </div>

              <div className="flex flex-col divide-y divide-gray-100">
                {loading ? (
                  <TableSkeleton
                    rows={recordsPerPage}
                    cols={8}
                    className="lg:grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr]"
                  />
                ) : currentRecords.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 bg-white">
                    No quotations found.
                  </div>
                ) : (
                  currentRecords.map((quotation) => (
                    <div
                      key={quotation._id}
                      className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] items-center gap-4 px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                    >
                      <div className="text-gray-600">
                        {quotation?.quotationNo}
                      </div>
                      <div className="text-gray-600">
                        {quotation?.supplier?.contactPerson}
                      </div>
                      <div className="text-gray-600">
                        {quotation?.demandItem?.demandItem}
                      </div>
                      <div className="text-gray-600">{quotation?.person}</div>
                      <div className="text-gray-600">
                        {quotation?.createdBy}
                      </div>
                      <div className="text-gray-600">
                        {quotation?.designation}
                      </div>
                      <div className="text-gray-600">
                        {quotation?.totalAmount}
                      </div>
                      <div className="flex gap-3 justify-start">
                        <button
                          onClick={() => handleEditClick(quotation)}
                          className="py-1 text-sm rounded text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit"
                        >
                          <SquarePen size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(quotation._id)}
                          className="py-1 text-sm rounded text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                        <button
                          onClick={() => setViewingQuotation(quotation)}
                          className="py-1 text-sm rounded text-amber-600 hover:bg-amber-50 transition-colors"
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between my-4 px-10">
              <div className="text-sm text-gray-600">
                Showing {indexOfFirstRecord + 1} to{" "}
                {Math.min(indexOfLastRecord, quotations.length)} of{" "}
                {quotations.length} records
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
                  {editingQuotation
                    ? "Update Quotation"
                    : "Add a New Quotation"}
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
                      Quotation No. <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={
                        editingQuotation
                          ? quotationNo
                          : `QuotNo-${nextQuatation}`
                      }
                      readOnly
                      className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                        errors.quotationNo
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-newPrimary"
                      }`}
                      placeholder="Enter quotation number"
                      required
                    />
                    {errors.quotationNo && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.quotationNo}
                      </p>
                    )}
                  </div>
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
                    >
                      <option value="">Select Supplier</option>
                      {supplierList?.map((supplier) => (
                        <option key={supplier._id} value={supplier._id}>
                          {supplier?.supplierName}
                        </option>
                      ))}
                    </select>
                    {errors.supplier && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.supplier}
                      </p>
                    )}
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
                      required
                    >
                      <option value="">Select Demand Item</option>
                      {demandList?.map((demand) => (
                        <option key={demand._id} value={demand._id}>
                          {demand?.demandItem}
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
                      Person <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={person}
                      onChange={(e) => setPerson(e.target.value)}
                      className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                        errors.person
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-newPrimary"
                      }`}
                      placeholder="Enter person name"
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
                      Created By <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={createdBy}
                      readOnly
                      className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                        errors.createdBy
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-newPrimary"
                      }`}
                      placeholder="Enter created by"
                      required
                    />
                    {errors.createdBy && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.createdBy}
                      </p>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="block text-gray-700 font-medium mb-2">
                      Designation <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                        errors.designation
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-newPrimary"
                      }`}
                      placeholder="Enter designation"
                      required
                    />
                    {errors.designation && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.designation}
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-4 mb-4">
                    <div className="flex gap-4 items-end">
                      <div className="flex-1 min-w-0">
                        <label className="block text-gray-700 font-medium mb-2">
                          Item Name <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={selectedItem}
                          onChange={(e) => setSelectedItem(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                        >
                          <option value="">Select item</option>
                          {demandItems.map((item) => (
                            <option key={item._id} value={item._id}>
                              {item.itemName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1 min-w-0">
                        <label className="block text-gray-700 font-medium mb-2">
                          Item Quantity <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={demandItemQuantity}
                          readOnly
                          placeholder="Quantity"
                          className="w-full p-3 border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                    <div className="flex gap-4 items-end">
                      <div className="flex-1">
                        <label className="block text-gray-700 font-medium mb-2">
                          Price <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                          placeholder="Enter price"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-gray-700 font-medium mb-2">
                          Total <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={totalAmount}
                          readOnly
                          placeholder="Total"
                          className="w-full p-3 border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                    <div className="flex items-end justify-end">
                      <button
                        type="button"
                        onClick={handleAddItem}
                        className="px-6 h-12 bg-newPrimary text-white rounded-lg hover:bg-newPrimary/80 transition flex items-center justify-center gap-2"
                      >
                        <span>+</span> Add
                      </button>
                    </div>
                  </div>

                  {itemsList.length > 0 && (
                    <div className="overflow-x-auto overflow-y-auto max-h-64 custom-scrollbar">
                      <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                        <thead className="bg-gray-100 text-gray-600 text-sm">
                          <tr>
                            <th className="px-6 py-2 whitespace-nowrap border-b">
                              Sr #
                            </th>
                            <th className="px-6 py-2 whitespace-nowrap border-b">
                              Item Name
                            </th>
                            <th className="px-6 py-2 whitespace-nowrap border-b">
                              Quantity
                            </th>
                            <th className="px-6 py-2 whitespace-nowrap border-b">
                              Price
                            </th>
                            <th className="px-6 py-2 whitespace-nowrap border-b">
                              Total
                            </th>
                            <th className="px-6 py-2 whitespace-nowrap border-b">
                              Remove
                            </th>
                          </tr>
                        </thead>
                        <tbody className="text-gray-700 text-sm">
                          {itemsList.map((item, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-4 py-2 border-b text-center">
                                {idx + 1}
                              </td>
                              <td className="px-4 py-2 text-center border-b">
                                {item.itemName}
                              </td>
                              <td className="px-4 py-2 border-b text-center">
                                {item.qty}
                              </td>
                              <td className="px-4 py-2 border-b text-center">
                                {item.price}
                              </td>
                              <td className="px-4 py-2 border-b text-center">
                                {item.total}
                              </td>
                              <td className="px-4 py-2 border-b text-center">
                                <button onClick={() => handleRemoveItem(idx)}>
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
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-newPrimary text-white px-4 py-3 rounded-lg hover:bg-newPrimary/80 transition-colors disabled:bg-blue-300"
                >
                  {loading
                    ? "Saving..."
                    : editingQuotation
                    ? "Update Quotation"
                    : "Save Quotation"}
                </button>
              </form>
            </div>
          </div>
        )}

        {viewingQuotation && (
          <ViewQuotation
            quotation={viewingQuotation}
            onClose={() => setViewingQuotation(null)}
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

export default Quotation;
