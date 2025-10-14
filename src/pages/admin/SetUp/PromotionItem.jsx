import React, { useState, useEffect, useCallback, useRef } from "react";
import { HashLoader } from "react-spinners";
import gsap from "gsap";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { Search, SquarePen, Trash2 } from "lucide-react";
import CommanHeader from "../../../components/CommanHeader";
import TableSkeleton from "../Skeleton";

const PromotionItem = () => {
  const [categoryList, setCategoryList] = useState([]);
  const [promotionList, setPromotionList] = useState([]);
  const [itemTypeList, setItemTypeList] = useState([]);
  const [promotionItems, setPromotionItems] = useState([]);
  const [editingPromotionItem, setEditingPromotionItem] = useState(null);
  const [promotionName, setPromotionName] = useState("");
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkedItems, setCheckedItems] = useState([]);
  // 🔹 New States
  const [details, setDetails] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedPromotion, setSelectedPromotion] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedItemType, setSelectedItemType] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [itemSearch, setItemSearch] = useState("");

  const [isEnable, setIsEnable] = useState(true);
  const sliderRef = useRef(null);

  const API_URL = `${import.meta.env.VITE_API_BASE_URL}/promotion-items`;
  let userInfo = null;
  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };
  try {
    userInfo = JSON.parse(localStorage.getItem("userInfo"));
  } catch (e) {
    userInfo = null;
  }

  // Fetch all data in proper sequence
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch all necessary data first

      const [promotionsRes, categoriesRes, itemTypesRes, promotionItemsRes] =
        await Promise.all([
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/promotion`),
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/categories/list`),
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/item-type`),
          axios.get(API_URL),
        ]);

      setPromotionList(promotionsRes.data);
      setCategoryList(categoriesRes.data);
      setItemTypeList(itemTypesRes.data);
      // Map promotion items with proper names

      const itemsWithNames = promotionItemsRes.data.map((item) => {
        const promotion =
          promotionsRes.data.find((p) => p._id === item.promotion) || {};
        const category =
          categoriesRes.data.find((c) => c._id === item.category) || {};
        const itemType =
          itemTypesRes.data.find((it) => it._id === item.itemType) || {};

        return {
          ...item,
          promotionId: promotion._id || item.promotion,
          promotionName: promotion.promotionName || "N/A",
          categoryId: category._id || item.category,
          categoryName: category.categoryName || "N/A",
          itemTypeId: itemType._id || item.itemType,
          itemTypeName: itemType.itemTypeName || "N/A",
        };
      });

      setPromotionItems(itemsWithNames);
    } catch (error) {
      console.error("Failed to fetch data", error);
      // Fallback to static data if API fails
      setPromotionItems([
        {
          id: 1,
          promotionName: "Summer Sale",
          categoryName: "Clothing",
          itemTypeName: "Shoes",
          items: [
            { itemName: "Nike", price: "$120" },
            { itemName: "Adidas", price: "$100" },
          ],
          discountPercentage: "20%",
          endDate: "2025-09-30",
        },
        {
          id: 2,
          promotionName: "Electronics Offer",
          categoryName: "Mobiles",
          itemTypeName: "Smartphones",
          items: [
            { itemName: "Apple iPhone", price: "$1200" },
            { itemName: "Samsung Galaxy", price: "$1000" },
          ],
          discountPercentage: "15%",
          endDate: "2025-10-15",
        },
      ]);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

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
    setEditingPromotionItem(null);
    setPromotionName("");
    setDetails("");
    setStartDate("");
    setEndDate("");
    setSelectedPromotion("");
    setSelectedCategory("");
    setSelectedItemType("");
    setDiscountPercentage("");
    setIsEnable(true);
    setIsSliderOpen(true);
    setItemSearch("");
    setIsSliderOpen(true);
  };

  const items = [
    { id: 1, itemName: "Nike", price: "$120" },
    { id: 2, itemName: "Adidas", price: "$100" },
    { id: 3, itemName: "Puma", price: "$90" },
    { id: 4, itemName: "Audi", price: "$50,000" },
    { id: 5, itemName: "BMW", price: "$60,000" },
    { id: 6, itemName: "Apple", price: "$1,200" },
    { id: 7, itemName: "Samsung", price: "$1,000" },
  ];

  const filterdata = items.filter((item) => {
    return item.itemName.toLowerCase().includes(itemSearch.toLowerCase());
  });

  const handleEditClick = (promotionitem) => {
    setEditingPromotionItem(promotionitem);
    setPromotionName(promotionitem.promotionName || "");
    setIsEnable(promotionitem.isEnable ?? true);
    setDetails(promotionitem.details || "");
    setStartDate(promotionitem.startDate || "");
    setEndDate(promotionitem.endDate || "");
    setSelectedPromotion(promotionitem.promotion || ""); // ✅ backend key
    setSelectedCategory(promotionitem.category || ""); // ✅ backend key
    setSelectedItemType(promotionitem.itemType || ""); // ✅ backend key
    setDiscountPercentage(promotionitem.discountPercentage || "");
    setIsSliderOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = promotionName.trim();

    if (!selectedPromotion) {
      toast.error("❌ Please select a promotion.");
      return;
    }

    setLoading(true);

    // 🔹 Full payload with new fields
    const payload = {
      promotion: selectedPromotion,
      category: selectedCategory,
      itemType: selectedItemType,
      items: items

        .filter((i) => checkedItems.includes(i._id)) // ✅ filter by _id, not id

        .map((i) => ({ _id: i._id, itemName: i.itemName, price: i.price })),
      discountPercentage,
      details,
      startDate,
      endDate,

      isEnable,
    };

    try {
      let res;
      if (editingPromotionItem) {
        // 🔄 Update existing promotion
        res = await axios.put(
          `${API_URL}/${editingPromotionItem._id}`,
          payload,
          {
            headers: { Authorization: `Bearer ${userInfo?.token}` },
          }
        );

        setPromotionItems(
          promotionItems.map((p) =>
            p._id === editingPromotionItem._id ? res.data : p
          )
        );
        toast.success("✅ Promotion updated!");
      } else {
        // ➕ Add new promotion
        res = await axios.post(API_URL, payload, {
          headers: { Authorization: `Bearer ${userInfo?.token}` },
        });

        setPromotionItems([...promotionItems, res.data]);
        toast.success("✅ Promotion added!");
      }

      // Reset form state
      setIsSliderOpen(false);
      setPromotionName("");
      setSelectedPromotion("");
      setSelectedCategory("");
      setSelectedItemType("");
      setDiscountPercentage("");
      setIsEnable(true);
      setEditingPromotionItem(null);

      // Refetch data to update the list
      fetchAllData();
    } catch (error) {
      console.error(error);
      toast.error(
        `❌ Failed to ${editingPromotionItem ? "update" : "add"} promotion.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEnable = async (promotion) => {
    // ... (no changes in your toggle function)
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
            setPromotionItems((prev) => prev.filter((p) => p._id !== id));

            swalWithTailwindButtons.fire(
              "Deleted!",
              "Promotion item deleted successfully.",
              "success"
            );
          } catch (error) {
            console.error("Delete error:", error);
            swalWithTailwindButtons.fire(
              "Error!",
              "Failed to delete promotion item.",
              "error"
            );
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire(
            "Cancelled",
            "Promotion item is safe 🙂",
            "error"
          );
        }
      });
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <CommanHeader />
      <div className="px-6 mx-auto">
        {/* Top bar */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-newPrimary">
            Promotion Items
          </h1>
          <button
            className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/80"
            onClick={handleAddClick}
          >
            + Add Promotion Items
          </button>
        </div>

        {/* Table */}

        <div className="rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-y-auto lg:overflow-x-auto max-h-[400px]">
            <div className="min-w-[1000px]">
              {/* ✅ Table Header */}
              <div className="hidden lg:grid grid-cols-[150px_150px_150px_400px_140px_150px_210px] gap-4 bg-gray-50 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200">
                <div>Promotion</div>
                <div>Category</div>
                <div>Item Type</div>
                <div>Item Names</div>
                <div>Discount</div>
                <div>End Date</div>
                {userInfo?.isAdmin && <div className="text-right">Actions</div>}
              </div>

              {/* ✅ Table Body */}
              <div className="flex flex-col divide-y divide-gray-100">
                {loading ? (
                  // Skeleton shown while loading
                  <TableSkeleton
                    rows={promotionItems.length || 5}
                    cols={userInfo?.isAdmin ? 7 : 6}
                  />
                ) : promotionItems.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 bg-white">
                    No promotions found.
                  </div>
                ) : (
                  promotionItems.map((promo) => (
                    <div
                      key={promo._id || promo.id}
                      className="grid grid-cols-1 lg:grid-cols-[150px_150px_150px_400px_140px_150px_210px] items-center gap-4 px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                    >
                      {/* Promotion */}
                      <div className="font-medium text-gray-900 truncate">
                        {promo.promotionName}
                      </div>

                      {/* Category */}
                      <div className="text-gray-600 truncate">
                        {promo.categoryName}
                      </div>

                      {/* Item Type */}
                      <div className="text-gray-600 truncate">
                        {promo.itemTypeName}
                      </div>

                      {/* Items */}
                      <div className="text-gray-600 truncate">
                        {promo.items && promo.items.length > 0 ? (
                          promo.items.map((item, idx) => (
                            <span key={idx} className="inline-block mr-3">
                              {item.itemName} {item.price && `(${item.price})`}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400">No items</span>
                        )}
                      </div>

                      {/* Discount */}
                      <div className="text-gray-600 truncate">
                        {promo.discountPercentage}
                      </div>

                      {/* End Date */}
                      <div className="text-gray-500">
                        {promo.endDate || "N/A"}
                      </div>

                      {/* Actions */}
                      {userInfo?.isAdmin && (
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => handleEditClick(promo)}
                            className="py-1 text-sm rounded text-blue-600"
                          >
                            <SquarePen size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(promo._id)}
                            className="py-1 text-sm rounded text-red-600"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )}
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
              className="w-full md:w-[800px] bg-white rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white rounded-t-2xl">
                <h2 className="text-xl font-bold text-newPrimary">
                  {editingPromotionItem
                    ? "Update Promotion Item"
                    : "Add a New Promotion Item"}
                </h2>
                <button
                  className="w-8 h-8 bg-newPrimary text-white rounded-full flex items-center justify-center hover:bg-newPrimary/70"
                  onClick={() => {
                    setIsSliderOpen(false);
                    setPromotionName("");
                    setDetails("");
                    setStartDate("");
                    setEndDate("");
                    setSelectedPromotion("");
                    setSelectedCategory("");
                    setSelectedItemType("");
                    setDiscountPercentage("");
                    setIsEnable(true);
                    setEditingPromotionItem(null);
                  }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 p-4 md:p-6">
                {/* Promotion on Item */}
                <h3 className="text-lg font-semibold text-newPrimary mb-2">
                  Promotion on Item
                </h3>

                {/* Promotion Name */}
                {/* <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Promotion Name
                  </label>
                  <input
                    type="text"
                    value={promotionName}
                    onChange={(e) => setPromotionName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                    placeholder="Enter promotion name"
                  />
                </div> */}

                {/* Promotion Select */}
                <div className="flex gap-4">
                  <div className="flex-1 min-w-0">
                    <label className="block text-gray-700 font-medium mb-2">
                      Select Promotion
                    </label>
                    <select
                      value={selectedPromotion}
                      onChange={(e) => setSelectedPromotion(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                    >
                      <option value="">-- Select Promotion --</option>
                      {promotionList.map((promo) => (
                        <option
                          key={promo._id || promo.id}
                          value={promo._id || promo.id}
                        >
                          {promo.promotionName || promo.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Category Select */}
                  <div className="flex-1 min-w-0">
                    <label className="block text-gray-700 font-medium mb-2">
                      Select Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                    >
                      <option value="">-- Select Category --</option>
                      {categoryList.map((cat) => (
                        <option
                          key={cat._id || cat.id}
                          value={cat._id || cat.id}
                        >
                          {cat.categoryName || cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-4">
                  {/* Item Type Select */}
                  <div className="flex-1 min-w-0">
                    <label className="block text-gray-700 font-medium mb-2">
                      Select Item Type
                    </label>
                    <select
                      value={selectedItemType}
                      onChange={(e) => setSelectedItemType(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                    >
                      <option value="">-- Select Item Type --</option>
                      {itemTypeList.map((type) => (
                        <option
                          key={type._id || type.id}
                          value={type._id || type.id}
                        >
                          {type.itemTypeName || type.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Item Search */}
                  <div className="flex-1 min-w-0">
                    <label className="block text-gray-700 font-medium mb-2">
                      Search Items
                    </label>
                    <div className="w-full relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={18} className="text-gray-400" />
                      </span>
                      <input
                        type="text"
                        value={itemSearch}
                        onChange={(e) => setItemSearch(e.target.value)}
                        placeholder="Search Item..."
                        aria-label="Search Item"
                        className="w-full h-10 pl-10 pr-3 border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400
                       placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                </div>
                {/* Item List */}

                <div className="w-full border rounded-lg shadow p-4 max-h-60 overflow-y-auto">
                  <ul className="space-y-3">
                    {filterdata.map((item) => (
                      <li
                        key={item.id}
                        className="flex justify-between items-center border-b pb-2"
                      >
                        <div>
                          <p className="font-medium">{item.itemName}</p>
                          <p className="text-sm text-gray-500">{item.price}</p>
                        </div>
                        <input
                          type="checkbox"
                          value={item._id}
                          className="h-5 w-5 accent-blue-600 rounded-sm"
                        />
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex gap-4">
                  {/* Discount Percentage */}
                  <div className="flex-1 min-w-0">
                    <label className="block text-gray-700 font-medium mb-2">
                      Discount Percentage
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={discountPercentage}
                      onChange={(e) => setDiscountPercentage(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                      placeholder="Enter discount percentage"
                    />
                  </div>

                  {/* Start Date
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                  />
                </div> */}

                  {/* End Date */}
                  {/* <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                  />
                </div> */}

                  {/* Status */}
                  <div className="flex-1 min-w-0">
                    <label className="block text-gray-700 font-medium mb-2">
                      Status
                    </label>
                    <select
                      value={isEnable}
                      onChange={(e) => setIsEnable(e.target.value === "true")}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                    >
                      <option value={true}>Enabled</option>
                      <option value={false}>Disabled</option>
                    </select>
                  </div>
                </div>
                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/80 transition-colors disabled:bg-newPrimary/50"
                >
                  {loading
                    ? "Saving..."
                    : editingPromotionItem
                    ? "Update Promotion Item"
                    : "Save Promotion Item"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromotionItem;
