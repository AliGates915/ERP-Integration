import React, { useState, useEffect, useRef, useCallback } from "react";
import { HashLoader } from "react-spinners";
import gsap from "gsap";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import CommanHeader from "../../../components/CommanHeader";
import { SquarePen, Trash2 } from "lucide-react";
import TableSkeleton from "../Skeleton";

// Static data for customers and banks
const staticCustomers = [
  { _id: "cust1", customerName: "TechCorp" },
  { _id: "cust2", customerName: "GlobalTrade" },
  { _id: "cust3", customerName: "Innovate Ltd" },
];

const staticBanks = [
  { bankName: "National Bank" },
  { bankName: "City Bank" },
  { bankName: "United Bank" },
];

const Bank = () => {
  const [bankList, setBankList] = useState([]);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [customer, setCustomer] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const sliderRef = useRef(null);
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  // GSAP Animation for Modal
  useEffect(() => {
    if (isSliderOpen) {
      if (sliderRef.current) {
        sliderRef.current.style.display = "block";
      }
      gsap.fromTo(
        sliderRef.current,
        { scale: 0.7, opacity: 0, y: -50 },
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

  const API_URL = `${import.meta.env.VITE_API_BASE_URL}/banks`;

  const fetchBankList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}`);
      setBankList(res.data || staticBanks.map((b, index) => ({
        _id: `bank${index + 1}`,
        customer: staticCustomers[Math.floor(Math.random() * staticCustomers.length)],
        bankName: b.bankName,
        accountName: `Account ${b.bankName}`,
        accountNo: `ACC${Math.floor(100000 + Math.random() * 900000)}`,
      })));
    } catch (error) {
      console.error("Failed to fetch Banks", error);
      setBankList(staticBanks.map((b, index) => ({
        _id: `bank${index + 1}`,
        customer: staticCustomers[Math.floor(Math.random() * staticCustomers.length)],
        bankName: b.bankName,
        accountName: `Account ${b.bankName}`,
        accountNo: `ACC${Math.floor(100000 + Math.random() * 900000)}`,
      })));
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);

  useEffect(() => {
    fetchBankList();
  }, [fetchBankList]);

  // Handlers
  const handleAddBank = () => {
    setIsSliderOpen(true);
    setIsEdit(false);
    setEditId(null);
    setCustomer("");
    setBankName("");
    setAccountName("");
    setAccountNo("");
  };

  const validateForm = () => {
    if (!customer) {
      toast.error("Please select a customer");
      return false;
    }
    if (!bankName) {
      toast.error("Please select a bank name");
      return false;
    }
    if (!accountName.trim()) {
      toast.error("Please enter an account name");
      return false;
    }
    if (!accountNo.trim()) {
      toast.error("Please enter an account number");
      return false;
    }
    return true;
  };

  // Save or Update Bank
  const handleSave = async () => {
    if (!validateForm()) return;

    const formData = {
      customer, // Store customer ID
      bankName,
      accountName,
      accountNo,
    };

    try {
      const { token } = userInfo || {};
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      let res;
      if (isEdit && editId) {
        res = await axios.put(`${API_URL}/${editId}`, formData, { headers });
        toast.success("Bank updated successfully");
      } else {
        res = await axios.post(`${API_URL}`, formData, { headers });
        setBankList([...bankList, res.data]);
        toast.success("Bank added successfully");
      }
      fetchBankList();
      setCustomer("");
      setBankName("");
      setAccountName("");
      setAccountNo("");
      setIsSliderOpen(false);
      setIsEdit(false);
      setEditId(null);
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  // Edit Bank
  const handleEdit = (bank) => {
    setIsEdit(true);
    setEditId(bank._id);
    setCustomer(bank.customer?._id || "");
    setBankName(bank.bankName || "");
    setAccountName(bank.accountName || "");
    setAccountNo(bank.accountNo || "");
    setIsSliderOpen(true);
  };

  // Delete Bank
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
            await axios.delete(`${API_URL}/${id}`, {
              headers: {
                Authorization: `Bearer ${userInfo?.token}`,
              },
            });
            setBankList(bankList.filter((b) => b._id !== id));
            swalWithTailwindButtons.fire(
              "Deleted!",
              "Bank deleted successfully.",
              "success"
            );
          } catch (error) {
            console.error("Delete error:", error);
            swalWithTailwindButtons.fire(
              "Error!",
              "Failed to delete bank.",
              "error"
            );
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire(
            "Cancelled",
            "Bank is safe 🙂",
            "error"
          );
        }
      });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <CommanHeader />
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-newPrimary">
            Bank List
          </h1>
          <p className="text-gray-500 text-sm">
            Manage your bank details
          </p>
        </div>
        <button
          className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/90"
          onClick={handleAddBank}
        >
          + Add Bank
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="hidden lg:grid grid-cols-[80px_1.5fr_1.5fr_1.5fr_auto] gap-6 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200">
              <div>SR#</div>
              <div>Customer Name</div>
              <div>Bank Name</div>
              <div>Account No.</div>
              {userInfo?.isAdmin && <div className="text-right">Actions</div>}
            </div>

            <div className="flex flex-col divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
              {loading ? (
                <TableSkeleton
                  rows={bankList.length > 0 ? bankList.length : 5}
                  cols={userInfo?.isAdmin ? 5 : 4}
                  className="lg:grid-cols-[80px_1.5fr_1.5fr_1.5fr_auto]"
                />
              ) : bankList.length === 0 ? (
                <div className="text-center py-4 text-gray-500 bg-white">
                  No banks found.
                </div>
              ) : (
                bankList?.map((b, index) => (
                  <>
                    <div
                      key={b._id}
                      className="hidden lg:grid grid-cols-[80px_1.5fr_1.5fr_1.5fr_auto] items-center gap-6 px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                    >
                      <div className="font-medium text-gray-900">{index + 1}</div>
                      <div className="text-gray-700">{b.customer?.customerName || "N/A"}</div>
                      <div className="text-gray-600">{b.bankName}</div>
                      <div className="text-gray-600">{b.accountNo}</div>
                      {userInfo?.isAdmin && (
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => handleEdit(b)}
                            className="text-blue-600 hover:underline"
                          >
                            <SquarePen size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(b._id)}
                            className="text-red-600 hover:underline"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )}
                    </div>

                    <div
                      key={`mobile-${b._id}`}
                      className="lg:hidden bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4"
                    >
                      <h3 className="font-semibold text-gray-800">
                        {b.customer?.customerName || "N/A"}
                      </h3>
                      <p className="text-sm text-gray-600">SR#: {index + 1}</p>
                      <p className="text-sm text-gray-600">Bank Name: {b.bankName}</p>
                      <p className="text-sm text-gray-600">Account No.: {b.accountNo}</p>
                      {userInfo?.isAdmin && (
                        <div className="mt-3 flex justify-end gap-3">
                          <button
                            className="text-blue-500"
                            onClick={() => handleEdit(b)}
                          >
                            <SquarePen size={18} />
                          </button>
                          <button
                            className="text-red-500"
                            onClick={() => handleDelete(b._id)}
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

      {isSliderOpen && (
        <div className="fixed inset-0 bg-gray-600/50 flex items-center justify-center z-50">
          <div
            ref={sliderRef}
            className="w-full md:w-[800px] bg-white rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white rounded-t-2xl">
              <h2 className="text-xl font-bold text-newPrimary">
                {isEdit ? "Update a Bank" : "Add a New Bank"}
              </h2>
              <button
                className="w-8 h-8 bg-newPrimary text-white rounded-full flex items-center justify-center hover:bg-newPrimary/70"
                onClick={() => {
                  setIsSliderOpen(false);
                  setIsEdit(false);
                  setEditId(null);
                  setCustomer("");
                  setBankName("");
                  setAccountName("");
                  setAccountNo("");
                }}
              >
                ×
              </button>
            </div>

            <div className="space-y-4 p-4 md:p-6">
              <div className="flex gap-4">
                <div className="flex-1 min-w-0">
                  <label className="block text-gray-700 font-medium">
                    Customer <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={customer}
                    onChange={(e) => setCustomer(e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Select Customer</option>
                    {staticCustomers.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.customerName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-gray-700 font-medium">
                    Bank Name <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Select Bank</option>
                    {staticBanks.map((b, index) => (
                      <option key={index} value={b.bankName}>
                        {b.bankName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 min-w-0">
                  <label className="block text-gray-700 font-medium">
                    Account Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={accountName}
                    required
                    onChange={(e) => setAccountName(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="e.g. Corporate Account"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-gray-700 font-medium">
                    Account No. <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={accountNo}
                    required
                    onChange={(e) => setAccountNo(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="e.g. ACC123456789"
                  />
                </div>
              </div>
              <button
                className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/80 w-full"
                onClick={handleSave}
              >
                Save Bank
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
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
          .grid-cols-[80px_1.5fr_1.5fr_1.5fr_auto] {
            grid-template-columns: 80px 1.5fr 1.5fr 1.5fr auto;
          }
        }
        @media (max-width: 640px) {
          .grid-cols-[80px_1.5fr_1.5fr_1.5fr_auto] {
            grid-template-columns: 80px 1.5fr 1.5fr 1.5fr auto;
          }
        }
      `}</style>
    </div>
  );
};

export default Bank;