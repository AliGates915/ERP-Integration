import React, { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import Barcode from "react-barcode";
import { toast } from "react-toastify";
import gsap from "gsap";
import { HashLoader } from "react-spinners";
import { BarcodeIcon } from "lucide-react";
import TableSkeleton from "./Skeleton";
import CommanHeader from "../../components/CommanHeader";

const ItemBarcode = () => {
  const [itemBarcodeList, setItemBarcodeList] = useState([
    {
      code: "PRD001",
      itemDetail: { itemName: "Coca Cola 1L" },
      category: { categoryName: "Beverages" },
      itemType: "Drink",
      price: 120,
      stock: 80,
      barcode: "BAR123456789",
    },
    {
      code: "PRD002",
      itemDetail: { itemName: "Lays Chips" },
      category: { categoryName: "Snacks" },
      itemType: "Food",
      price: 50,
      stock: 200,
      barcode: "BAR987654321",
    },
    {
      code: "PRD003",
      itemDetail: { itemName: "Nestle Water 500ml" },
      category: { categoryName: "Beverages" },
      itemType: "Drink",
      price: 40,
      stock: 300,
      barcode: "BAR112233445",
    },
    {
      code: "PRD004",
      itemDetail: { itemName: "Oreo Biscuits" },
      category: { categoryName: "Snacks" },
      itemType: "Food",
      price: 75,
      stock: 150,
      barcode: "BAR998877665",
    },
    {
      code: "PRD005",
      itemDetail: { itemName: "Red Bull 250ml" },
      category: { categoryName: "Energy Drinks" },
      itemType: "Drink",
      price: 180,
      stock: 90,
      barcode: "BAR556677889",
    },
  ]);
  const [categoryList, setCategoryList] = useState([]);
  const [manufacturerList, setManufacturerList] = useState([]);
  const [supplierList, setSupplierList] = useState([]);
  const [itemDetailList, setItemDetailList] = useState([]);
  const [unitList, setUnitList] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [manufacturerId, setManufacturerId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [itemDetailId, setItemDetailId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [code, setCode] = useState("");
  const [stock, setStock] = useState("");
  const [reorderLevel, setReorderLevel] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const sliderRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Safe userInfo parsing
  const getUserInfo = () => {
    try {
      const info = JSON.parse(localStorage.getItem("userInfo") || "{}");
     
      return info;
    } catch (error) {
      console.error("Error parsing userInfo:", error);
      return {};
    }
  };

  const userInfo = getUserInfo();

  // Animate slider
  useEffect(() => {
    if (isSliderOpen && sliderRef.current) {
      gsap.fromTo(
        sliderRef.current,
        { x: "100%", opacity: 0 },
        { x: "0%", opacity: 1, duration: 0.5, ease: "power2.out" }
      );
      sliderRef.current.style.display = "block";
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

  // Fetch Categories
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/categories`
      );
      if (!res.ok) throw new Error("Failed to fetch categories");
      const result = await res.json();
      setCategoryList(result);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategoryList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Manufacturers
  const fetchManufacturers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/manufacturers`
      );
      if (!res.ok) throw new Error("Failed to fetch manufacturers");
      const result = await res.json();
      setManufacturerList(result);
    } catch (error) {
      console.error("Error fetching manufacturers:", error);
      setManufacturerList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Suppliers
  const fetchSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/suppliers`);
      if (!res.ok) throw new Error("Failed to fetch suppliers");
      const result = await res.json();
      setSupplierList(result);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      setSupplierList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Item Details
  const fetchItemDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/item-details`
      );
      setItemDetailList(res.data);
    } catch (error) {
      console.error("Failed to fetch item details:", error);
      setItemDetailList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Units
  const fetchUnits = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/item-unit`);
      if (!res.ok) throw new Error("Failed to fetch units");
      const result = await res.json();
      setUnitList(result);
    } catch (error) {
      console.error("Error fetching units:", error);
      setUnitList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Barcodes
  const fetchBarcodes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/itemBarcode`
      );
      if (!res.ok) throw new Error("Failed to fetch barcodes");
      const result = await res.json();
     

      setItemBarcodeList(result);
    } catch (error) {
      console.error("Error fetching barcodes:", error);
      setItemBarcodeList([]);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchManufacturers();
    fetchSuppliers();
    fetchItemDetails();
    fetchUnits();
    // fetchBarcodes();
  }, [
    fetchCategories,
    fetchManufacturers,
    fetchSuppliers,
    fetchItemDetails,
    fetchUnits,
    fetchBarcodes,
  ]);

  const handleAddItem = () => {
    setIsSliderOpen(true);
  };

  const handleSave = async () => {
    if (
      !code ||
      !categoryId ||
      !manufacturerId ||
      !itemDetailId ||
      !stock ||
      !reorderLevel ||
      !salePrice
    ) {
      alert("Please fill in all required fields!");
      return;
    }

    const newItem = {
      code,
      unit: unitId,
      category: categoryId,
      manufacturer: manufacturerId,
      supplier: supplierId || null, // optional
      itemDetail: itemDetailId,
      stock: parseInt(stock),
      reorderLevel: parseInt(reorderLevel),
      salePrice: parseFloat(salePrice),
    };
    
    try {
      const token = userInfo?.token;
      if (!token) {
        toast.error("❌ Authorization token missing!");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      let res;
      if (isEdit && editId) {
        // Update
        res = await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/itemBarcode/${editId}`,
          newItem,
          { headers }
        );
        toast.success("✅ Item updated successfully");
      } else {
        // Create
        res = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/itemBarcode`,
          newItem,
          { headers }
        );
        toast.success("✅ Item added successfully");
      }

      // Update local list with new/updated data
      if (res?.data) {
        setItemBarcodeList([...itemBarcodeList, res.data]);
      }

      setIsSliderOpen(false);

      // Reset form fields
      setCode("");
      setCategoryId("");
      setManufacturerId("");
      setSupplierId("");
      setItemDetailId("");
      setUnitId("");
      setStock("");
      setReorderLevel("");
      setSalePrice("");
      fetchBarcodes();
    } catch (error) {
      console.error("❌ Error saving item:", error);
      toast.error("Failed to save item!");
    }
  };

  // Print individual barcode
  const handlePrint = (item) => {
    const itemDetail =
      itemDetailList.find((d) => d._id === item.itemDetail)?.itemName ||
      "Unknown";
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Barcode</title>
        </head>
        <body style="display: flex; flex-direction: column; align-items: center; font-family: sans-serif;">
          <h3>${itemDetail}</h3>
          <div>
            ${document.getElementById(`barcode-${item.code}`).outerHTML}
          </div>
          <p>Price: $${item.salePrice}</p>
          <script>
            window.onload = () => {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
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
      {/* Common Header */}
      <CommanHeader />
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-newPrimary">Item Barcode</h1>
          <p className="text-gray-500 text-sm">
            Item Barcode Management Dashboard
          </p>
        </div>
        
      </div>

      {/* TABLE/CARDS */}
      {/* TABLE/CARDS */}
      <div className="rounded-xl shadow border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="max-h-[400px] overflow-y-auto">
            <div className="w-full min-w-full text-sm">
              {/* ✅ Table Header (Desktop Only) */}
              <div className="hidden lg:grid grid-cols-[1fr_2fr_1fr_1fr_1fr_1fr_2fr_auto] gap-6 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200">
                <div>Code</div>
                <div>Item Name</div>
                <div>Category</div>
                <div>Type</div>
                <div>Price</div>
                <div>Stock</div>
                <div>Barcode</div>
                <div className="text-right">Actions</div>
              </div>

              {/* ✅ Table Body */}
              <div className="flex flex-col divide-y divide-gray-100">
                {loading ? (
                  <TableSkeleton
                    rows={
                      itemBarcodeList.length > 0 ? itemBarcodeList.length : 5
                    }
                    cols={8}
                    className="lg:grid-cols-[1fr_2fr_1fr_1fr_1fr_1fr_2fr_auto]"
                  />
                ) : itemBarcodeList.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 bg-white">
                    No items found.
                  </div>
                ) : (
                  itemBarcodeList.map((item, idx) => (
                    <>
                      {/* ✅ Desktop Grid */}
                      <div
                        key={item.code}
                        className="hidden lg:grid grid-cols-[1fr_2fr_1fr_1fr_1fr_1fr_2fr_auto] gap-6 items-center px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                      >
                        <div>{item.code}</div>
                        <div className="truncate">
                          {item?.itemDetail?.itemName}
                        </div>
                        <div>{item?.category?.categoryName}</div>
                        <div>{item?.itemType}</div>
                        <div>${item.price}</div>
                        <div>{item.stock}</div>
                        <div>
                          <Barcode
                            value={item.barcode}
                            height={20}
                            width={1.2}
                            background="transparent"
                          />
                        </div>
                        <div className="flex justify-end">
                          <button
                            onClick={() => {
                              setSelectedItem(item);
                              setIsModalOpen(true);
                            }}
                            className="text-newPrimary hover:text-green-600"
                          >
                            <BarcodeIcon size={18} />
                          </button>
                        </div>
                      </div>

                      {/* ✅ Mobile Card */}
                      <div
                        key={`mobile-${item.code}`}
                        className="lg:hidden bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4"
                      >
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-700">
                            {item?.itemDetail?.itemName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {item.code}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Category: {item?.category?.categoryName}
                        </div>
                        <div className="text-sm text-gray-600">
                          Type: {item?.itemType}
                        </div>
                        <div className="text-sm text-gray-600">
                          Price: ${item.price}
                        </div>
                        <div className="text-sm text-gray-600">
                          Stock: {item.stock}
                        </div>
                        <div className="mt-2">
                          <Barcode
                            value={item.barcode}
                            height={30}
                            width={1.4}
                            background="transparent"
                          />
                        </div>

                        {/* Actions */}
                        <div className="mt-3 flex justify-end">
                          <button
                            className="text-newPrimary hover:text-green-600"
                            onClick={() => {
                              setSelectedItem(item);
                              setIsModalOpen(true);
                            }}
                          >
                            <BarcodeIcon size={18} />
                          </button>
                        </div>
                      </div>
                    </>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl relative">
            {/* Close button */}
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
              onClick={() => setIsModalOpen(false)}
            >
              ✕
            </button>

            <h2 className="text-xl font-bold text-newPrimary mb-4">
              Barcode Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Primary Barcode */}
              <div className="border rounded-lg p-4 flex flex-col items-center">
                <h3 className="text-lg font-semibold mb-2 text-gray-700">
                  Primary Barcode
                </h3>
                <Barcode
                  value={selectedItem.barcode}
                  height={40}
                  width={1.5}
                  background="transparent"
                />
                <p className="mt-2 text-sm text-gray-600">
                  Code: {selectedItem.code}
                </p>
                <p className="text-sm text-gray-600">
                  Item: {selectedItem?.itemDetail?.itemName}
                </p>
                <p className="text-sm text-gray-600">
                  Category: {selectedItem?.category?.categoryName}
                </p>
                <p className="text-sm text-gray-600">
                  Price: ${selectedItem.price}
                </p>
              </div>

              {/* Secondary Barcode */}
              <div className="border rounded-lg p-4 flex flex-col items-center">
                <h3 className="text-lg font-semibold mb-2 text-gray-700">
                  Secondary Barcode
                </h3>
                <Barcode
                  value={selectedItem.barcode}
                  height={40}
                  width={1.5}
                  background="transparent"
                />
                <p className="mt-2 text-sm text-gray-600">
                  Code: {selectedItem.code}
                </p>
                <p className="text-sm text-gray-600">
                  Item: {selectedItem?.itemDetail?.itemName}
                </p>
                <p className="text-sm text-gray-600">
                  Category: {selectedItem?.category?.categoryName}
                </p>
                <p className="text-sm text-gray-600">
                  Price: ${selectedItem.price}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemBarcode;
