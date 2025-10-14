// src/pages/admin/AddProduct.jsx
import React, { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Select from 'react-select'; // ✅ 1. Import react-select

const initialState = {
  name: "",
  price: "",
  description: "",
  category: [], // Changed from "" to []
  stock: "",
  color: "",
  size: "",
  promotion: "",
  discountPercentage: "", // ✅ Add to initial state
  images: [],
};

const AddProduct = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialState);
  const [categories, setCategories] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategoryName, setSelectedCategoryName] = useState("");

  // ✅ Add this line to declare the missing state variable
  const [selectedPromotionName, setSelectedPromotionName] = useState("");

  // ✅ 2. State for react-select needs to be in the { value, label } format
  const [selectedCategories, setSelectedCategories] = useState([]);

  // Fetch enabled categories and promotions from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, promoRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/categories`),
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/promotions`),
        ]);
        
        // Filter for only enabled items
        setCategories(catRes.data.data.filter(cat => cat.isEnable));
        setPromotions(promoRes.data.data.filter(promo => promo.isEnable));

      } catch (error) {
        toast.error("Failed to fetch categories or promotions.");
      }
    };
    fetchData();
  }, [categories,promotions]);  

  // ✅ 3. Format categories data for react-select
  const categoryOptions = useMemo(() => 
    categories.map(cat => ({ value: cat._id, label: cat.name })),
    [categories]
  );

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // ✅ 4. Update the handler for react-select
  const handleCategoryChange = (selectedOptions) => {
    setSelectedCategories(selectedOptions); // Update the state for the Select component

    // Update the main form state with an array of just the IDs
    const categoryIds = selectedOptions ? selectedOptions.map(opt => opt.value) : [];
    setForm(prev => ({ ...prev, category: categoryIds }));

    // For conditional fields, you can check the names from the selected options
    const firstCategoryName = selectedOptions?.[0]?.label || "";
    setSelectedCategoryName(firstCategoryName);
  };

  const handleImageChange = (e) => {
    // Validate number of files
    if (e.target.files.length > 5) {
      toast.error("You can only upload a maximum of 5 images.");
      e.target.value = null; // Clear the file input
      return;
    }
    setForm((prev) => ({
      ...prev,
      images: Array.from(e.target.files),
    }));
  };

  // ✅ Create a specific handler for the Promotion dropdown
  const handlePromotionChange = (e) => {
    const promotionId = e.target.value;
    const promotion = promotions.find(p => p._id === promotionId);
    
    if (promotion) {
      // If a promotion is selected, update the name for conditional rendering
      setSelectedPromotionName(promotion.name);
      setForm(prev => ({
        ...prev,
        promotion: promotionId,
        // IMPORTANT: Reset discount if the new selection isn't a "Discount" type
        discountPercentage: promotion.name === 'Discount' ? prev.discountPercentage : ""
      }));
    } else {
      // If "Select Promotion" is chosen, reset everything
      setSelectedPromotionName("");
      setForm(prev => ({
        ...prev,
        promotion: "",
        discountPercentage: ""
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // --- 1. VALIDATION FIRST ---
    if (Number(form.price) <= 0.50) {
      toast.error("Price must be greater than $ 0.50");
      return; // Stop. `loading` is still false.
    }
    
    // --- 2. SET LOADING STATE ---
    setLoading(true);

    const formData = new FormData();
    // Append all form fields
    Object.keys(form).forEach(key => {
      // Send the category array as a comma-separated string
      if (key === 'category') {
        formData.append('category', form.category.join(','));
      } else if (key !== 'images') {
        formData.append(key, form[key]);
      }
    });

    // Append images
    form.images.forEach(image => {
      formData.append('images', image);
    });

    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/products/add`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success("Product added successfully!");
      setForm(initialState); // Reset form
      setSelectedCategoryName("");
      
      // ✅ Navigate back to the product list
      navigate('/admin/products'); 

    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add product.");
    } finally {
      // --- 3. RESET LOADING STATE ---
      setLoading(false);
    }
  };

  // Conditionally render fields based on the *name* of the selected category
  const renderCategorySpecificFields = () => {

    return (
      <>
        
          <div>
            <label className="block mb-1 font-medium">Color</label>
            <input
              type="text"
              name="color"
              value={form.color}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2 mb-4"
              placeholder="e.g. Black, Blue"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Size</label>
            <input
              type="text"
              name="size"
              value={form.size}
              onChange={handleChange}
           
              className="w-full border rounded px-3 py-2 mb-4"
              placeholder="e.g. S, M, L or 9, 10"
            />
          </div>

      </>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-8">
      <div className="bg-white rounded shadow-lg p-8 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4 text-center">Add New Product</h2>
        <form onSubmit={handleSubmit}>
          {/* Product Name */}
          <div>
            <label className="block mb-1 font-medium">Product Name</label>
            <input
              type="text" name="name" value={form.name} onChange={handleChange} required
              className="w-full border rounded px-3 py-2 mb-4" placeholder="Product Name"
            />
          </div>
          {/* Price */}
          <div>
            <label className="block mb-1 font-medium">Price</label>
            <input
              type="number" name="price" value={form.price} onChange={handleChange} required
              className="w-full border rounded px-3 py-2 mb-4" placeholder="Price"
            />
          </div>
          {/* Description */}
          <div>
            <label className="block mb-1 font-medium">Description</label>
            <textarea
              name="description" value={form.description} onChange={handleChange} required
              className="w-full border rounded px-3 py-2 mb-4" placeholder="Description" rows={3}
            />
          </div>
          {/* Category */}
          {/* ✅ 6. Replace the old select with the new one */}
          <div>
            <label className="block mb-1 font-medium">Category</label>
            <Select
              isMulti // This enables multi-select
              name="categories"
              options={categoryOptions}
              className="basic-multi-select mb-4"
              classNamePrefix="select"
              value={selectedCategories}
              onChange={handleCategoryChange}
              placeholder="Select Categories..."
              required
            />
          </div>
          
          {/* Category-dependent fields */}
          {renderCategorySpecificFields()}

          {/* Stock Quantity */}
          <div>
            <label className="block mb-1 font-medium">Stock Quantity</label>
            <input
              type="number" name="stock" value={form.stock} onChange={handleChange} required
              className="w-full border rounded px-3 py-2 mb-4" placeholder="Stock"
            />
          </div>
          {/* Promotion */}
          <div>
            <label className="block mb-1 font-medium">Promotion</label>
            <select
              name="promotion"
              value={form.promotion}
              onChange={handlePromotionChange} // ✅ Use the new handler
              className="w-full border rounded px-3 py-2 mb-4"
            >
              <option value="">Select Promotion (Optional)</option>
              {promotions.map((promo) => (
                <option key={promo._id} value={promo._id}>
                  {promo.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* ✅ Conditionally Render Discount Percentage Field */}
          {selectedPromotionName === 'Discount' && (
            <div className="p-4 mb-4 border-l-4 border-blue-500 bg-blue-50 rounded">
              <label className="block mb-1 font-medium text-blue-800">Discount Percentage (%)</label>
              <input
                type="number"
                name="discountPercentage"
                value={form.discountPercentage}
                onChange={handleChange} // The generic handler is fine here
                className="w-full border rounded px-3 py-2"
                placeholder="e.g. 10 for 10%"
                min="1"
                max="99"
                required // Make it required only when visible
              />
            </div>
          )}

          {/* Image Upload */}
          <div>
            <label className="block mb-1 font-medium">Upload Images (max 5)</label>
            <input
              type="file" name="images" accept="image/*" multiple onChange={handleImageChange} required
              className="w-full border rounded px-3 py-2 mb-4"
            />
            {form.images.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {form.images.map((file, idx) => (
                  <span key={idx} className="text-xs bg-gray-200 px-2 py-1 rounded">
                    {file.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-2 rounded font-semibold hover:bg-primary-dark transition disabled:bg-gray-400"
          >
            {loading ? "Adding Product..." : "Add Product"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
