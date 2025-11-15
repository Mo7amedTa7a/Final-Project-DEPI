import React, { Suspense } from 'react';
import { createBrowserRouter } from "react-router";
import MainLayout from "../components/MainLayout/MainLayout";
import Loader from "../components/Loader/Loader";

// Lazy loading components
const Home = React.lazy(() => import('../pages/Home/Home'));
const PatientDashboardLazy = React.lazy(() => import('../pages/PatientDashboard/PatientDashboard'));
const FindDoctorLazy = React.lazy(() => import('../pages/FindDoctor/FindDoctor'));
const PharmaciesLazy = React.lazy(() => import('../pages/Pharmacies/Pharmacies'));
const DoctorProfileLazy = React.lazy(() => import('../pages/DoctorProfile/DoctorProfile'));
const PharmacyProfileLazy = React.lazy(() => import('../pages/PharmacyProfile/PharmacyProfile'));

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
        Component: () => (
          <Suspense fallback={<Loader />}>
            <PatientDashboardLazy />
          </Suspense>
        ),
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
    ],
  },
]);
