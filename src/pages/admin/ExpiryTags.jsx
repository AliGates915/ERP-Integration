import React, { useState, useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import Swal from "sweetalert2";
import axios from "axios";
import { toast } from "react-toastify";
import { HashLoader } from "react-spinners";
import CommanHeader from "../../components/CommanHeader";
import TableSkeleton from "./Skeleton";
import { SquarePen, Trash2 } from "lucide-react";

const ExpiryTags = () => {
  const [expiryTagList, setExpiryTagList] = useState([
    {
      _id: "tag1",
      receiptNo: "RCP-1001",
      itemCode: "ITM-001",
      itemName: "Paracetamol",
      category: "Medicines",
      price: 50,
      salePrice: 65,
      manufacturer: "ABC Pharma",
      supplier: "MediSupply Pvt Ltd",
      manufactureDate: "2025-08-01T10:00:00",
      expiryDate: "2026-08-01T10:00:00",
    },
    {
      _id: "tag2",
      receiptNo: "RCP-1002",
      itemCode: "ITM-002",
      itemName: "Vitamin C Syrup",
      category: "Medicines",
      price: 120,
      salePrice: 150,
      manufacturer: "HealthCare Labs",
      supplier: "Wellness Suppliers",
      manufactureDate: "2025-07-15T09:00:00",
      expiryDate: "2026-01-15T09:00:00",
    },
    {
      _id: "tag3",
      receiptNo: "RCP-1003",
      itemCode: "ITM-003",
      itemName: "Charger",
      category: "Electronics",
      price: 800,
      salePrice: 950,
      manufacturer: "TechGear",
      supplier: "ElectroWorld",
      manufactureDate: "2025-05-10T08:30:00",
      expiryDate: "2027-05-10T08:30:00",
    },
    {
      _id: "tag4",
      receiptNo: "RCP-1004",
      itemCode: "ITM-004",
      itemName: "Injections",
      category: "Medicines",
      price: 300,
      salePrice: 380,
      manufacturer: "LifeLine Pharma",
      supplier: "Global Meds",
      manufactureDate: "2025-06-20T11:15:00",
      expiryDate: "2026-06-20T11:15:00",
    },
  ]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [receiptNo, setReceiptNo] = useState("");
  const [itemCode, setItemCode] = useState("");
  const [itemName, setItemName] = useState("");
  const [price, setPrice] = useState(0);
  const [manufacturer, setManufacturer] = useState("");
  const [supplier, setSupplier] = useState("");
  const [category, setCategory] = useState("");
  const [salePrice, setSalePrice] = useState(0);
  const [manufactureDate, setManufactureDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  // UI + edit
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const sliderRef = useRef(null);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  // Category/suggestions
  const [categoryList, setCategoryList] = useState([]);
  const [itemCategory, setItemCategory] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  // Animate slider
  useEffect(() => {
    if (isSliderOpen && sliderRef.current) {
      gsap.fromTo(
        sliderRef.current,
        { x: "100%", opacity: 0 },
        { x: "0%", opacity: 1, duration: 0.5, ease: "power2.out" }
      );
    } else if (sliderRef.current) {
      gsap.to(sliderRef.current, {
        x: "100%",
        opacity: 0,
        duration: 0.5,
        ease: "power2.in",
        onComplete: () => {
          sliderRef.current.style.display = "none";
        },
      });
    }
  }, [isSliderOpen]);

  const handleCloseSlider = () => {
    setIsSliderOpen(false);
    setIsEdit(false);
    setEditId(null);
    resetForm();
  };

  // Reset form
  const resetForm = () => {
    setReceiptNo("");
    setItemCode("");
    setItemName("");
    setPrice(0);
    setManufacturer("");
    setSupplier("");
    setCategory("");
    setItemCategory("");
    setSalePrice(0);
    setManufactureDate("");
    setExpiryDate("");
  };

  // Fetch expiry tags
  const fetchExpiryTags = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/expirayTags`
      );
      setExpiryTagList(res.data);
    } catch (error) {
      console.error("Error fetching expiry tags:", error);
      toast.error("Failed to fetch expiry tags");
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  }, []);

  useEffect(() => {
    fetchExpiryTags();
  }, [fetchExpiryTags]);

  // Fetch categories
  const fetchCategoryList = useCallback(async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/categories/list`
      );
      setCategoryList(res.data);
    } catch (error) {
      console.error("Error fetching categories", error);
    }
  }, []);

  useEffect(() => {
    fetchCategoryList();
  }, [fetchCategoryList]);

  // Fetch items by category
  const fetchItemsByCategory = async (categoryName) => {
    try {
      setItemCategory(categoryName);
      const res = await axios.get(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/item-details/category/${categoryName}`
      );
      setSuggestions(res.data);
    } catch (error) {
      console.error("Error fetching items by category", error);
    }
  };

  const handleSelectItem = async (e) => {
    const selectedName = e.target.value;
    setItemName(selectedName);

    const selectedItem = suggestions.find(
      (item) => item.itemName === selectedName
    );

    if (selectedItem) {
      setPrice(selectedItem.purchase || "");
      setSalePrice(selectedItem.sales || "");
      setManufactureDate(selectedItem.createdAt?.slice(0, 16) || "");
      if (selectedItem.manufacturer) {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/manufacturers/${
            selectedItem.manufacturer
          }`
        );
        setManufacturer(res.data.manufacturerName);
      }
      if (selectedItem.supplier) {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/suppliers/${
            selectedItem.supplier
          }`
        );
        setSupplier(res.data.supplierName);
      }
    }
  };

  // Save expiry tag
  const handleSave = async () => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const token = userInfo?.token;

    if (!token) {
      toast.error("❌ Authorization token missing!");
      return;
    }

    const payload = {
      receiptNo,
      itemCode,
      itemName,
      price,
      manufacturer,
      supplier,
      category: itemCategory,
      salePrice,
      manufactureDate,
      expiryDate,
    };

    try {
      const headers = { Authorization: `Bearer ${token}` };
      if (isEdit && editId) {
        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/expirayTags/${editId}`,
          payload,
          { headers }
        );
        toast.success("✅ Expiry Tag updated successfully");
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/expirayTags`,
          payload,
          { headers }
        );
        toast.success("✅ Expiry Tag added successfully");
      }
      resetForm();
      setIsEdit(false);
      setEditId(null);
      setIsSliderOpen(false);
      fetchExpiryTags();
    } catch (error) {
      console.error("Save error:", error);
      toast.error(`❌ ${isEdit ? "Update" : "Add"} expiry tag failed`);
    }
  };

  // Delete expiry tag
  const handleDelete = async (id) => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const token = userInfo?.token;
    if (!token) {
      toast.error("❌ Authorization token missing!");
      return;
    }

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
        text: "This will delete the expiry tag.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, cancel!",
        reverseButtons: true,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          try {
            await axios.delete(
              `${import.meta.env.VITE_API_BASE_URL}/expirayTags/${id}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            swalWithTailwindButtons.fire(
              "Deleted!",
              "Expiry Tag removed.",
              "success"
            );
            fetchExpiryTags();
          } catch (error) {
            console.error("Delete error:", error);
            swalWithTailwindButtons.fire(
              "Error!",
              "Failed to delete Expiry Tag.",
              "error"
            );
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire(
            "Cancelled",
            "Expiry Tag is safe 🙂",
            "error"
          );
        }
      });
  };

  // Edit expiry tag
  const handleEdit = (tag) => {
    setIsEdit(true);
    setEditId(tag._id);
    setReceiptNo(tag.receiptNo || "");
    setItemCode(tag.itemCode || "");
    setItemName(tag.itemName || "");
    setPrice(tag.price || 0);
    setManufacturer(tag.manufacturer || "");
    setSupplier(tag.supplier || "");
    setCategory(tag.category || "");
    setItemCategory(tag.category || "");
    setSalePrice(tag.salePrice || 0);
    setManufactureDate(tag.manufactureDate || "");
    setExpiryDate(tag.expiryDate || "");
    setIsSliderOpen(true);
  };

  // if (loading) {
  //   return (
  //     <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
  //       <HashLoader size={150} color="#84CF16" />
  //     </div>
  //   );
  // }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Common Header */}
      <CommanHeader />
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-newPrimary">
            Expiry Tags List
          </h1>
          <p className="text-gray-500 text-sm">
            Expiry Tag Management Dashboard
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsSliderOpen(true);
          }}
          className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-primaryDark transition-colors duration-200"
        >
          + Add Expiry Tag
        </button>
      </div>

      {/* Table */}
      {/* Table */}
      <div className="rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* ✅ Table Header (Desktop Only) */}
            <div className="hidden lg:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1.5fr_auto] gap-6 bg-gray-50 py-3 px-6 text-xs font-semibold text-gray-600 uppercase border-b border-gray-200 sticky top-0 z-10">
              <div>Item Name</div>
              <div>Code</div>
              <div>Category</div>
              <div>Price</div>
              <div>Sale Price</div>
              <div>Expiry Date</div>
              <div className="text-right">Actions</div>
            </div>

            {/* ✅ Table Body */}
            <div className="flex flex-col divide-y divide-gray-100 max-h-screen overflow-y-auto">
              {loading ? (
                <TableSkeleton
                  rows={expiryTagList.length > 0 ? expiryTagList.length : 5}
                  cols={7}
                  className="lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_1.5fr_auto]"
                />
              ) : expiryTagList.length === 0 ? (
                <div className="text-center py-4 text-gray-500 bg-white">
                  No tags found.
                </div>
              ) : (
                expiryTagList.map((tag) => (
                  <>
                    {/* ✅ Desktop Grid */}
                    <div
                      key={tag._id}
                      className="hidden lg:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1.5fr_auto] gap-6 items-center px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                    >
                      <div className="font-medium text-gray-900">
                        {tag.itemName}
                      </div>
                      <div className="font-semibold text-green-600">
                        {tag.itemCode}
                      </div>
                      <div className="text-gray-600">{tag.category}</div>
                      <div className="text-gray-600">{tag.price}</div>
                      <div className="text-gray-600">{tag.salePrice}</div>
                      <div className="text-gray-600">
                        {tag.expiryDate?.slice(0, 10)}
                      </div>
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => handleEdit(tag)}
                          className="text-blue-500 hover:underline"
                        >
                          <SquarePen size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(tag._id)}
                          className="text-red-500 hover:underline"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {/* ✅ Mobile Card */}
                    <div
                      key={`mobile-${tag._id}`}
                      className="lg:hidden bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4"
                    >
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">
                          {tag.itemName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {tag.itemCode}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Category: {tag.category}
                      </div>
                      <div className="text-sm text-gray-600">
                        Price: {tag.price}
                      </div>
                      <div className="text-sm text-gray-600">
                        Sale Price: {tag.salePrice}
                      </div>
                      <div className="text-sm text-gray-600">
                        Expiry: {tag.expiryDate?.slice(0, 10)}
                      </div>

                      {userInfo?.isAdmin && (
                        <div className="mt-3 flex justify-end gap-3">
                          <button
                            className="text-blue-500"
                            onClick={() => handleEdit(tag)}
                          >
                            <SquarePen size={18} />
                          </button>
                          <button
                            className="text-red-500"
                            onClick={() => handleDelete(tag._id)}
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

      {/* Right-Side Slider */}
      {isSliderOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50">
          <div
            ref={sliderRef}
            className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-xl overflow-y-auto"
            style={{ display: "block" }}
          >
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-newPrimary">
                {isEdit ? "Edit Expiry Tag" : "Add Expiry Tag"}
              </h2>
              <button
                className="w-6 h-6 text-white rounded-full flex justify-center items-center hover:text-gray-400 text-xl bg-newPrimary"
                onClick={handleCloseSlider}
              >
                &times;
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Expiry Tag Section */}
              <div className="border rounded-lg p-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-1">
                      Receipt No
                    </label>
                    <input
                      type="text"
                      value={receiptNo}
                      onChange={(e) => setReceiptNo(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                      placeholder="Enter receipt number"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Category</label>
                    <select
                      value={itemCategory}
                      onChange={(e) => {
                        const cat = e.target.value;
                        setItemCategory(cat);
                        if (cat) fetchItemsByCategory(cat);
                      }}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                    >
                      <option value="">Select Category</option>
                      {categoryList.map((c) => (
                        <option key={c._id} value={c.categoryName}>
                          {c.categoryName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">
                      Item Name
                    </label>
                    <select
                      value={itemName}
                      onChange={handleSelectItem}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                    >
                      <option value="">Select Item</option>
                      {suggestions.map((s) => (
                        <option key={s._id} value={s.itemName}>
                          {s.itemName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">
                      Item Code
                    </label>
                    <input
                      type="text"
                      value={itemCode}
                      onChange={(e) => setItemCode(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                      placeholder="Enter item code"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Price</label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                      placeholder="Enter price"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">
                      Sale Price
                    </label>
                    <input
                      type="number"
                      value={salePrice}
                      onChange={(e) => setSalePrice(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                      placeholder="Enter sale price"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">
                      Manufacturer
                    </label>
                    <input
                      type="text"
                      value={manufacturer}
                      onChange={(e) => setManufacturer(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                      placeholder="Enter manufacturer"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Supplier</label>
                    <input
                      type="text"
                      value={supplier}
                      onChange={(e) => setSupplier(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                      placeholder="Enter supplier"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">
                      Manufacture Date
                    </label>
                    <input
                      type="datetime-local"
                      value={manufactureDate}
                      onChange={(e) => setManufactureDate(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="datetime-local"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                  onClick={handleCloseSlider}
                >
                  Cancel
                </button>
                <button
                  className="bg-newPrimary text-white px-6 py-2 rounded-lg hover:bg-primaryDark transition-colors duration-200"
                  onClick={handleSave}
                >
                  {isEdit ? "Update Expiry Tag" : "Save Expiry Tag"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ExpiryTags;
