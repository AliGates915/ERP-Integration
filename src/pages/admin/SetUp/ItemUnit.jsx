import React, { useState, useCallback, useEffect, useRef } from "react";
import { HashLoader } from "react-spinners";
import gsap from "gsap";
import { toast } from "react-toastify";
import axios from "axios";
import Swal from "sweetalert2";
import CommanHeader from "../../../components/CommanHeader";
import { SquarePen, Trash2 } from "lucide-react";
import TableSkeleton from "../Skeleton";

const ItemUnit = () => {
  const [itemUnitList, setItemUnitList] = useState([]);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [manufacturerName, setManufacturerName] = useState("");
  const [address, setAddress] = useState("");
  const [productsSupplied, setProductsSupplied] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(true); // true for Active, false for Inactive
  const [gstNumber, setGstNumber] = useState("");

  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const sliderRef = useRef(null);
  const [loading, setLoading] = useState(true);

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

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

  // Static Data for Manufacturers

  const API_URL = `${import.meta.env.VITE_API_BASE_URL}/item-unit`;

  // Handlers
  const handleAddManufacturer = () => {
    setIsSliderOpen(true);
    setIsEdit(false);
    setEditId(null);
    setManufacturerName("");
    setAddress("");
    setProductsSupplied("");
    setEmail("");
    setGstNumber("");
    setStatus(true);
  };

  const fetchItemUnitList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}`);
      setItemUnitList(res.data); // store actual categories array
    } catch (error) {
      console.error("Failed to fetch Supplier", error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);
  useEffect(() => {
    fetchItemUnitList();
  }, [fetchItemUnitList]);

  // Save or Update Manufacturer
  const handleSave = async () => {
    const formData = {
      unitName: manufacturerName,
      description: address,
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
        setItemUnitList(
          itemUnitList.map((m) => (m._id === editId ? res.data : m))
        );
        toast.success("Item Unit updated successfully");
      } else {
        // Simulate API create
        const res = await axios.post(API_URL, formData, {
          headers,
        });
        setItemUnitList([...itemUnitList, res.data]);
        toast.success("Item Unit added successfully");
      }

      // Reset form
      setManufacturerName("");
      setAddress("");
      setProductsSupplied("");
      setEmail("");
      setGstNumber("");
      setStatus(true);
      setIsSliderOpen(false);
      setIsEdit(false);
      setEditId(null);
      fetchItemUnitList();
    } catch (error) {
      console.error(error);
      toast.error(`❌ ${isEdit ? "Update" : "Add"} manufacturer failed`);
    }
  };

  // Edit Manufacturer
  const handleEdit = (item) => {
    setIsEdit(true);
    setEditId(item._id);
    setManufacturerName(item.unitName);
    setAddress(item.description);
    setIsSliderOpen(true);
  };

  // Delete Manufacturer
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
        try {
          await axios.delete(`${API_URL}/${id}`, {
            headers: {
              Authorization: `Bearer ${userInfo?.token}`,
            },
          });
          setItemUnitList(itemUnitList.filter((m) => m._id !== id));
          swalWithTailwindButtons.fire(
            "Deleted!",
            "Manufacturer deleted successfully.",
            "success"
          );
        } catch (error) {
          console.error("Delete error:", error);
          swalWithTailwindButtons.fire(
            "Error!",
            "Failed to delete manufacturer.",
            "error"
          );
        }
      });
  };

  // Show loading spinner
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
          <h1 className="text-2xl font-bold text-newPrimary">Unit Item List</h1>
          <p className="text-gray-500 text-sm">
            Manage your manufacturer details
          </p>
        </div>
        <button
          className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-primaryDark"
          onClick={handleAddManufacturer}
        >
          + Add Unit Item
        </button>
      </div>

      {/* Item unit Table */}
      <div className="rounded-xl shadow border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* ✅ Table Header */}
            <div className="hidden lg:grid grid-cols-[0.2fr_150px_1fr_2fr_auto] gap-6 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200">
              <div>SR</div>
              <div>Unit Item ID</div>
              <div>Name</div>
              <div>Description</div>
              {userInfo?.isAdmin && <div className="text-right">Actions</div>}
            </div>

            {/* ✅ Table Body */}
            <div className="flex flex-col divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
              {loading ? (
                // Skeleton shown while loading
                <TableSkeleton
                  rows={itemUnitList.length > 0 ? itemUnitList.length : 5}
                  cols={userInfo?.isAdmin ? 5 : 6}
                  className="lg:grid-cols-[0.2fr_150px_1fr_2fr_auto]"
                />
              ) : itemUnitList.length === 0 ? (
                <div className="text-center py-4 text-gray-500 bg-white">
                  No unit items found.
                </div>
              ) : (
                itemUnitList.map((manufacturer, index) => (
                  <div
                    key={manufacturer._id || `temp-${manufacturer}`}
                    className="grid grid-cols-[0.2fr_150px_1fr_2fr_auto] items-center gap-6 px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                  >
                    <div className="text-gray-600">{index + 1}</div>
                    {/* Unit Item ID */}
                    <div className="text-gray-900">
                      {manufacturer._id?.slice(0, 5) || "N/A"}
                    </div>

                    {/* Name */}
                    <div className="text-gray-600">{manufacturer.unitName}</div>

                    {/* Description */}
                    <div className="text-gray-600">
                      {manufacturer.description}
                    </div>

                    {/* Actions */}
                    {userInfo?.isAdmin && (
                      <div className="flex justify-end">
                        <div className="relative group">
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleEdit(manufacturer)}
                              className="w-full text-left  py-1 text-sm  text-blue-600 flex items-center gap-2"
                            >
                              <SquarePen size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(manufacturer._id)}
                              className="w-full text-left py-1 text-sm hover:bg-red-50 text-red-500 flex items-center gap-2"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
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
                {isEdit ? "Edit Right" : "Add a New Item Unit"}
              </h2>
              <button
                className="w-8 h-8 bg-newPrimary text-white rounded-full flex items-center justify-center hover:bg-newPrimary/70"
                onClick={() => setIsSliderOpen(false)}
              >
                &times;
              </button>
            </div>

            <div className="p-4 md:p-6 bg-white rounded-xl shadow-md space-y-4">
              {/* Unit Name */}
              <div>
                <label className="block text-gray-700 font-medium">
                  Unit Name
                </label>
                <input
                  type="text"
                  value={manufacturerName}
                  required
                  onChange={(e) => setManufacturerName(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-gray-700 font-medium">
                  Description
                </label>
                <input
                  type="text"
                  value={address}
                  required
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* Save Button */}
              <button
                className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/80 w-full"
                onClick={handleSave}
              >
                Save Item Unit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemUnit;
