import React, { useState } from 'react';
import HeroSection from './HeroSectionComponent/HeroSection';
import DoctorsSection from './DoctorsSectionComponent/DoctorsSection';
import PharmaciesSection from './PharmaciesSectionComponent/PharmaciesSection';

const Home = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [searchType, setSearchType] = useState("All"); // All, Doctor, Pharmacy
    const [specialtyFilter, setSpecialtyFilter] = useState("All");
    const [governorateFilter, setGovernorateFilter] = useState("All");

    return (
        <div>
            <HeroSection 
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                searchType={searchType}
                setSearchType={setSearchType}
                specialtyFilter={specialtyFilter}
                setSpecialtyFilter={setSpecialtyFilter}
                governorateFilter={governorateFilter}
                setGovernorateFilter={setGovernorateFilter}
            />
            <div id="search-results">
                <DoctorsSection 
                    searchTerm={searchTerm}
                    searchType={searchType}
                    specialtyFilter={specialtyFilter}
                    governorateFilter={governorateFilter}
                />
                <PharmaciesSection 
                    searchTerm={searchTerm}
                    searchType={searchType}
                    governorateFilter={governorateFilter}
                />
            </div>
        </div>
    );
};

export default Home;