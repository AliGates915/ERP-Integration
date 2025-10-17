import React, { useState, useEffect, useRef, useCallback } from "react";
import { HashLoader } from "react-spinners";
import gsap from "gsap";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import axios from "axios";
import CommanHeader from "../../../components/CommanHeader";
import { SquarePen, Trash2 } from "lucide-react";
import TableSkeleton from "../Skeleton";

const ShelveLocation = () => {
  const [shelveLocationList, setShelveLocationList] = useState([]);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [shelfName, setShelfName] = useState("");
  const [section, setSection] = useState("");
  // const [currentStockCount, setCurrentStockCount] = useState("");
  const [description, setDescription] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const sliderRef = useRef(null);
  const [loading, setLoading] = useState(true);

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const API_URL = `${import.meta.env.VITE_API_BASE_URL}/shelves`;

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

  const fetchLocation = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}`);
      setShelveLocationList(res.data); // store actual categories array
    } catch (error) {
      console.error("Failed to fetch Supplier", error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);
  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  // Handlers
  const handleAddShelveLocation = () => {
    setIsSliderOpen(true);
    setIsEdit(false);
    setEditId(null);
    setShelfName("");
    // setSection("");
    // setCurrentStockCount("");
    setDescription("");
  };

  // Save or Update Shelve Location
  const handleSave = async () => {
    const formData = {
      shelfNameCode: shelfName,
      description,
    };

    try {
      const { token } = userInfo || {};
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      if (isEdit && editId) {
        // Simulate API update
        const res = await axios.put(`${API_URL}/${editId}`, formData, {
          headers,
        });

        toast.success("Shelve Location updated successfully");
      } else {
        try {
          const res = await axios.post(API_URL, formData, {
            headers,
          });
          toast.success("Shelve Location added successfully");
        } catch (error) {
          toast.error(error.response.data.message);
        }
      }
      fetchLocation();
      // Reset form
      setShelfName("");
      // setSection("");
      // setCurrentStockCount("");
      setDescription("");
      setIsSliderOpen(false);
      setIsEdit(false);
      setEditId(null);
    } catch (error) {
      console.error(error);
      // toast.error(error.response.data.message);
    }
  };

  // Edit Shelve Location
  const handleEdit = (shelveLocation) => {
    console.log({ shelveLocation });

    setIsEdit(true);
    setEditId(shelveLocation._id);
    setShelfName(shelveLocation.shelfNameCode);
    // setSection(shelveLocation.section);
    // setCurrentStockCount(shelveLocation.currentStockCount.toString());
    setDescription(shelveLocation.description);
    setIsSliderOpen(true);
  };

  // Delete Shelve Location
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
            setShelveLocationList(
              shelveLocationList.filter((s) => s._id !== id)
            );
            swalWithTailwindButtons.fire(
              "Deleted!",
              "Shelve Location deleted successfully.",
              "success"
            );
          } catch (error) {
            console.error("Delete error:", error);
            swalWithTailwindButtons.fire(
              "Error!",
              "Failed to delete shelve location.",
              "error"
            );
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire(
            "Cancelled",
            "Shelve Location is safe 🙂",
            "error"
          );
        }
      });
  };

  // // Show loading spinner
  // if (loading) {
  //   return (
  //     <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
  //       <div className="text-center">
  //         <HashLoader height="150" width="150" radius={1} color="#84CF16" />
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Coomon header */}
      <CommanHeader />
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-newPrimary">
            Shelve Locations List
          </h1>
          <p className="text-gray-500 text-sm">
            Manage your shelve location details
          </p>
        </div>
        <button
          className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/80"
          onClick={handleAddShelveLocation}
        >
          + Add Shelve Location
        </button>
      </div>

      {/* Shelve Location Table */}

      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* ✅ Table Header (desktop only) */}
            <div className="hidden lg:grid grid-cols-[0.2fr_1fr_2fr_auto] gap-6 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200">
              <div>SR</div>
              <div>Shelf Code</div>
              <div>Description</div>
              {userInfo?.isAdmin && <div className="text-right">Actions</div>}
            </div>

            {/* ✅ Table Body */}
            <div className="flex flex-col divide-y divide-gray-100 max-h-screen overflow-y-auto">
              {loading ? (
                <TableSkeleton
                  rows={
                    shelveLocationList.length > 0
                      ? shelveLocationList.length
                      : 5
                  }
                  cols={userInfo?.isAdmin ? 4 : 2}
                  className="lg:grid-cols-[0.2fr_1fr_2fr_auto]"
                />
              ) : shelveLocationList.length === 0 ? (
                <div className="text-center py-4 text-gray-500 bg-white">
                  No shelves found.
                </div>
              ) : (
                shelveLocationList.map((s, index) => (
                  <>
                    {/* ✅ Desktop Row */}
                    <div
                      key={s._id}
                      className="hidden lg:grid grid-cols-[0.2fr_1fr_2fr_auto] items-center gap-6 px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                    >
                      <div className="text-gray-600">{index + 1}</div>
                      <div className="text-gray-900">{s.shelfNameCode}</div>
                      <div className="text-gray-600">{s.description}</div>
                      {userInfo?.isAdmin && (
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => handleEdit(s)}
                            className="text-blue-600"
                          >
                            <SquarePen size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(s._id)}
                            className="text-red-600"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* ✅ Mobile Card */}
                    <div
                      key={`mobile-${s._id}`}
                      className="lg:hidden bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4"
                    >
                      <h3 className="font-semibold text-gray-800">
                        {s.shelfNameCode}
                      </h3>
                      <p className="text-sm text-gray-600">{s.description}</p>

                      {userInfo?.isAdmin && (
                        <div className="mt-3 flex justify-end gap-3">
                          <button
                            className="text-blue-500"
                            onClick={() => handleEdit(s)}
                          >
                            <SquarePen size={18} />
                          </button>
                          <button
                            className="text-red-500"
                            onClick={() => handleDelete(s._id)}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )}
                    </div>
                  </>
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
            className="w-full md:w-[500px] bg-white rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white rounded-t-2xl">
              <h2 className="text-xl font-bold text-newPrimary">
                {isEdit ? "Edit Right" : "Add a New Shelve Location"}
              </h2>
              <button
                className="w-8 h-8 bg-newPrimary text-white rounded-full flex items-center justify-center hover:bg-newPrimary/70"
                onClick={() => setIsSliderOpen(false)}
              >
                &times;
              </button>
            </div>
            <div className="p-4 md:p-6 bg-white rounded-xl shadow-md space-y-4">
              {/* Shelf Name / Code */}
              <div>
                <label className="block text-gray-700 font-medium">
                  Shelf Name / Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={shelfName}
                  required
                  onChange={(e) => setShelfName(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* Section */}
              {/* <div>
                <label className="block text-gray-700 font-medium">
                  Section <span className="text-newPrimary">*</span>
                </label>
                <input
                  type="text"
                  value={section}
                  required
                  onChange={(e) => setSection(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div> */}

              {/* Current Stock Count */}
              {/* <div>
                <label className="block text-gray-700 font-medium">
                  Current Stock Count <span className="text-newPrimary">*</span>
                </label>
                <input
                  type="number"
                  value={currentStockCount}
                  required
                  onChange={(e) => setCurrentStockCount(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div> */}

              {/* Description */}
              <div>
                <label className="block text-gray-700 font-medium">
                  Description <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={description}
                  required
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* Save Button */}
              <button
                className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/80 w-full"
                onClick={handleSave}
              >
                Save Shelve Location
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShelveLocation;
