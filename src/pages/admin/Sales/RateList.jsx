import React, { useState, useEffect, useRef, useCallback } from "react";
import { SquarePen, Trash2 } from "lucide-react";
import CommanHeader from "../../../components/CommanHeader";
import TableSkeleton from "../Skeleton";
import Swal from "sweetalert2";
import gsap from "gsap";
import axios from "axios";
import { toast } from "react-toastify";

const RateList = () => {

  const [itemTypeList, setItemTypeList] = useState([]);
  const [rateLists, setRateLists] = useState([]);
  const [filteredRateLists, setFilteredRateLists] = useState([]);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [productName, setProductName] = useState("");
  const [itemTypeName, setItemTypeName] = useState("");
  const [productCode, setProductCode] = useState("");
  const [packSize, setPackSize] = useState("");
  const [specifications, setSpecifications] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingRateList, setEditingRateList] = useState(null);
  const [errors, setErrors] = useState({});
  const [itemList, setItemList] = useState([]);
  const [types] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showPreviewTable, setShowPreviewTable] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const recordsPerPage = 10;
  const sliderRef = useRef(null);

  const API_URL = `${import.meta.env.VITE_API_BASE_URL}/rateList`;
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


  // Fetch rate list
  const fetchRateList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}`);
     
      setRateLists(res.data);
      setFilteredRateLists(res.data); // Initialize filtered list
    } catch (error) {
      console.error("Failed to fetch rate lists", error);
      toast.error("Failed to fetch rate lists");
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchRateList();
  }, [fetchRateList]);

  const fetchItemtypeList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/item-type`);
      setItemTypeList(res.data); // store actual categories array
    
    } catch (error) {
      console.error("Failed to fetch Supplier", error);
    } finally {
      setTimeout(() => setLoading(false), 2000);
    }
  }, []);
  useEffect(() => {
    fetchItemtypeList();
  }, [fetchItemtypeList]);

  const fetchItemDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/item-details/rateList/${itemTypeName}`
      );
      setItemList(res.data); // store actual categories array
    
    } catch (error) {
      console.error("Failed to fetch item details", error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, [itemTypeName]);
  useEffect(() => {
    fetchItemDetails();
  }, [fetchItemDetails]);

  // Rate list search - Fixed version
  useEffect(() => {
    if (!searchTerm) {
      setFilteredRateLists(rateLists);
      return;
    }

    const delayDebounce = setTimeout(() => {
      try {
        const filtered = rateLists.filter((rate) =>
          rate.productCode?.toUpperCase().includes(searchTerm.toUpperCase())
        );
        setFilteredRateLists(filtered);
        setCurrentPage(1); // Reset to first page when searching
      } catch (error) {
        console.error("Search rate list failed:", error);
        setFilteredRateLists([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, rateLists]);

  // Add this useEffect to debug your itemList data
  // useEffect(() => {
  //   console.log("Item List Data:", itemList);
  //   if (itemList.length > 0) {
  //     console.log("First item structure:", itemList[0]);
  //     console.log("First item details:", itemList[0]?.details);
  //     console.log("First item unitName:", itemList[0]?.itemUnit?.unitName);
  //   }
  // }, [itemList]);
  // Reset form fields
  const resetForm = () => {
    setItemTypeName("");
    setProductName("");
    setProductCode("");
    setPackSize("");
    setSpecifications("");
    setSalePrice("");
    setEditingRateList(null);
    setErrors({});
    setShowPreviewTable(false);
    setPreviewData(null);
    setIsSliderOpen(false);
  };

  // Validate form fields
const validateForm = () => {
  const newErrors = {};
  const trimmedItemTypeName = itemTypeName.trim();
  const trimmedProductName = productName.trim();
  // ✅ No .trim() for number
  const parsedSalePrice = parseFloat(salePrice);
  if (!trimmedItemTypeName) newErrors.itemTypeName = "Item Type Name is required";
  if (!trimmedProductName) newErrors.productName = "Product Name is required";
  if (isNaN(parsedSalePrice) || parsedSalePrice <= 0) {
    newErrors.salePrice = "Sale Price must be a positive number";
  }
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};


  // Handle Product Name selection
  const handleProductChange = (id) => {
    const selectedItem = itemList.find((item) => item._id === id);
    if (selectedItem) {
      setProductName(selectedItem._id); // keep id in state for dropdown
      setProductCode(selectedItem.primaryBarcode || "");
      setPackSize(selectedItem.itemUnit?.unitName || "");
      setSpecifications(selectedItem.details || "");
      // setItemTypeName(selectedItem.itemTypeName || "");
    } else {
      setProductName("");
      setProductCode("");
      setPackSize("");
      setSpecifications("");
      // setItemTypeName();
    }
  };
  console.log("Product Name State:", packSize);

  // Handlers for form and table actions
  const handleAddRateList = () => {
    resetForm();
    setIsSliderOpen(true);
  };

  const handleEditClick = (rateList) => {
    setEditingRateList(rateList);
    setItemTypeName(rateList?.type?.itemTypeName || "");
    setProductName(rateList?.productName?._id || "");
    setProductCode(rateList?.productName?.primaryBarcode || "");
    setPackSize(rateList?.productName?.unitName || "");     // ✅ now works
    setSpecifications(rateList?.productName?.details || "");// ✅ now works
    setSalePrice(rateList?.salePrice || "");
    setIsSliderOpen(true);
  };



  const handleAddClick = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const selectedItem = itemList.find((item) => item._id === productName);
      const selectedType = itemTypeList.find((type) => type._id === itemTypeName);

      const newPreviewData = {
        type: itemTypeName, // ✅ store type ID
        productName: productName, // ✅ store product ID
        salePrice: parseFloat(salePrice),

        // for showing preview
        itemTypeLabel: selectedType?.itemTypeName || "",
        productNameLabel: selectedItem?.itemName || "",
        productCode: selectedItem?.primaryBarcode || "",
        packSize: selectedItem?.itemUnit?.unitName || "",
        specifications: selectedItem?.details || "",
      };

      setPreviewData(newPreviewData);
      setShowPreviewTable(true);
    }
  };




  const handleRemovePreview = () => {
    setPreviewData(null);
    setShowPreviewTable(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!previewData) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Please click Add to preview the data before saving.",
        confirmButtonColor: "#d33",
      });
      return;
    }

    const payload = {
      type: previewData.type, // ID
      productName: previewData.productName, // ID
      salePrice: previewData.salePrice,
    };

    console.log("Submitting Payload:", payload);

    try {
      if (editingRateList) {
        await axios.put(
          `${API_URL}/${editingRateList._id}`,
          payload,
          { headers: { Authorization: `Bearer ${userInfo?.token}` } }
        );
        Swal.fire({ icon: "success", title: "Updated!", text: "Rate List updated successfully." });
      } else {
        await axios.post(
          API_URL,
          payload,
          { headers: { Authorization: `Bearer ${userInfo?.token}` } }
        );
        Swal.fire({ icon: "success", title: "Added!", text: "Rate List added successfully." });
      }

      fetchRateList();
      resetForm();
    } catch (error) {
      console.error("Error saving rate list:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.response?.data?.message || "Failed to save rate list.",
      });
    }
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
          await axios.delete(
            `${API_URL}/${id}`,
            {
              headers: { Authorization: `Bearer ${userInfo?.token}` },
            }
          );

          setRateLists(prev => prev.filter((r) => r._id !== id));
          setFilteredRateLists(prev => prev.filter((r) => r._id !== id));

          swalWithTailwindButtons.fire(
            "Deleted!",
            "Rate List deleted successfully.",
            "success"
          );
        } catch (error) {
          console.error("Delete error:", error);
          swalWithTailwindButtons.fire(
            "Error!",
            "Failed to delete rate list.",
            "error"
          );
        }
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        swalWithTailwindButtons.fire(
          "Cancelled",
          "Rate List is safe 🙂",
          "error"
        );
      }
    });
};

  // Pagination logic - use filteredRateLists instead of rateLists
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRateLists.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredRateLists.length / recordsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <CommanHeader />
      <div className="px-6 mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-newPrimary">
              Rate List Details
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Enter Product Code eg: ELC-001"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 w-[250px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-newPrimary"
            />
            <button
              className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/80"
              onClick={handleAddRateList}
            >
              + Add Rate List
            </button>
          </div>
        </div>

        <div className="rounded-xl shadow border border-gray-200 overflow-hidden">
          <div className="overflow-y-auto lg:overflow-x-auto max-h-[900px]">
            <div className="min-w-[1400px]">
              <div className="hidden lg:grid grid-cols-[0.5fr_1fr_1fr_1fr_1fr_1.5fr_1fr_0.5fr] gap-4 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200">
                <div>SR#</div>
                <div>Type</div>
                <div>Product Name</div>
                <div>Product Code</div>
                <div>Pack Size</div>
                <div>Specifications</div>
                <div>Sale Price</div>
                <div>Actions</div>
              </div>

              <div className="flex flex-col divide-y divide-gray-100">
                {loading ? (
                  <TableSkeleton
                    rows={recordsPerPage}
                    cols={8}
                    className="lg:grid-cols-[0.5fr_1fr_1fr_1fr_1fr_1.5fr_1fr_0.5fr]"
                  />
                ) : currentRecords.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 bg-white">
                    No rate lists found.
                  </div>
                ) : (
                  currentRecords.map((rateList, index) => (
                    <div
                      key={rateList._id}
                      className="grid grid-cols-1 lg:grid-cols-[0.5fr_1fr_1fr_1fr_1fr_1.5fr_1fr_0.5fr] items-center gap-4 px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                    >
                      <div className="text-gray-600">{indexOfFirstRecord + index + 1}</div>
                      <div className="text-gray-600">{rateList?.type?.itemTypeName}</div>
                      <div className="text-gray-600">{rateList?.productName?.itemName}</div>
                      <div className="text-gray-600">{rateList?.productName?.primaryBarcode}</div>
                      <div className="text-gray-600">{rateList.productName?.itemUnit?.unitName}</div>
                      <div className="text-gray-600">{rateList?.productName?.details}</div>
                      <div className="text-gray-600">{rateList?.salePrice}</div>
                      <div className="flex gap-3 justify-start">
                        <button
                          onClick={() => handleEditClick(rateList)}
                          className="py-1 text-sm rounded text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit"
                        >
                          <SquarePen size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(rateList._id)}
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between my-4 px-10">
              <div className="text-sm text-gray-600">
                Showing {indexOfFirstRecord + 1} to{" "}
                {Math.min(indexOfLastRecord, filteredRateLists.length)} of{" "}
                {filteredRateLists.length} records
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md ${currentPage === 1
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-newPrimary text-white hover:bg-newPrimary/80"
                    }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-md ${currentPage === totalPages
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-newPrimary text-white hover:bg-newPrimary/80"
                    }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {isSliderOpen && (
          <div className="fixed inset-0 bg-gray-600/50 flex items-center justify-center z-50">
            <div
              ref={sliderRef}
              className="w-full md:w-[800px] bg-white rounded-2xl  pb-5 shadow-2xl overflow-y-auto "
            >
              {/* Header */}
              <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white rounded-t-2xl">
                <h2 className="text-xl font-bold text-newPrimary">
                  {editingRateList ? "Update Rate List" : "Add a New Rate List"}
                </h2>
                <button
                  className="text-2xl text-gray-500 hover:text-gray-700"
                  onClick={resetForm}
                >
                  ×
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4 p-4 py-4 md:p-6">
                <div className="border bg-gray-100 p-4 rounded-lg space-y-4">
                  {/* Type & Product Name */}
                  <div className="flex gap-4">
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={itemTypeName}
                        onChange={(e) => setItemTypeName(e.target.value)} // store ID here
                        className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${errors.itemTypeName ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-newPrimary"
                          }`}
                        required
                      >
                        <option value="">-- Select Item Type --</option>
                        {itemTypeList.map((item) => (
                          <option key={item._id} value={item._id}>
                            {item.itemTypeName}
                          </option>
                        ))}
                      </select>

                      {errors.itemTypeName && (
                        <p className="text-red-500 text-xs mt-1">{errors.itemTypeName}</p>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        Product Name <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={productName}
                        onChange={(e) => handleProductChange(e.target.value)}
                        className={`w-full p-3  border rounded-md focus:outline-none focus:ring-2 ${errors.productName
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-newPrimary"
                          }`}
                        required
                      >
                        <option value="">Select Product</option>
                        {itemList.map((item) => (
                          <option key={item._id} value={item._id}>
                            {item.itemName}
                          </option>

                        ))}
                      </select>
                      {errors.itemName && (
                        <p className="text-red-500 text-xs mt-1">{errors.itemName}</p>
                      )}
                    </div>
                  </div>

                  {/* Product Code & Pack Size */}
                  <div className="flex gap-4">
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        Product Code
                      </label>
                      <input
                        type="text"
                        value={productCode}
                        readOnly
                        className="w-full p-3 rounded-md border border-gray-300/80 bg-white/40 text-black placeholder-gray-500 focus:outline-none"
                        placeholder="Product Code"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        Pack Size
                      </label>
                      <input
                        type="text"
                        value={packSize}
                        readOnly
                        className="w-full p-3 rounded-md border border-gray-300/80 bg-white/40 text-black placeholder-gray-500 focus:outline-none"
                        placeholder="Pack Size"
                      />
                    </div>
                  </div>

                  {/* Specifications & Sale Price */}
                  <div className="flex gap-4">
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        Specifications
                      </label>
                      <input
                        type="text"
                        value={specifications}
                        readOnly
                        className="w-full p-3 rounded-md border border-gray-300/80 bg-white/40 text-black placeholder-gray-500 focus:outline-none"
                        placeholder="Specifications"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        Sale Price <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="number"
                          value={salePrice}
                          onChange={(e) => setSalePrice(e.target.value)}
                          className={`w-full p-3 border rounded-md bg-white focus:outline-none focus:ring-2 ${errors.salePrice
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-newPrimary"
                            }`}
                          placeholder="Enter sale price"
                          min="0"
                          step="0.01"
                          required
                        />
                        <button
                          type="button"
                          onClick={handleAddClick}
                          disabled={loading}
                          className="bg-newPrimary text-white px-4 py-3 rounded-lg hover:bg-newPrimary/80 transition-colors disabled:bg-blue-300"
                        >
                          Add
                        </button>
                      </div>
                      {errors.salePrice && (
                        <p className="text-red-500 text-xs mt-1">{errors.salePrice}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Preview Section */}
                {showPreviewTable && previewData && (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Preview</h3>
                    <div className="rounded-lg shadow border border-gray-200 overflow-hidden">
                      <div className="grid grid-cols-[0.5fr_1fr_1fr_1fr_1fr_1fr_0.5fr] gap-4 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase">
                        <div>SR#</div>
                        <div>Type</div>
                        <div>Code</div>
                        <div>Item</div>
                        <div>Pack Size</div>
                        <div>Sale Price</div>
                        <div>Remove</div>
                      </div>
                      <div className="grid grid-cols-[0.5fr_1fr_1fr_1fr_1fr_1fr_0.5fr] items-center gap-4 px-6 py-4 text-sm bg-white">
                        <div className="text-gray-600">
                          {editingRateList
                            ? rateLists.findIndex((r) => r._id === editingRateList._id) + 1
                            : rateLists.length + 1}
                        </div>
                        <div className="text-gray-600">{previewData.itemTypeLabel}</div>
                        <div className="text-gray-600">{previewData.productCode}</div>
                        <div className="text-gray-600">{previewData.productNameLabel}</div>
                        <div className="text-gray-600">{previewData.packSize}</div>
                        <div className="text-gray-600">{previewData.specifications}</div>
                        <div className="text-gray-600">{previewData.salePrice}</div>


                        <div className="flex justify-start">
                          <button
                            onClick={handleRemovePreview}
                            className=" text-xl flex-shrink-0 text-red-500 transition-colors"
                            title="Remove"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="mt-4 w-full bg-newPrimary text-white px-4 py-3 rounded-lg hover:bg-newPrimary/80 transition-colors disabled:bg-blue-300"
                    >
                      {loading ? "Saving..." : "Save Rate List"}
                    </button>
                  </div>
                )}
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

export default RateList;