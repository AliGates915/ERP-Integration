import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/admin/Login";
import Signup from "./pages/admin/Signup";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ItemList from "./pages/admin/ItemList.jsx";
import CustomerData from "./pages/admin/CustomerData";
import { ToastContainer } from "react-toastify";
import ShelveLocation from "./pages/admin/SetUp/ShelveLocation.jsx";
import "react-toastify/dist/ReactToastify.css";
import CategoryItem from "./pages/admin/SetUp/CategoryItem.jsx";
import ProtectedRoute from "./components/ProtectedRoute";
import SupplierList from "./pages/admin/SetUp/Supplier.jsx";
import Manufacture from "./pages/admin/SetUp/Manufacture.jsx";
import ItemBarcode from "./pages/admin/ItemBarcode";
import SalesInvoice from "./pages/admin/SalesInvoice";
import ExpiryTags from "./pages/admin/ExpiryTags";
import BookingOrder from "./pages/admin/BookingOrder";
import ItemUnit from "./pages/admin/SetUp/ItemUnit.jsx";

import Users from "./pages/admin/Security/Users.jsx";
import GroupManagement from "./pages/admin/Security/GroupManagement.jsx";
import Modules from "./pages/admin/Modules";
import AccessControll from "./pages/admin/Security/AccessControll.jsx";
import ExpenseHead from "./pages/admin/ExpenseHead.jsx";
import ExpenseVoucher from "./pages/admin/ExpenseVoucher.jsx";
import DayBook from "./pages/admin/DayBook.jsx";
import ItemType from "./pages/admin/Functionalities/ItemType.jsx";
import Promotion from "./pages/admin/SetUp/PromotionDetail.jsx";
import PromotionItem from "./pages/admin/SetUp/PromotionItem.jsx";
import OpeningBalance from "./pages/admin/OpeningBalance.jsx";
import ScrollToTop from "./helper/ScrollToTop.jsx";
import Designation from "./pages/admin/Mangement/Designation.jsx";

import Departments from "./pages/admin/Mangement/Departments.jsx";
import Employee from "./pages/admin/Mangement/Employee.jsx";

import RateList from "./pages/admin/Sales/RateList.jsx";
import DistributionRateList from "./pages/admin/Sales/DistributionRateList.jsx";
import BookingOrders from "./pages/admin/Sales/BookingOrders.jsx";
import DeliveryChallan from "./pages/admin/Functionalities/DeliveryChallan.jsx";
import SalesInvoices from "./pages/admin/Functionalities/SalesInvoices.jsx";
// import PaymentReceiptVoucher from "./pages/admin/Reports/PaymentReceiptVoucher.jsx";
import CustomerLedger from "./pages/admin/Sales/CustomerLedger.jsx";
import Receivable from "./pages/admin/Sales/Receivable.jsx";
import SalesReturn from "./pages/admin/Functionalities/SalesReturn.jsx";
import StoreAcknowledgement from "./pages/admin/Sales/StoreAcknowledgement.jsx";
import Profile from "./components/Profile.jsx";
import DistributorList from "./pages/admin/Sales/Distributor.jsx";
import EmptyVehicleEntry from "./pages/admin/Sales/EmptyVehicleEntry.jsx";
import CustomerList from "./pages/admin/SetUp/Customer.jsx";
import Tax from "./pages/admin/SetUp/Tax.jsx";
import SalesPage from "./pages/admin/Sales/SalesPage.jsx";
import Group from "./pages/admin/SetUp/Group.jsx";
import Company from "./pages/admin/SetUp/Company.jsx";
// import FbrCompany from "./pages/admin/Functionalities/FbrCompany.jsx";
// import FbrCustomers from "./pages/admin/Functionalities/FbrCustomers.jsx";
import FbrProduct from "./pages/admin/SetUp/FbrProduct.jsx";
import FbrBookingOrders from "./pages/admin/Functionalities/FbrBookingOrders.jsx";
import FbrDeliveryChallan from "./pages/admin/Functionalities/FbrDeliveryChallan.jsx";
import FbrSalesInvoices from "./pages/admin/Functionalities/FbrSalesInvoices.jsx";
import FbrSalesReturn from "./pages/admin/Functionalities/FbrSalesReturn.jsx";
import FbrPaymentReceipt from "./pages/admin/Reports/FbrPaymentReceipt.jsx";
import FbrLedger from "./pages/admin/Reports/FbrLedger.jsx";
import FbrReceivable from "./pages/admin/Reports/FbrReceivable.jsx";
import FbrPage from "./pages/admin/Functionalities/FbrPage.jsx";

