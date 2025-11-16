# Data Directory

This directory contains all static data and mock data used throughout the application.

## File Structure

### JSON Files
- `Doctors.json` - Doctor data
- `Pharmacies.json` - Pharmacy data

### JavaScript Data Files
- `OrdersData.js` - Mock orders data for pharmacy dashboard
- `PatientDashboardData.js` - Mock data for patient dashboard (appointments, orders, queue)
- `DoctorProfileData.js` - Mock data for doctor profile (slots, clinics, images, symptoms, services, reviews)
- `HeroSectionData.js` - Hero section carousel images
- `SidebarData.js` - Sidebar menu configuration
- `MedicationCategories.js` - Medication categories for filtering

## Usage

Import data from these files in your components:

```javascript
import { mockOrders } from "../../Data/OrdersData";
import { upcomingAppointments, recentOrders, queueData } from "../../Data/PatientDashboardData";
import { availableSlots, mockClinics, clinicImages, symptoms, services, initialReviews } from "../../Data/DoctorProfileData";
import { heroImages } from "../../Data/HeroSectionData";
import { menuItemsConfig, bottomMenuConfig } from "../../Data/SidebarData";
import { medicationCategories } from "../../Data/MedicationCategories";
```

