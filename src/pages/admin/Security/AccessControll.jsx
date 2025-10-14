import React, { useState, useCallback, useEffect, useRef } from "react";
import gsap from "gsap";
import { toast } from "react-toastify";
import axios from "axios";
import { HashLoader } from "react-spinners";
import Swal from "sweetalert2";
import { FiSearch, FiPlus, FiEdit, FiTrash2 } from "react-icons/fi";
import ModuleFunctionalities from "../../../context/modulesConfig";
import CommanHeader from "../../../components/CommanHeader";
import TableSkeleton from "../Skeleton";
import { SquarePen, Trash2 } from "lucide-react";

const ModulesFunctionalities = () => {
  const [functionalityList, setFunctionalityList] = useState([]);
  const [modules, setModules] = useState([]);
  const [groups, setGroups] = useState([]);
  const [groupId, setGroupId] = useState("");
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [moduleName, setModuleName] = useState("");
  const [selectedFunctionalities, setSelectedFunctionalities] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const sliderRef = useRef(null);

  const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};
  const headers = {
    Authorization: `Bearer ${userInfo?.token || ""}`,
    "Content-Type": "application/json",
  };

  // Populate modules from ModuleFunctionalities
  useEffect(() => {

    const moduleList = Object.keys(ModuleFunctionalities).map((name, index) => ({
      _id: `module-${index}`,
      moduleName: name,
    }));

    setModules(moduleList);
  }, []);

  // Filter functionality list based on search query
  const filteredFunctionalityList = functionalityList.filter((func) => {
    const moduleName = func?.moduleName?.toLowerCase() || "";

    const funcName = Array.isArray(func?.name) ? func.name.join(", ").toLowerCase() : "";
    return (
      moduleName.includes(searchQuery.toLowerCase()) ||
      funcName.includes(searchQuery.toLowerCase())
    );
  });

  // Fetch Group Data
  const fetchGroupData = useCallback(async () => {
    try {
      setLoading(true);

      // Uncomment for real API call

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/groups`
      );

      // setGroups(response);
      if (!response.ok) throw new Error("Failed to fetch groups");
      const result = await response.json();
      setGroups(result);
    } catch (error) {
      console.error("Error fetching group data:", error);
      toast.error("Failed to fetch groups");
      setGroups([]);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 2000);


    }
  }, []);


  // Get available functionalities for selected module
  const availableFunctionalities = moduleName ? ModuleFunctionalities[moduleName] || [] : [];


  const handleAddFunctionality = () => {
    setIsSliderOpen(true);
    setIsEdit(false);
    setModuleName("");
    setSelectedFunctionalities([]);
    setEditId(null);
  };

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


  // Fetch Functionality Data
  const fetchFunctionalityData = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/rights`, { headers });

      if (!response.ok) throw new Error("Failed to fetch functionalities");
      const result = await response.json();

      // ✅ If backend wraps data inside `data`, unwrap it
      setFunctionalityList(Array.isArray(result.data) ? result.data : result);
    } catch (error) {
      toast.error("Error fetching functionalities");
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 2000);


    }
  }, []);


  // Fetch data on mount
  useEffect(() => {
    fetchFunctionalityData();
    fetchGroupData();
  }, [fetchFunctionalityData, fetchGroupData]);

  // Handle multi-select change
  const handleFunctionalityChange = (e) => {
    const options = e.target.options;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(options[i].value);
      }
    }
    setSelectedFunctionalities(selected);
  };

  // Save Functionality Data (Create/Update)
  const handleSave = async () => {
    if (!moduleName || selectedFunctionalities.length === 0) {
      toast.error("Please select a module and at least one functionality");
      return;
    }

    try {
      const config = { headers };
      // const groupName = groups.find((g) => g._id === groupId)?.groupName || "";
      const payload = {
        group: groupId,
        module: moduleName,

        functionalities: selectedFunctionalities
      }
    

      if (isEdit && editId) {
        // Update existing functionality
        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/rights/${editId}`,
          payload,
          config
        );
        toast.success("Functionality updated successfully");
      } else {
        // Create new functionality
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/rights`,
          payload,
          config
        );
        toast.success("Functionalities added successfully");
      }

      setIsSliderOpen(false);
      setModuleName("");
      setSelectedFunctionalities([]);
      setEditId(null);
      setGroupId("");
      setIsEdit(false);
      fetchFunctionalityData();
    } catch (error) {
      toast.error(`Failed to ${isEdit ? "update" : "add"} functionalities`);
    }
  };

  // Edit Functionality
  const handleEdit = (func) => {
    setIsEdit(true);
    setEditId(func._id);
    setGroupId(func?.group?._id || "");
    setModuleName(func.moduleName || "");

    setSelectedFunctionalities(Array.isArray(func.name) ? func.name : func.name.split(", "));

    setIsSliderOpen(true);
  };

  // Delete Functionality
  const handleDelete = async (id) => {
    const swalWithTailwindButtons = Swal.mixin({
      customClass: {

        confirmButton: "bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600",
        cancelButton: "bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600",

      },
      buttonsStyling: false,
    });

    swalWithTailwindButtons
      .fire({
        title: "Are you sure?",
        text: "This action cannot be undone!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, cancel!",
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          try {

            await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/rights/${id}`, { headers });

            setFunctionalityList(functionalityList.filter((p) => p._id !== id));
            toast.success("Functionality deleted successfully");
          } catch (error) {
            toast.error("Failed to delete functionality");
          }
        }
      });
  };

  // if (loading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <HashLoader color="#84CF16" />
  //     </div>
  //   );
  // }

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Coomon header */}
      <CommanHeader />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>

          <h1 className="text-xl md:text-2xl font-bold text-newPrimary">Assign Rights</h1>
          <p className="text-gray-500 text-sm">Manage group permissions and access rights</p>

        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search functionalities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            className="bg-newPrimary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
            onClick={handleAddFunctionality}
          >
            <FiPlus />
            Add Rights
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="min-w-full">

            {/* ✅ Table Header (sticky like previous tables) */}
            <div className="hidden md:grid grid-cols-[1fr_2fr_auto] gap-6 bg-gray-50 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200">
              <div>Module</div>
              <div>Functionalities</div>
              {userInfo?.isAdmin && <div className="text-right">Actions</div>}
            </div>

            {/* ✅ Table Body */}
            <div className="flex flex-col divide-y divide-gray-100">
              {loading ? (
                <TableSkeleton

                  rows={filteredFunctionalityList.length > 0 ? filteredFunctionalityList.length : 5}

                  cols={userInfo?.isAdmin ? 3 : 2}
                />
              ) : filteredFunctionalityList.length > 0 ? (
                filteredFunctionalityList.map((func) => (
                  <div
                    key={func._id}
                    className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-6 items-center px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                  >
                    {/* 📱 Mobile header info */}
                    <div className="md:hidden font-medium text-gray-900 border-b pb-2 mb-2">
                      {func?.group?.groupName}
                    </div>

                    {/* Module */}

                    <div className="font-medium text-gray-900">{func?.module}</div>

                    {/* Functionalities */}
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(func.functionalities) && func.functionalities.length > 0 ? (

                        func.functionalities.map((f, idx) => {
                          const colors = [
                            "bg-blue-100 text-blue-800",
                            "bg-green-100 text-green-800",
                            "bg-purple-100 text-purple-800",
                            "bg-pink-100 text-pink-800",
                            "bg-yellow-100 text-yellow-800",
                            "bg-red-100 text-red-800",
                          ];
                          const colorClass = colors[idx % colors.length];
                          return (
                            <span
                              key={idx}
                              className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}
                            >
                              {f}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </div>

                    {/* Actions */}
                    {userInfo?.isAdmin && (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(func)}
                          className="p-2 text-blue-600  rounded-lg transition-colors"
                        >
                          <SquarePen size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(func._id)}
                          className="p-2 text-red-600  rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500 bg-white">

                  No functionalities found {searchQuery && `matching "${searchQuery}"`}

                </div>
              )}
            </div>
          </div>
        </div>
      </div>


      {isSliderOpen && (
        <div className="fixed inset-0 bg-gray-600/50 flex items-center justify-center z-50">
          <div
            ref={sliderRef}
            className="w-full md:w-[500px] bg-white rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white rounded-t-2xl">
              <h2 className="text-xl font-bold text-newPrimary">
                {isEdit ? "Edit Right" : "Add Right"}
              </h2>
              <button
                className="w-8 h-8 bg-newPrimary text-white rounded-full flex items-center justify-center hover:bg-newPrimary/70"
                onClick={() => setIsSliderOpen(false)}
              >
                &times;
              </button>
            </div>
            <div className="p-4 md:p-6 space-y-4">
              <div>

                <label className="block text-sm font-medium text-gray-900 mb-1">Group</label>

                <select
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary transition-all"
                >
                  <option value="">Select Group</option>
                  {groups.map((group) => (
                    <option key={group._id} value={group._id}>
                      {group.groupName}
                    </option>
                  ))}
                </select>
              </div>



              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Module</label>

                <select
                  value={moduleName}
                  onChange={(e) => {
                    setModuleName(e.target.value);
                    setSelectedFunctionalities([]);
                  }}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Module</option>
                  {modules.map((module) => (
                    <option key={module._id} value={module.moduleName}>
                      {module.moduleName}
                    </option>
                  ))}
                </select>
              </div>
              <div>

                <label className="block text-sm font-medium text-gray-900 mb-1">Functionalities</label>

                <select
                  multiple
                  value={selectedFunctionalities}
                  onChange={handleFunctionalityChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
                  disabled={!moduleName}
                >
                  {availableFunctionalities.length > 0 ? (
                    availableFunctionalities.map((func, index) => (
                      <option key={index} value={func}>
                        {func}
                      </option>
                    ))
                  ) : (
                    <option disabled>No functionalities available</option>
                  )}
                </select>

                <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple functionalities</p>

              </div>
              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsSliderOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-newPrimary text-white rounded-lg hover:bg-newPrimary/70"
                  onClick={handleSave}
                >
                  {isEdit ? "Update Right" : "Save Right"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default ModulesFunctionalities;

