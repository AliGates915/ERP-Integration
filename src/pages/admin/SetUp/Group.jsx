import React, { useState, useEffect, useRef, useCallback } from "react";
import { HashLoader } from "react-spinners";
import gsap from "gsap";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import CommanHeader from "../../../components/CommanHeader";
import { SquarePen, Trash2 } from "lucide-react";
import TableSkeleton from "../Skeleton";

const Group = () => {
  const [groupList, setGroupList] = useState([]);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const sliderRef = useRef(null);

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const API_URL = `${import.meta.env.VITE_API_BASE_URL}/groups`;

  // ✅ GSAP animation for modal
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

  // ✅ Fetch Groups
  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      setGroupList(res.data);
    } catch (error) {
      console.error("Failed to fetch groups:", error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // ✅ Add / Update group
  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Group name is required!");
      return;
    }

    const payload = { name, description };

    try {
      const headers = {
        Authorization: `Bearer ${userInfo?.token}`,
        "Content-Type": "application/json",
      };
      if (isEdit && editId) {
        await axios.put(`${API_URL}/${editId}`, payload, { headers });
        toast.success("Group updated successfully!");
      } else {
        const res = await axios.post(API_URL, payload, { headers });
        setGroupList([...groupList, res.data]);
        toast.success("Group added successfully!");
      }

      setIsSliderOpen(false);
      setIsEdit(false);
      setEditId(null);
      setName("");
      setDescription("");
      fetchGroups();
    } catch (error) {
      console.error("Error saving group:", error);
      toast.error(error?.response?.data?.message || "Something went wrong!");
    }
  };

  // ✅ Edit group
  const handleEdit = (g) => {
    setIsEdit(true);
    setEditId(g._id);
    setName(g.name);
    setDescription(g.description);
    setIsSliderOpen(true);
  };

  // ✅ Delete group
  const handleDelete = async (id) => {
    const swal = Swal.mixin({
      customClass: {
        actions: "space-x-2",
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
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, cancel!",
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          try {
            await axios.delete(`${API_URL}/${id}`, {
              headers: { Authorization: `Bearer ${userInfo?.token}` },
            });
            setGroupList(groupList.filter((g) => g._id !== id));
            swal.fire("Deleted!", "Group deleted successfully.", "success");
          } catch (error) {
            swal.fire("Error!", "Failed to delete group.", "error");
          }
        }
      });
  };

  // ✅ Add Button handler
  const handleAdd = () => {
    setIsEdit(false);
    setEditId(null);
    setName("");
    setDescription("");
    setIsSliderOpen(true);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <CommanHeader />
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-newPrimary">Group List</h1>
          <p className="text-gray-500 text-sm">
            Manage and organize your groups
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/90"
        >
          + Add Group
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="hidden lg:grid grid-cols-[150px_2fr_3fr_auto] gap-6 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase border-b">
              <div>ID</div>
              <div>Group Name</div>
              <div>Description</div>
              <div className="text-right">Actions</div>
            </div>

            <div className="flex flex-col divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
              {loading ? (
                <TableSkeleton rows={5} cols={4} />
              ) : groupList.length === 0 ? (
                <div className="text-center py-4 text-gray-500 bg-white">
                  No groups found.
                </div>
              ) : (
                groupList.map((g) => (
                  <div
                    key={g._id}
                    className="hidden lg:grid grid-cols-[150px_2fr_3fr_auto] items-center gap-6 px-6 py-4 text-sm bg-white hover:bg-gray-50"
                  >
                    <div>{g._id?.slice(0, 6)}</div>
                    <div className="font-semibold text-gray-800">{g.name}</div>
                    <div className="text-gray-600 truncate">
                      {g.description || "-"}
                    </div>
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => handleEdit(g)}
                        className="text-blue-600 hover:underline"
                      >
                        <SquarePen size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(g._id)}
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

      {/* Modal */}
      {isSliderOpen && (
        <div className="fixed inset-0 bg-gray-600/50 flex items-center justify-center z-50">
          <div
            ref={sliderRef}
            className="w-full md:w-[600px] bg-white rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white rounded-t-2xl">
              <h2 className="text-xl font-bold text-newPrimary">
                {isEdit ? "Update Group" : "Add a New Group"}
              </h2>
              <button
                className="w-8 h-8 bg-newPrimary text-white rounded-full flex items-center justify-center hover:bg-newPrimary/70"
                onClick={() => setIsSliderOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="space-y-4 p-4 md:p-6">
              <div>
                <label className="block text-gray-700 font-medium">
                  Group Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Enter group name"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Enter description"
                />
              </div>

              <button
                onClick={handleSave}
                className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/80 w-full"
              >
                Save Group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Group;
