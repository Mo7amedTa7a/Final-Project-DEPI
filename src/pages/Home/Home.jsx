import React from 'react';
import HeroSection from './HeroSectionComponent/HeroSection';
import DoctorsSection from './DoctorsSectionComponent/DoctorsSection';
import PharmaciesSection from './PharmaciesSectionComponent/PharmaciesSection';

const Home = () => {
    return (
        <div>
            <HeroSection />
            <DoctorsSection />
            <PharmaciesSection />
        </div>
    );
};

export default Home;