import React, { useState, useEffect, useRef, useCallback } from "react";
import { Eye, SquarePen, Trash2 } from "lucide-react";
import CommanHeader from "../../../components/CommanHeader";
import TableSkeleton from "../Skeleton";
import Swal from "sweetalert2";
import axios from "axios";
import ViewModel from "./ViewModel";
import { useApprovals } from "../../../context/hook/useApprovalApi";

const PurchaseApproval = () => {

  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [department, setDepartment] = useState("");
  const [employee, setEmployee] = useState("");
  const [items, setItems] = useState("");
  const [status, setStatus] = useState("Hold");
  const [editingApproval, setEditingApproval] = useState(null);
  const sliderRef = useRef(null);
  const [isView, setisView] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequisition, setSelectedRequisition] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
   const { approvals, setApprovals, loading, refetch } = useApprovals(searchTerm);


  // Handlers for form and table actions
  const handleEditClick = (approval) => {
    setEditingApproval(approval);
    setDepartment(approval.department);
    setEmployee(approval.employee);
    setItems(approval.items);
    setStatus(approval.status);
    setIsSliderOpen(true);
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
          setApprovals((prev) => prev.filter((a) => a._id !== id));
          setCurrentPage(1); // Reset to first page after deletion
          swalWithTailwindButtons.fire(
            "Deleted!",
            "Approval deleted successfully.",
            "success"
          );
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire(
            "Cancelled",
            "Approval is safe 🙂",
            "error"
          );
        }
      });
  };

  const handleView = (req) => {
    setSelectedRequisition(req);
    setisView(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedDepartment = department.trim();
    const trimmedEmployee = employee.trim();
    const trimmedItems = items.trim();

    if (!trimmedDepartment || !trimmedEmployee || !trimmedItems) {
      Swal.fire("Error", "All fields are required.", "error");
      return;
    }

    const newApproval = {
      _id: editingApproval ? editingApproval._id : Date.now().toString(),
      department: trimmedDepartment,
      employee: trimmedEmployee,
      items: trimmedItems,
      status,
      createdAt: new Date().toISOString(),
    };

    if (editingApproval) {
      setApprovals(
        approvals.map((a) => (a._id === editingApproval._id ? newApproval : a))
      );
      Swal.fire("✅ Success", "Approval updated successfully!", "success");
    } else {
      setApprovals([...approvals, newApproval]);
      Swal.fire("✅ Success", "Approval added successfully!", "success");
    }

    // Reset form state
    setDepartment("");
    setEmployee("");
    setItems("");
    setStatus("Hold");
    setEditingApproval(null);
    setIsSliderOpen(false);
    setCurrentPage(1); // Reset to first page after adding/updating
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) return "Invalid Date";

    const day = String(parsed.getDate()).padStart(2, "0");
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    const year = parsed.getFullYear();

    return `${day}-${month}-${year}`; // DD-MM-YYYY
  };

  // Status change API call
  async function handleStatusChangeApiCall(id, newStatus) {
 

    try {
      const { token } = JSON.parse(localStorage.getItem("userInfo")) || {};

      const res = await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/requisitions/${id}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Update state to reflect status change
      setApprovals((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status: newStatus } : a))
      );
      setCurrentPage(1); // Reset to first page after status change
      Swal.fire("✅ Success", `Status updated to ${newStatus}`, "success");
     
    } catch (error) {
      console.error("Status update failed:", error);
      Swal.fire("❌ Error", "Failed to update status", "error");
    }
  }

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = approvals.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(approvals.length / recordsPerPage);

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
              Purchase Approval Details
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <input
              type="text"
              placeholder="Enter Approval ID eg: PRA-Ali-0002"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 w-[250px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-newPrimary"
            />
          </div>
        </div>

        <div className="rounded-xl shadow border border-gray-200 overflow-hidden">
          {/* Outer wrapper handles horizontal scroll */}
          <div className="overflow-x-auto">
            {/* Table wrapper with min-width only applied here */}
            <div className="max-h-[900px] overflow-y-auto custom-scrollbar">
              <div className="inline-block min-w-[1200px] w-full align-middle">
                {/* Table Header */}
                <div className="hidden lg:grid grid-cols-[200px,200px,200px,200px,300px,150px] gap-6 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200">
                  <div>Approved Id</div>
                  <div>Department</div>
                  <div>Employee</div>
                  <div>Date</div>
                  <div className={`${loading ? "" : "flex justify-end"}`}>
                    Actions
                  </div>
                  <div className={`${loading ? "" : "flex justify-end"}`}>
                    View
                  </div>
                </div>

                {/* Table Body */}
                <div className="flex flex-col divide-y divide-gray-100">
                  {loading ? (
                    <TableSkeleton
                      rows={recordsPerPage}
                      cols={6}
                      className="lg:grid-cols-[200px,200px,200px,200px,300px,150px]"
                    />
                  ) : currentRecords.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 bg-white">
                      No approvals found.
                    </div>
                  ) : (
                    currentRecords.map((approval, idx) => (
                      <div
                        key={approval._id}
                        className="grid grid-cols-1 lg:grid-cols-[200px,200px,200px,200px,300px,150px] items-center gap-6 px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                      >
                        {/* Sr # */}
                        <div className="font-medium text-gray-900">
                          {approval?.demandItem}
                        </div>

                        {/* Department */}
                        <div className="text-gray-600">
                          {approval?.department?.departmentName}
                        </div>

                        {/* Employee */}
                        <div className="text-gray-600">
                          {approval?.employee?.employeeName}
                        </div>

                        {/* Date */}
                        <div className="text-gray-500">
                          {formatDate(approval.date)}
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-2">
                          {approval.status === "Approved" && (
                            <button
                              disabled
                              className="px-3 py-1 text-[16px] font-medium rounded-full bg-green-300 text-green-700 opacity-60 cursor-not-allowed"
                            >
                              Approved
                            </button>
                          )}

                          {approval.status === "Pending" && (
                            <>
                              <button
                                onClick={() =>
                                  handleStatusChangeApiCall(
                                    approval._id,
                                    "Approved"
                                  )
                                }
                                className="px-3 py-1 text-[16px] font-medium rounded-full bg-green-200 text-green-800 hover:bg-green-300"
                              >
                                Approved
                              </button>
                              <button
                                onClick={() =>
                                  handleStatusChangeApiCall(
                                    approval._id,
                                    "Hold"
                                  )
                                }
                                className="px-3 py-1 text-[16px] font-medium rounded-full bg-red-100 text-red-800 hover:bg-red-200"
                              >
                                Hold
                              </button>
                            </>
                          )}

                          {approval.status === "Hold" && (
                            <button
                              onClick={() =>
                                handleStatusChangeApiCall(
                                  approval._id,
                                  "Approved"
                                )
                              }
                              className="px-3 py-1 text-[16px] font-medium rounded-full bg-green-200 text-green-800 hover:bg-green-300"
                            >
                              Approved
                            </button>
                          )}
                        </div>

                        {/* View */}
                        <div
                          onClick={() => handleView(approval)}
                          className="flex cursor-pointer justify-end text-amber-600"
                        >
                          <Eye size={18} />
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
                {Math.min(indexOfLastRecord, approvals.length)} of{" "}
                {approvals.length} records
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
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-end z-50">
            <div
              ref={sliderRef}
              className="w-full max-w-md bg-white p-4 h-full overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-newPrimary">
                  {editingApproval ? "Update Approval" : "Add a New Approval"}
                </h2>
                <button
                  className="text-2xl text-gray-500 hover:text-gray-700"
                  onClick={() => {
                    setIsSliderOpen(false);
                    setDepartment("");
                    setEmployee("");
                    setItems("");
                    setStatus("Hold");
                    setEditingApproval(null);
                  }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Department <span className="text-newPrimary">*</span>
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                    placeholder="Enter department"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Employee <span className="text-newPrimary">*</span>
                  </label>
                  <input
                    type="text"
                    value={employee}
                    onChange={(e) => setEmployee(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                    placeholder="Enter employee name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Items with Quantity{" "}
                    <span className="text-newPrimary">*</span>
                  </label>
                  <input
                    type="text"
                    value={items}
                    onChange={(e) => setItems(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="Enter items with quantity"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                  >
                    <option value="Hold">Hold</option>
                    <option value="Approved">Approved</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-newPrimary text-white px-4 py-3 rounded-lg hover:bg-newPrimary/80 transition-colors disabled:bg-blue-300"
                >
                  {loading
                    ? "Saving..."
                    : editingApproval
                    ? "Update Approval"
                    : "Save Approval"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Show popup only if isView is true */}
        {isView && selectedRequisition && (
          <ViewModel

            requisition={selectedRequisition}

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

export default PurchaseApproval;