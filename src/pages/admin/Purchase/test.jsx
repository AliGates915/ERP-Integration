import React, { useState, useEffect, useRef } from "react";
import { SquarePen, Trash2 } from "lucide-react";
import CommanHeader from "../../../components/CommanHeader";
import TableSkeleton from "../Skeleton";
import Swal from "sweetalert2";

const Estimation = () => {
    const [estimations, setEstimations] = useState([]);
    const [isSliderOpen, setIsSliderOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [estimationId, setEstimationId] = useState("");
    const [supplier, setSupplier] = useState("");
    const [itemsList, setItemsList] = useState([]);
    const [itemName, setItemName] = useState("");
    const [itemQuantity, setItemQuantity] = useState("");
    const [forDemand, setForDemand] = useState("");
    const [rate, setRate] = useState("");
    const [total, setTotal] = useState("");
    const [date, setDate] = useState("");
    const [status, setStatus] = useState("Pending");
    const [editingEstimation, setEditingEstimation] = useState(null);
    const [errors, setErrors] = useState({});
    const sliderRef = useRef(null);

    // Static data for estimations
    const staticData = [
        {
            _id: "1",
            estimationId: "EST001",
            supplier: "ABC Corp",
            items: [{ name: "Dell XPS 15", qty: 5, rate: "1500", total: "7500" }],
            forDemand: "Laptops (5)",
            rate: "1500",
            total: "7500",
            date: "2025-09-01",
            status: true,
            createdAt: new Date().toISOString(),
        },
        {
            _id: "2",
            estimationId: "EST002",
            supplier: "XYZ Ltd",
            items: [{ name: "HP LaserJet", qty: 2, rate: "300", total: "600" }],
            forDemand: "Printers (2)",
            rate: "300",
            total: "600",
            date: "2025-09-15",
            status: false,
            createdAt: new Date().toISOString(),
        },
        {
            _id: "3",
            estimationId: "EST003",
            supplier: "Tech Solutions",
            items: [{ name: "Samsung 27\"", qty: 10, rate: "200", total: "2000" }],
            forDemand: "Monitors (10)",
            rate: "200",
            total: "2000",
            date: "2025-09-20",
            status: true,
            createdAt: new Date().toISOString(),
        },
    ];

    // Predefined items based on forDemand selection
    const demandItems = {
        "Office Supplies": [
            { name: "Paper A4", qty: 10, rate: "5", total: "50" },
            { name: "Pens", qty: 20, rate: "1", total: "20" },
        ],
        "IT Equipment": [
            { name: "Laptop", qty: 5, rate: "1000", total: "5000" },
            { name: "Monitor", qty: 3, rate: "200", total: "600" },
        ],
        "Furniture": [
            { name: "Office Chair", qty: 4, rate: "150", total: "600" },
            { name: "Desk", qty: 2, rate: "300", total: "600" },
        ],
        "Raw Materials": [
            { name: "Steel Sheets", qty: 50, rate: "20", total: "1000" },
            { name: "Wood Planks", qty: 30, rate: "15", total: "450" },
        ],
        "Services": [
            { name: "Consulting", qty: 1, rate: "500", total: "500" },
            { name: "Maintenance", qty: 1, rate: "200", total: "200" },
        ],
    };

    // Format date for display
    const formatDate = (date) => {
        if (!date) return "";
        return new Date(date).toISOString().split("T")[0];
    };

    // Load static data on mount
    useEffect(() => {
        setLoading(true);
        setEstimations(staticData);
        setTimeout(() => setLoading(false), 1000); // Simulate loading for 1 second
    }, []);

    // Reset form fields
    const resetForm = () => {
        setEstimationId("");
        setSupplier("");
        setItemsList([]);
        setItemName("");
        setItemQuantity("");
        setForDemand("");
        setRate("");
        setTotal("");
        setDate("");
        setStatus("Pending");
        setEditingEstimation(null);
        setErrors({});
        setIsSliderOpen(false);
    };

    // Update itemsList and rate/total when forDemand changes
    useEffect(() => {
        if (forDemand && !editingEstimation) {
            const selectedItems = demandItems[forDemand] || [];
            setItemsList(selectedItems);
            const totalRate = selectedItems.reduce((sum, item) => sum + parseFloat(item.rate), 0);
            const totalAmount = selectedItems.reduce((sum, item) => sum + parseFloat(item.total), 0);
            setRate(totalRate.toString());
            setTotal(totalAmount.toString());
        }
    }, [forDemand]);

    // Validate form fields
    const validateForm = () => {
        const newErrors = {};
        const trimmedEstimationId = estimationId.trim();
        const trimmedSupplier = supplier.trim();
        const trimmedForDemand = forDemand.trim();
        const trimmedRate = rate.trim();
        const trimmedTotal = total.trim();
        const parsedRate = parseFloat(rate);
        const parsedTotal = parseFloat(total);

        if (!trimmedEstimationId) newErrors.estimationId = "Estimation ID is required";
        if (!trimmedSupplier) newErrors.supplier = "Supplier is required";
        if (!trimmedForDemand) newErrors.forDemand = "For Demand is required";
        if (itemsList.length === 0) newErrors.itemsList = "At least one item is required";
        if (!trimmedRate || isNaN(parsedRate) || parsedRate <= 0) {
            newErrors.rate = "Rate must be a positive number";
        }
        if (!trimmedTotal || isNaN(parsedTotal) || parsedTotal <= 0) {
            newErrors.total = "Total must be a positive number";
        }
        if (!date) newErrors.date = "Date is required";
        if (!status) newErrors.status = "Status is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handlers for form and table actions
    const handleAddClick = () => {
        resetForm();
        setIsSliderOpen(true);
    };

    const handleEditClick = (estimation) => {
        setEditingEstimation(estimation);
        setEstimationId(estimation.estimationId);
        setSupplier(estimation.supplier);
        setItemsList(estimation.items);
        setItemName("");
        setItemQuantity("");
        setForDemand(estimation.forDemand);
        setRate(estimation.rate);
        setTotal(estimation.total);
        setDate(formatDate(estimation.date));
        setStatus(estimation.status ? "Active" : "Inactive");
        setErrors({});
        setIsSliderOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            Swal.fire({
                icon: "warning",
                title: "Missing or Invalid Fields",
                html: `Please correct the following errors:<br/><ul class='list-disc pl-5'>${Object.values(errors)
                    .map((err) => `<li>${err}</li>`)
                    .join("")}</ul>`,
                confirmButtonColor: "#d33",
            });
            return;
        }

        const newEstimation = {
            _id: editingEstimation ? editingEstimation._id : Date.now().toString(),
            estimationId: estimationId.trim(),
            supplier: supplier.trim(),
            items: itemsList,
            forDemand: forDemand.trim(),
            rate: rate.trim(),
            total: total.trim(),
            date,
            status: status === "Active",
            createdAt: new Date().toISOString(),
        };

        if (editingEstimation) {
            setEstimations(
                estimations.map((e) =>
                    e._id === editingEstimation._id ? newEstimation : e
                )
            );
            Swal.fire({
                icon: "success",
                title: "Updated!",
                text: "Estimation updated successfully.",
                confirmButtonColor: "#3085d6",
            });
        } else {
            setEstimations([...estimations, newEstimation]);
            Swal.fire({
                icon: "success",
                title: "Added!",
                text: "Estimation added successfully.",
                confirmButtonColor: "#3085d6",
            });
        }

        resetForm();
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
                text: "You won't be able to revert this!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, delete it!",
                cancelButtonText: "No, cancel!",
                reverseButtons: true,
            })
            .then((result) => {
                if (result.isConfirmed) {
                    setEstimations(estimations.filter((e) => e._id !== id));
                    swalWithTailwindButtons.fire(
                        "Deleted!",
                        "Estimation deleted successfully.",
                        "success"
                    );
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    swalWithTailwindButtons.fire(
                        "Cancelled",
                        "Estimation is safe 🙂",
                        "error"
                    );
                }
            });
    };

    return (
        <div className="p-4 bg-gray-50 min-h-screen">
            <CommanHeader />
            <div className="px-6 mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-newPrimary">
                            Estimation Details
                        </h1>
                    </div>
                    <button
                        className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/80"
                        onClick={handleAddClick}
                    >
                        + Add Estimation
                    </button>
                </div>

                <div className="rounded-xl shadow border border-gray-200 overflow-hidden">
                    <div className="overflow-y-auto lg:overflow-x-auto max-h-[400px]">
                        <div className="min-w-[1200px]">
                            {/* Table Header */}
                            <div className="hidden lg:grid grid-cols-[1fr_1fr_3fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-6 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200">
                                <div>Estimation ID</div>
                                <div>Supplier</div>
                                <div>Items</div>
                                <div>For Demand</div>
                                <div>Rate</div>
                                <div>Total</div>
                                <div>Date</div>
                                <div>Status</div>
                                <div>Actions</div>
                            </div>

                            {/* Table Body */}
                            <div className="flex flex-col divide-y divide-gray-100">
                                {loading ? (
                                    <TableSkeleton
                                        rows={3}
                                        cols={9}
                                        className="lg:grid-cols-[1fr_1fr_3fr_1fr_1fr_1fr_1fr_1fr_1fr]"
                                    />
                                ) : estimations.length === 0 ? (
                                    <div className="text-center py-4 text-gray-500 bg-white">
                                        No estimations found.
                                    </div>
                                ) : (
                                    estimations.map((estimation) => (
                                        <div
                                            key={estimation._id}
                                            className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_3fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] items-center gap-6 px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                                        >
                                            <div className="font-medium text-gray-900">{estimation.estimationId}</div>
                                            <div className="text-gray-600">{estimation.supplier}</div>
                                            <div className="text-gray-600">
                                                <div className="flex flex-wrap gap-2">
                                                    {estimation.items.map((item, idx) => (
                                                        <div key={idx} className="flex gap-2">
                                                            <span
                                                                className="px-3 py-1 rounded-full text-xs font-medium"
                                                                style={{
                                                                    backgroundColor: `hsl(${(idx * 70) % 360}, 80%, 85%)`,
                                                                    color: `hsl(${(idx * 70) % 360}, 40%, 25%)`,
                                                                }}
                                                            >
                                                                {item.name}
                                                            </span>
                                                            <span
                                                                className="px-3 py-1 rounded-full text-xs font-medium"
                                                                style={{
                                                                    backgroundColor: `hsl(${(idx * 70 + 35) % 360}, 80%, 85%)`,
                                                                    color: `hsl(${(idx * 70 + 35) % 360}, 40%, 25%)`,
                                                                }}
                                                            >
                                                                Qty: {item.qty}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="text-gray-600">{estimation.forDemand}</div>
                                            <div className="text-gray-600">{estimation.rate}</div>
                                            <div className="text-gray-600">{estimation.total}</div>
                                            <div className="text-gray-500">{formatDate(estimation.date)}</div>
                                            <div className="text-gray-600">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs ${estimation.status
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-red-100 text-red-800"
                                                        }`}
                                                >
                                                    {estimation.status ? "Active" : "Inactive"}
                                                </span>
                                            </div>
                                            <div>
                                                <button
                                                    onClick={() => handleEditClick(estimation)}
                                                    className=" py-1 text-sm rounded text-blue-600 hover:bg-blue-50 transition-colors"
                                                    title="Edit"
                                                >
                                                    <SquarePen size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(estimation._id)}
                                                    className="px-3 py-1 text-sm rounded text-red-600 hover:bg-red-50 transition-colors"
                                                    title="Delete"
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

                {isSliderOpen && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-end z-50">
                        <div
                            ref={sliderRef}
                            className="w-full max-w-md bg-white p-4 h-full overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-newPrimary">
                                    {editingEstimation ? "Update Estimation" : "Add a New Estimation"}
                                </h2>
                                <button
                                    className="text-2xl text-gray-500 hover:text-gray-700"
                                    onClick={resetForm}
                                >
                                    ×
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">
                                        Estimation ID <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={estimationId}
                                        onChange={(e) => setEstimationId(e.target.value)}
                                        className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                                            errors.estimationId
                                                ? "border-red-500 focus:ring-red-500"
                                                : "border-gray-300 focus:ring-newPrimary"
                                        }`}
                                        placeholder="Enter estimation ID"
                                        required
                                    />
                                    {errors.estimationId && (
                                        <p className="text-red-500 text-xs mt-1">{errors.estimationId}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">
                                        Supplier <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={supplier}
                                        onChange={(e) => setSupplier(e.target.value)}
                                        className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                                            errors.supplier
                                                ? "border-red-500 focus:ring-red-500"
                                                : "border-gray-300 focus:ring-newPrimary"
                                        }`}
                                        required
                                    >
                                        <option value="">Select Supplier</option>
                                        <option value="ABC Corp">ABC Corp</option>
                                        <option value="XYZ Ltd">XYZ Ltd</option>
                                        <option value="Tech Solutions">Tech Solutions</option>
                                        <option value="Global Supplies">Global Supplies</option>
                                    </select>
                                    {errors.supplier && (
                                        <p className="text-red-500 text-xs mt-1">{errors.supplier}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">
                                        For Demand <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={forDemand}
                                        onChange={(e) => setForDemand(e.target.value)}
                                        className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                                            errors.forDemand
                                                ? "border-red-500 focus:ring-red-500"
                                                : "border-gray-300 focus:ring-newPrimary"
                                        }`}
                                        required
                                    >
                                        <option value="">Select Item</option>
                                        <option value="Office Supplies">Office Supplies</option>
                                        <option value="IT Equipment">IT Equipment</option>
                                        <option value="Furniture">Furniture</option>
                                        <option value="Raw Materials">Raw Materials</option>
                                        <option value="Services">Services</option>
                                    </select>
                                    {errors.forDemand && (
                                        <p className="text-red-500 text-xs mt-1">{errors.forDemand}</p>
                                    )}
                                </div>
                                {forDemand && itemsList.length > 0 && (
                                    <div className="overflow-x-auto">
                                        <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                                            <thead className="bg-gray-100 text-gray-600 text-sm">
                                                <tr>
                                                    <th className="px-4 py-2 border-b">Sr #</th>
                                                    <th className="px-4 py-2 border-b">Item Name</th>
                                                    <th className="px-4 py-2 border-b">Quantity</th>
                                                    <th className="px-4 py-2 border-b">Rate</th>
                                                    <th className="px-4 py-2 border-b">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-gray-700 text-sm">
                                                {itemsList.map((item, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-50">
                                                        <td className="px-4 py-2 border-b text-center">{idx + 1}</td>
                                                        <td className="px-4 py-2 border-b">{item.name}</td>
                                                        <td className="px-4 py-2 border-b text-center">{item.qty}</td>
                                                        <td className="px-4 py-2 border-b text-center">${item.rate}</td>
                                                        <td className="px-4 py-2 border-b text-center">${item.total}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">
                                        Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                                            errors.date
                                                ? "border-red-500 focus:ring-red-500"
                                                : "border-gray-300 focus:ring-newPrimary"
                                        }`}
                                        required
                                    />
                                    {errors.date && (
                                        <p className="text-red-500 text-xs mt-1">{errors.date}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">
                                        Status <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                                            errors.status
                                                ? "border-red-500 focus:ring-red-500"
                                                : "border-gray-300 focus:ring-newPrimary"
                                        }`}
                                        required
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                    {errors.status && (
                                        <p className="text-red-500 text-xs mt-1">{errors.status}</p>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-newPrimary text-white px-4 py-3 rounded-lg hover:bg-newPrimary/80 transition-colors disabled:bg-blue-300"
                                >
                                    {loading ? "Saving..." : editingEstimation ? "Update Estimation" : "Save Estimation"}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                <style jsx>{`
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
                `}</style>
            </div>
        </div>
    );
};

export default Estimation;