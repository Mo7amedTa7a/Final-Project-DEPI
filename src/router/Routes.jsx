import React, { Suspense } from 'react';
import { createBrowserRouter } from "react-router";
import MainLayout from "../components/MainLayout/MainLayout";
import AuthLayout from "../components/AuthLayout/AuthLayout";
import Loader from "../components/Loader/Loader";
import ProtectedRoute from "../components/ProtectedRoute/ProtectedRoute";

// Lazy loading components
const Home = React.lazy(() => import('../pages/Home/Home'));
const PatientDashboardLazy = React.lazy(() => import('../pages/PatientDashboard/PatientDashboard'));
const PharmacyDashboardLazy = React.lazy(() => import('../pages/PharmacyDashboard/PharmacyDashboard'));
const DoctorDashboardLazy = React.lazy(() => import('../pages/DoctorDashboard/DoctorDashboard'));
const PatientsLazy = React.lazy(() => import('../pages/Patients/Patients'));
const MessagesLazy = React.lazy(() => import('../pages/Messages/Messages'));
const PrescriptionsLazy = React.lazy(() => import('../pages/Prescriptions/Prescriptions'));
const CheckoutLazy = React.lazy(() => import('../pages/Checkout/Checkout'));
const WalletLazy = React.lazy(() => import('../pages/Wallet/Wallet'));
const FindDoctorLazy = React.lazy(() => import('../pages/FindDoctor/FindDoctor'));
const PharmaciesLazy = React.lazy(() => import('../pages/Pharmacies/Pharmacies'));
const DoctorProfileLazy = React.lazy(() => import('../pages/DoctorProfile/DoctorProfile'));
const PharmacyProfileLazy = React.lazy(() => import('../pages/PharmacyProfile/PharmacyProfile'));
const SignupLazy = React.lazy(() => import('../pages/Signup/SignUp'));
const LoginLazy = React.lazy(() => import('../pages/Login/Login'));
const PatientProfileSetupLazy = React.lazy(() => import('../pages/PatientProfileSetup/PatientProfileSetup'));
const DoctorProfileSetupLazy = React.lazy(() => import('../pages/DoctorProfileSetup/DoctorProfileSetup'));
const PharmacyProfileSetupLazy = React.lazy(() => import('../pages/PharmacyProfileSetup/PharmacyProfileSetup'));
const AccountLazy = React.lazy(() => import('../pages/Account/Account'));
const CartLazy = React.lazy(() => import('../pages/Cart/Cart'));
const OrdersLazy = React.lazy(() => import('../pages/Orders/Orders'));
const VideoCallLazy = React.lazy(() => import('../pages/VideoCall/VideoCall'));


export const Routes = createBrowserRouter([
  {
    path: "/",
    Component: MainLayout,
    children: [
      {
        index: true,
        Component: () => (
          <Suspense fallback={<Loader />}>
            <Home />
          </Suspense>
        ),
      },
      {
        path: "dashboard",
        Component: () => {
          const currentUser = JSON.parse(localStorage.getItem("CurrentUser") || "{}");
          const userRole = currentUser.role;
          
          if (!currentUser || !currentUser.email) {
            return (
              <ProtectedRoute>
                <Suspense fallback={<Loader />}>
                  <PatientDashboardLazy />
                </Suspense>
              </ProtectedRoute>
            );
          }
          
          if (userRole === "Pharmacy") {
            return (
              <ProtectedRoute>
                <Suspense fallback={<Loader />}>
                  <PharmacyDashboardLazy />
                </Suspense>
              </ProtectedRoute>
            );
          } else if (userRole === "Doctor") {
            return (
              <ProtectedRoute>
                <Suspense fallback={<Loader />}>
                  <DoctorDashboardLazy />
                </Suspense>
              </ProtectedRoute>
            );
          } else {
            return (
              <ProtectedRoute>
                <Suspense fallback={<Loader />}>
                  <PatientDashboardLazy />
                </Suspense>
              </ProtectedRoute>
            );
          }
        },
      },
      {
        path: "finddoctor",
        Component: () => (
          <Suspense fallback={<Loader />}>
            <FindDoctorLazy />
          </Suspense>
        ),
      },
      {
        path: "pharmacies",
        Component: () => (
          <Suspense fallback={<Loader />}>
            <PharmaciesLazy />
          </Suspense>
        ),
      },
      {
        path: "doctor/:id",
        Component: () => (
          <Suspense fallback={<Loader />}>
            <DoctorProfileLazy />
          </Suspense>
        ),
      },
      {
        path: "pharmacy/:id",
        Component: () => (
          <Suspense fallback={<Loader />}>
            <PharmacyProfileLazy />
          </Suspense>
        ),
      },
      {
        path: "account",
        Component: () => (
          <Suspense fallback={<Loader />}>
            <AccountLazy />
          </Suspense>
        ),
      },
      {
        path: "cart",
        Component: () => (
          <ProtectedRoute>
            <Suspense fallback={<Loader />}>
              <CartLazy />
            </Suspense>
          </ProtectedRoute>
        ),
      },
            {
              path: "orders",
              Component: () => (
                <ProtectedRoute>
                  <Suspense fallback={<Loader />}>
                    <OrdersLazy />
                  </Suspense>
                </ProtectedRoute>
              ),
            },
            {
              path: "patients",
              Component: () => (
                <ProtectedRoute requiredRole="Doctor">
                  <Suspense fallback={<Loader />}>
                    <PatientsLazy />
                  </Suspense>
                </ProtectedRoute>
              ),
            },
            {
              path: "messages",
              Component: () => (
                <ProtectedRoute>
                  <Suspense fallback={<Loader />}>
                    <MessagesLazy />
                  </Suspense>
                </ProtectedRoute>
              ),
            },
            {
              path: "prescriptions",
              Component: () => (
                <ProtectedRoute requiredRole="Patient">
                  <Suspense fallback={<Loader />}>
                    <PrescriptionsLazy />
                  </Suspense>
                </ProtectedRoute>
              ),
            },
            {
              path: "checkout",
              Component: () => (
                <ProtectedRoute>
                  <Suspense fallback={<Loader />}>
                    <CheckoutLazy />
                  </Suspense>
                </ProtectedRoute>
              ),
            },
            {
              path: "wallet",
              Component: () => (
                <ProtectedRoute requiredRole={["Pharmacy", "Doctor"]}>
                  <Suspense fallback={<Loader />}>
                    <WalletLazy />
                  </Suspense>
                </ProtectedRoute>
              ),
            },
    ],
  },
  {
    path: "/video-call/:id",
    Component: () => (
      <Suspense fallback={<Loader />}>
        <VideoCallLazy />
      </Suspense>
    ),
  },
  {
    path: "/",
    Component: AuthLayout,
    children: [
      {
        path: "login",
        Component: () => (
          <Suspense fallback={<Loader />}>
            <LoginLazy />
          </Suspense>
        ),
      },
      {
        path: "signup",
        Component: () => (
          <Suspense fallback={<Loader />}>
            <SignupLazy />
          </Suspense>
        ),
      },
      {
        path: "patient-profile-setup",
        Component: () => (
          <Suspense fallback={<Loader />}>
            <PatientProfileSetupLazy />
          </Suspense>
        ),
      },
      {
        path: "doctor-profile-setup",
        Component: () => (
          <Suspense fallback={<Loader />}>
            <DoctorProfileSetupLazy />
          </Suspense>
        ),
      },
      {
        path: "pharmacy-profile-setup",
        Component: () => (
          <Suspense fallback={<Loader />}>
            <PharmacyProfileSetupLazy />
          </Suspense>
        ),
      },
    ],
  },
]);
