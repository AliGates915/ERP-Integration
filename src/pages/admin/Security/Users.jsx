import React, { useState, useCallback, useEffect, useRef } from "react";
import gsap from "gsap";
import { toast } from "react-toastify";
import axios from "axios";
import { HashLoader } from "react-spinners";
import Swal from "sweetalert2";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

import { FiSearch, FiPlus, FiKey } from "react-icons/fi";

import CommanHeader from "../../../components/CommanHeader";
import { SquarePen, Trash2 } from "lucide-react";
import TableSkeleton from "../Skeleton";

const Users = () => {
  const [userList, setUserList] = useState([]);
  const [groupList, setGroupList] = useState([]);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [isChangePassword, setIsChangePassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [designation, setDesignation] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  const sliderRef = useRef(null);

  // Filter user list based on search query
  const filteredUserList = userList.filter(
    (user) =>
      user?.groupName?.groupName
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.designation?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddUser = () => {
    setIsChangePassword(false);
    setIsSliderOpen(true);
  };


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

  // Fetch users Data
  const fetchCompanyUser = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/group-users`
      );
      const result = await response.json();
      setUserList(result);
    } catch (error) {
      console.error("Error fetching expense head data:", error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);

  // Fetch users Data
  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/groups`
      );
      const result = await response.json();
      setGroupList(result);
    } catch (error) {
      console.error("Error fetching expense head data:", error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);

  useEffect(() => {
    fetchCompanyUser();
    fetchGroups();
  }, [fetchCompanyUser, fetchGroups]);

  // Token
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  // Save User Data
  const handleSave = async () => {
    const payload = {
      name,
      email,
      number: mobileNumber,
      designation,
      password,
      groupName: selectedGroup,
    };

    try {
      const { token } = JSON.parse(localStorage.getItem("userInfo")) || {};
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      let response;
      if (isEdit && editId) {
        response = await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/group-users/${editId}`,
          payload,
          { headers }
        );
        toast.success("Company User updated successfully!");
      } else {
        response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/group-users`,
          payload,
          { headers }
        );
        toast.success("Company User saved successfully!");
        fetchCompanyUser();
      }

      // Reset fields
      setEditId(null);
      setIsEdit(false);
      setIsSliderOpen(false);
      setName("");
      setEmail("");
      setMobileNumber("");
      setDesignation("");
      setSelectedGroup("");
      setPassword("");
    } catch (error) {
      console.error(
        "Error creating company user:",
        error.response?.data || error.message
      );
      toast.error(`❌ ${isEdit ? "Update" : "Add"} user failed`);
    }
  };

  // Change Password
  const handleChangePassword = async () => {
    const formData = new FormData();
    formData.append("password", newPassword);

    try {
      const { token } = JSON.parse(localStorage.getItem("userInfo")) || {};
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      };

      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/users/${editId}/password`,
        formData,
        { headers }
      );
      toast.success("✅ Password changed successfully");

      // Reset fields
      setIsChangePassword(false);
      setIsSliderOpen(false);
      setEditId(null);
      setNewPassword("");
    } catch (error) {
      console.error(error);
      toast.error("❌ Password change failed");
    }
  };

  // Edit User
  const handleEdit = (user) => {
    setIsChangePassword(false);
    setIsEdit(true);
    setEditId(user._id);
    setSelectedGroup(user.groupName?._id || "");
    setName(user.name || "");
    setEmail(user.email || "");
    setMobileNumber(user.number || "");
    setDesignation(user.designation || "");
    setPassword("");
    setIsSliderOpen(true);
  };

  // Open Change Password Form
  const handleOpenChangePassword = (user) => {
    setIsChangePassword(true);
    setEditId(user._id);
    setName(user.name || "");
    setIsSliderOpen(true);
  };

  // Delete User
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
              `${import.meta.env.VITE_API_BASE_URL}/group-users/${id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            setUserList(userList.filter((p) => p._id !== id));
            swalWithTailwindButtons.fire(
              "Deleted!",
              "User deleted successfully.",
              "success"
            );
          } catch (error) {
            console.error("Delete error:", error);
            swalWithTailwindButtons.fire(
              "Error!",
              "Failed to delete User.",
              "error"
            );
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire("Cancelled", "User is safe 🙂", "error");
        }
      });
  };

  const togglePasswordVisibility = (userId) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
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
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Coomon header */}
      <CommanHeader />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-newPrimary">
            User List
          </h1>
          <p className="text-gray-500 text-sm">User Management Dashboard</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
            />
          </div>

          <button
            className="bg-newPrimary text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-primaryDark transition-all shadow-md hover:shadow-lg"
            onClick={handleAddUser}
          >
            <FiPlus className="text-lg" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* User Table */}
      <div className="rounded-xl  border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="min-w-full">
            {/* ✅ Table Header (desktop only, sticky like previous tables) */}
            <div className="hidden md:grid grid-cols-7 gap-6 bg-gray-50 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200">
              <div>Group</div>
              <div>Name</div>
              <div>Email</div>
              <div>Mobile Number</div>
              <div>Designation</div>
              <div>Password</div>
              {userInfo?.isAdmin && <div className="text-right">Actions</div>}
            </div>

            {/* ✅ Table Body */}
            <div className="flex flex-col divide-y divide-gray-100">
              {loading ? (
                // Skeleton shown while loading
                <TableSkeleton

                  rows={filteredUserList.length>0?filteredUserList.length:5}

                  cols={userInfo?.isAdmin ? 7 : 6}
                  className="lg:grid-cols-7"
                />
              ) : filteredUserList.length > 0 ? (
                filteredUserList.map((user) => (
                  <div
                    key={user._id}
                    className="grid grid-cols-1 md:grid-cols-7 gap-6 items-center px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                  >
                    {/* 📱 Mobile view header */}
                    <div className="md:hidden flex justify-between items-center border-b pb-2 mb-2">
                      <div className="text-sm font-medium text-gray-900">
                        {user.name}
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {user.groupName?.groupName}
                        </span>
                      </div>
                    </div>

                    {/* 💻 Desktop cells */}
                    <div className="hidden md:block text-sm font-medium text-gray-900 truncate">
                      {user.groupName?.groupName}
                    </div>
                    <div className="hidden md:block text-sm font-medium text-gray-900 truncate">
                      {user.name}
                    </div>
                    <div className="hidden md:block text-sm text-gray-500 truncate">
                      {user.email}
                    </div>
                    <div className="hidden md:block text-sm text-gray-500 truncate">
                      {user.number}
                    </div>
                    <div className="hidden md:block text-sm text-gray-500 truncate">
                      {user.designation}
                    </div>

                    {/* 📱 Mobile detail rows */}
                    <div className="md:hidden grid grid-cols-2 gap-2 mt-2 text-sm">
                      <div className="text-xs text-gray-500">Email:</div>
                      <div>{user.email}</div>

                      <div className="text-xs text-gray-500">Mobile:</div>
                      <div>{user.number}</div>

                      <div className="text-xs text-gray-500">Designation:</div>
                      <div>{user.designation}</div>

                      <div className="text-xs text-gray-500">Password:</div>
                      <div className="flex items-center">
                        {visiblePasswords[user._id] ? user.password : "•••••"}
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(user._id)}
                          className="ml-2 text-gray-600 hover:text-gray-800"
                        >
                          {visiblePasswords[user._id] ? (
                            <AiOutlineEyeInvisible />
                          ) : (
                            <AiOutlineEye />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* 💻 Password - Desktop */}
                    <div className="hidden md:flex items-center text-gray-500">
                      {visiblePasswords[user._id] ? user.password : "•••••"}
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility(user._id)}
                        className="ml-2 text-gray-600 hover:text-gray-800"
                      >
                        {visiblePasswords[user._id] ? (
                          <AiOutlineEyeInvisible />
                        ) : (
                          <AiOutlineEye />
                        )}
                      </button>
                    </div>

                    {/* ⚙️ Actions */}
                    {userInfo?.isAdmin && (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 text-blue-600  rounded-lg transition-colors"
                        >
                          <SquarePen size={18} />
                        </button>
                        <button
                          onClick={() => handleOpenChangePassword(user)}
                          className="p-2 text-yellow-600 rounded-lg transition-colors"
                        >
                          <FiKey size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="p-2 text-red-600 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500 bg-white">
                  No users found {searchQuery && `matching "${searchQuery}"`}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>


      {isSliderOpen && (
        <div className="fixed inset-0 bg-gray-600/50 flex items-center justify-center z-50">
          <div
            ref={sliderRef}
            className="w-full md:w-[500px] bg-white rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white rounded-t-2xl">
              <h2 className="text-xl font-bold text-newPrimary">
                {isEdit ? "Edit Right" : "Add User"}
              </h2>
              <button
                className="w-8 h-8 bg-newPrimary text-white rounded-full flex items-center justify-center hover:bg-newPrimary/70"

                onClick={() => setIsSliderOpen(false)}
              >
                &times;
              </button>
            </div>
            <div className="p-4 md:p-6 space-y-5">
              {/* User Section */}
              <div className="space-y-5">
                {isChangePassword ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        disabled
                        className="w-full p-2.5 border border-gray-300 rounded-lg bg-gray-100 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary transition-all"
                        placeholder="Enter new password"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        Groups
                      </label>
                      <select
                        value={selectedGroup}
                        onChange={(e) => setSelectedGroup(e.target.value)}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary transition-all"
                      >
                        <option value="">Select Group</option>
                        {groupList.map((group) => (
                          <option key={group._id} value={group._id}>
                            {group.groupName || ""}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary transition-all"
                        placeholder="Enter name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary transition-all"
                        placeholder="Enter email"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        Mobile Number
                      </label>
                      <input
                        type="text"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary transition-all"
                        placeholder="Enter mobile number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        Designation
                      </label>
                      <input
                        type="text"
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary transition-all"
                        placeholder="Enter designation"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        Password
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary transition-all"
                        placeholder={
                          isEdit
                            ? "Enter new password (optional)"
                            : "Enter password"
                        }
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  className="px-4 md:px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => setIsSliderOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="bg-newPrimary text-white px-4 md:px-6 py-2 rounded-lg hover:bg-primaryDark transition-colors duration-200"
                  onClick={isChangePassword ? handleChangePassword : handleSave}
                >
                  {isChangePassword
                    ? "Change Password"
                    : isEdit
                    ? "Update User"
                    : "Save User"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
