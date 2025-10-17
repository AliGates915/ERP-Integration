import React, { useState, useEffect, useRef, useCallback } from "react";
import { HashLoader } from "react-spinners";
import gsap from "gsap";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import CommanHeader from "../../../components/CommanHeader";
import { SquarePen, Trash2 } from "lucide-react";
import TableSkeleton from "../Skeleton";

const Company = () => {
  const [companies, setCompanies] = useState([]);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  // form fields
  const [group, setGroup] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [logo, setLogo] = useState(null);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [contactAddress, setContactAddress] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [ntn, setNtn] = useState("");
  const [strn, setStrn] = useState("");

  const [groupOptions, setGroupOptions] = useState([]);

  const sliderRef = useRef(null);
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const API_URL = `${import.meta.env.VITE_API_BASE_URL}/companies`;
  const GROUP_URL = `${import.meta.env.VITE_API_BASE_URL}/groups`;

  // ✅ Animate modal
  useEffect(() => {
    if (isSliderOpen) {
      if (sliderRef.current) sliderRef.current.style.display = "block";
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
          if (sliderRef.current) sliderRef.current.style.display = "none";
        },
      });
    }
  }, [isSliderOpen]);

  // ✅ Fetch company list
  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      setCompanies(res.data);
    } catch (error) {
      console.error("Failed to fetch companies:", error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);

  // ✅ Fetch group list for select field
  const fetchGroups = async () => {
    try {
      const res = await axios.get(GROUP_URL);
      setGroupOptions(res.data);
    } catch (err) {
      console.error("Error fetching groups:", err);
    }
  };

  useEffect(() => {
    fetchCompanies();
    fetchGroups();
  }, [fetchCompanies]);

  // ✅ Handle Save
  const handleSave = async () => {
    if (!companyName.trim()) {
      toast.error("Company name is required");
      return;
    }

    const formData = new FormData();
    formData.append("group", group);
    formData.append("companyName", companyName);
    formData.append("address", address);
    formData.append("phone", phone);
    formData.append("website", website);
    formData.append("contactAddress", contactAddress);
    formData.append("mobile", mobile);
    formData.append("email", email);
    formData.append("ntn", ntn);
    formData.append("strn", strn);
    if (logo) formData.append("logo", logo);

    try {
      const headers = {
        Authorization: `Bearer ${userInfo?.token}`,
        "Content-Type": "multipart/form-data",
      };

      if (isEdit && editId) {
        await axios.put(`${API_URL}/${editId}`, formData, { headers });
        toast.success("Company updated successfully!");
      } else {
        const res = await axios.post(API_URL, formData, { headers });
        setCompanies([...companies, res.data]);
        toast.success("Company added successfully!");
      }

      setIsSliderOpen(false);
      setIsEdit(false);
      setEditId(null);
      resetForm();
      fetchCompanies();
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Something went wrong!");
    }
  };

  const resetForm = () => {
    setGroup("");
    setCompanyName("");
    setLogo(null);
    setAddress("");
    setPhone("");
    setWebsite("");
    setContactAddress("");
    setMobile("");
    setEmail("");
    setNtn("");
    setStrn("");
  };

  // ✅ Handle Edit
  const handleEdit = (c) => {
    setIsEdit(true);
    setEditId(c._id);
    setGroup(c.group?._id || "");
    setCompanyName(c.companyName);
    setAddress(c.address);
    setPhone(c.phone);
    setWebsite(c.website);
    setContactAddress(c.contactAddress);
    setMobile(c.mobile);
    setEmail(c.email);
    setNtn(c.ntn);
    setStrn(c.strn);
    setIsSliderOpen(true);
  };

  // ✅ Delete
  const handleDelete = async (id) => {
    const swal = Swal.mixin({
      customClass: {
        confirmButton:
          "bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600",
        cancelButton:
          "bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600",
      },
      buttonsStyling: false,
    });

    swal
      .fire({
        title: "Are you sure?",
        text: "This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          try {
            await axios.delete(`${API_URL}/${id}`, {
              headers: { Authorization: `Bearer ${userInfo?.token}` },
            });
            setCompanies(companies.filter((c) => c._id !== id));
            swal.fire("Deleted!", "Company deleted successfully.", "success");
          } catch (err) {
            swal.fire("Error!", "Failed to delete company.", "error");
          }
        }
      });
  };

  // ✅ Add Button
  const handleAdd = () => {
    resetForm();
    setIsEdit(false);
    setEditId(null);
    setIsSliderOpen(true);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <CommanHeader />
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-newPrimary">Company List</h1>
          <p className="text-gray-500 text-sm">
            Manage your company information
          </p>
        </div>
        {/* <button
          onClick={handleAdd}
          className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/90"
        >
          + Add Company
        </button> */}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            <div className="hidden lg:grid grid-cols-[120px_1.5fr_2fr_1.5fr_1fr_auto] gap-6 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase border-b">
              <div>ID</div>
              <div>Company</div>
              <div>Address</div>
              <div>Phone</div>
              <div>Email</div>
              <div className="text-right">Actions</div>
            </div>

            <div className="flex flex-col divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
              {loading ? (
                <TableSkeleton rows={5} cols={6} />
              ) : companies.length === 0 ? (
                <div className="text-center py-4 text-gray-500 bg-white">
                  No companies found.
                </div>
              ) : (
                companies.map((c) => (
                  <div
                    key={c._id}
                    className="hidden lg:grid grid-cols-[120px_1.5fr_2fr_1.5fr_1fr_auto] items-center gap-6 px-6 py-4 text-sm bg-white hover:bg-gray-50"
                  >
                    <div>{c._id.slice(0, 6)}</div>
                    <div className="flex items-center gap-2">
                      {c.logo && (
                        <img
                          src={c.logo.url}
                          alt="logo"
                          className="w-8 h-8 rounded-full object-cover border"
                        />
                      )}
                      <span className="font-semibold text-gray-800">
                        {c.companyName}
                      </span>
                    </div>
                    <div className="text-gray-600 truncate">{c.address}</div>
                    <div className="text-gray-600">{c.phone}</div>
                    <div className="text-gray-600 truncate">{c.email}</div>
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => handleEdit(c)}
                        className="text-blue-600"
                      >
                        <SquarePen size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(c._id)}
                        className="text-red-600"
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
      </div>

      {/* Modal */}
      {isSliderOpen && (
        <div className="fixed inset-0 bg-gray-600/50 flex items-center justify-center z-50">
          <div
            ref={sliderRef}
            className="w-full md:w-[800px] bg-white rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white rounded-t-2xl">
              <h2 className="text-xl font-bold text-newPrimary">
                {isEdit ? "Update Company" : "Add a New Company"}
              </h2>
              <button
                className="w-8 h-8 bg-newPrimary text-white rounded-full flex items-center justify-center hover:bg-newPrimary/70"
                onClick={() => setIsSliderOpen(false)}
              >
                ×
              </button>
            </div>

            {/* Form */}
            <div className="space-y-4 p-4 md:p-6">
              {/* Group + Company + Logo */}
              <div className="flex gap-4 flex-wrap">
                <div className="flex-1">
                  <label className="block text-gray-700 font-medium">
                    Group <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={group}
                    onChange={(e) => setGroup(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select Group</option>
                    {groupOptions.map((g) => (
                      <option key={g._id} value={g._id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-gray-700 font-medium">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="w-[200px]">
                  <div
                    className={`relative w-[85px] h-[85px] ${
                      !logo && "border-2 border-dashed border-newPrimary"
                    } rounded-full flex items-center justify-center cursor-pointer transition`}
                    onClick={() => document.getElementById("logoInput").click()}
                  >
                    {logo ? (
                      <img
                        src={URL.createObjectURL(logo)}
                        alt="Company Logo"
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <span className="text-newPrimary font-medium truncate text-[12px]">
                        Upload logo
                      </span>
                    )}
                    <input
                      id="logoInput"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setLogo(e.target.files[0])}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Email + Phone */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-gray-700 font-medium">
                  Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* Contact Person + Mobile */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={contactAddress}
                    onChange={(e) => setContactAddress(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium">
                    Mobile
                  </label>
                  <input
                    type="text"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              {/* Website */}
              <div>
                <label className="block text-gray-700 font-medium">
                  Website
                </label>
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* NTN + STRN */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium">NTN</label>
                  <input
                    type="text"
                    value={ntn}
                    onChange={(e) => setNtn(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium">
                    STRN
                  </label>
                  <input
                    type="text"
                    value={strn}
                    onChange={(e) => setStrn(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/80 w-full"
              >
                Save Company
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Company;
