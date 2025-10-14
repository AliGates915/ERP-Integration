import React from "react";
import { FiMail } from "react-icons/fi";

const Profile = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Card Container */}
      <div className="bg-white shadow rounded-xl overflow-hidden">
        {/* Header Banner */}
        <div className="h-28 bg-gradient-to-r from-blue-100 via-green-100 to-newPrimary"></div>

        {/* Profile Section */}
        <div className="p-6 -mt-14 flex items-center">
          {/* Avatar */}
          <img
            src="https://randomuser.me/api/portraits/women/68.jpg"
            alt="profile"
            className="w-20 h-20 rounded-full border-4 border-white shadow"
          />

          {/* Info */}
          <div className="ml-4 flex-1">
            <h2 className="text-xl font-semibold">Alexa Rawles</h2>
            <p className="text-gray-500 text-sm">alexarawles@gmail.com</p>
          </div>

          {/* Edit Button */}
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Edit
          </button>
        </div>

        {/* Form Section */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Your First Name"
              className="w-full mt-1 p-3 border rounded-md bg-gray-50"
            />
          </div>

          {/* Nick Name */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Nick Name
            </label>
            <input
              type="text"
              placeholder="Your First Name"
              className="w-full mt-1 p-3 border rounded-md bg-gray-50"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Gender
            </label>
            <select className="w-full mt-1 p-3 border rounded-md bg-gray-50">
              <option>Your First Name</option>
            </select>
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Country
            </label>
            <select className="w-full mt-1 p-3 border rounded-md bg-gray-50">
              <option>Your First Name</option>
            </select>
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Language
            </label>
            <select className="w-full mt-1 p-3 border rounded-md bg-gray-50">
              <option>Your First Name</option>
            </select>
          </div>

          {/* Time Zone */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Time Zone
            </label>
            <select className="w-full mt-1 p-3 border rounded-md bg-gray-50">
              <option>Your First Name</option>
            </select>
          </div>
        </div>

        {/* Email Section */}
        <div className="px-6 pb-6">
          <h3 className="font-semibold text-gray-800 mb-3">My Email Address</h3>
          <div className="flex items-center gap-3 bg-gray-50 border rounded-lg p-3 mb-3">
            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center">
              <FiMail size={18} />
            </div>
            <div>
              <p className="text-sm text-gray-800">alexarawles@gmail.com</p>
              <p className="text-xs text-gray-500">1 month ago</p>
            </div>
          </div>
          <button className="px-4 py-2 text-blue-600 text-sm border rounded-lg hover:bg-blue-50">
            + Add Email Address
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
