import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../shared/components/homepage/Navbar';
import Footer from '../../shared/components/homepage/Footer';
import CarRentalContract from '../components/CarRentalContract';
import { Button } from '../../shared/components/ui/button';

export default function UserContractPage() {
    // bookingId is optional: route can be /user/contract or /user/contract/:bookingId
    const { bookingId } = useParams();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />

            <div className="max-w-5xl mx-auto px-4 py-10">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-semibold">Electric Car Rental Contract</h1>
                    <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
                        Back
                    </Button>
                </div>

                {/* CarRentalContract nhận prop bookingId (nếu có) */}
                <CarRentalContract bookingId={bookingId} onStatusChange={() => { /* optional callback */ }} />
            </div>

            <Footer />
        </div>
    );
}
