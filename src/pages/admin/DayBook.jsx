import React, { useState, useCallback, useEffect } from "react";
import { HashLoader } from "react-spinners";
import { format } from "date-fns";
import CommanHeader from "../../components/CommanHeader";

// Static data for day book entries

const DayBook = () => {
  const [dayBookList, setDayBookList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Fetch Day Book Data
  const fetchDayBookData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/dayBook`);
      const result = await response.json();
     
      setDayBookList(result);
    } catch (error) {
      console.error("Error fetching day book data:", error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);

  useEffect(() => {
    fetchDayBookData();
  }, [fetchDayBookData]);


  // Filter day book entries based on date range
  const filteredDayBookList = Array.isArray(dayBookList)
    ? dayBookList.filter((entry) => {
      const entryDate = new Date(entry.date);
      const from = fromDate ? new Date(fromDate) : null;
      const to = toDate ? new Date(toDate) : null;

      if (from && to) {
        return entryDate >= from && entryDate <= to;
      } else if (from) {
        return entryDate >= from;
      } else if (to) {
        return entryDate <= to;
      }
      return true;
    })
    : [];

  // Show loading spinner
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <HashLoader
            height="150"
            width="150"
            radius={1}
            color="#84CF16"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Coomon header */}
      <CommanHeader/>
      <div>
        <h1 className="text-2xl font-bold text-newPrimary">Day Book List</h1>
        <p className="text-gray-500 text-sm">Day Book Management Dashboard</p>
      </div>

      {/* Date Picker Section */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Day Book Table */}
      <div className="rounded-xl shadow p-6 border border-gray-100 w-full overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="w-full">
            {/* Table Headers */}
            <div className="hidden lg:grid grid-cols-3 gap-4 bg-gray-50 py-3 px-6 text-xs font-medium text-gray-500 uppercase rounded-lg">
              <div>Date</div>
              <div>Sales</div>
              <div>Expense</div>
            </div>

            {/* Day Book Table */}
            <div className="mt-4 flex flex-col gap-[14px] pb-14">
              {filteredDayBookList.map((entry, index) => (
                <div
                  key={index}
                  className="grid grid-cols-3 items-center gap-4 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100"
                >
                  {/* Date */}
                  <div className="text-sm font-medium text-gray-900">
                    {entry.date ? format(new Date(entry.date), "yyyy-MM-dd") : "" }
                  </div>

                  {/* Sales */}
                  <div className="text-sm font-semibold text-green-600">
                    ${entry.sales.toLocaleString()}
                  </div>

                  {/* Expense */}
                  <div className="text-sm text-gray-500">
                    ${entry.expense.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayBook;