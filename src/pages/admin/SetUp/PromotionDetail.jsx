import React, { useState, useEffect, useCallback, useRef } from "react";
import { HashLoader } from "react-spinners";
import gsap from "gsap";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import CommanHeader from "../../../components/CommanHeader";
import { SquarePen, Trash2 } from "lucide-react";
import TableSkeleton from "../Skeleton";

const Promotion = () => {
  const [promotions, setPromotions] = useState([]);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [promotionName, setPromotionName] = useState("");
  const [isEnable, setIsEnable] = useState(true);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const sliderRef = useRef(null);

  const API_URL = `${import.meta.env.VITE_API_BASE_URL}/promotion`;
  const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  const fetchPromotionList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      setPromotions(res.data);
    
    } catch (error) {
      console.error("Failed to fetch Promotion", error);
      // Fallback to static data if API fails
      setPromotions([
        {
          _id: "1",
          promotionName: "Summer Sale",
          details: "Flat 30% off on all summer items",
          startDate: "2025-06-01",
          endDate: "2025-06-30",
          isEnable: true,
          createdAt: new Date().toISOString(),
        },
        {
          _id: "2",
          promotionName: "Winter Clearance",
          details: "Up to 50% off on jackets",
          startDate: "2025-12-01",
          endDate: "2025-12-31",
          isEnable: false,
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchPromotionList();
  }, [fetchPromotionList]);

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

  // Handlers
  const handleAddClick = () => {
    setEditingPromotion(null);
    setPromotionName("");
    setDetails("");
    setStartDate("");
    setEndDate("");
    setIsEnable(true);
    setIsSliderOpen(true);
  };

  const handleEditClick = (promotion) => {
    setEditingPromotion(promotion);
    setPromotionName(promotion.promotionName);
    setIsEnable(promotion.isEnable);
    setDetails(promotion.details || "");
    setStartDate(formatDate(promotion.startDate));

    setEndDate(formatDate(promotion.endDate));
    setIsSliderOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = promotionName.trim();
    // const formatDate = (date) => {
    //   if (!date) return "";
    //   return new Date(date).toISOString().split("T")[0];
    // };

    if (!trimmedName) {
      toast.error("Promotion name cannot be empty.");
      return;
    }

    const formData = {
      promotionName: trimmedName,
      details,
      startDate,
      endDate,
      isEnable,
    };

    try {
      const { token } = userInfo || {};
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      let res;

      if (editingPromotion) {
        // ✅ Update existing promotion
        res = await axios.put(`${API_URL}/${editingPromotion._id}`, formData, {
          headers,
        });

        setPromotions(
          promotions.map((p) => (p._id === editingPromotion._id ? res.data : p))
        );

        toast.success("Promotion updated successfully");
      } else {
        // ✅ Add new promotion
        res = await axios.post(API_URL, formData, { headers });

        setPromotions([...promotions, res.data]);

        toast.success("Promotion added successfully");
      }

      // Reset form state
      setPromotionName("");
      setDetails("");
      setStartDate("");
      setEndDate("");
      setIsEnable(true);
      setEditingPromotion(null);
      setIsSliderOpen(false);
    } catch (error) {
      console.error("Save failed:", error);
      toast.error(
        `❌ Failed to ${editingPromotion ? "update" : "add"} promotion`
      );
    }
  };

  const handleToggleEnable = async (promotion) => {
    setPromotions(
      promotions.map((p) =>
        p._id === promotion._id ? { ...p, isEnable: !p.isEnable } : p
      )
    );
    toast.success(
      `✅ Promotion ${!promotion.isEnable ? "enabled" : "disabled"}.`
    );
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

            // ✅ Delete from backend
            await axios.delete(`${API_URL}/${id}`, { headers });

            // ✅ Update UI
            setPromotions(promotions.filter((p) => p._id !== id));

            swalWithTailwindButtons.fire(
              "Deleted!",
              "Promotion deleted successfully.",
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
            "Promotion is safe 🙂",
            "error"
          );
        }
      });
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* Common header */}
      <CommanHeader />
      <div className="px-6 mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-newPrimary">
              Promotion Details
            </h1>
          </div>
          <button
            className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/80"
            onClick={handleAddClick}
          >
            + Add Promotions
          </button>
        </div>

        <div className="rounded-xl shadow border border-gray-200 overflow-hidden">
          <div className="overflow-y-auto lg:overflow-x-auto max-h-[400px]">
            <div className="min-w-[800px]">
              {/* ✅ Table Header */}
              <div className="hidden lg:grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-6 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200">
                <div>Promotion Name</div>
                <div>Details</div>
                <div>Start Date</div>
                <div>End Date</div>
                <div className="text-right">Actions</div>
              </div>

              {/* ✅ Table Body */}
              <div className="flex flex-col divide-y divide-gray-100">
                {loading ? (
                  <TableSkeleton
                    rows={3}
                    cols={5}
                    className="lg:grid-cols-[1fr_1fr_1fr_1fr_auto]"
                  />
                ) : promotions.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 bg-white">
                    No promotions found.
                  </div>
                ) : (
                  promotions.map((promotion) => (
                    <div
                      key={promotion._id}
                      className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1fr_1fr_auto] items-center gap-6 px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                    >
                      {/* Promotion Name */}
                      <div className="font-medium text-gray-900">
                        {promotion.promotionName}
                      </div>

                      {/* Details */}
                      <div className="text-gray-600 truncate">
                        {promotion.details}
                      </div>

                      {/* Start Date */}
                      <div className="text-gray-500 text-end max-w-32">
                        {formatDate(promotion.startDate)}
                      </div>

                      {/* End Date */}
                      <div className="text-gray-500 text-end max-w-40">
                        {formatDate(promotion.endDate)}
                      </div>

                      {/* Actions */}
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(promotion)}
                          className="px-3 py-1 text-sm rounded text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit"
                        >
                          <SquarePen size={18} />
                        </button>
                        <button
                          onClick={() => handleToggleEnable(promotion)}
                          className={`px-3 py-1 text-sm rounded ${
                            promotion.isEnable
                              ? "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                              : "bg-green-100 text-green-600 hover:bg-green-200"
                          }`}
                          title={promotion.isEnable ? "Disable" : "Enable"}
                        >
                          {promotion.isEnable ? "Disable" : "Enable"}
                        </button>
                        <button
                          onClick={() => handleDelete(promotion._id)}
                          className="px-3 py-1 text-sm rounded text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete"
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
              className="w-full md:w-[500px] bg-white rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white rounded-t-2xl">
                <h2 className="text-xl font-bold text-newPrimary">
                  {editingPromotion
                    ? "Update Promotion"
                    : "Add a New Promotion"}
                </h2>
                <button
                  className="w-8 h-8 bg-newPrimary text-white rounded-full flex items-center justify-center hover:bg-newPrimary/70"
                  onClick={() => {
                    setIsSliderOpen(false);
                    setPromotionName("");
                    setDetails("");
                    setStartDate("");
                    setEndDate("");
                    setIsEnable(true);
                    setEditingPromotion(null);
                  }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 p-4 md:p-6">
                {/* Promotion Name */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Promotion Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={promotionName}
                    onChange={(e) => setPromotionName(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                    placeholder="Enter promotion name"
                    required
                  />
                </div>

                {/* Details */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Details
                  </label>
                  <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                    placeholder="Enter promotion details"
                    rows="3"
                  />
                </div>

                {/* Start / End Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                    />
                  </div>
                </div>

                {/* Status Enable */}
                <div className="flex items-center justify-between">
                  <label className="text-gray-700 font-medium">Status</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsEnable(!isEnable)}
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
                        isEnable ? "bg-green-500" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                          isEnable ? "translate-x-6" : "translate-x-0"
                        }`}
                      />
                    </button>
                    <span
                      className={`text-sm font-medium ${
                        isEnable ? "text-green-600" : "text-gray-500"
                      }`}
                    >
                      {isEnable ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-newPrimary text-white px-4 py-3 rounded-lg hover:bg-newPrimary/80 transition-colors disabled:bg-newPrimary/50"
                >
                  {loading
                    ? "Saving..."
                    : editingPromotion
                    ? "Update Promotion"
                    : "Save Promotion"}
                </button>
              </form>
            </div>
          </div>
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

export default Promotion;
