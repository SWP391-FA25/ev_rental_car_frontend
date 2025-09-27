import React, { useEffect, useState } from "react";
import api from "../../../app/apiClient";

export default function DashboardStats() {
    const [stats, setStats] = useState({ users: 0, cars: 0, orders: 0 });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {

                const [u, c, o] = await Promise.allSettled([
                    api.get("/users/count"),
                    api.get("/cars/count"),
                    api.get("/orders/count"),
                ]);

                setStats({
                    users: u.status === "fulfilled" ? u.value.data : 0,
                    cars: c.status === "fulfilled" ? c.value.data : 0,
                    orders: o.status === "fulfilled" ? o.value.data : 0,
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) return <div>Loading stats...</div>;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded shadow">
                <div className="text-sm">Total Users</div>
                <div className="text-2xl font-bold">{stats.users}</div>
            </div>
            <div className="p-4 bg-white rounded shadow">
                <div className="text-sm">Total Cars</div>
                <div className="text-2xl font-bold">{stats.cars}</div>
            </div>
            <div className="p-4 bg-white rounded shadow">
                <div className="text-sm">Total Orders</div>
                <div className="text-2xl font-bold">{stats.orders}</div>
            </div>
        </div>
    );
}