function AppContent() {
  return (
    <div className="max-h-screen flex flex-col bg-gray-50">
      <main className="flex-1">
        <ScrollToTop />
        <Routes>
          {/* Public Routes */}

          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="item-details" element={<ItemList />} />
            <Route path="customers" element={<CustomerData />} />
            <Route path="shelve-location" element={<ShelveLocation />} />
            <Route path="category-item" element={<CategoryItem />} />
            <Route path="supplier" element={<SupplierList />} />
            <Route path="sales" element={<SalesPage />} />
            <Route path="fbr-integration" element={<FbrPage />} />

            <Route path="group" element={<Group />} />

            <Route path="manufacture" element={<Manufacture />} />
            <Route path="item-barcode" element={<ItemBarcode />} />
            <Route path="sales-invoice" element={<SalesInvoice />} />
            <Route path="expiry-tags" element={<ExpiryTags />} />
            <Route path="item-unit" element={<ItemUnit />} />
            <Route path="promotion" element={<Promotion />} />
            <Route path="customers-booking" element={<BookingOrder />} />
            <Route path="company" element={<Company />} />
            <Route path="users" element={<Users />} />
            <Route path="groups" element={<GroupManagement />} />
            <Route path="access-rights" element={<AccessControll />} />
            <Route path="modules" element={<Modules />} />

            <Route path="rate-list" element={<RateList />} />
            <Route
              path="distributor-rate-list"
              element={<DistributionRateList />}
            />
            <Route path="booking-orders" element={<BookingOrders />} />
            <Route path="delivery-challan" element={<DeliveryChallan />} />
            <Route
              path="store-acknowledgement"
              element={<StoreAcknowledgement />}
            />
            <Route path="sales-invoices" element={<SalesInvoices />} />
            {/* <Route
              path="payment-receipt-voucher"
              element={<PaymentReceiptVoucher />}
            /> */}
            <Route path="customer-ledger" element={<CustomerLedger />} />
            <Route path="receivable" element={<Receivable />} />
            <Route path="sales-return" element={<SalesReturn />} />
            <Route path="distributor" element={<DistributorList />} />
            {/* fbr */}
            {/* <Route path="fbr-company" element={<FbrCompany />} /> */}
            {/* <Route path="fbr-customers" element={<FbrCustomers />} /> */}
            <Route path="fbr-products" element={<FbrProduct />} />
            <Route path="fbr-booking-orders" element={<FbrBookingOrders />} />
            <Route
              path="fbr-delivery-challan"
              element={<FbrDeliveryChallan />}
            />
            <Route path="fbr-sale-invoice" element={<FbrSalesInvoices />} />
            <Route path="fbr-sales-return" element={<FbrSalesReturn />} />
            <Route path="fbr-payment-receipt" element={<FbrPaymentReceipt />} />
            <Route path="fbr-ledger" element={<FbrLedger />} />
            <Route path="fbr-receivable" element={<FbrReceivable />} />
            <Route path="expense-head" element={<ExpenseHead />} />
            <Route path="expense-voucher" element={<ExpenseVoucher />} />
            <Route path="day-book" element={<DayBook />} />
            <Route path="open-balance" element={<OpeningBalance />} />
            <Route path="designation" element={<Designation />} />
            <Route path="employee" element={<Employee />} />
            <Route path="departments" element={<Departments />} />
            <Route path="empty-vehicle-entry" element={<EmptyVehicleEntry />} />
            <Route path="promotion-item" element={<PromotionItem />} />
            <Route path="item-type" element={<ItemType />} />
            <Route path="tax" element={<Tax />} />
            <Route path="customers-list" element={<CustomerList />} />
          </Route>
        </Routes>
      </main>
      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
}

function App() {
  return <AppContent />;
}

export default App;
