import React, { useState, useEffect, useRef, useCallback } from "react";
import { SquarePen, Trash2 } from "lucide-react";
import CommanHeader from "../../../components/CommanHeader";
import TableSkeleton from "../Skeleton";
import Swal from "sweetalert2";
import gsap from "gsap";
import { api } from "../../../context/ApiService";
import { toast } from "react-toastify";

const Tax = () => {
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [taxName, setTaxName] = useState("");
  const [taxes, setTaxes] = useState([]);

  const [Value, setValue] = useState();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingTax, setEditingTax] = useState(null);
  const [errors, setErrors] = useState({});
  const recordsPerPage = 10;
  const sliderRef = useRef(null);
  const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};
  const [loading, setLoading] = useState(true); // for table load

  // GSAP Animation for Modal
  useEffect(() => {
    if (!sliderRef.current) return; // prevent null errors

    if (isSliderOpen) {
      sliderRef.current.style.display = "block";
      gsap.fromTo(
        sliderRef.current,
        { scale: 0.7, opacity: 0, y: -50 },
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

  // Fetch Module Data
  const fetchModuleData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get("/taxes");
      setTaxes(data);
    } catch (error) {
      console.error("Error fetching module data:", error);
      setTaxes([]); // fallback to empty array
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);

  useEffect(() => {
    fetchModuleData();
  }, [fetchModuleData]);

  // Tax search
  useEffect(() => {
    if (!searchTerm) {
      fetchModuleData(); // reload full list
      return;
    }

    const delayDebounce = setTimeout(() => {
      try {
        setLoading(true);
        setTaxes((prev) =>
          prev.filter((tax) =>
            tax.taxName.toUpperCase().includes(searchTerm.toUpperCase())
          )
        );
      } catch (error) {
        console.error("Search tax failed:", error);
        setTaxes([]);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, fetchModuleData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!taxName && !Value) {
      toast.error("Tax name and Value cannot be empty.");
      return;
    }

    const value = Number(Value);

    setLoading(true);
    const payload = { taxName, value };

    try {
      let res;
      if (editingTax) {
        res = await api.put(`/taxes/${editingTax._id}`, payload, {
          headers: {
            Authorization: `Bearer ${userInfo?.token}`,
          },
        });
        toast.success("Taxes updated!");
      } else {
        // ➕ Add new category
        res = await api.post("/taxes", payload, {
          headers: {
            Authorization: `Bearer ${userInfo?.token}`,
          },
        });
        toast.success("Taxes added!");
      }

      // Reset form state
      resetForm();
      fetchModuleData();
    } catch (error) {
      console.error(error);
      toast.error(`❌ Failed to ${editingTax ? "update" : "add"} Tax.`);
    } finally {
      setLoading(false);
    }
  };
  // Reset form fields
  const resetForm = () => {
    setTaxName("");
    setValue("");
    setEditingTax(null);
    setErrors({});
    setIsSliderOpen(false);
  };

  // Handlers for form and table actions
  const handleAddTax = () => {
    resetForm();
    setIsSliderOpen(true);
  };

  const handleEditClick = (tax) => {
    setEditingTax(tax);
    setTaxName(tax.taxName || "");
    setValue(tax.value || "");
    setErrors({});
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
      .then(async (result) => {
        if (result.isConfirmed) {
          try {
            // ✅ Call API

            const res = await api.delete(`/taxes/${id}`, {
              headers: {
                Authorization: `Bearer ${userInfo?.token}`,
              },
            });

            // Remove from local state
            setTaxes((prev) => prev.filter((t) => t._id !== id));
            swalWithTailwindButtons.fire(
              "Deleted!",
              "Tax deleted successfully.",
              "success"
            );
          } catch (error) {
            console.error("Delete error:", error);
            swalWithTailwindButtons.fire(
              "Error!",
              "Failed to delete tax.",
              "error"
            );
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire("Cancelled", "Tax is safe 🙂", "error");
        }
      });
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <CommanHeader />
      <div className="px-6 mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-newPrimary">Tax Details</h1>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Enter Tax Name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 w-[250px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-newPrimary"
            />
            <button
              className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/80"
              onClick={handleAddTax}
            >
              + Add Tax
            </button>
          </div>
        </div>

        <div className="rounded-xl shadow border border-gray-200 overflow-hidden">
          <div className="overflow-y-auto lg:overflow-x-auto max-h-[900px]">
            <div className="min-w-[600px]">
              <div className="hidden lg:grid grid-cols-[0.2fr_1fr_1fr_1fr] gap-4 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200">
                <div>SR</div>
                <div>Tax Name</div>
                <div>Value (%)</div>
                <div>Actions</div>
              </div>

              <div className="flex flex-col divide-y divide-gray-100">
                {loading ? (
                  <TableSkeleton
                    rows={recordsPerPage}
                    cols={4}
                    className="lg:grid-cols-[0.2fr_1fr_1fr_1fr]"
                  />
                ) : taxes.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 bg-white">
                    No taxes found.
                  </div>
                ) : (
                  taxes.map((tax, index) => (
                    <div
                      key={tax._id}
                      className="grid grid-cols-1 lg:grid-cols-[0.2fr_1fr_1fr_1fr] items-center gap-4 px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                    >
                      <div className="text-gray-600">{index + 1}</div>
                      <div className="text-gray-600">{tax?.taxName}</div>
                      <div className="text-gray-600">{tax?.value}</div>
                      <div className="flex gap-3 justify-start">
                        <button
                          onClick={() => handleEditClick(tax)}
                          className="py-1 text-sm rounded text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit"
                        >
                          <SquarePen size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(tax._id)}
                          className="py-1 text-sm rounded text-red-600 hover:bg-red-50 transition-colors"
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
                  {editingTax ? "Update Tax" : "Add a New Tax"}
                </h2>
                <button
                  className="w-8 h-8 bg-newPrimary text-white rounded-full flex items-center justify-center hover:bg-newPrimary/70"
                  onClick={resetForm}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 p-4 md:p-6">
                <div className="flex-1 min-w-0">
                  <label className="block text-gray-700 font-medium mb-2">
                    Tax Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={taxName}
                    onChange={(e) => setTaxName(e.target.value)}
                    className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                      errors.taxName
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-newPrimary"
                    }`}
                    placeholder="Enter tax name"
                    required
                  />
                  {errors.taxName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.taxName}
                    </p>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-gray-700 font-medium mb-2">
                    Value (%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={Value}
                    onChange={(e) => setValue(e.target.value)}
                    className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                      errors.value
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-newPrimary"
                    }`}
                    placeholder="Enter tax value"
                    min="0"
                    max="100"
                    step="0.01"
                    required
                  />
                  {errors.value && (
                    <p className="text-red-500 text-xs mt-1">{errors.value}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-newPrimary text-white px-4 py-3 rounded-lg hover:bg-newPrimary/80 transition-colors disabled:bg-blue-300"
                >
                  {loading ? "Saving..." : "Save Tax"}
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

export default Tax;
