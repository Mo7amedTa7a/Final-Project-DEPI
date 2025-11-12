import { createBrowserRouter } from "react-router";
import MainLayout from "../components/MainLayout/MainLayout";
import PatientDashboard from "../pages/PatientDashboard/PatientDashboard";
import Home from "../pages/Home/Home";
import FindDoctor from "../pages/FindDoctor/FindDoctor";
import Pharmacies from "../pages/Pharmacies/Pharmacies";
import DoctorProfile from "../pages/DoctorProfile/DoctorProfile";
import PharmacyProfile from "../pages/PharmacyProfile/PharmacyProfile";



export const Routes = createBrowserRouter([
  {
    path: "/",
    Component: MainLayout,
    children: [
      { index: true, Component: Home },
      { path: "dashboard", Component: PatientDashboard },
      { path: "finddoctor", Component: FindDoctor },
      { path: "pharmacies", Component: Pharmacies },
      { path: "doctor/:id", Component: DoctorProfile },
      { path: "pharmacy/:id", Component: PharmacyProfile },
    ],
  },
]);

 