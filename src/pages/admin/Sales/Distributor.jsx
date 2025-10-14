import React, { useState, useEffect, useRef, useCallback } from "react";
import { HashLoader } from "react-spinners";
import gsap from "gsap";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import CommanHeader from "../../../components/CommanHeader";
import { SquarePen, Trash2 } from "lucide-react";
import TableSkeleton from "../Skeleton";

const DistributorList = () => {
  const [distributorList, setDistributorList] = useState([
    // {
    //   _id: "dist1",
    //   distributorName: "Global Retail",
    //   contactPerson: "John Doe",
    //   email: "john@globalretail.com",
    //   address: "123 Retail St, New York, NY",
    //   phoneNumber: "+1-212-555-1234",
    //   mobileNumber: "03001234567",
    //   designation: "Sales Manager",
    //   ntn: "NTN123456789",
    //   gst: "27ABCDE1234F1Z5",
    //   paymentTerms: "Credit",
    //   creditLimit: "100000",
    //   creditTime: "30",
    //   status: true,
    // },
    // {
    //   _id: "dist2",
    //   distributorName: "City Distributors",
    //   contactPerson: "Jane Smith",
    //   email: "jane@citydistributors.com",
    //   address: "456 Main St, Chicago, IL",
    //   phoneNumber: "+1-312-555-5678",
    //   mobileNumber: "03009876543",
    //   designation: "Procurement Head",
    //   ntn: "NTN987654321",
    //   gst: "27XYZAB5678G2H3",
    //   paymentTerms: "Cash",
    //   status: false,
    // },
  ]);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [distributorName, setDistributorName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [status, setStatus] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [designation, setDesignation] = useState("");
  const [ntn, setNtn] = useState("");
  const [gst, setGst] = useState("");
  const [creditLimit, setCreditLimit] = useState("");
  const [creditTime, setCreditTime] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const sliderRef = useRef(null);
  const [loading, setLoading] = useState(true);
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

  const API_URL = `${import.meta.env.VITE_API_BASE_URL}/distributors`;

  const fetchDistributorsList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}`);
      setDistributorList(res.data);
    
    } catch (error) {
      console.error("Failed to fetch Distributors", error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);

  useEffect(() => {
    fetchDistributorsList();
  }, [fetchDistributorsList]);

  // Handlers
  const handleAddDistributor = () => {
    setIsSliderOpen(true);
    setIsEdit(false);
    setEditId(null);
    setDistributorName("");
    setContactPerson("");
    setEmail("");
    setAddress("");
    setPaymentTerms("");
    setPhoneNumber("");
    setMobileNumber("");
    setDesignation("");
    setNtn("");
    setGst("");
    setCreditLimit("");
    setCreditTime("");
    setStatus(true);
  };

  const validateEmail = (email) => {
    const re = /^\S+@\S+\.\S+$/;
    return re.test(email);
  };

  // Save or Update Distributor
  const handleSave = async () => {
    if (
      paymentTerms === "CreditCard" &&
      status &&
      (!creditLimit || creditLimit > 5000000)
    ) {
      toast.error("❌ Credit limit is required and must not exceed 50 lac");
      return;
    }

    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    const formData = {
      distributorName,
      email,
      contactPerson,
      address,
      mobileNumber,
      phoneNumber,
      designation,
      ntn,
      gst,
      paymentTerms: paymentTerms === "CreditCard" ? "Credit" : paymentTerms,
      creditTime: paymentTerms === "CreditCard" ? creditTime : undefined,
      creditLimit: paymentTerms === "CreditCard" ? creditLimit : undefined,
      status,
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
        toast.success("Distributor updated successfully");
      } else {
        res = await axios.post(`${API_URL}`, formData, { headers });
        setDistributorList([...distributorList, res.data]);
        toast.success("Distributor added successfully");
      }
      fetchDistributorsList();
      setDistributorName("");
      setContactPerson("");
      setEmail("");
      setAddress("");
      setPaymentTerms("");
      setPhoneNumber("");
      setDesignation("");
      setNtn("");
      setGst("");
      setCreditLimit("");
      setCreditTime("");
      setStatus(true);
      setIsSliderOpen(false);
      setIsEdit(false);
      setEditId(null);
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  // Edit Distributor
  const handleEdit = (distributor) => {
    setIsEdit(true);
    setEditId(distributor._id);
    setDistributorName(distributor.distributorName);
    setContactPerson(distributor.contactPerson);
    setEmail(distributor.email);
    setAddress(distributor.address);
    setPhoneNumber(distributor.phoneNumber || "");
    setMobileNumber(distributor.mobileNumber || "");
    setDesignation(distributor.designation || "");
    setNtn(distributor.ntn || "");
    setGst(distributor.gst || "");
    setPaymentTerms(
      distributor.paymentTerms === "Credit"
        ? "CreditCard"
        : distributor.paymentTerms || ""
    );
    setCreditLimit(distributor.creditLimit || "");
    setCreditTime(distributor.creditTime || "");
    setStatus(distributor.status);
    setIsSliderOpen(true);
  };

  // Delete Distributor
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
            setDistributorList(distributorList.filter((c) => c._id !== id));
            swalWithTailwindButtons.fire(
              "Deleted!",
              "Distributor deleted successfully.",
              "success"
            );
          } catch (error) {
            console.error("Delete error:", error);
            swalWithTailwindButtons.fire(
              "Error!",
              "Failed to delete distributor.",
              "error"
            );
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire(
            "Cancelled",
            "Distributor is safe 🙂",
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
            Distributors List
          </h1>
          <p className="text-gray-500 text-sm">
            Manage your distributor details
          </p>
        </div>
        <button
          className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/90"
          onClick={handleAddDistributor}
        >
          + Add Distributor
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[1100px]">
            <div className="hidden lg:grid grid-cols-[100px_1.5fr_1fr_1.5fr_2fr_1fr_1fr_100px_auto] gap-6 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200">
              <div>ID</div>
              <div>Name</div>
              <div>Contact</div>
              <div>Email</div>
              <div>Address</div>
              <div>Phone</div>
              <div>Payment</div>
              <div>Status</div>
              {userInfo?.isAdmin && <div className="text-right">Actions</div>}
            </div>

            <div className="flex flex-col divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
              {loading ? (
                <TableSkeleton
                  rows={distributorList.length > 0 ? distributorList.length : 5}
                  cols={userInfo?.isAdmin ? 9 : 8}
                  className="lg:grid-cols-[100px_1.5fr_1fr_1.5fr_2fr_1fr_1fr_100px_auto]"
                />
              ) : distributorList.length === 0 ? (
                <div className="text-center py-4 text-gray-500 bg-white">
                  No distributors found.
                </div>
              ) : (
                distributorList?.map((c) => (
                  <>
                    <div
                      key={c._id}
                      className="hidden lg:grid grid-cols-[100px_1.5fr_1fr_1.5fr_2fr_1fr_1fr_100px_auto] items-center gap-6 px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                    >
                      <div className="font-medium text-gray-900">
                        {c._id?.slice(0, 6)}
                      </div>
                      <div className="text-gray-700">{c.distributorName}</div>
                      <div className="text-gray-600">{c.contactPerson}</div>
                      <div className="text-gray-600">{c.email}</div>
                      <div className="text-gray-600 truncate">{c.address}</div>
                      <div className="text-gray-600">{c.phoneNumber}</div>
                      <div className="text-gray-600">
                        {c.paymentTerms}
                        {c.paymentTerms === "Credit" && c.creditLimit
                          ? ` (${c.creditLimit})`
                          : ""}
                      </div>
                      <div className="font-semibold">
                        {c.status ? (
                          <span className="text-green-600 bg-green-50 px-3 py-1 rounded-[5px]">
                            Active
                          </span>
                        ) : (
                          <span className="text-red-600 bg-red-50 px-3 py-1 rounded-[5px]">
                            Inactive
                          </span>
                        )}
                      </div>
                      {userInfo?.isAdmin && (
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => handleEdit(c)}
                            className="text-blue-600 hover:underline"
                          >
                            <SquarePen size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(c._id)}
                            className="text-red-600 hover:underline"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )}
                    </div>

                    <div
                      key={`mobile-${c._id}`}
                      className="lg:hidden bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4"
                    >
                      <h3 className="font-semibold text-gray-800">
                        {c.distributorName}
                      </h3>
                      <p className="text-sm text-gray-600">{c.contactPerson}</p>
                      <p className="text-sm text-gray-600">{c.email}</p>
                      <p className="text-sm text-gray-600">{c.phoneNumber}</p>
                      <p className="text-sm text-gray-600 truncate">
                        {c.address}
                      </p>
                      <p className="text-sm text-gray-600">
                        {c.paymentTerms}{" "}
                        {c.paymentTerms === "Credit" && c.creditLimit
                          ? `(Limit: ${c.creditLimit})`
                          : ""}
                      </p>
                      <p
                        className={`text-sm font-semibold ${
                          c.status ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {c.status ? "Active" : "Inactive"}
                      </p>

                      {userInfo?.isAdmin && (
                        <div className="mt-3 flex justify-end gap-3">
                          <button
                            className="text-blue-500"
                            onClick={() => handleEdit(c)}
                          >
                            <SquarePen size={18} />
                          </button>
                          <button
                            className="text-red-500"
                            onClick={() => handleDelete(c._id)}
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
                {isEdit
                  ? "Update a Distributor"
                  : "Add a New Distributor"}
              </h2>
              <button
                className="w-8 h-8 bg-newPrimary text-white rounded-full flex items-center justify-center hover:bg-newPrimary/70"
                onClick={() => {
                  setIsSliderOpen(false);
                  setIsEdit(false);
                  setEditId(null);
                  setDistributorName("");
                  setContactPerson("");
                  setEmail("");
                  setAddress("");
                  setPaymentTerms("");
                  setPhoneNumber("");
                  setDesignation("");
                  setNtn("");
                  setGst("");
                  setCreditLimit("");
                  setCreditTime("");
                  setStatus(true);
                }}
              >
                ×
              </button>
            </div>

            <div className="space-y-4 p-4 md:p-6">
              <div className="flex gap-4">
                <div className="flex-1 min-w-0">
                  <label className="block text-gray-700 font-medium">
                    Distributor Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={distributorName}
                    required
                    onChange={(e) => setDistributorName(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-gray-700 font-medium">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={phoneNumber}
                    required
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="e.g. +1-212-555-1234"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 min-w-0">
                  <label className="block text-gray-700 font-medium">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={mobileNumber}
                    required
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="e.g. 03001234567"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-gray-700 font-medium">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    required
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 min-w-0">
                  <label className="block text-gray-700 font-medium">
                    Contact Person <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={contactPerson}
                    required
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-gray-700 font-medium">
                    Designation <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={designation}
                    required
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="e.g. Sales Manager"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 font-medium">
                  Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={address}
                  required
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="flex gap-4">
                 <div className="flex-1 min-w-0">
                  <label className="block text-gray-700 font-medium">
                    NTN <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={ntn}
                    required
                    onChange={(e) => setNtn(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="e.g. NTN123456789"
                  />
                </div> 
                 <div className="flex-1 min-w-0">
                  <label className="block text-gray-700 font-medium">
                    GST <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={gst}
                    required
                    onChange={(e) => setGst(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="e.g. 27ABCDE1234F1Z5"
                  />
                </div> 
              </div>
              <div>
                <label className="block text-gray-700 font-medium">
                  Payment Terms <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="CreditCard"
                      checked={paymentTerms === "CreditCard"}
                      onChange={(e) => setPaymentTerms(e.target.value)}
                      className="form-radio"
                    />
                    Credit
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="Cash"
                      checked={paymentTerms === "Cash"}
                      onChange={(e) => setPaymentTerms(e.target.value)}
                      className="form-radio"
                    />
                    Cash
                  </label>
                </div>
              </div>
              {paymentTerms === "CreditCard" && (
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="block text-gray-700 font-medium">
                      Credit Time Limit{" "}
                      <span className="text-newPrimary">*</span>
                    </label>
                    <input
                      type="number"
                      value={creditTime}
                      onChange={(e) => setCreditTime(e.target.value)}
                      className="w-full p-2 border rounded"
                      placeholder="Enter time limit (days)"
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="block text-gray-700 font-medium">
                      Credit Cash Limit{" "}
                      <span className="text-newPrimary">*</span>
                    </label>
                    <input
                      type="number"
                      value={creditLimit}
                      onChange={(e) => setCreditLimit(e.target.value)}
                      className="w-full p-2 border rounded"
                      placeholder="Enter cash limit"
                    />
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <label className="text-gray-700 font-medium">Status</label>
                <button
                  type="button"
                  onClick={() => setStatus(!status)}
                  className={`w-14 h-7 flex items-center rounded-full p-1 transition-colors duration-300 ${
                    status ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                      status ? "translate-x-7" : "translate-x-0"
                    }`}
                  />
                </button>
                <span>{status ? "Active" : "Inactive"}</span>
              </div>
              <button
                className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/80 w-full"
                onClick={handleSave}
              >
                Save Distributor
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
          .grid-cols-[100px_1.5fr_1fr_1.5fr_2fr_1fr_1fr_100px_auto] {
            grid-template-columns: 1fr 1.5fr 1fr 1.5fr 2fr 1fr 1fr 0.8fr 0.5fr;
          }
        }
        @media (max-width: 640px) {
          .grid-cols-[100px_1.5fr_1fr_1.5fr_2fr_1fr_1fr_100px_auto] {
            grid-template-columns: 1fr 1.5fr 1fr 1.5fr 2fr 1fr 1fr 0.8fr 0.5fr;
          }
        }
      `}</style>
    </div>
  );
};

export default DistributorList;