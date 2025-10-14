import React, { useState, useEffect, useRef, useCallback } from "react";
import { Eye, Loader, SquarePen, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import CommanHeader from "../../../components/CommanHeader";
import TableSkeleton from "../Skeleton";
import axios from "axios";
import { api } from "../../../context/ApiService";
import ViewModel from "./ViewModel";

const QualityChecking = () => {
  const [qualityChecks, setQualityChecks] = useState([]);
  const [isView, setIsView] = useState(false);
  const [selectedGatepass, setSelectedGatepass] = useState(null);
  const [gatePassList, setGatePassList] = useState([]);
  const [gatePassListItems, setGatePassListItems] = useState([]);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [qcId, setQcId] = useState("");
  const [gpId, setGpId] = useState("");
  const [date, setDate] = useState("");
  const [itemsList, setItemsList] = useState([]);
  const [itemName, setItemName] = useState("");
  const [itemQuantity, setItemQuantity] = useState("");
  const [description, setDescription] = useState("");
  const [remarks, setRemarks] = useState("");
  const [result, setResult] = useState("");
  const [editingQC, setEditingQC] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [nextQcId, setNextQcId] = useState("001");
  const [editingQualityChecks, setEditingQualityChecks] = useState(null);
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const sliderRef = useRef(null);

  // 🔹 ID Creation of Quality Checking
  useEffect(() => {
    if (qualityChecks.length > 0) {
      const maxNo = Math.max(
        ...qualityChecks.map((qc) => {
          const match = qc.qcId?.match(/QC-(\d+)/); // extract number after QC-
          return match ? parseInt(match[1], 10) : 0;
        })
      );
      setNextQcId((maxNo + 1).toString().padStart(3, "0"));
    } else {
      setNextQcId("001");
    }
  }, [qualityChecks]);

  // 🔹 QC Modal states
  const [qcModalOpen, setQcModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalRemarks, setModalRemarks] = useState("");
  const [modalResult, setModalResult] = useState("");

  // 🔹 Open per-item QC Modal
  const openQcModal = (item, index) => {
    setSelectedItem({ ...item, index });
    setModalRemarks(item.remarks || "");
    setModalResult(item.result || "");
    setQcModalOpen(true);
  };

  // 🔹 Save per-item QC Modal
  const saveQcModal = () => {
    setItemsList((prev) =>
      prev.map((i, idx) =>
        (i._id && i._id === selectedItem._id) || idx === selectedItem.index
          ? { ...i, remarks: modalRemarks, result: modalResult }
          : i
      )
    );
    setQcModalOpen(false);
  };

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const API_URL = `${import.meta.env.VITE_API_BASE_URL}/qualityCheck`;
  // Qulaity Check fetch
  const fetchQualityCheckInn = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}`);
      setQualityChecks(res.data); // store actual categories array
     
    } catch (error) {
      console.error("Failed to qualtity check ", error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);
  useEffect(() => {
    fetchQualityCheckInn();
  }, [fetchQualityCheckInn]);
  const GATEPASS_URL = `${import.meta.env.VITE_API_BASE_URL}/gatePassIn`;
  // Qulaity Check fetch
  const fetchGatePassInn = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${GATEPASS_URL}`);
      setGatePassList(res.data); // store actual categories array
     
    } catch (error) {
      console.error("Failed to Gate pass", error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);
  useEffect(() => {
    fetchGatePassInn();
  }, [fetchGatePassInn]);

 const fetchGatePassInnItems = useCallback(async () => {
  if (!gpId) return;

  // 🚫 Don't fetch items if editing existing QC and gpId hasn't changed
  if (editingQC && gpId === (editingQC.gatePassIn?._id || "")) {
    return;
  }

  try {
    setItemsLoading(true);
    const res = await axios.get(`${GATEPASS_URL}/${gpId}`);
    const data = res.data;

    const items =
      data?.withPO?.items?.length > 0
        ? data.withPO.items
        : data?.withoutPO?.items?.length > 0
        ? data.withoutPO.items
        : [];

    setGatePassListItems(data);
    setItemsList(items);
  } catch (error) {
    console.error("Failed to fetch gate pass", error);
  } finally {
    setItemsLoading(false);
  }
}, [gpId, editingQC]);




  useEffect(() => {
   
      fetchGatePassInnItems();
    
  }, [fetchGatePassInnItems]);

  // reset QC ID
  const resetForm = () => {
    setQcId(""); // reset QC ID
    setDate("");
    setItemsList([]);
    setGpId('')
    setItemName("");
    setItemQuantity("");
    setDescription("");
    setRemarks("");
    setResult("");
    setEditingQC(null);
    setErrors({});
    setIsSliderOpen(false);
  };

  const handleAddClick = () => {
    resetForm();
    setQcId(`QC-${nextQcId}`); // ✅ use QC instead of REQ
    setIsSliderOpen(true);
  };

  const handleEditClick = (qc) => {

    
    setEditingQC(qc);
    setQcId(qc.qcId);
    setGpId(qc.gatePassIn?._id || "");
    setDate(qc.date ? qc.date.split("T")[0] : "");
    setItemsList(
      (qc.items || []).map((i) => ({
        ...i,
        result: i.action, // normalize action -> result for consistency
      }))
    );
    setDescription(qc.description || "");
    setRemarks(qc.remarks || "");
    setResult(qc.result || "");
    setIsSliderOpen(true);
  };

  // ✅ Right here (line ~118 in your paste)
  const handleAddItem = () => {
    if (!itemName || !itemQuantity || parseInt(itemQuantity, 10) <= 0) {
      Swal.fire(
        "Invalid Item",
        "Please enter valid item and quantity.",
        "warning"
      );
      return;
    }
    setItemsList([
      ...itemsList,
      { name: itemName, qty: parseInt(itemQuantity, 10) },
    ]);
    setItemName("");
    setItemQuantity("");

    if (!itemName || !itemQuantity || parseInt(itemQuantity, 10) <= 0) {
      Swal.fire(
        "Invalid Item",
        "Please enter valid item and quantity.",
        "warning"
      );
      return;
    }
    setItemsList([
      ...itemsList,
      { name: itemName, qty: parseInt(itemQuantity, 10) },
    ]);
    setItemName("");
    setItemQuantity("");
  };

  const validateForm = () => {
    const newErrors = {};
    if (!qcId.trim()) newErrors.qcId = "QC ID is required";
    if (!gpId.trim()) newErrors.gpId = "Gate Pass ID is required";
    if (!date) newErrors.date = "Date is required";
    if (itemsList.length === 0)
      newErrors.itemsList = "At least one item is required";

    // if (!result) newErrors.result = "Result is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const { token } = userInfo || {};
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    const newQC = {
      qcId: qcId.trim(),
      date,
      gatePassId: gpId,
      description,
      items: itemsList.map((i) => ({
        itemName: i.itemName || i.name,
        quantity: i.quantity || i.qty,
       action: i.result || i.action || "",
        remarks: i.remarks || "",
      })),
    };
  

    try {
      if (editingQC) {
        // Update existing
        await api.put(`/qualityCheck/${editingQC._id}`, newQC, {
          headers,
        });

        Swal.fire(
          "Updated!",
          "Quality Checking updated successfully.",
          "success"
        );
      } else {
        // Create new
        await api.post("/qualityCheck", newQC, { headers });

        Swal.fire("Added!", "Quality Checking added successfully.", "success");
      }
      fetchQualityCheckInn();
      resetForm();
    } catch (error) {
      console.error("Error saving quality checking", error);
      Swal.fire(
        "Error!",
        error.response?.data?.message || "Failed to save quality checking."
      );
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This will be deleted permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const { token } = userInfo || {};
        const headers = {
          Authorization: `Bearer ${token}`,
        };
        await api.delete(`/qualityCheck/${id}`, { headers });
        setQualityChecks(qualityChecks.filter((q) => q._id !== id));
        Swal.fire("Deleted!", "Record has been deleted.", "success");
      }
    });
  };
  const handleView = (qc) => {
    setSelectedGatepass(qc);
    setIsView(true);
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <CommanHeader />
      <div className="px-6 mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-newPrimary">
            Quality Checking Details
          </h1>
          <button
            className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/80"
            onClick={handleAddClick}
          >
            + Add Quality Checking
          </button>
        </div>

        {/* Table */}
        <div className="rounded-xl shadow border border-gray-200 overflow-hidden">
          <div className="overflow-y-auto lg:overflow-x-auto max-h-[400px]">
            <div className="min-w-[900px]">
              <div className="hidden lg:grid grid-cols-[1fr_2fr_2fr_1fr_auto] gap-6 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0">
                <div>QC ID</div>
                {/* <div>Items</div> */}
                <div>Description</div>
                <div>Remarks</div>
                <div>Date</div>
                {/* <div>Result</div> */}
                <div className="text-right">Actions</div>
              </div>

              <div className="flex flex-col divide-y divide-gray-100">
                {loading ? (
                  <TableSkeleton
                    rows={qualityChecks.length || 5}
                    cols={5}
                    className="lg:grid-cols-[1fr_2fr_2fr_1fr_auto]"
                  />
                ) : qualityChecks.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 bg-white">
                    No records found.
                  </div>
                ) : (
                  qualityChecks.map((qc) => (
                    <div
                      key={qc._id}
                      className="grid grid-cols-1 lg:grid-cols-[1fr_2fr_2fr_1fr_auto] items-center gap-6 px-6 py-4 text-sm bg-white hover:bg-gray-50"
                    >
                      <div className="font-medium">{qc.qcId}</div>
                      {/* <div>
                        {qc.items.map((i, idx) => (
                          <span
                            key={idx}
                            className="inline-block px-2 py-1 text-xs bg-gray-100 rounded mr-2"
                          >
                            {i.name} ({i.qty})
                          </span>
                        ))}
                      </div> */}
                      <div>{qc.description}</div>
                      <div>
                        {qc.items?.map((i) => (
                          <div key={i._id} className="">
                            {i.remarks || "—"}
                          </div>
                        ))}
                      </div>
                      <div>{formatDate(qc.date)}</div>
                      {/* <div className="capitalize">{qc.result}</div> */}
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleEditClick(qc)}
                          className="text-blue-600 hover:bg-blue-50 py-1 rounded"
                        >
                          <SquarePen size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(qc._id)}
                          className=" py-1 text-sm rounded text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                        <button
                          onClick={() => handleView(qc)}
                          className="py-1 text-sm text-amber-600 hover:bg-amber-50"
                          title="View"
                        >
                          <Eye size={18} />
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
              className="w-full md:w-[650px] bg-white rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white rounded-t-2xl">
                <h2 className="text-xl font-bold text-newPrimary">
                  {editingQC ? "Update Quality Check" : "Add Quality Check"}
                </h2>
                <button
                  className="w-8 h-8 bg-newPrimary text-white rounded-full flex items-center justify-center hover:bg-newPrimary/70"
                  onClick={resetForm}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 p-6">
                <div className="grid grid-cols-2 items-center gap-4">
                  {/* QC ID */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">
                      QC ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editingQC ? qcId : `QC-${nextQcId}`} // ✅ FIXED
                      onChange={(e) => setQcId(e.target.value)}
                      className="w-full p-3 border rounded-md"
                      required
                    />

                    {errors.qcId && (
                      <p className="text-red-500 text-xs">{errors.qcId}</p>
                    )}
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full p-3 border rounded-md"
                    />
                    {errors.date && (
                      <p className="text-red-500 text-xs">{errors.date}</p>
                    )}
                  </div>
                </div>

                {/* Section */}
                <div className="border p-4 rounded-lg bg-formBgGray space-y-4">
                  {/* Gate Pass In ID */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">
                      Gate Pass In Id <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={gpId}
                      onChange={(e) => setGpId(e.target.value)}
                      className="w-full p-3 border rounded-md"
                      required
                    >
                      <option value="">Select Gate Pass</option>
                      {gatePassList?.map((gatepass) => (
                        <option key={gatepass._id} value={gatepass._id}>
                          {gatepass.gatePassId}
                        </option>
                      ))}
                    </select>

                    {errors.gpId && (
                      <p className="text-red-500 text-xs">{errors.gpId}</p>
                    )}
                  </div>

                  {gpId &&
                    (itemsLoading ? (
                      <div className="flex justify-center py-4">
                        <Loader size={24} className="animate-spin" />
                      </div>
                    ) : itemsList.length > 0 ? (
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <table className="w-full border-collapse">
                          <thead className="bg-gray-200 text-gray-600 text-sm border border-gray-300">
                            <tr>
                              <th className="border border-gray-300 p-2">
                                Item
                              </th>
                              <th className="border border-gray-300 p-2">
                                Quantity
                              </th>
                              <th className="border border-gray-300 p-2">
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {itemsList.map((item, idx) => (
                              <tr
                                key={idx}
                                className="bg-gray-100 text-center border border-gray-300"
                              >
                                <td className="border border-gray-300 p-2">
                                  {item.itemName || item.name}
                                </td>
                                <td className="border border-gray-300 p-2">
                                  {item.quantity || item.qty} {item.unit || ""}
                                </td>
                                <td className="border border-gray-300 p-2 text-center">
                                  {item.result === "Upto Standard" ? (
                                    <div
                                      className="w-6 h-6 mx-auto rounded-full bg-green-500 text-white cursor-pointer"
                                      onClick={() => openQcModal(item, idx)}
                                    >
                                      ✓
                                    </div>
                                  ) : item.result === "Damage" ||
                                    item.result === "Rejected" ? (
                                    <div
                                      className="w-6 h-6 mx-auto rounded-full bg-red-500 text-white cursor-pointer"
                                      onClick={() => openQcModal(item, idx)}
                                    >
                                      ✕
                                    </div>
                                  ) : (
                                    <div
                                      className="w-6 h-6 border rounded-full cursor-pointer mx-auto"
                                      onClick={() => openQcModal(item, idx)}
                                    />
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        No items found
                      </div>
                    ))}
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 border rounded-md"
                  />
                </div>

                {errors.result && (
                  <p className="text-red-500 text-xs">{errors.result}</p>
                )}

                <button
                  type="submit"
                  className="w-full bg-newPrimary text-white py-3 rounded-lg"
                >
                  {editingQC ? "Update" : "Save"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* QC Modal */}
        {qcModalOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6">
              <div className="flex justify-between items-center border-b pb-2 mb-4">
                <h2 className="text-lg font-semibold text-newPrimary">
                  Quality Check
                </h2>
                <button
                  onClick={() => setQcModalOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500 text-white"
                >
                  ×
                </button>
              </div>

              <label className="block text-gray-700 font-medium mb-1">
                Remarks
              </label>
              <input
                type="text"
                value={modalRemarks}
                onChange={(e) => setModalRemarks(e.target.value)}
                className="w-full p-3 border rounded-md mb-4"
                placeholder="Enter remarks..."
              />

              <div className="flex gap-4 mb-6">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="qcResult"
                    value="Upto Standard"
                    checked={modalResult === "Upto Standard"}
                    onChange={(e) => setModalResult(e.target.value)}
                  />
                  Upto Standard
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="qcResult"
                    value="Damage"
                    checked={modalResult === "Damage"}
                    onChange={(e) => setModalResult(e.target.value)}
                  />
                  Damage
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="qcResult"
                    value="Rejected"
                    checked={modalResult === "Rejected"}
                    onChange={(e) => setModalResult(e.target.value)}
                  />
                  Rejected
                </label>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setQcModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={saveQcModal}
                  className="px-4 py-2 rounded-lg bg-newPrimary text-white hover:bg-newPrimary/80"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {isView && selectedGatepass && (
        <ViewModel
          data={selectedGatepass}
          type="qualityCheck"
          onClose={() => setIsView(false)}
        />
      )}
    </div>
  );
};

export default QualityChecking;
