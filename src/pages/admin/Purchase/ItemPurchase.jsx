import React, { useState, useRef, useEffect, useCallback } from "react";
import { HashLoader } from "react-spinners";
import gsap from "gsap";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import axios from "axios";
import { SquarePen, Trash2 } from "lucide-react";
import TableSkeleton from "../Skeleton";
import CommanHeader from "../../../components/CommanHeader";

export default function PurchaseManager() {
  const [view, setView] = useState("list"); // list | form

  const [purchases, setPurchases] = useState([
    {
      _id: "1",
      grnNo: "GRN-1001",
      grnDate: "2025-01-15",
      invoiceNo: "INV-5001",
      supplier: { supplierName: "ABC Traders" },
      items: [
        { name: "Coca Cola 1L", qty: 50, total: 2500 },
        { name: "Lays Chips", qty: 100, total: 4000 },
      ],
      discountAmount: 500,
      payable: 6000,
    },
    {
      _id: "2",
      grnNo: "GRN-1002",
      grnDate: "2025-02-05",
      invoiceNo: "INV-5002",
      supplier: { supplierName: "XYZ Distributors" },
      items: [
        { name: "Milk 1L", qty: 30, total: 3000 },
        { name: "Butter", qty: 20, total: 2000 },
      ],
      discountAmount: 200,
      payable: 4800,
    },
    {
      _id: "3",
      grnNo: "GRN-1003",
      grnDate: "2025-02-10",
      invoiceNo: "INV-5003",
      supplier: { supplierName: "Fast Supplies Ltd." },
      items: [
        { name: "Shampoo", qty: 40, total: 8000 },
        { name: "Soap", qty: 60, total: 3000 },
      ],
      discountAmount: 1000,
      payable: 10000,
    },
  ]);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [purchaseDrawerOpen, setPurchaseDrawerOpen] = useState(false);
  const sliderRef = useRef(null);
  const [supplierList, setSupplierList] = useState([]);
  const [formData, setFormData] = useState({
    grnNo: "",
    grnDate: new Date().toISOString().split("T")[0],
    supplier: "",
    invoiceNo: "",
    discountPercent: 0,
  });
  const [items, setItems] = useState([]);
  const [newGrn, setNewGrn] = useState("");
  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    purchase: 0,
    sale: 0,
    unit: "",
    qty: 0,
  });

  const totalPrice = items.reduce(
    (sum, item) => sum + item.purchase * item.qty,
    0
  );

  const [editId, setEditId] = useState(null);
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const [categoryList, setCategoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPurchase, setEditingPurchase] = useState(null);

  // Slider animation
  useEffect(() => {
    if (isSliderOpen && sliderRef.current) {
      gsap.fromTo(
        sliderRef.current,
        { x: "100%", opacity: 0 },
        { x: "0%", opacity: 1, duration: 1.2, ease: "expo.out" }
      );
    }
  }, [isSliderOpen]);

  // Fetch Purchases Data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/purchases`
      );
      setPurchases(res.data); // store actual categories array
  
    } catch (error) {
      console.error("Failed to fetch products or categories", error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);

  // Initialize shelve location list with static data
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Last GRN No.
  useEffect(() => {
    const fetchLastGRN = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/purchases/last`
        );

        const data = res.data;
     

        const nextGrn = String(parseInt(data.grnNo, 10) + 1).padStart(4, "0");
      

        setNewGrn(nextGrn); // ✅ store in state
      } catch (err) {
        console.error(err);
      }
    };

    fetchLastGRN();
  }, [purchases]);

  // Supplier List Fetch
  const fetchSupplierList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/suppliers/list`
      );
      setSupplierList(res.data); // store actual categories array
     
    } catch (error) {
      console.error("Failed to fetch Supplier", error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);
  useEffect(() => {
    fetchSupplierList();
  }, [fetchSupplierList]);

  // CategoryList Fetch
  const fetchCategoryList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/categories/list`
      );
      setCategoryList(res.data); // store actual categories array
    
    } catch (error) {
      console.error("Failed to fetch categories", error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);
  useEffect(() => {
    fetchCategoryList();
  }, [fetchCategoryList]);

  // Total calculations
  const totalPurchase = items.reduce(
    (acc, item) => acc + item.purchase * item.qty,
    0
  );

  // Handle supplier selection
  const handleSupplierChange = (e) => {
    const selectedSupplierId = e.target.value;
    const selectedSupplier = supplierList.find(
      (s) => s._id === selectedSupplierId
    );

    setFormData({
      ...formData,
      supplier: selectedSupplierId,
      invoiceNo: selectedSupplier?.invoiceNo || "", // auto set invoice number
    });
  };

  const totalQty = items.reduce((acc, item) => acc + Number(item.qty), 0);
  const discountAmount = (totalPurchase * formData.discountPercent) / 100;
  const payable = totalPurchase - discountAmount;

  const handleSavePurchase = async () => {
    // Validation
    if (
      !formData.grnDate ||
      !formData.supplier ||
      !formData.invoiceNo ||
      items.length === 0
    ) {
      toast.error("❌ Please fill all required fields!");
      return;
    }

    // Prepare payload matching backend
    const payload = {
      grnNo: newGrn,
      grnDate: formData.grnDate,
      supplier: formData.supplier,
      invoiceNo: formData.invoiceNo,
      items: items.map((i) => ({
        name: i.name,
        category: i.category,
        purchase: i.purchase,
        sale: i.sale,
        qty: i.qty,
        total: i.total,
      })),
      discountPercent: formData.discountPercent,
      discountAmount,
      totalPrice,
      payable,
    };

    try {
      const headers = {
        Authorization: `Bearer ${userInfo.token}`,
        "Content-Type": "application/json",
      };

      if (editingPurchase && editId) {
        // Update existing purchase
        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/purchases/${editId}`,
          payload,
          { headers }
        );
        toast.success("✅ Purchase updated successfully!");
      } else {
        // Create new purchase
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/purchases`,
          payload,
          { headers }
        );
        toast.success("✅ Purchase created successfully!");
      }

      // Reset form
      setFormData({
        grnNo: "",
        grnDate: new Date().toISOString().split("T")[0],
        supplier: "",
        invoiceNo: "",
        discountPercent: 0,
      });
      setItems([]);
      setPurchaseDrawerOpen(false);
      setEditingPurchase(null);
      setEditId(null);

      // Refresh data if needed
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error(
        `❌ ${editingPurchase ? "Update" : "Create"} purchase failed!`
      );
    }
  };

  const handleEditClick = (purchase) => {
    setEditingPurchase(purchase);
    setFormData({
      grnNo: purchase.grnNo,
      grnDate: purchase.grnDate,
      supplier: purchase.supplier._id,
      invoiceNo: purchase.invoiceNo,
      discountPercent: purchase.discountPercent,
    });
    setItems(purchase.items);
    setPurchaseDrawerOpen(true);
  };

  const handleDelete = (purchaseId) => {
    const swalWithTailwindButtons = Swal.mixin({
      customClass: {
        actions: "space-x-2",
        confirmButton:
          "bg-green-500 text-white px-4 py-4 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300",
        cancelButton:
          "bg-red-500 text-white px-4 py-4 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300",
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
          setPurchases(purchases.filter((p) => p._id !== purchaseId));
          swalWithTailwindButtons.fire(
            "Deleted!",
            "Purchase deleted successfully.",
            "success"
          );
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire(
            "Cancelled",
            "Purchase is safe 🙂",
            "error"
          );
        }
      });
  };


  return (
    <div className="p-4 px-6 bg-gray-50 min-h-screen">
      {/* Common Header */}
      <CommanHeader />
      <div className=" mt-6">
        {view === "list" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-2xl font-bold text-newPrimary">
                  Purchase Items
                </h1>
              </div>
              <button
                className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/80"
                onClick={() => {
                  setEditingPurchase(null);
                  setFormData({
                    grnNo: "",
                    grnDate: new Date().toISOString().split("T")[0],
                    supplier: "",
                    invoiceNo: "",
                    discountPercent: 0,
                  });
                  setItems([]);
                  setPurchaseDrawerOpen(true);
                }}
              >
                + Add New Purchase
              </button>
            </div>
            {/* Table Section */}
            <div className="rounded-xl shadow border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <div className="max-h-screen overflow-y-auto">
                  <div className="w-full min-w-full text-sm">
                    {/* Table Header */}
                    <div className="hidden lg:grid grid-cols-[60px_1fr_1fr_1fr_1fr_2fr_1fr_1fr_1fr_1fr_auto] gap-6 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200">
                      <div>Sr.#</div>
                      <div>GRN No</div>
                      <div>GRN Date</div>
                      <div>Invoice No</div>
                      <div>Supplier</div>
                      <div>Items</div>
                      <div>Total Purchase</div>
                      <div>Total Qty</div>
                      <div>Discount</div>
                      <div>Payable</div>
                      <div>Actions</div>
                    </div>

                    {/* Table Body */}
                    <div className="flex flex-col divide-y divide-gray-100">
                      {loading ? (
                        <TableSkeleton
                          rows={purchases.length > 0 ? purchases.length : 5}
                          cols={11}
                          className="lg:grid-cols-[60px_1fr_1fr_1fr_1fr_2fr_1fr_1fr_1fr_1fr_auto]"
                        />
                      ) : purchases.length === 0 ? (
                        <div className="text-center py-4 text-gray-500 bg-white">
                          No purchases found.
                        </div>
                      ) : (
                        purchases.map((p, idx) => {
                          const totalPurchase = p.items.reduce(
                            (sum, it) => sum + it.total,
                            0
                          );
                          const totalQty = p.items.reduce(
                            (sum, it) => sum + it.qty,
                            0
                          );

                          return (
                            <>
                              {/* ✅ Desktop Grid */}
                              <div
                                key={p._id}
                                className="hidden lg:grid grid-cols-[60px_1fr_1fr_1fr_1fr_2fr_1fr_1fr_1fr_1fr_auto] 
                       gap-6 items-center px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                              >
                                <div>{idx + 1}</div>
                                <div>{p.grnNo}</div>
                                <div>
                                  {new Date(p.grnDate).toLocaleDateString()}
                                </div>
                                <div>{p.invoiceNo}</div>
                                <div>{p.supplier?.supplierName}</div>
                                <div className="truncate">
                                  {p.items.map((it) => it.name).join(", ")}
                                </div>
                                <div>{totalPurchase}</div>
                                <div>{totalQty}</div>
                                <div>{p.discountAmount}</div>
                                <div>{p.payable}</div>
                                <div className="flex justify-end gap-3">
                                  <button className="text-blue-500 hover:underline">
                                    <SquarePen size={18} />
                                  </button>
                                  <button className="text-red-500 hover:underline">
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              </div>

                              {/* ✅ Mobile Card */}
                              <div
                                key={`mobile-${p._id}`}
                                className="lg:hidden bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4"
                              >
                                <div className="flex justify-between mb-2">
                                  <span className="text-sm font-semibold text-gray-700">
                                    {p.supplier?.supplierName}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(p.grnDate).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-600">
                                  GRN: {p.grnNo}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Invoice: {p.invoiceNo}
                                </div>
                                <div className="text-sm text-gray-600 truncate">
                                  Items:{" "}
                                  {p.items.map((it) => it.name).join(", ")}
                                </div>
                                <div className="mt-2 flex justify-between text-sm font-medium text-gray-700">
                                  <span>Total: {totalPurchase}</span>
                                  <span>Qty: {totalQty}</span>
                                </div>
                                <div className="mt-1 text-sm text-gray-600">
                                  Discount: {p.discountAmount}
                                </div>
                                <div className="text-sm font-semibold text-newPrimary">
                                  Payable: {p.payable}
                                </div>

                                {/* Actions */}
                                <div className="mt-3 flex justify-end gap-3">
                                  <button className="text-blue-500">
                                    <SquarePen size={18} />
                                  </button>
                                  <button className="text-red-500">
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              </div>
                            </>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {purchaseDrawerOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-end z-50">
            <div className="w-full max-w-md bg-white p-4 h-full overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-bold text-newPrimary">
                  {editingPurchase ? "Update Purchase" : "Purchase Item Entry"}
                </h1>
                <button
                  className="text-2xl text-gray-500 hover:text-gray-700"
                  onClick={() => {
                    setPurchaseDrawerOpen(false);
                    setEditingPurchase(null);
                    setFormData({
                      grnNo: "",
                      grnDate: new Date().toISOString().split("T")[0],
                      supplier: "",
                      invoiceNo: "",
                      discountPercent: 0,
                    });
                    setItems([]);
                  }}
                >
                  ×
                </button>
              </div>

              {/* Purchase Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    GRN No <span className="text-newPrimary">*</span>
                  </label>
                  <input
                    readOnly
                    placeholder="GRN No"
                    className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                    value={newGrn}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    GRN Date <span className="text-newPrimary">*</span>
                  </label>
                  <input
                    type="date"
                    className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                    value={formData.grnDate}
                    onChange={(e) =>
                      setFormData({ ...formData, grnDate: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Supplier <span className="text-newPrimary">*</span>
                  </label>
                  <select
                    className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                    value={formData.supplier}
                    onChange={handleSupplierChange}
                  >
                    <option value="">Select Supplier</option>
                    {supplierList.map((supplier) => (
                      <option key={supplier._id} value={supplier._id}>
                        {supplier.supplierName} {/* ✅ Only string */}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Invoice No <span className="text-newPrimary">*</span>
                  </label>
                  <input
                    readOnly
                    placeholder="Invoice No"
                    className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                    value={formData.invoiceNo}
                  />
                </div>
              </div>

              {/* Items Table */}
              <div className="bg-gray-50 shadow p-4 mt-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <h2 className="font-bold text-gray-700">Items</h2>
                  <button
                    className="bg-newPrimary hover:bg-newPrimary/70 text-white px-4 py-1 rounded"
                    onClick={() => setIsSliderOpen(true)}
                  >
                    + Add Item
                  </button>
                </div>

                <table className="min-w-full border mt-2">
                  <thead className="bg-gray-200 text-xs">
                    <tr>
                      <th className="py-2 px-3">#</th>
                      <th className="py-2 px-3">Name</th>
                      <th className="py-2 px-3">Category</th>
                      <th className="py-2 px-3">Purchase Price</th>
                      <th className="py-2 px-3">Sale Price</th>
                      <th className="py-2 px-3">Qty</th>
                      <th className="py-2 px-3">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="py-2 px-3">{idx + 1}</td>
                        <td className="py-2 px-3">{it.name}</td>
                        <td className="py-2 px-3">{it.category}</td>
                        <td className="py-2 px-3">{it.purchase}</td>
                        <td className="py-2 px-3">{it.sale}</td>
                        <td className="py-2 px-3">{it.qty}</td>
                        <td className="py-2 px-3">{it.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="text-sm text-gray-700">
                  Total Price: {totalPrice}
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Discount %
                  </label>
                  <input
                    type="number"
                    placeholder="Discount %"
                    className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                    value={formData.discountPercent}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountPercent: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="text-sm text-gray-700">
                  Discount: {discountAmount}
                </div>
                <div className="text-sm text-gray-700">Payable: {payable}</div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex gap-2">
                <button
                  className="w-full bg-newPrimary text-white px-4 py-4 rounded-lg hover:bg-newPrimary/80"
                  onClick={handleSavePurchase} // ✅ Call function here
                >
                  {editingPurchase ? "Update Purchase" : "Save Purchase"}
                </button>
                <button
                  className="w-full bg-gray-500 text-white px-4 py-4 rounded-lg hover:bg-gray-600"
                  onClick={() => {
                    setPurchaseDrawerOpen(false);
                    setEditingPurchase(null);
                    setFormData({
                      grnNo: "",
                      grnDate: new Date().toISOString().split("T")[0],
                      supplier: "",
                      invoiceNo: "",
                      discountPercent: 0,
                    });
                    setItems([]);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Item Slider */}
        {isSliderOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-end z-50">
            <div
              ref={sliderRef}
              className="w-full max-w-md bg-white p-4 h-full overflow-y-auto custom-scrollbar"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-newPrimary">Add Item</h2>
                <button
                  className="text-2xl text-gray-500 hover:text-gray-700"
                  onClick={() => setIsSliderOpen(false)}
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Item Name <span className="text-newPrimary">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Item Name"
                    className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                    value={newItem.name}
                    onChange={(e) =>
                      setNewItem({ ...newItem, name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Item Category <span className="text-newPrimary">*</span>
                  </label>
                  <select
                    className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                    value={newItem.category}
                    onChange={(e) =>
                      setNewItem({ ...newItem, category: e.target.value })
                    }
                  >
                    <option value="">Select Category</option>
                    {categoryList.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.categoryName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Purchase Price <span className="text-newPrimary">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Purchase Price"
                    className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                    value={newItem.purchase}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        purchase: Number(e.target.value),
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Sale Price
                  </label>
                  <input
                    type="number"
                    placeholder="Sale Price"
                    className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                    value={newItem.sale}
                    onChange={(e) =>
                      setNewItem({ ...newItem, sale: Number(e.target.value) })
                    }
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Quantity <span className="text-newPrimary">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Quantity"
                    className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                    value={newItem.qty}
                    onChange={(e) =>
                      setNewItem({ ...newItem, qty: Number(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-between mt-4 gap-4">
                <button
                  className="w-full bg-newPrimary text-white px-4 py-4 rounded-lg hover:bg-green-700"
                  onClick={() => {
                    if (
                      !newItem.name ||
                      !newItem.category ||
                      !newItem.purchase ||
                      !newItem.qty
                    ) {
                      toast.error("❌ Please fill all required fields!");
                      return;
                    }
                    setItems([
                      ...items,
                      { ...newItem, total: newItem.purchase * newItem.qty },
                    ]);
                    setNewItem({
                      name: "",
                      category: "",
                      purchase: 0,
                      sale: 0,
                      qty: 0,
                    });
                    setIsSliderOpen(false);
                  }}
                >
                  Add Item
                </button>
                <button
                  className="w-full bg-gray-500 text-white px-4 py-4 rounded-lg hover:bg-gray-600"
                  onClick={() => setIsSliderOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
    .table-container {
        max-width: 100%;
    }
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
    @media (max-width: 1024px) {
        .grid-cols-\[60px_100px_120px_100px_150px_200px_120px_100px_100px_100px_60px\] {
            grid-template-columns: 50px 80px 100px 80px 120px 150px 100px 80px 80px 80px 50px;
        }
    }
    @media (max-width: 640px) {
        .grid-cols-\[60px_100px_120px_100px_150px_200px_120px_100px_100px_100px_60px\] {
            grid-template-columns: 40px 70px 90px 70px 100px 120px 90px 70px 70px 70px 40px;
        }
    }
`}</style>
    </div>
  );
}
