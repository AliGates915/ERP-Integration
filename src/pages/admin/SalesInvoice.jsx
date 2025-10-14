import React, { useState, useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import Swal from "sweetalert2";
import axios from "axios";
import { toast } from "react-toastify";
import { HashLoader } from "react-spinners";
import { FaEdit, FaTrash, FaPrint } from "react-icons/fa";
import { TbTruckReturn } from "react-icons/tb";
import { Printer, SquarePen, Trash2, Truck } from "lucide-react";
import TableSkeleton from "./Skeleton";
import CommanHeader from "../../components/CommanHeader";

const SalesInvoice = () => {
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const sliderRef = useRef(null);
  const [isEdit, setIsEdit] = useState(false);
  const [isReturn, setIsReturn] = useState(false);
  const [returnDescription, setReturnDescription] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [searchIndex, setSearchIndex] = useState(null);
  const [loading, setLoading] = useState(true);

  // Static invoice data
  // Inside SalesInvoice component, instead of fetching at first
  const [invoices, setInvoices] = useState([
    {
      _id: "1",
      receiptNo: "INV-1001",
      customerName: "Ali Khan",
      mobile: "03001234567",
      items: [
        { itemName: "Coca Cola 1L", price: 50, qty: 2, total: 100 },
        { itemName: "Lays Chips", price: 30, qty: 3, total: 90 },
      ],
      discount: 20,
      payable: 170,
      givenAmount: 200,
      returnAmount: 30,
    },
    {
      _id: "2",
      receiptNo: "INV-1002",
      customerName: "Sara Ahmed",
      mobile: "03007654321",
      items: [
        { itemName: "Milk 1L", price: 120, qty: 1, total: 120 },
        { itemName: "Bread", price: 50, qty: 2, total: 100 },
      ],
      discount: 10,
      payable: 210,
      givenAmount: 210,
      returnAmount: 0,
    },
    {
      _id: "3",
      receiptNo: "INV-1003",
      customerName: "Usman Ali",
      mobile: "03211234567",
      items: [
        { itemName: "Shampoo", price: 300, qty: 1, total: 300 },
        { itemName: "Soap", price: 80, qty: 4, total: 320 },
      ],
      discount: 50,
      payable: 570,
      givenAmount: 600,
      returnAmount: 30,
    },
  ]);

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
 
  // Form states
  const [customerName, setCustomerName] = useState("");
  const [mobileNo, setMobile] = useState("");
  const [items, setItems] = useState([
    { itemName: "", price: 0, qty: 1, total: 0 },
  ]);
  const [discount, setDiscount] = useState("");
  const [givenAmount, setGivenAmount] = useState("");

  const [payable, setPayable] = useState(0);
  const [returnAmount, setReturnAmount] = useState(0);
  const [balanceAmt, setBalanceAmt] = useState(0); // ✅ was missing

  const [editId, setEditId] = useState(null);
  const [itemCategory, setItemCategory] = useState("");
  const [categoryList, setCategoryList] = useState([]);
  const [suggestionsNo, setSuggestionsNo] = useState([]);

  // Animate slider
  useEffect(() => {
    if (isSliderOpen && sliderRef.current) {
      gsap.fromTo(
        sliderRef.current,
        { x: "100%", opacity: 0 },
        { x: "0%", opacity: 1, duration: 0.8, ease: "expo.out" }
      );
    }
  }, [isSliderOpen]);

  // Fetch Sales Invoice Data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/saleInvoices`
      );
      setInvoices(res.data); // store actual categories array

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

  // search suggestion with debouncing customer
  useEffect(() => {
    if (!mobileNo || mobileNo.length < 4) {
      setSuggestionsNo([]);
      return;
    }
    const mobileNumber = mobileNo;

    const delay = setTimeout(async () => {
      try {
        const res = await axios.get(
          `${
            import.meta.env.VITE_API_BASE_URL
          }/customers/search/mobile/?q=${mobileNumber}`
        );

        if (res.data) {
          setSuggestionsNo(Array.isArray(res.data) ? res.data : [res.data]);
         
        } else {
          setSuggestionsNo([]);
        }
      } catch (error) {
        console.error("Error fetching customer", error);
        setSuggestionsNo([]);
      }
    }, 300); // debounce 300ms

    return () => clearTimeout(delay);
  }, [mobileNo]);

  // search suggestion with debouncing
  useEffect(() => {
    // ✅ Run only if searchValue is not empty and has more than 1 character
    if (!searchValue || searchValue.length <= 1) {
      setSuggestions([]);
      return;
    }

    const delay = setTimeout(() => {
      const fetchData = async () => {
        try {
          const res = await axios.get(
            `${
              import.meta.env.VITE_API_BASE_URL
            }/item-details/search?q=${searchValue}`
          );
          setSuggestions(res.data);
        
        } catch (error) {
          console.error("Error fetching items", error);
        }
      };

      fetchData();
    }, 50); // 👈 debounce (increase to 50ms for smoother API calls)

    return () => clearTimeout(delay);
  }, [searchValue]);

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

  // ✅ Fetch items by category
  const fetchItemsByCategory = async (categoryName) => {
    try {
      setItemCategory(categoryName);
      const res = await axios.get(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/item-details/category/${categoryName}`
      );
      setSuggestions(res.data); // store items of this category as suggestions
 
    } catch (error) {
      console.error("Failed to fetch items by category", error);
    }
  };

  const handleSearch = (selectedItem, index) => {
    handleItemChange(index, "itemName", selectedItem.itemName);
    handleItemChange(index, "price", selectedItem.price); // auto-fill price
    setSearchValue(""); // clear searchValue after selection
    setSuggestions([]); // close dropdown
  };

  // Handle item changes
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;
    updatedItems[index].total =
      parseFloat(updatedItems[index].price || 0) *
      parseFloat(updatedItems[index].qty || 0);
    setItems(updatedItems);
    calculateTotals(updatedItems, discount, givenAmount);
  };

  // Remove item row
  const removeItemRow = (index) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
    calculateTotals(updatedItems, discount, givenAmount);
  };

  // 👉 Calculate totals
  const calculateTotals = (itemsList, disc, given) => {
    const totalBill = itemsList.reduce(
      (sum, item) => sum + Number(item.total || 0),
      0
    );
    const payableAmt = totalBill - (parseFloat(disc) || 0);

    const paidValue = parseFloat(given) || 0;

    // Balance = what’s left to pay
    let newBalance = payableAmt - paidValue;
    let returnAmt = 0;

    if (paidValue > payableAmt) {
      returnAmt = paidValue - payableAmt;
      newBalance = 0;
    }

    setPayable(payableAmt);
    setBalanceAmt(newBalance);
    setReturnAmount(returnAmt);
  };

  // Save invoice
  const handleSaveInvoice = async () => {
    const formData = {
      customerName,
      mobile: mobileNo,
      items,
      discount,
      givenAmount,
      returnDescription,
      payable,
      returnAmount,
      itemCategory,
    };
   

    try {
      const headers = {
        Authorization: `Bearer ${userInfo.token}`,
        "Content-Type": "application/json",
      };

      if (isEdit && editId) {
        // Update existing invoice
        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/saleInvoices/${editId}`,
          formData,
          { headers }
        );
        toast.success("Invoice updated successfully ✅");
      } else {
        // Create new invoice (receiptNo is auto-generated in backend)
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/saleInvoices`,
          formData,
          { headers }
        );
        toast.success("Invoice created successfully ✅");
      }

      // reset form
      resetForm();
      setIsSliderOpen(false);
      setIsEdit(false);
      setEditId(null);

      // refresh invoice list if you have one
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error(`❌ ${isEdit ? "Update" : "Create"} invoice failed`);
    }
  };

  // ✅ Handle suggestion click
  const handleCustomerSelect = (customer) => {
    setCustomerName(customer.customerName);
    setMobile(customer.mobileNumber); // use mobileNumber to match your API
    setSuggestionsNo([]);
  };

  // Reset form
  const resetForm = () => {
    setCustomerName("");
    setMobile("");
    setItems([{ itemName: "", price: 0, qty: 1, total: 0 }]);
    setDiscount(0);
    setGivenAmount(0);
    setPayable(0);
    setReturnAmount(0);
  };

  // Delete invoice
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
              `${import.meta.env.VITE_API_BASE_URL}/saleInvoices/${id}`,
              {
                headers: {
                  Authorization: `Bearer ${userInfo.token}`, // if you’re using auth
                },
              }
            );
            setInvoices(invoices.filter((s) => s._id !== id));
            swalWithTailwindButtons.fire(
              "Deleted!",
              "Sales Invoice deleted successfully.",
              "success"
            );
            fetchData();
          } catch (error) {
            console.error("Delete error:", error);
            swalWithTailwindButtons.fire(
              "Error!",
              "Failed to delete sales invoice.",
              "error"
            );
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire(
            "Cancelled",
            "Sales Invoice is safe 🙂",
            "error"
          );
        }
      });
  };

  // Edit invoice
  const handleEdit = (invoice) => {
    setIsEdit(true);
    setEditId(invoice._id);

    // ✅ now itemCategory is a string, not object
    setItemCategory(invoice.itemCategory || "");

    setCustomerName(invoice.customerName || "");
    setMobile(invoice.mobile || "");
    setItems(invoice.items || []);
    setDiscount(invoice.discount || 0);
    setGivenAmount(invoice.givenAmount || 0);
    setPayable(invoice.payable || 0);
    setReturnAmount(invoice.returnAmount || 0);
    setIsSliderOpen(true);
  };

  // Retrun invoice
  const handleReturn = (invoice) => {
   

    setIsEdit(true);
    setIsReturn(true);
    setEditId(invoice._id);
    

    setCustomerName(invoice.customerName || "");
    setMobile(invoice.mobile || "");
    setItems(invoice.items || []); // default to empty array
    setDiscount(invoice.discount || 0);
    setGivenAmount(invoice.givenAmount || 0);
    setPayable(invoice.payable || 0);
    setReturnAmount(invoice.returnAmount || 0);
    setIsSliderOpen(true);
  };

  // Print invoice
  const handlePrint = (invoice) => {
    const printWindow = window.open("", "_blank");

    // Build items table HTML
    const itemsHTML = invoice.items
      .map(
        (i, idx) => `
      <tr>
        <td style="border:1px solid #000;padding:4px;text-align:center;">${
          idx + 1
        }</td>
        <td style="border:1px solid #000;padding:4px;">${i.itemName}</td>
        <td style="border:1px solid #000;padding:4px;text-align:right;">${
          i.price
        }</td>
        <td style="border:1px solid #000;padding:4px;text-align:center;">${
          i.qty
        }</td>
        <td style="border:1px solid #000;padding:4px;text-align:right;">${
          i.total
        }</td>
      </tr>
    `
      )
      .join("");

    printWindow.document.write(`
    <html>
      <head>
        <title>Invoice - ${invoice.receiptNo}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h2, h4 { text-align: center; margin: 0; }
          table { border-collapse: collapse; width: 100%; margin-top: 15px; }
          p { margin: 4px 0; }
        </style>
      </head>
      <body>
        <h2>Shop Name</h2>
        <h4>Sales Invoice</h4>
        <hr/>
        <p><strong>Receipt No:</strong> ${invoice.receiptNo}</p>
        <p><strong>Customer:</strong> ${invoice.customerName}</p>
        <p><strong>Mobile:</strong> ${invoice.mobile}</p>

        <table>
          <thead>
            <tr>
              <th style="border:1px solid #000;padding:4px;">#</th>
              <th style="border:1px solid #000;padding:4px;">Item</th>
              <th style="border:1px solid #000;padding:4px;">Price</th>
              <th style="border:1px solid #000;padding:4px;">Qty</th>
              <th style="border:1px solid #000;padding:4px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>

        <hr/>
        <p><strong>Discount:</strong> ${invoice.discount}</p>
        <p><strong>Payable:</strong> ${invoice.payable}</p>
        <p><strong>Given Amount:</strong> ${invoice.givenAmount}</p>
        <p><strong>Return Amount:</strong> ${invoice.returnAmount}</p>

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
      {/* Common Header */}
      <CommanHeader />
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-newPrimary">
          Sales Invoice List
        </h1>
        <button
          className="bg-newPrimary text-white px-2 sm:px-4 py-2 rounded-lg hover:bg-primaryDark w-full sm:w-auto"
          onClick={() => {
            resetForm();
            setIsSliderOpen(true);
          }}
        >
          + Add Sales Invoice
        </button>
      </div>

      {/* Responsive Table Container */}
      <div className="rounded-xl shadow border border-gray-200 overflow-hidden">
        {/* Mobile Cards (show on small screens) */}
        <div className="lg:hidden space-y-4 p-4">
          {invoices.map((inv, index) => (
            <div
              key={index}
              className="bg-gray-100 p-4 rounded-xl shadow-sm border border-gray-200"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="text-sm font-medium text-gray-500">
                  Receipt No.
                </div>
                <div className="text-sm text-gray-900">{inv.receiptNo}</div>

                <div className="text-sm font-medium text-gray-500">
                  Customer Name
                </div>
                <div className="text-sm text-gray-900">{inv.customerName}</div>

                <div className="text-sm font-medium text-gray-500">
                  Mobile #
                </div>
                <div className="text-sm text-gray-900">{inv.mobile}</div>

                <div className="text-sm font-medium text-gray-500">Payable</div>
                <div className="text-sm text-gray-900">{inv.payable}</div>

                <div className="text-sm font-medium text-gray-500">Given</div>
                <div className="text-sm text-gray-900">{inv.givenAmount}</div>

                <div className="text-sm font-medium text-gray-500">Return</div>
                <div className="text-sm text-gray-900">{inv.returnAmount}</div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex justify-end">
                <div className="relative group">
                  <button className="text-gray-400 hover:text-gray-600 text-xl">
                    ⋯
                  </button>
                  <div className="absolute right-0 top-6 w-28 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-300 z-50 flex flex-col">
                    <button
                      onClick={() => handleEdit(inv)}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-blue-600/10 text-newPrimary flex items-center gap-2"
                    >
                      <SquarePen size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(inv._id)}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-500 flex items-center gap-2"
                    >
                      <Trash2 size={18} />
                    </button>
                    <button
                      onClick={() => handlePrint(inv)}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-blue-600/10 text-blue-700 flex items-center gap-2"
                    >
                      <Printer size={18} />
                    </button>
                    <button
                      onClick={() => handleReturn(inv)}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-green-50 text-green-600 flex items-center gap-2"
                    >
                      <Truck size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table (show on large screens) */}
        <div className="hidden lg:block overflow-x-auto">
          <div className="min-w-[1000px]">
            {/* Table Header */}
            <div className="grid grid-cols-7 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase border-b border-gray-200">
              <div className="text-left">Receipt No.</div>
              <div className="text-left">Customer Name</div>
              <div className="text-left">Mobile #</div>
              <div className="text-left">Payable</div>
              <div className="text-left">Given</div>
              <div className="text-left">Return</div>
              <div className="text-right">Actions</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {loading ? (
                <TableSkeleton
                  rows={invoices.length>0?invoices.length:5}
                  cols={7}
                  className="lg:grid-cols-7"
                />
              ) : invoices.length === 0 ? (
                <div className="text-center py-4 text-gray-500 bg-white">
                  No invoices found.
                </div>
              ) : (
                invoices.map((inv, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-7 items-center px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                  >
                    <div className="font-medium text-gray-700">
                      {inv.receiptNo}
                    </div>
                    <div className="text-gray-600">{inv.customerName}</div>
                    <div className="text-gray-600">{inv.mobile}</div>
                    <div className="text-gray-600">{inv.payable}</div>
                    <div className="text-gray-600">{inv.givenAmount}</div>
                    <div className="text-gray-600">{inv.returnAmount}</div>

                    {/* Actions */}
                    <div className="flex justify-end items-center gap-3">
                      <button
                        onClick={() => handleEdit(inv)}
                        className="text-blue-500 hover:text-blue-700"
                        title="Edit"
                      >
                        <SquarePen size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(inv._id)}
                        className="text-red-500 hover:text-red-700"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button
                        onClick={() => handlePrint(inv)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Print"
                      >
                        <Printer size={18} />
                      </button>
                      <button
                        onClick={() => handleReturn(inv)}
                        className="text-green-600 hover:text-green-800"
                        title="Return Sales"
                      >
                        <Truck size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Slider Form */}
      {isSliderOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-end z-50">
          <div
            ref={sliderRef}
            className="w-full sm:w-full md:w-2/3 lg:w-1/3 bg-white p-6 h-full overflow-y-auto shadow-lg transition-all duration-300"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold mb-4">
                {isEdit ? "Edit Invoice" : "Add New Invoice"}
              </h2>
              <button
                className="text-gray-500 hover:text-gray-800 text-2xl"
                onClick={() => setIsSliderOpen(false)}
              >
                x
              </button>
            </div>

            {/* Customer Info */}

            {/* Mobile Number */}
            <label htmlFor="">Mobile Number</label>
            <input
              type="text"
              value={mobileNo}
              required
              onChange={(e) => !isReturn && setMobile(e.target.value)} // ❌ disable typing if return
              className="w-full p-2 border rounded"
              readOnly={isReturn} // ✅ make it readonly
            />

            {!isReturn &&
              suggestionsNo.length > 0 && ( // ❌ hide suggestions if return
                <ul className="absolute bg-white border w-full mt-1 z-10 rounded shadow">
                  {suggestionsNo.map((s) => (
                    <li
                      key={s._id}
                      className="p-2 hover:bg-gray-200 cursor-pointer"
                      onClick={() => handleCustomerSelect(s)}
                    >
                      📱 {s.mobileNumber} — {s.customerName}
                    </li>
                  ))}
                </ul>
              )}

            {/* Customer name */}
            <label htmlFor="">Customer Name</label>
            <input
              placeholder="Customer Name"
              className="w-full border p-2 mb-2"
              value={customerName}
              required
              onChange={(e) => !isReturn && setCustomerName(e.target.value)} // ❌ disable if return
              readOnly={isReturn}
            />

            {/* Item Category */}
            <div>
              <label className="block text-gray-700 font-medium">
                Item Category <span className="text-newPrimary">*</span>
              </label>
              <select
                value={itemCategory}
                required
                onChange={(e) => {
                  if (!isReturn) {
                    // ❌ block changes if return
                    const categoryName = e.target.value;
                    setItemCategory(categoryName);
                    if (categoryName) fetchItemsByCategory(categoryName);
                  }
                }}
                className="w-full p-2 border rounded"
                disabled={isReturn} // ✅ disable dropdown
              >
                <option value="">Select Category</option>
                {categoryList.map((category) => (
                  <option key={category._id} value={category.categoryName}>
                    {category.categoryName}
                  </option>
                ))}
              </select>
            </div>

            {/* Items */}
            <div className="mt-2">Items</div>
            {items.map((item, i) => (
              <div
                key={i}
                className="relative flex flex-col sm:flex-row gap-2 mb-4 items-start sm:items-center"
              >
                <input
                  placeholder="Item Name"
                  className="border p-2 flex-1"
                  value={
                    searchIndex === i && searchValue !== ""
                      ? searchValue
                      : item.itemName
                  }
                  onChange={(e) => {
                    setSearchValue(e.target.value);
                    setSearchIndex(i);
                    if (e.target.value.length > 0) {
                      // filter category items by typed value
                      const filtered = suggestions.filter((s) =>
                        s.itemName
                          .toLowerCase()
                          .includes(e.target.value.toLowerCase())
                      );
                      setSuggestions(filtered);
                    } else {
                      setSuggestions([]);
                    }
                  }}
                />
                <input
                  type="number"
                  placeholder="Rate"
                  className="border p-2 w-full sm:w-20"
                  value={item.price}
                  onChange={(e) => handleItemChange(i, "rate", e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Qty"
                  className="border p-2 w-full sm:w-16"
                  value={item.qty}
                  onChange={(e) => handleItemChange(i, "qty", e.target.value)}
                />
                <div className="p-2 w-full sm:w-20 text-right">
                  {item.amount}
                </div>
                <button
                  onClick={() => removeItemRow(i)}
                  className="text-red-500 hover:underline"
                >
                  X
                </button>

                {/* Suggestions */}
                {suggestions.length > 0 && searchIndex === i && (
                  <ul className="absolute left-0 right-0 mt-24 w-full sm:w-[13rem] bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                    {suggestions.map((s, index) => (
                      <li
                        key={s._id}
                        className={`px-4 py-2 text-sm text-gray-700 cursor-pointer transition-colors duration-200 
            ${
              index !== suggestions.length - 1 ? "border-b border-gray-100" : ""
            } 
          hover:bg-indigo-50 hover:text-indigo-600`}
                        onClick={() => handleSearch(s, i)}
                      >
                        {s.itemName}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}

            {/* Return Des */}
            {isReturn && (
              <div className="mb-4">
                <label
                  htmlFor="returnReason"
                  className="block font-medium mb-1"
                >
                  Why are we returning the product?
                </label>
                <input
                  id="returnReason"
                  type="text"
                  placeholder="Write some words..."
                  className="w-full border p-2 rounded"
                  value={returnDescription}
                  onChange={(e) => setReturnDescription(e.target.value)}
                  required
                />
              </div>
            )}

            {/* Totals */}
            <div className="mt-6 p-4 border rounded-lg bg-gray-50 shadow-sm">
              <h3 className="font-bold text-lg mb-4 text-gray-700">
                Order Summary
              </h3>

              <div className="flex gap-4">
                {/* Given Amount */}
                <div className="flex flex-col w-1/2">
                  <label className="text-sm font-medium text-gray-600">
                    Given Amount
                  </label>
                  <input
                    type="number"
                    placeholder="Given Amount"
                    className="w-full border rounded-md p-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                    value={givenAmount}
                    onChange={(e) => {
                      const val = e.target.value;
                      setGivenAmount(val);
                      calculateTotals(
                        items,
                        discount ? parseFloat(discount) : 0,
                        parseFloat(val) || 0
                      );
                    }}
                  />
                </div>

                {/* Discount */}
                <div className="flex flex-col w-1/2">
                  <label className="text-sm font-medium text-gray-600">
                    Discount
                  </label>
                  <input
                    type="number"
                    placeholder="Discount"
                    className="w-full border rounded-md p-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                    value={discount}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDiscount(val);
                      calculateTotals(
                        items,
                        parseFloat(val) || 0,
                        givenAmount ? parseFloat(givenAmount) : 0
                      );
                    }}
                  />
                </div>
              </div>
            </div>
            {/* Payable */}
            <div className="mb-2 font-bold">Payable Amount: {payable}</div>

            {/* Return / Balance */}
            <div className="mb-2 font-bold text-gray-700">
              {balanceAmt > 0
                ? `Balance Due: ${balanceAmt}`
                : returnAmount > 0
                ? `Return Amount: ${returnAmount}`
                : "All Paid"}
            </div>

            {/* Save */}
            <button
              className="bg-newPrimary text-white px-4 py-2 rounded-lg w-full"
              onClick={handleSaveInvoice}
            >
              {isEdit ? "Update Invoice" : "Save Invoice"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesInvoice;
