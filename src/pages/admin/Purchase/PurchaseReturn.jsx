import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import Swal from "sweetalert2";
import CommanHeader from "../../../components/CommanHeader";
import { SquarePen, Trash2, X } from "lucide-react";
import TableSkeleton from "../Skeleton";

const PurchaseReturn = () => {
  const [returnList, setReturnList] = useState([]);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  // Form states
  const [returnId, setReturnId] = useState("");
  const [date, setDate] = useState("");
  const [gatePass, setGatePass] = useState("");
  const [supplier, setSupplier] = useState("");
  const [poId, setPoId] = useState("");
  const [items, setItems] = useState([]);

  const [itemName, setItemName] = useState("");
  const [qty, setQty] = useState("");
  const [priceQty, setPriceQty] = useState("");
  const [isItemSelected, setIsItemSelected] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);

  const sliderRef = useRef(null);

  // Animate Slider
  useEffect(() => {
    if (isSliderOpen) {
      gsap.fromTo(
        sliderRef.current,
        { scale: 0.7, opacity: 0, y: -50 },
        { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }
      );
    }
  }, [isSliderOpen]);

  // Handlers
  const handleAddReturn = () => {
    resetForm();
    setIsSliderOpen(true);
    setIsEdit(false);
  };

  const resetForm = () => {
    setReturnId("");
    setDate("");
    setGatePass("");
    setSupplier("");
    setPoId("");
    setItems([]);
    setItemName("");
    setQty("");
    setPriceQty("");
    setEditId(null);
  };

  // Add items
  const handleAddItem = () => {
    if (!itemName || !qty) return;

    const newItem = {
      id: Date.now(),
      name: itemName,
      qty: parseInt(qty),
      price: parseInt(priceQty) || 0,
    };

    if (selectedItemIndex !== null) {
      // Update existing item
      const updatedItems = [...items];
      updatedItems[selectedItemIndex] = newItem;
      setItems(updatedItems);
    } else {
      // Add new item
      setItems([...items, newItem]);
    }

    // Reset inputs
    setItemName("");
    setQty("");
    setPriceQty("");
    setSelectedItemIndex(null);
    setIsItemSelected(false);
  };

  const handleSave = () => {
    const newReturn = {
      id: isEdit ? editId : Date.now(),
      returnId,
      date,
      gatePass,
      supplier,
      poId,
      items,
    };

    if (isEdit) {
      setReturnList(returnList.map((r) => (r.id === editId ? newReturn : r)));
      Swal.fire("Updated!", "Purchase return updated successfully", "success");
    } else {
      setReturnList([...returnList, newReturn]);
      Swal.fire("Added!", "Purchase return added successfully", "success");
    }

    setIsSliderOpen(false);
    resetForm();
  };

  const handleEdit = (ret) => {
    setIsEdit(true);
    setIsSliderOpen(true);
    setEditId(ret.id);
    setReturnId(ret.returnId);
    setDate(ret.date);
    setGatePass(ret.gatePass);
    setSupplier(ret.supplier);
    setPoId(ret.poId);
    setItems(ret.items);
  };

  function handleRemoveItem(index) {
    setItems(items.filter((_, i) => i !== index));
  }

  function handleRemoveItem(idx) {
    const updatedItems = items.filter((_, index) => index !== idx);
    setItems(updatedItems);
  }
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <CommanHeader />

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-newPrimary">
            Purchase Returns
          </h1>
          <p className="text-gray-500 text-sm">
            Manage your purchase return entries
          </p>
        </div>
        <button
          className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/80"
          onClick={handleAddReturn}
        >
          + Add Return
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[1000px]">
            {/* Table Header */}
            <div className="hidden lg:grid grid-cols-[120px_120px_150px_150px_150px_auto] gap-6 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase">
              <div>Return ID</div>
              <div>Date</div>
              <div>Gate Pass</div>
              <div>Supplier</div>
              <div>PO ID</div>
              <div className="text-right">Actions</div>
            </div>

            {/* Table Body */}
            <div className="flex flex-col divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
              {returnList.length === 0 ? (
                <div className="text-center py-4 text-gray-500 bg-white">
                  No returns found.
                </div>
              ) : (
                returnList.map((r) => (
                  <div
                    key={r.id}
                    className="hidden lg:grid grid-cols-[120px_120px_150px_150px_150px_auto] items-center gap-6 px-6 py-4 text-sm bg-white hover:bg-gray-50"
                  >
                    <div>{r.returnId}</div>
                    <div>{r.date}</div>
                    <div>{r.gatePass}</div>
                    <div>{r.supplier}</div>
                    <div>{r.poId}</div>
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => handleEdit(r)}
                        className="text-blue-600 hover:underline"
                      >
                        <SquarePen size={18} />
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
        <div className="fixed inset-0 bg-gray-600/50 flex items-center justify-center z-50">
          <div
            ref={sliderRef}
            className="w-full md:w-[800px] bg-white rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold text-newPrimary">
                {isEdit ? "Update Return" : "Purchase Return"}
              </h2>
              <button
                className="w-8 h-8 bg-newPrimary text-white rounded-full flex items-center justify-center hover:bg-newPrimary/70"
                onClick={() => setIsSliderOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="space-y-4 p-6">
              {/* Form Fields */}
              <div className="flex gap-4">
                <div className="flex-1 min-w-0">
                  <label className="text-gray-700 font-medium">Return ID</label>
                  <input
                    type="text"
                    value={returnId}
                    onChange={(e) => setReturnId(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="text-gray-700 font-medium">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 min-w-0">
                  <label className="text-gray-700 font-medium">
                    Gate Pass ID
                  </label>
                  <select
                    value={gatePass}
                    onChange={(e) => {
                      const selectedGatePass = e.target.value;
                      setGatePass(selectedGatePass);

                      // Example: auto-fill Supplier & PO ID based on selected gate pass
                      if (selectedGatePass === "GP001") {
                        setSupplier("ABC Supplier");
                        setPoId("PO12345");
                      }
                    }}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select Gate Pass</option>
                    <option value="GP001">GP001</option>
                  </select>
                </div>
                <div className="flex-1 min-w-0">
                  <label className="text-gray-700 font-medium">Supplier</label>
                  <input
                    type="text"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    className="w-full p-2 border rounded"
                    disabled={!gatePass} // disabled if no gatePass selected
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="text-gray-700 font-medium">PO ID</label>
                  <input
                    type="text"
                    value={poId}
                    onChange={(e) => setPoId(e.target.value)}
                    className="w-full p-2 border rounded"
                    disabled={!gatePass} // disabled if no gatePass selected
                  />
                </div>
              </div>
              <div className="flex gap-4">
                {/* Items Section */}
                <div className="flex-1 min-w-0">
                  <label className="text-gray-700 font-medium">Item Name</label>
                  <select
                    value={itemName} // make sure select shows the current itemName
                    onChange={(e) => {
                      const value = e.target.value;
                      setItemName(value); // update state
                      setIsItemSelected(value !== ""); // enable inputs

                      // Auto-fill qty & price if item exists in items list
                      const existingItem = items.find(
                        (it) => it.name === value
                      );
                      if (existingItem) {
                        setQty(existingItem.qty);
                        setPriceQty(existingItem.price);
                        setSelectedItemIndex(items.indexOf(existingItem));
                      } else {
                        setQty("");
                        setPriceQty("");
                        setSelectedItemIndex(null);
                      }
                    }}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select Item Name</option>
                    <option value="Item1">Item1</option>
                    <option value="Item2">Item2</option>
                    <option value="Item3">Item3</option>
                  </select>
                </div>
              </div>

              {/* Items Section Inputs*/}

              <div className="border p-4 rounded-lg bg-formBgGray space-y-4">

                <h3 className="font-semibold text-gray-800 mb-2">Items</h3>

                <div className="flex gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      placeholder="Item Name"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      className="w-full p-2 border rounded"
                      disabled={!isItemSelected}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <input
                      type="number"
                      placeholder="Qty"
                      value={qty}
                      onChange={(e) => setQty(e.target.value)}
                      className="w-full p-2 border rounded"
                      disabled={!isItemSelected}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <input
                      type="number"
                      placeholder="Price"
                      value={priceQty}
                      onChange={(e) => setPriceQty(e.target.value)}
                      className="w-full p-2 border rounded"
                      disabled={!isItemSelected}
                    />
                  </div>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="px-3 bg-newPrimary hover:bg-blue-600 text-white rounded flex items-center h-full w-full justify-center flex-1 min-w-0 text-sm whitespace-nowrap"
                    >
                      Update Item
                    </button>
                  </div>
                </div>
                {/* Items Table */}
                {items.length > 0 && (
                  <div className="overflow-x-auto">
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="w-full border-collapse text-sm">

                        <thead className="bg-gray-200 text-gray-600 text-sm border border-gray-300">

                          <tr>
                            <th className="border border-gray-300 px-2 py-1">
                              Item
                            </th>
                            <th className="border border-gray-300 px-2 py-1">
                              Qty
                            </th>
                            <th className="border border-gray-300 px-2 py-1">
                              Price
                            </th>
                            <th className="border border-gray-300 px-2 py-1">
                              Remove
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((it, idx) => (
                            <tr
                              key={it.id}
                              onClick={() => {
                                setItemName(it.name);
                                setQty(it.qty);
                                setPriceQty(it.price);

                                setSelectedItemIndex(idx);
                                setIsItemSelected(true);
                              }}
                              className="cursor-pointer hover:bg-gray-100"
                            >
                              <td className="border border-gray-300 text-center px-2 py-1">
                                {it.name}
                              </td>
                              <td className="border border-gray-300 text-center px-2 py-1">
                                {it.qty}
                              </td>
                              <td className="border border-gray-300 text-center px-2 py-1">
                                {it.price}
                              </td>

                              <td className="px-4 py-2 border-b border-gray-300 text-center">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation(); // prevent row click from triggering edit
                                    handleRemoveItem(idx);
                                  }}
                                >
                                  <X size={18} className="text-red-600 " />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                className="w-full bg-newPrimary text-white py-2 rounded-lg"
              >
                {isEdit ? "Update Return" : "Save Return"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseReturn;
