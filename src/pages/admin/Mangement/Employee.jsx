import React, { useState, useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import CommanHeader from "../../../components/CommanHeader";
import { SquarePen, Trash2 } from "lucide-react";
import TableSkeleton from "../Skeleton";
import axios from "axios";

const Employee = () => {
  const [employeeList, setEmployeeList] = useState([]);

  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [employeeName, setEmployeeName] = useState("");
  const [department, setDepartment] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [gender, setGender] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [nic, setNic] = useState("");
  const [dob, setDob] = useState("");
  const [qualification, setQualification] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [enable, setEnable] = useState(true);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const sliderRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [departmentList, setDepartmentList] = useState([]);
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const API_URL = `${import.meta.env.VITE_API_BASE_URL}/employees`;
  const DEPARTMENT_URL = `${import.meta.env.VITE_API_BASE_URL}/departments`;

  // GSAP Animation for Modal
  useEffect(() => {
    if (isSliderOpen) {
      if (sliderRef.current) {
        sliderRef.current.style.display = "block"; // ensure visible before animation
      }
      gsap.fromTo(
        sliderRef.current,
        { scale: 0.7, opacity: 0, y: -50 }, // start smaller & slightly above
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

  // Fetch Department list
  const fetchDepartmentList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${DEPARTMENT_URL}`);
      setDepartmentList(res?.data);
    
    } catch (error) {
      console.error("Failed to fetch Supplier", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  }, []);
  useEffect(() => {
    fetchDepartmentList();
  }, [fetchDepartmentList]);

  // Fetch Department Table list
  const fetchDepartmentTableList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}`);
      setEmployeeList(res?.data);
    
    } catch (error) {
      console.error("Failed to fetch Supplier", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  }, []);
  useEffect(() => {
    fetchDepartmentTableList();
  }, [fetchDepartmentTableList]);

  // Handlers
  const handleAddEmployee = () => {
    setIsSliderOpen(true);
    setIsEdit(false);
    setEditId(null);
    setEmployeeName("");
    setDepartment("");
    setAddress("");
    setCity("");
    setGender("");
    setPhoneNumber("");
    setNic("");
    setDob("");
    setQualification("");
    setBloodGroup("");
    setEnable(true);
  };

  const handleSave = async () => {
    if (!employeeName || !department) {
      toast.error("❌ Employee name and department are required");
      return;
    }
    const { token } = userInfo || {};
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const newEmployee = {
      departmentId: departmentList.find(
        (dept) => dept.departmentName === department
      )?._id,
      employeeName,
      address,
      city,
      gender,
      mobile: phoneNumber,
      nicNo: nic,
      dob,
      qualification,
      bloodGroup,
      isEnable: enable,
    };

    if (isEdit && editId) {
      const res = await axios.put(`${API_URL}/${editId}`, newEmployee, {
        headers,
      });
      toast.success(" Employee updated successfully");
    } else {
      const res = await axios.post(API_URL, newEmployee, {
        headers,
      });
      toast.success(" Employee added successfully");
    }
    fetchDepartmentTableList();
    setIsSliderOpen(false);
  };

  const handleEdit = (emp) => {
    setIsEdit(true);
    setEditId(emp._id);
    setEmployeeName(emp.employeeName);
    setDepartment(emp.departmentId?.departmentName || "");
    setAddress(emp.address);
    setCity(emp.city);
    setGender(emp.gender);
    setPhoneNumber(emp.mobile || "");
    setNic(emp.nicNo || "");
    setDob(emp.dob ? emp.dob.split("T")[0] : "");
    setQualification(emp.qualification);
    setBloodGroup(emp.bloodGroup);
    setEnable(emp.isEnable);
    setIsSliderOpen(true);
  };

  // Date formating
  const formatDate = (date) => {
    if (!date) return "N/A";

    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) return "Invalid Date";

    const day = String(parsed.getDate()).padStart(2, "0");
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    const year = parsed.getFullYear();

    return `${day}-${month}-${year}`; // DD-MM-YYYY
  };

  const handleDelete = (id) => {
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
        text: "You want to delete this employee?",
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

            setEmployeeList(employeeList.filter((emp) => emp._id !== id));
            swalWithTailwindButtons.fire(
              "Deleted!",
              "Employee has been deleted.",
              "success"
            );
          } catch (error) {
            console.error("Delete error:", error);
            swalWithTailwindButtons.fire(
              "Error!",
              "Failed to delete department.",
              "error"
            );
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire(
            "Cancelled",
            "Employee is safe 🙂",
            "error"
          );
        }
      });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Common header */}
      <CommanHeader />
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-newPrimary">Employees</h1>
          <p className="text-gray-500 text-sm">Manage your employee details</p>
        </div>
        <button
          className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/90"
          onClick={handleAddEmployee}
        >
          + Add Employee
        </button>
      </div>

      {/* Employee Table */}
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[1200px]">
            {/* ✅ Table Header */}
            <div className="hidden lg:grid grid-cols-9 gap-6 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200">
              <div>ID</div>
              <div>Name</div>
              <div>Department</div>
              <div>Phone</div>
              <div>NIC</div>
              <div>DOB</div>
              <div>Qualification</div>
              <div>Status</div>
              <div className="text-right">Actions</div>
            </div>

            {/* ✅ Table Body */}
            <div className="flex flex-col divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
              {loading ? (
                <TableSkeleton
                  rows={employeeList.length > 0 ? employeeList.length : 5}
                  cols={9}
                  className="lg:grid-cols-9"
                />
              ) : employeeList.length === 0 ? (
                <div className="text-center py-4 text-gray-500 bg-white">
                  No employee found.
                </div>
              ) : (
                employeeList.map((emp) => (
                  <div
                    key={emp._id}
                    className="hidden lg:grid grid-cols-9 items-center gap-6 px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                  >
                    <div className="font-medium text-gray-900">
                      {emp._id?.slice(0, 6)}
                    </div>
                    <div className="text-gray-700">{emp?.employeeName}</div>
                    <div className="text-gray-600">
                      {emp?.departmentId?.departmentName}
                    </div>
                    <div className="text-gray-600">{emp?.mobile}</div>
                    <div className="text-gray-600">{emp?.nicNo}</div>
                    <div className="text-gray-600">{formatDate(emp.dob)}</div>
                    <div className="text-gray-600">{emp?.qualification}</div>
                    <div className=" font-semibold">
                      {emp?.isEnable ? (
                        <span className="text-green-600 bg-green-50 px-3 py-1 rounded-[5px]">
                          Enabled
                        </span>
                      ) : (
                        <span className="text-red-600 bg-red-50 px-3 py-1 rounded-[5px]">
                          Disabled
                        </span>
                      )}
                    </div>

                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => handleEdit(emp)}
                        className="text-blue-600 hover:underline"
                      >
                        <SquarePen size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(emp._id)}
                        className="text-red-600 hover:underline"
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

      {/* Slider Form */}
      {isSliderOpen && (
        <div className="fixed inset-0 bg-gray-600/50 flex items-center justify-center z-50">
          <div
            ref={sliderRef}
            className="w-full md:w-[800px] bg-white rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white rounded-t-2xl">
              <h2 className="text-xl font-bold text-newPrimary">
                {isEdit ? "Update Employee" : "Add a New Employee"}
              </h2>
              <button
                className="w-8 h-8 bg-newPrimary text-white rounded-full flex items-center justify-center hover:bg-newPrimary/70"
                onClick={() => {
                  setIsSliderOpen(false);
                  setIsEdit(false);
                  setEditId(null);
                  setEmployeeName("");
                  setDepartment("");
                  setAddress("");
                  setCity("");
                  setGender("");
                  setPhoneNumber("");
                  setNic("");
                  setDob("");
                  setQualification("");
                  setBloodGroup("");
                  setEnable(true);
                }}
              >
                ×
              </button>
            </div>

            <div className="space-y-4 p-4 md:p-6">
              <div className="flex gap-4">
                <div className="flex-1 min-w-0">
                  <label className="block text-gray-700 font-medium">
                    Name <span className="text-red-500">*</span>{" "}
                  </label>
                  <input
                    type="text"
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-gray-700 font-medium">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select Department</option>
                    {departmentList.map((dept) => (
                      <option key={dept._id} value={dept.departmentName}>
                        {dept.departmentName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 min-w-0">
                  <label className="block text-gray-700 font-medium">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-gray-700 font-medium">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 min-w-0">
                  <label className="block text-gray-700 font-medium">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-gray-700 font-medium">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 min-w-0">
                  <label className="block text-gray-700 font-medium">
                    NIC <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={nic}
                    onChange={(e) => setNic(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-gray-700 font-medium">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 min-w-0">
                  <label className="block text-gray-700 font-medium">
                    Qualification <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-gray-700 font-medium">
                    Blood Group <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
              {/* Enable Toggle */}
              <div className="flex items-center gap-3">
                <label className="text-gray-700 font-medium">Enable</label>
                <button
                  type="button"
                  onClick={() => setEnable(!enable)}
                  className={`w-14 h-7 flex items-center rounded-full p-1 transition-colors duration-300 ${
                    enable ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                      enable ? "translate-x-7" : "translate-x-0"
                    }`}
                  />
                </button>
                <span>{enable ? "Enabled" : "Disabled"}</span>
              </div>

              <button
                className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/80 w-full"
                onClick={handleSave}
              >
                Save Employee
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employee;
