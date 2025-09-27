import React, { useEffect, useState } from "react";
import api from "../../../app/apiClient";
import { useNavigate } from "react-router-dom";

export default function UserTable() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [query, setQuery] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
    }, []);

    async function fetchUsers() {
        setLoading(true);
        try {
            const res = await api.get("/users"); // endpoint: /users
            setUsers(res.data);
        } catch (err) {
            console.error("fetch users failed", err);
            alert("Lấy danh sách user lỗi. Kiểm tra console.");
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id) {
        if (!window.confirm("Bạn có chắc muốn xóa user này?")) return;
        try {
            await api.delete(`/users/${id}`);
            setUsers(prev => prev.filter(u => u.id !== id));
        } catch (err) {
            console.error(err);
            alert("Xóa thất bại");
        }
    }

    const filtered = users.filter(u => {
        const q = query.trim().toLowerCase();
        if (!q) return true;
        return (
            String(u.id).includes(q) ||
            (u.name && u.name.toLowerCase().includes(q)) ||
            (u.email && u.email.toLowerCase().includes(q))
        );
    });

    return (
        <div className="bg-white p-4 rounded shadow">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold">Users</h3>
                <div className="flex gap-2">
                    <input
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Search by name / email / id"
                        className="border rounded px-3 py-1"
                    />
                    <button
                        onClick={() => navigate("/admin/users/new")}
                        className="bg-blue-600 text-white px-3 py-1 rounded"
                    >
                        Add
                    </button>
                </div>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : (
                <table className="w-full text-sm table-auto">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-2 border">ID</th>
                            <th className="p-2 border">Name</th>
                            <th className="p-2 border">Email</th>
                            <th className="p-2 border">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(u => (
                            <tr key={u.id} className="hover:bg-gray-50">
                                <td className="p-2 border">{u.id}</td>
                                <td className="p-2 border">{u.name}</td>
                                <td className="p-2 border">{u.email}</td>
                                <td className="p-2 border">
                                    <button
                                        onClick={() => navigate(`/admin/users/${u.id}/edit`)}
                                        className="mr-2 px-2 py-1 border rounded"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(u.id)}
                                        className="px-2 py-1 border rounded text-red-600"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td className="p-4 text-center" colSpan={4}>
                                    Không có dữ liệu
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
}
