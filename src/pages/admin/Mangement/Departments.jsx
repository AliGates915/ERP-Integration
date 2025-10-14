import React, { useState, useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { SquarePen, Trash2 } from "lucide-react";
import CommanHeader from "../../../components/CommanHeader";
import TableSkeleton from "../Skeleton";
import axios from "axios";

const Departments = () => {
  const [departmentList, setDepartmentList] = useState([]);

  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [department, setDepartment] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const sliderRef = useRef(null);

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  const API_URL = `${import.meta.env.VITE_API_BASE_URL}/departments`;

  // GSAP Animation for Modal
  useEffect(() => {
    if (isSliderOpen) {
      if (sliderRef.current) {
        sliderRef.current.style.display = "block"; // ensure visible before animation
      }
      gsap.fromTo(
        sliderRef.current,
        { scale: 0.7, opacity: 0, y: -50 }, // start smaller & slightly above
        { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }
      );
    } else {
      gsap.to(sliderRef.current, {
        scale: 0.7,
        opacity: 0,
        y: -50,
        duration: 0.4,
        ease: "power3.in",
        onComplete: () => {
          if (sliderRef.current) {
            sliderRef.current.style.display = "none";
          }
        },
      });
    }
  }, [isSliderOpen]);

  // Fetch Department list
  const fetchDepartmentList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}`);
      setDepartmentList(res.data);
    
    } catch (error) {
      console.error("Failed to fetch Supplier", error);
    } finally {
      setTimeout(() => setLoading(false), 2000);
    }
  }, []);
  useEffect(() => {
    fetchDepartmentList();
  }, [fetchDepartmentList]);

  // Handlers
  const handleAdd = () => {
    setIsSliderOpen(true);
    setIsEdit(false);
    setEditId(null);
    setDepartment("");
  };

  const handleSave = async () => {
    if (!department) {
      toast.error("❌ Department is required");
      return;
    }

    try {
      const { token } = userInfo || {};
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      const newDept = {
        departmentName: department,
      };

      if (isEdit && editId) {
        const res = await axios.put(`${API_URL}/${editId}`, newDept, {
          headers,
        });
        toast.success(" Department updated successfully");
      } else {
        const res = await axios.post(API_URL, newDept, {
          headers,
        });
        toast.success(" Department added successfully");
      }
      fetchDepartmentList();
      setIsSliderOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(`❌ ${isEdit ? "Update" : "Add"} department failed`);
    }
  };

  const handleEdit = (d) => {
    setIsEdit(true);

    setEditId(d._id);

    setDepartment(d.departmentName);
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
        text: "You want to delete this department?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, cancel!",
        reverseButtons: true,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          try {
            await axios.delete(`${API_URL}/${id}`, {
              headers: {
                Authorization: `Bearer ${userInfo?.token}`,
              },
            });

            setDepartmentList(departmentList.filter((d) => d._id !== id));

            swalWithTailwindButtons.fire(
              "Deleted!",
              "Department deleted successfully.",
              "success"
            );
          } catch (error) {
            console.error("Delete error:", error);
            swalWithTailwindButtons.fire(
              "Error!",
              "Failed to delete department.",
              "error"
            );
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire(
            "Cancelled",
            "Department is safe 🙂",
            "error"
          );
        }
      });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <CommanHeader />
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-newPrimary">Departments</h1>

          <p className="text-gray-500 text-sm">
            Manage your department details
          </p>
        </div>
        <button
          className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/90"
          onClick={handleAdd}
        >
          + Add Department
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[500px]">
            {/* Table Header */}
            <div className="hidden lg:grid grid-cols-[80px_1fr_auto] gap-6 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200">
              <div>Sr</div>
              <div>Department</div>
              <div className="text-right">Actions</div>
            </div>

            {/* Table Body */}
            <div className="flex flex-col divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
              {loading ? (
                <TableSkeleton
                  rows={departmentList.length > 0 ? departmentList.length : 5}
                  cols={3}
                  className="lg:grid-cols-[80px_1fr_auto]"
                />
              ) : departmentList.length === 0 ? (
                <div className="text-center py-4 text-gray-500 bg-white">
                  No departments found.
                </div>
              ) : (
                departmentList.map((d, index) => (
                  <div
                    key={d._id}
                    className="hidden lg:grid grid-cols-[80px_1fr_auto] items-center gap-6 px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                  >
                    <div>{index + 1}</div>
                    <div className="text-gray-700">{d.departmentName}</div>
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => handleEdit(d)}
                        className="text-blue-600 hover:underline"
                      >
                        <SquarePen size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(d._id)}
                        className="text-red-600 hover:underline"
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

      {/* Slider */}
      {isSliderOpen && (
        <div className="fixed inset-0 bg-gray-600/50 flex items-center justify-center z-50">
          <div
            ref={sliderRef}
            className="w-full md:w-[500px] bg-white rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white rounded-t-2xl">
              <h2 className="text-xl font-bold text-newPrimary">
                {isEdit ? "Update Department" : "Add a New Department"}
              </h2>
              <button
                className="w-8 h-8 bg-newPrimary text-white rounded-full flex items-center justify-center hover:bg-newPrimary/70"
                onClick={() => setIsSliderOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="space-y-4 p-4 md:p-6">
              <div>
                <label className="block text-gray-700 font-medium">
                  Department <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Enter department"
                />
              </div>

              <button
                className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/80 w-full"
                onClick={handleSave}
              >
                {isEdit ? "Update Department" : "Save Department"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;
