import React, { useState, useCallback, useEffect, useRef } from "react";
import gsap from "gsap";
import { toast } from "react-toastify";
import axios from 'axios';
import { HashLoader } from "react-spinners";
import Swal from "sweetalert2";
import CommanHeader from "../../components/CommanHeader";



const Modules = () => {
  const [moduleList, setModuleList] = useState([]); // Initialize with static data
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [moduleName, setModuleName] = useState("");
  const [description, setDescription] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const sliderRef = useRef(null); // Ref for the slider element

  const handleAddModule = () => {
    setIsSliderOpen(true);
  };

  // GSAP Animation for Slider
  useEffect(() => {
    if (isSliderOpen) {
      gsap.fromTo(
        sliderRef.current,
        { x: "100%", opacity: 0 },
        { x: "0%", opacity: 1, duration: 0.5, ease: "power2.out" }
      );
    } else {
      gsap.to(sliderRef.current, {
        x: "100%",
        opacity: 0,
        duration: 0.5,
        ease: "power2.in",
        onComplete: () => {
          // Ensure slider is hidden after animation
          sliderRef.current.style.display = "none";
        },
      });
    }
  }, [isSliderOpen]);

  // Token
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  
  // Fetch Module Data
  const fetchModuleData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/modules`);
      const result = await response.json();
     
      setModuleList(result.length > 0 ? result : staticModuleData); // Use API data if available, else static data
    } catch (error) {
      console.error("Error fetching module data:", error);
      setModuleList(staticModuleData); // Fallback to static data on error
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);

  useEffect(() => {
    fetchModuleData();
  }, [fetchModuleData]);



  // Save Module Data
  const handleSave = async () => {
  try {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const token = userInfo?.token;

    if (!token) {
      toast.error("❌ Authorization token missing!");
      return;
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json", // important
    };

    // Build JSON payload (match your API body)
    const payload = {
      moduleName,      // make sure backend expects this field
      description,     // if backend expects it
    };

    if (isEdit && editId) {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/modules/${editId}`,
        payload,
        { headers }
      );
      toast.success("✅ Module updated successfully");
    } else {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/modules`,
        payload,
        { headers }
      );
      toast.success("✅ Module added successfully");
    }

    // reset states
    setEditId(null);
    setIsEdit(false);
    setIsSliderOpen(false);
    setModuleName("");
    setDescription("");
    fetchModuleData();

  } catch (error) {
    console.error("Save error:", error.response?.data || error.message);
    toast.error(`❌ ${isEdit ? "Update" : "Add"} module failed`);
  }
};


  // Edit Module
  const handleEdit = (module) => {
    setIsEdit(true);
    setEditId(module._id);
    setModuleName(module.moduleName || "");
    setDescription(module.description || "");
    setIsSliderOpen(true);
   
  };

  // Delete Module
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
            const token = userInfo?.token;
            if (!token) {
              toast.error("Authorization token missing!");
              return;
            }

            await axios.delete(
              `${import.meta.env.VITE_API_BASE_URL}/modules/${id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            setModuleList(moduleList.filter((p) => p._id !== id));
            swalWithTailwindButtons.fire(
              "Deleted!",
              "Module deleted successfully.",
              "success"
            );
          } catch (error) {
            console.error("Delete error:", error);
            swalWithTailwindButtons.fire(
              "Error!",
              "Failed to delete Module.",
              "error"
            );
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire(
            "Cancelled",
            "Module is safe 🙂",
            "error"
          );
        }
      });
  };

  // Show loading spinner
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <HashLoader
            height="150"
            width="150"
            radius={1}
            color="#84CF16"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Coomon header */}
      <CommanHeader/>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-newPrimary">Module List</h1>
          <p className="text-gray-500 text-sm">Module Management Dashboard</p>
        </div>
        <button
          className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-primaryDark transition-colors duration-200"
          onClick={handleAddModule}
        >
          + Add Module
        </button>
      </div>

      {/* Module Table */}
      <div className="rounded-xl shadow p-6 border border-gray-100 w-full overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="w-full">
            {/* Table Headers */}
            <div className="hidden lg:grid grid-cols-3 gap-4 bg-gray-50 py-3 px-6 text-xs font-medium text-gray-500 uppercase rounded-lg">
              <div>Module Name</div>
              <div>Description</div>
              {userInfo?.isAdmin && <div className="text-right">Actions</div>}
            </div>

            {/* Module Table */}
            <div className="mt-4 flex flex-col gap-[14px] pb-14">
              {moduleList.map((module, index) => (
                <div
                  key={index}
                  className="grid grid-cols-3 items-center gap-4 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100"
                >
                  {/* Module Name */}
                  <div className="text-sm font-medium text-gray-900">
                    {module.moduleName}
                  </div>

                  {/* Description */}
                  <div className="text-sm text-gray-500">{module.description}</div>

                  {/* Actions */}
                  {userInfo?.isAdmin && (
                    <div className="text-right relative group">
                      <button className="text-gray-400 hover:text-gray-600 text-xl">⋯</button>
                      <div className="absolute right-0 top-6 w-28 h-20 bg-white border border-gray-200 rounded-md shadow-lg 
                        opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto 
                        transition-opacity duration-300 z-50 flex flex-col justify-between">
                        <button
                          onClick={() => handleEdit(module)}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-blue-100 text-blue-600 flex items-center gap-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(module._id)}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-red-100 text-red-500 flex items-center gap-2"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right-Side Slider */}
      {isSliderOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50">
          <div
            ref={sliderRef}
            className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-xl overflow-y-auto"
            style={{ display: "block" }}
          >
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-newPrimary">{isEdit ? "Edit Module" : "Add Module"}</h2>
              <button
                className="w-6 h-6 text-white rounded-full flex justify-center items-center hover:text-gray-400 text-xl bg-newPrimary"
                onClick={() => setIsSliderOpen(false)}
              >
                &times;
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Module Section */}
              <div className="border rounded-lg p-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-1">Module Name</label>
                    <input
                      type="text"
                      value={moduleName}
                      onChange={(e) => setModuleName(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                      placeholder="Enter module name"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Description</label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                      placeholder="Enter description"
                      rows="4"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => setIsSliderOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="bg-newPrimary text-white px-6 py-2 rounded-lg hover:bg-primaryDark transition-colors duration-200"
                  onClick={handleSave}
                >
                  {isEdit ? "Update Module" : "Save Module"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Modules;