import React, { useState, useCallback, useEffect, useRef } from "react";
import gsap from "gsap";
import { toast } from "react-toastify";
import axios from "axios";
import { HashLoader } from "react-spinners";
import Swal from "sweetalert2";
import { SquarePen, Trash2 } from "lucide-react";
import TableSkeleton from "./Skeleton";
import CommanHeader from "../../components/CommanHeader";

const CustomerData = () => {
  const [customerList, setCustomerList] = useState([
    {
      _id: "c1",
      customerName: "John Doe",
      address: "123 Main Street, Cityville",
      mobileNumber: "03001234567",
      previousBalance: "5000",
      nearby: "Near City Mall",
      paymentMethod: "Cash",
    },
    {
      _id: "c2",
      customerName: "Sarah Smith",
      address: "456 Market Road, Townsville",
      mobileNumber: "03007654321",
      previousBalance: "2500",
      nearby: "Near Central Park",
      paymentMethod: "Credit Card",
    },
    {
      _id: "c3",
      customerName: "Ali Khan",
      address: "789 Gulshan Block, Karachi",
      mobileNumber: "03211234567",
      previousBalance: "0",
      nearby: "Opposite City Tower",
      paymentMethod: "Bank Transfer",
    },
    {
      _id: "c4",
      customerName: "Maria Garcia",
      address: "12 Green Avenue, Lahore",
      mobileNumber: "03331239876",
      previousBalance: "700",
      nearby: "Close to Metro Station",
      paymentMethod: "Cash",
    },
    {
      _id: "c5",
      customerName: "David Johnson",
      address: "45 Sunset Blvd, Islamabad",
      mobileNumber: "03459876543",
      previousBalance: "1500",
      nearby: "Next to Airport",
      paymentMethod: "Debit Card",
    },
  ]);

  const [staffMembers, setStaffMember] = useState([]);
  const [productList, setProductList] = useState([]);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [address, setCustomerAddress] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [previousBalance, setPreviousBalance] = useState("");
  const [nearby, setNearby] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const sliderRef = useRef(null); // Ref for the slider element

  const handleAddCustomer = () => {
    setIsSliderOpen(true);
  };

  // GSAP Animation for Slider
  useEffect(() => {
    if (isSliderOpen) {
      gsap.fromTo(
        sliderRef.current,
        { x: "100%", opacity: 0 },
        { x: "0%", opacity: 1, duration: 0.5, ease: "power2.out" }
      );
    } else {
      gsap.to(sliderRef.current, {
        x: "100%",
        opacity: 0,
        duration: 0.5,
        ease: "power2.in",
        onComplete: () => {
          // Ensure slider is hidden after animation
          sliderRef.current.style.display = "none";
        },
      });
    }
  }, [isSliderOpen]);

  // Token
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
 

  // Fetch Customer Data
  const fetchCustomerData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/customers`
      );
      const result = await response.json();
     
      setCustomerData(result);
    } catch (error) {
      console.error("Error fetching customer data:", error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);

  useEffect(() => {
    fetchCustomerData();
  }, [fetchCustomerData]);

 

  // Save Customer Data
  const handleSave = async () => {
    const payload = {
      customerName,
      address,
      mobileNumber,
      previousBalance,
      nearby,
      paymentMethod,
    };

  

    try {
      const { token } = JSON.parse(localStorage.getItem("userInfo")) || {};
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      if (isEdit && editId) {
        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/customers/${editId}`,
          payload,
          { headers }
        );
        toast.success("✅ Customer updated successfully");
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/customers`,
          payload,
          { headers }
        );
        toast.success("✅ Customer added successfully");
      }

      // Reset fields
      setEditId(null);
      setIsEdit(false);
      setIsSliderOpen(false);
      setCustomerName("");
      setCustomerAddress("");
      setMobileNumber("");
      setPreviousBalance("");
      setNearby("");
      setPaymentMethod("");

      // Refresh list
      fetchCustomerData();
    } catch (error) {
      console.error(error);
      toast.error(`❌ ${isEdit ? "Update" : "Add"} customer failed`);
    }
  };

  // Edit Customer
  const handleEdit = (client) => {
    setIsEdit(true);
    setEditId(client._id);
    setCustomerName(client.customerName || "");
    setCustomerAddress(client.address || "");
    setMobileNumber(client.mobileNumber || "");
    setPreviousBalance(client.previousBalance || "");
    setNearby(client.nearby || "");
    setPaymentMethod(client.paymentMethod || "");
    setIsSliderOpen(true);
 
  };

  // Delete Customer
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
            const token = userInfo?.token;
            if (!token) {
              toast.error("Authorization token missing!");
              return;
            }

            await axios.delete(
              `${import.meta.env.VITE_API_BASE_URL}/customers/${id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            setCustomerData(customerList.filter((p) => p._id !== id));
            swalWithTailwindButtons.fire(
              "Deleted!",
              "Customer deleted successfully.",
              "success"
            );
          } catch (error) {
            console.error("Delete error:", error);
            swalWithTailwindButtons.fire(
              "Error!",
              "Failed to delete Customer.",
              "error"
            );
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire(
            "Cancelled",
            "Customer is safe 🙂",
            "error"
          );
        }
      });
  };

  // Show loading spinner
  // if (loading) {
  //   return (
  //     <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
  //       <div className="text-center">
  //         <HashLoader
  //           height="150"
  //           width="150"
  //           radius={1}
  //           color="#84CF16"
  //         />
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Common Header */}
      <CommanHeader />
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-newPrimary">Customer List</h1>
          <p className="text-gray-500 text-sm">Customer Management Dashboard</p>
        </div>
        <button
          className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-primaryDark transition-colors duration-200"
          onClick={handleAddCustomer}
        >
          + Add Customer
        </button>
      </div>

      {/* Customer Table */}
    
      <div className="rounded-xl shadow border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="max-h-screen overflow-y-auto">
            <div className="w-full min-w-full text-sm">
              {/* ✅ Table Header (Desktop Only) */}
              <div className="hidden lg:grid grid-cols-[1fr_2fr_1fr_1fr_1fr_1fr_auto] gap-6 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200">
                <div>Name</div>
                <div>Address</div>
                <div>Mobile No./WhatsApp</div>
                <div>Previous Balance</div>
                <div>Nearby</div>
                <div>Payment Method</div>
                {userInfo?.isAdmin && <div className="text-right">Actions</div>}
              </div>

              {/* ✅ Table Body */}
              <div className="flex flex-col divide-y divide-gray-100">
                {loading ? (
                  <TableSkeleton
                    rows={customerList.length > 0 ? customerList.length : 5}
                    cols={userInfo?.isAdmin ? 7 : 6}
                    className="lg:grid-cols-[1fr_2fr_1fr_1fr_1fr_1fr_auto]"
                  />
                ) : customerList.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 bg-white">
                    No customers found.
                  </div>
                ) : (
                  customerList.map((client, idx) => (
                    <>
                      {/* ✅ Desktop Grid */}
                      <div
                        key={client._id}
                        className="hidden lg:grid grid-cols-[1fr_2fr_1fr_1fr_1fr_1fr_auto] gap-6 items-center px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                      >
                        <div className="font-medium text-gray-900">
                          {client.customerName}
                        </div>
                        <div className="font-semibold text-green-600">
                          {client.address}
                        </div>
                        <div className="text-gray-500">
                          {client.mobileNumber}
                        </div>
                        <div className="text-gray-500">
                          {client.previousBalance}
                        </div>
                        <div className="text-gray-500">{client.nearby}</div>
                        <div className="text-gray-500">
                          {client.paymentMethod}
                        </div>
                        {userInfo?.isAdmin && (
                          <div className="flex justify-end gap-3">
                            <button
                              onClick={() => handleEdit(client)}
                              className="text-blue-500 hover:underline"
                            >
                              <SquarePen size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(client._id)}
                              className="text-red-500 hover:underline"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* ✅ Mobile Card */}
                      <div
                        key={`mobile-${client._id}`}
                        className="lg:hidden bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4"
                      >
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-700">
                            {client.customerName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {client.mobileNumber}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Address: {client.address}
                        </div>
                        <div className="text-sm text-gray-600">
                          Prev Balance: {client.previousBalance}
                        </div>
                        <div className="text-sm text-gray-600">
                          Nearby: {client.nearby}
                        </div>
                        <div className="text-sm text-gray-600">
                          Payment: {client.paymentMethod}
                        </div>
                        {userInfo?.isAdmin && (
                          <div className="mt-3 flex justify-end gap-3">
                            <button
                              className="text-blue-500"
                              onClick={() => handleEdit(client)}
                            >
                              <SquarePen size={18} />
                            </button>
                            <button
                              className="text-red-500"
                              onClick={() => handleDelete(client._id)}
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
      </div>

      {/* Right-Side Slider */}
      {isSliderOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50">
          <div
            ref={sliderRef}
            className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-xl overflow-y-auto"
            style={{ display: "block" }}
          >
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-newPrimary">
                {isEdit ? "Edit Customer" : "Add Customer"}
              </h2>
              <button
                className="w-6 h-6 text-white rounded-full flex justify-center items-center hover:text-gray-400 text-xl bg-newPrimary"
                onClick={() => setIsSliderOpen(false)}
              >
                &times;
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Customer Section */}
              <div className="border rounded-lg p-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                      placeholder="Enter name"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                      placeholder="Enter address"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">
                      Mobile No./WhatsApp
                    </label>
                    <input
                      type="text"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                      placeholder="Enter mobile number"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">
                      Previous Balance
                    </label>
                    <input
                      type="text"
                      value={previousBalance}
                      onChange={(e) => setPreviousBalance(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                      placeholder="Enter previous balance"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Nearby</label>
                    <input
                      type="text"
                      value={nearby}
                      onChange={(e) => setNearby(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                      placeholder="Enter nearby location"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">
                      Payment Terms
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                    >
                      <option value="">Select Payment Method</option>
                      <option value="Card">Card</option>{" "}
                      {/* ✅ Matches schema */}
                      <option value="Cash">Cash</option>
                      <option value="Cash on Delivery">Cash on Delivery</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => setIsSliderOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="bg-newPrimary text-white px-6 py-2 rounded-lg hover:bg-primaryDark transition-colors duration-200"
                  onClick={handleSave}
                >
                  {isEdit ? "Update Customer" : "Save Customer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerData;
