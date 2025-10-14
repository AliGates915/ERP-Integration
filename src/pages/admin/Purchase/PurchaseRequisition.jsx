import React, { useState, useEffect, useRef, useCallback } from "react";
import { Eye, SquarePen, Trash2, X } from "lucide-react";
import CommanHeader from "../../../components/CommanHeader";
import TableSkeleton from "../Skeleton";
import Swal from "sweetalert2";
import axios from "axios";
import ViewModel from "./ViewModel";
import { api } from "../../../context/ApiService";
import {
  useCategories,
  useDepartments,
  useEmployees,
  useRequisitions,
} from "../../../context/hook/useRequisitionApi";

const PurchaseRequisition = () => {
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [requisitionId, setRequisitionId] = useState("");
  const [itemNameList, setItemNameList] = useState([]);
  const [date, setDate] = useState("");
  const [department, setDepartment] = useState("");
  const [employee, setEmployee] = useState("");
  const { employees: employeeName, loading: empLoading } = useEmployees();
  const [requirement, setRequirement] = useState("");
  const { categories: categoryList, loading: catLoading } = useCategories();
  const {
    requisitions,
    loading: reqLoading,
    setRequisitions,
    refetch,
  } = useRequisitions(searchTerm);
  const [details, setDetails] = useState("");
  const [items, setItems] = useState("");
  const [category, setCategory] = useState("");
  const [isEnable, setIsEnable] = useState(true);
  const [isView, setisView] = useState(false);
  const [editingRequisition, setEditingRequisition] = useState(null);
  const sliderRef = useRef(null);
  const { departments: departmentList, loading: depLoading } = useDepartments();
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState();
  const [itemsList, setItemsList] = useState([]);
  const [selectedRequisition, setSelectedRequisition] = useState(null);
  const [nextRequisitionId, setNextRequisitionId] = useState("001");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const loading = depLoading || empLoading || catLoading || reqLoading;

  const handleAddItem = () => {
    if (!itemName || !quantity) return;

    const newItem = {
      itemName,
      quantity: parseInt(quantity, 10),
    };

    setItemsList([...itemsList, newItem]);
    setItemName("");
    setQuantity("");
  };
  // Fetch purchase orders
  useEffect(() => {
  if (!category || !category.categoryName) {
    setItemNameList([]);
    return;
  }

  const fetchRawCategories = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/item-details/raw-materials/${category.categoryName}`
      );
      setItemNameList(res.data);
    } catch (error) {
      console.error("Failed to fetch purchase orders", error);
    }
  };

  fetchRawCategories();
}, [category]);


 

  useEffect(() => {
    if (requisitions.length > 0) {
      const maxNo = Math.max(
        ...requisitions.map((r) => {
          const match = r.requisitionId?.match(/REQ-(\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        })
      );
      setNextRequisitionId((maxNo + 1).toString().padStart(3, "0"));
    } else {
      setNextRequisitionId("001");
    }
  }, [requisitions]);

  const handleAddClick = () => {
    setEditingRequisition(null);
    setRequisitionId("");
    setDate("");
    setDepartment("");
    setEmployee("");
    setRequirement("");
    setDetails("");
    setItemsList([]);
    setCategory("");
    setQuantity("");
    setIsEnable(true);
    setIsSliderOpen(true);
  };

  const handleEditClick = (requisition) => {
    setEditingRequisition(requisition);
    setRequisitionId(requisition.requisitionId);
    setDate(formatDate(requisition.date));
    setDepartment(requisition.department?._id || "");
    setEmployee(requisition.employee?._id || "");
    
    setRequirement(requisition.requirements || "");
    setDetails(requisition.details || "");
    setItemsList(requisition.items || []);
    setIsEnable(requisition.isEnable ?? true);
    setIsSliderOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !department ||
      !employee ||
      !requirement ||
      !details ||
      !category ||
      itemsList.length === 0
    ) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "⚠️ Please fill in all required fields and add at least one item.",
        confirmButtonColor: "#d33",
      });
      return;
    }

    const { token } = userInfo || {};
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const newRequisition = {
      requisitionId: editingRequisition
        ? requisitionId
        : `REQ-${nextRequisitionId}`,
      department,
      employee,
      requirements: requirement,
      details,
      category:category._id,
      items: itemsList,
    };
    

    try {
      if (editingRequisition) {
        await api.put(
          `/requisitions/${editingRequisition._id}`,
          newRequisition,
          { headers }
        );
        Swal.fire("Updated!", "Requisition updated successfully.", "success");
      } else {
        await api.post("/requisitions", newRequisition, { headers });
        Swal.fire("Added!", "Requisition added successfully.", "success");
      }

      refetch();
      setIsSliderOpen(false);
      setItemsList([]);
      setCurrentPage(1); // Reset to first page after adding/updating
    } catch (error) {
      console.error("Error saving requisition", error);
      Swal.fire(
        "Error!",
        error.response?.data?.message || "Failed to save requisition."
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

  const handleToggleEnable = (requisition) => {
    setRequisitions(
      requisitions.map((r) =>
        r._id === requisition._id ? { ...r, isEnable: !r.isEnable } : r
      )
    );
    alert(`Requisition ${!requisition.isEnable ? "enabled" : "disabled"}.`);
  };

  const handleView = (req) => {
    setSelectedRequisition(req);
    setisView(true);
  };

  const closeModal = () => {
    setisView(false);
    setSelectedRequisition(null);
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
            };

            await api.delete(`/requisitions/${id}`, { headers });
            setRequisitions(requisitions.filter((p) => p._id !== id));
            refetch();
            setCurrentPage(1); // Reset to first page after deletion

            swalWithTailwindButtons.fire(
              "Deleted!",
              "Requisition deleted successfully.",
              "success"
            );
          } catch (error) {
            console.error("Delete error:", error);
            swalWithTailwindButtons.fire(
              "Error!",
              "Failed to delete requisition.",
              "error"
            );
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire(
            "Cancelled",
            "Requisition is safe 🙂",
            "error"
          );
        }
      });
  };

  function handleRemoveItem(index) {
    setItemsList(itemsList.filter((_, i) => i !== index));
  }

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = requisitions.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(requisitions.length / recordsPerPage);

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
              Purchase Requisition Details
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {/* ✅ Search Input */}
            <input
              type="text"
              placeholder="Enter REQ No eg: REQ-001"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-newPrimary"
            />

            <button
              className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/80"
              onClick={handleAddClick}
            >
              + Add Requisition
            </button>
          </div>
        </div>

        <div className="rounded-xl shadow border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="max-h-screen overflow-y-auto custom-scrollbar">
              <div className="inline-block w-full align-middle">
                <div className="hidden lg:grid grid-cols-[200px,200px,200px,200px,200px,200px,100px] gap-6 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200">
                  <div>Requisition ID</div>
                  <div>Department</div>
                  <div>Employee</div>
                  <div>Requirement</div>
                  <div>Category</div>
                  <div>Date</div>
                  <div className="">Actions</div>
                </div>

                <div className="flex flex-col divide-y divide-gray-100">
                  {loading ? (
                    <TableSkeleton
                      rows={recordsPerPage}
                      cols={7}
                      className="lg:grid-cols-[200px,200px,200px,200px,200px,200px,200px]"
                    />
                  ) : currentRecords.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 bg-white">
                      No requisitions found.
                    </div>
                  ) : (
                    currentRecords.map((requisition) => (
                      <div
                        key={requisition._id}
                        className="grid grid-cols-1 lg:grid-cols-[200px,200px,200px,200px,200px,100px,200px,_auto] items-center gap-6 px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                      >
                        <div className="font-medium text-gray-900">
                          {requisition.requisitionId}
                        </div>
                        <div className="text-gray-600">
                          {requisition?.department?.departmentName || "N/A"}
                        </div>
                        <div className="text-gray-600">
                          {requisition?.employee?.employeeName || "N/A"}
                        </div>
                        <div className="text-gray-600">
                          {requisition?.requirements}
                        </div>
                        <div className="text-gray-600">
                          {requisition?.category?.categoryName}
                        </div>
                        <div className="text-gray-500">
                          {formatDate(requisition.date)}
                        </div>
                        <div className="flex mr-7 justify-end gap-3">
                          <button
                            onClick={() => handleEditClick(requisition)}
                            className="py-1 text-sm rounded text-blue-600"
                            title="Edit"
                          >
                            <SquarePen size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(requisition._id)}
                            className="py-1 text-sm text-red-600"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                          <button
                            onClick={() => handleView(requisition)}
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
              {/* Records info */}
              <div className="text-sm text-gray-600">
                Showing {indexOfFirstRecord + 1} to{" "}
                {Math.min(indexOfLastRecord, requisitions.length)} of{" "}
                {requisitions.length} records
              </div>

              {/* Pagination buttons */}
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
                  {editingRequisition
                    ? "Update Requisition"
                    : "Add a New Requisition"}
                </h2>
                <button
                  className="w-8 h-8 bg-newPrimary text-white rounded-full flex items-center justify-center hover:bg-newPrimary/70"
                  onClick={() => {
                    setIsSliderOpen(false);
                    setRequisitionId("");
                    setDate("");
                    setDepartment("");
                    setEmployee("");
                    setRequirement("");
                    setDetails("");
                    setItems("");
                    setCategory("");
                    setQuantity("");
                    setIsEnable(true);
                    setEditingRequisition(null);
                  }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 p-4 md:p-6">
                <div className="space-y-4 border p-4 rounded-lg bg-gray-50 px-4 py-8">
                  <div className="flex gap-4">
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        Requisition ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={
                          editingRequisition
                            ? requisitionId
                            : `REQ-${nextRequisitionId}`
                        }
                        readOnly
                        onChange={(e) => setRequisitionId(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                        placeholder="Enter requisition ID"
                        required
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        Department <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                        required
                      >
                        <option value="">Select Department</option>
                        {departmentList.map((dept) => (
                          <option key={dept._id} value={dept._id}>
                            {dept.departmentName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        Employee <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={employee}
                        onChange={(e) => setEmployee(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                        required
                      >
                        <option value="">Select Employee</option>
                        {employeeName.map((emp) => (
                          <option key={emp._id} value={emp._id}>
                            {emp.employeeName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        Requirement <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={requirement}
                        onChange={(e) => setRequirement(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                        required
                      >
                        <option value="">Select Requirement</option>
                        <option value="Regular Purchase">
                          Regular Purchase
                        </option>
                        <option value="Monthly Purchase">
                          Monthly Purchase
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Details
                  </label>
                  <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                    placeholder="Enter requisition details"
                    rows="3"
                  />
                </div>

                {/* Section */}
                <div className="border p-4 rounded-lg bg-formBgGray space-y-4 px-4 py-8">
                  <div className="flex gap-4">
                    <div className="flex gap-2 items-end">
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">
                          Category <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={category?._id || ""}
                          onChange={(e) => {
                            const selected = categoryList.find(
                              (cat) => cat._id === e.target.value
                            );
                            setCategory(
                              selected
                                ? {
                                    _id: selected._id,
                                    categoryName: selected.categoryName,
                                  }
                                : ""
                            );
                          }}
                          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                          required
                        >
                          <option value="">Select Category</option>
                          {categoryList.map((cat) => (
                            <option key={cat._id} value={cat._id}>
                              {cat.categoryName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex justify-between gap-2 items-end">
                        <div className="flex-1 min-w-0">
                          <label className="block text-gray-700 font-medium mb-2">
                            Item Name
                          </label>
                          <select
                            value={itemName}
                            onChange={(e) => setItemName(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                          >
                            <option value="">Select Item Name</option>
                            {itemNameList.map((item) => (
                              <option key={item._id} value={item.itemName}>
                                {item.itemName}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-gray-700 font-medium mb-2">
                            Quantity
                          </label>
                          <input
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                            placeholder="Enter quantity"
                            min="1"
                          />
                        </div>

                        <div className="">
                          <button
                            type="button"
                            onClick={handleAddItem}
                            className="w-20 h-12 px-20 bg-newPrimary text-white rounded-lg hover:bg-newPrimary/80 transition flex justify-center items-center gap-2"
                          >
                            <span>+</span> Add
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
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
                              Remove
                            </th>
                          </tr>
                        </thead>
                        <tbody className="text-gray-700 text-sm">
                          {itemsList.map((item, idx) => (
                            <tr
                              key={idx}
                              className="bg-gray-100 text-center border border-gray-300"
                            >
                              <td className="px-4 py-2 border border-gray-300 text-center">
                                {idx + 1}
                              </td>
                              <td className="px-4 py-2 border border-gray-300 text-center">
                                {item.itemName}
                              </td>
                              <td className="px-4 py-2 border border-gray-300 text-center">
                                {item.quantity}
                              </td>
                              <td className="px-4 py-2 border border-gray-300 text-center">
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
                    : editingRequisition
                    ? "Update Requisition"
                    : "Save Requisition"}
                </button>
              </form>
            </div>
          </div>
        )}

        {isView && selectedRequisition && (
          <ViewModel
            data={selectedRequisition}
            type="requisition"
            onClose={() => setisView(false)}
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

export default PurchaseRequisition;
