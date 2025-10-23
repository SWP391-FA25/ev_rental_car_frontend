"use client"

import { useState } from "react"
import { Upload, FileText, Download, Trash2, Eye, CheckCircle, Clock, X, Calendar } from "lucide-react"
import { Button } from "../../../shared/components/ui/button"
import { Card } from "../../../shared/components/ui/card"
import { Input } from "../../../shared/components/ui/input"

const mockContracts = [
	{
		id: "1",
		contractNumber: "CONTRACT-2024-0001",
		status: "COMPLETED",
		renterName: "Nguyễn Văn A",
		witnessName: "Trần Văn B",
		notes: "Hợp đồng thuê xe ô tô",
		signedFileUrl:
			"https://example.com/contracts/signed_CONTRACT-2024-0001_1729420800000.pdf",
		signedFileSize: 2400000,
		signedMimeType: "application/pdf",
		signedAt: "2024-10-20T10:30:00Z",
		uploadedAt: "2024-10-20T10:35:00Z",
		uploadedBy: {
			id: "staff1",
			name: "Lê Thị C",
			role: "STAFF",
		},
		booking: {
			id: "booking1",
			user: {
				id: "user1",
				name: "Nguyễn Văn A",
				email: "nguyenvana@example.com",
				phone: "0901234567",
			},
			vehicle: {
				id: "vehicle1",
				licensePlate: "51A-12345",
				model: "Toyota Camry 2023",
			},
			station: {
				id: "station1",
				name: "Chi nhánh Quận 1",
				address: "123 Đường Lê Lợi, Quận 1, TP.HCM",
			},
		},
	},
	{
		id: "2",
		contractNumber: "CONTRACT-2024-0002",
		status: "CREATED",
		renterName: "Trần Thị B",
		witnessName: "Phạm Minh C",
		notes: "Chờ ký kết",
		uploadedAt: "2024-10-19T14:20:00Z",
		booking: {
			id: "booking2",
			user: {
				id: "user2",
				name: "Trần Thị B",
				email: "tranthib@example.com",
				phone: "0912345678",
			},
			vehicle: {
				id: "vehicle2",
				licensePlate: "51B-54321",
				model: "Honda Accord 2023",
			},
			station: {
				id: "station2",
				name: "Chi nhánh Quận 3",
				address: "456 Đường Nguyễn Huệ, Quận 3, TP.HCM",
			},
		},
	},
	{
		id: "3",
		contractNumber: "CONTRACT-2024-0003",
		status: "COMPLETED",
		renterName: "Phạm Minh C",
		witnessName: "Lê Hoàng D",
		notes: "Hợp đồng thuê xe 7 ngày",
		signedFileUrl:
			"https://example.com/contracts/signed_CONTRACT-2024-0003_1729334400000.pdf",
		signedFileSize: 3100000,
		signedMimeType: "application/pdf",
		signedAt: "2024-10-18T09:15:00Z",
		uploadedAt: "2024-10-18T09:20:00Z",
		uploadedBy: {
			id: "staff2",
			name: "Võ Thị E",
			role: "STAFF",
		},
		booking: {
			id: "booking3",
			user: {
				id: "user3",
				name: "Phạm Minh C",
				email: "phamminc@example.com",
				phone: "0923456789",
			},
			vehicle: {
				id: "vehicle3",
				licensePlate: "51C-11111",
				model: "Mazda CX-5 2023",
			},
			station: {
				id: "station1",
				name: "Chi nhánh Quận 1",
				address: "123 Đường Lê Lợi, Quận 1, TP.HCM",
			},
		},
	},
	{
		id: "4",
		contractNumber: "CONTRACT-2024-0004",
		status: "CREATED",
		renterName: "Lê Hoàng D",
		witnessName: "Nguyễn Thị F",
		notes: "Chờ xử lý",
		uploadedAt: "2024-10-17T16:45:00Z",
		booking: {
			id: "booking4",
			user: {
				id: "user4",
				name: "Lê Hoàng D",
				email: "lehoangd@example.com",
				phone: "0934567890",
			},
			vehicle: {
				id: "vehicle4",
				licensePlate: "51D-22222",
				model: "Hyundai Tucson 2023",
			},
			station: {
				id: "station3",
				name: "Chi nhánh Quận 5",
				address: "789 Đường Trần Hưng Đạo, Quận 5, TP.HCM",
			},
		},
	},
	{
		id: "5",
		contractNumber: "CONTRACT-2024-0005",
		status: "COMPLETED",
		renterName: "Võ Thị E",
		witnessName: "Trần Văn G",
		notes: "Hợp đồng thuê xe 30 ngày",
		signedFileUrl:
			"https://example.com/contracts/signed_CONTRACT-2024-0005_1729248000000.pdf",
		signedFileSize: 2700000,
		signedMimeType: "application/pdf",
		signedAt: "2024-10-16T11:00:00Z",
		uploadedAt: "2024-10-16T11:05:00Z",
		uploadedBy: {
			id: "staff1",
			name: "Lê Thị C",
			role: "STAFF",
		},
		booking: {
			id: "booking5",
			user: {
				id: "user5",
				name: "Võ Thị E",
				email: "vothie@example.com",
				phone: "0945678901",
			},
			vehicle: {
				id: "vehicle5",
				licensePlate: "51E-33333",
				model: "Kia Sorento 2023",
			},
			station: {
				id: "station2",
				name: "Chi nhánh Quận 3",
				address: "456 Đường Nguyễn Huệ, Quận 3, TP.HCM",
			},
		},
	},
]

export function ContractUploadPage() {
	const [contracts, setContracts] = useState(mockContracts)
	const [searchTerm, setSearchTerm] = useState("")
	const [filterStatus, setFilterStatus] = useState("all")
	const statusOptions = ["all", "CREATED", "COMPLETED"]
	const [showUploadModal, setShowUploadModal] = useState(false)
	const [selectedContract, setSelectedContract] = useState(null)
	const [uploadFormData, setUploadFormData] = useState({
		renterName: "",
		witnessName: "",
		notes: "",
		file: null,
	})

	const filteredContracts = contracts.filter((contract) => {
		const matchesSearch =
			(contract.contractNumber || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
			(contract.renterName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
			(contract.booking?.vehicle?.licensePlate || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
			(contract.booking?.station?.name || "").toLowerCase().includes(searchTerm.toLowerCase())

		const matchesStatus = filterStatus === "all" || contract.status === filterStatus

		return matchesSearch && matchesStatus
	})

	const getStatusIcon = (status) => {
		switch (status) {
			case "COMPLETED":
				return <CheckCircle className="w-5 h-5 text-green-600" />
			case "CREATED":
				return <Clock className="w-5 h-5 text-amber-600" />
			default:
				return null
		}
	}

	const getStatusLabel = (status) => {
		switch (status) {
			case "COMPLETED":
				return "Đã hoàn thành"
			case "CREATED":
				return "Chờ ký kết"
			default:
				return ""
		}
	}

	const getStatusColor = (status) => {
		switch (status) {
			case "COMPLETED":
				return "bg-green-50 text-green-700 border-green-200"
			case "CREATED":
				return "bg-amber-50 text-amber-700 border-amber-200"
			default:
				return ""
		}
	}

	const formatFileSize = (bytes) => {
		if (!bytes) return "N/A"
		const mb = bytes / (1024 * 1024)
		return mb.toFixed(2) + " MB"
	}

	const formatDate = (dateString) => {
		if (!dateString) return ""
		return new Date(dateString).toLocaleDateString("vi-VN", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
		})
	}

	const handleUploadClick = (contract) => {
		setSelectedContract(contract)
		setUploadFormData({
			renterName: contract.renterName,
			witnessName: contract.witnessName,
			notes: contract.notes || "",
			file: null,
		})
		setShowUploadModal(true)
	}

	const handleUploadSubmit = () => {
		if (!uploadFormData.file || !selectedContract) return

		const updatedContract = {
			...selectedContract,
			status: "COMPLETED",
			renterName: uploadFormData.renterName,
			witnessName: uploadFormData.witnessName,
			notes: uploadFormData.notes,
			signedFileUrl: URL.createObjectURL(uploadFormData.file),
			signedFileSize: uploadFormData.file.size,
			signedMimeType: uploadFormData.file.type,
			signedAt: new Date().toISOString(),
			uploadedAt: new Date().toISOString(),
			uploadedBy: {
				id: "current-staff",
				name: "Nhân viên hiện tại",
				role: "STAFF",
			},
		}

		setContracts(contracts.map((c) => (c.id === selectedContract.id ? updatedContract : c)))
		setShowUploadModal(false)
		setUploadFormData({
			renterName: "",
			witnessName: "",
			notes: "",
			file: null,
		})
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-4xl font-bold text-slate-900 mb-2">
						Quản lý Hợp đồng Thuê
					</h1>
					<p className="text-slate-600">
						Tải lên và quản lý hợp đồng thuê cho các khách hàng
					</p>
				</div>

				{/* Filters and Search */}
				<div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<div className="flex-1">
						<Input
							placeholder="Tìm kiếm theo số hợp đồng, tên khách hàng, biển số xe hoặc chi nhánh..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="bg-white border-slate-300"
						/>
					</div>
					<div className="flex gap-2">
						{statusOptions.map((status) => (
							<Button
								key={status}
								variant={filterStatus === status ? "default" : "outline"}
								onClick={() => setFilterStatus(status)}
								className={
									filterStatus === status
										? "bg-blue-600 hover:bg-blue-700 text-white"
										: "border-slate-300 text-slate-700 hover:bg-slate-50"
								}
							>
								{status === "all" && "Tất cả"}
								{status === "CREATED" && "Chờ ký kết"}
								{status === "COMPLETED" && "Đã hoàn thành"}
							</Button>
						))}
					</div>
				</div>

				{/* Contracts Table */}
				<Card className="bg-white overflow-hidden">
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-slate-50 border-b border-slate-200">
								<tr>
									<th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
										Số HĐ
									</th>
									<th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
										Khách hàng
									</th>
									<th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
										Xe / Chi nhánh
									</th>
									<th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
										Trạng thái
									</th>
									<th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
										Ngày tải
									</th>
									<th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
										Hành động
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-200">
								{filteredContracts.length > 0 ? (
									filteredContracts.map((contract) => (
										<tr
											key={contract.id}
											className="hover:bg-slate-50 transition-colors"
										>
											<td className="px-6 py-4">
												<p className="font-mono text-sm font-medium text-slate-900">
													{contract.contractNumber}
												</p>
											</td>
											<td className="px-6 py-4">
												<div>
													<p className="font-medium text-slate-900">
														{contract.renterName}
													</p>
													<p className="text-xs text-slate-500">
														{contract.booking.user.phone}
													</p>
												</div>
											</td>
											<td className="px-6 py-4">
												<div>
													<p className="text-sm font-medium text-slate-900">
														{contract.booking.vehicle.licensePlate}
													</p>
													<p className="text-xs text-slate-500">
														{contract.booking.station.name}
													</p>
												</div>
											</td>
											<td className="px-6 py-4">
												<div
													className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(
														contract.status
													)}`}
												>
													{getStatusIcon(contract.status)}
													<span className="text-sm font-medium">
														{getStatusLabel(contract.status)}
													</span>
												</div>
											</td>
											<td className="px-6 py-4">
												<p className="text-sm text-slate-600">
													{formatDate(contract.uploadedAt)}
												</p>
											</td>
											<td className="px-6 py-4">
												<div className="flex items-center gap-2">
													<Button
														variant="ghost"
														size="sm"
														className="text-slate-600 hover:text-blue-600 hover:bg-blue-50"
														title="Xem chi tiết"
														onClick={() => setSelectedContract(contract)}
													>
														<Eye className="w-4 h-4" />
													</Button>
													{contract.status === "CREATED" && (
														<Button
															variant="ghost"
															size="sm"
															className="text-slate-600 hover:text-green-600 hover:bg-green-50"
															title="Tải lên hợp đồng"
															onClick={() => handleUploadClick(contract)}
														>
															<Upload className="w-4 h-4" />
														</Button>
													)}
													{contract.status === "COMPLETED" &&
														contract.signedFileUrl && (
															<Button
																variant="ghost"
																size="sm"
																className="text-slate-600 hover:text-green-600 hover:bg-green-50"
																title="Tải xuống"
																onClick={() =>
																	window.open(
																		contract.signedFileUrl,
																		"_blank"
																	)
																}
															>
																<Download className="w-4 h-4" />
															</Button>
														)}
													<Button
														variant="ghost"
														size="sm"
														className="text-slate-600 hover:text-red-600 hover:bg-red-50"
														title="Xóa"
													>
														<Trash2 className="w-4 h-4" />
													</Button>
												</div>
											</td>
										</tr>
									))
								) : (
									<tr>
										<td colSpan={6} className="px-6 py-12 text-center">
											<div className="flex flex-col items-center gap-2">
												<FileText className="w-12 h-12 text-slate-300" />
												<p className="text-slate-600">Không tìm thấy hợp đồng nào</p>
											</div>
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>

					{/* Footer Stats */}
					<div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-wrap gap-6">
						<div>
							<p className="text-sm text-slate-600">Tổng cộng</p>
							<p className="text-2xl font-bold text-slate-900">
								{contracts.length}
							</p>
						</div>
						<div>
							<p className="text-sm text-slate-600">Đã hoàn thành</p>
							<p className="text-2xl font-bold text-green-600">
								{contracts.filter((c) => c.status === "COMPLETED").length}
							</p>
						</div>
						<div>
							<p className="text-sm text-slate-600">Chờ ký kết</p>
							<p className="text-2xl font-bold text-amber-600">
								{contracts.filter((c) => c.status === "CREATED").length}
							</p>
						</div>
					</div>
				</Card>
			</div>

			{/* Upload Modal */}
			{showUploadModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
					<Card className="w-full max-w-2xl bg-white">
						<div className="p-6">
							<div className="flex items-center justify-between mb-6">
								<h2 className="text-2xl font-bold text-slate-900">
									Tải lên Hợp đồng Ký kết
								</h2>
								<button
									onClick={() => setShowUploadModal(false)}
									className="text-slate-400 hover:text-slate-600"
								>
									<X className="w-6 h-6" />
								</button>
							</div>

							{selectedContract && (
								<div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
									<div className="grid grid-cols-2 gap-4">
										<div>
											<p className="text-sm text-slate-600">Số hợp đồng</p>
											<p className="font-mono font-semibold text-slate-900">
												{selectedContract.contractNumber}
											</p>
										</div>
										<div>
											<p className="text-sm text-slate-600">Khách hàng</p>
											<p className="font-semibold text-slate-900">
												{selectedContract.renterName}
											</p>
										</div>
										<div>
											<p className="text-sm text-slate-600">Xe</p>
											<p className="font-semibold text-slate-900">
												{selectedContract.booking.vehicle.licensePlate}
											</p>
										</div>
										<div>
											<p className="text-sm text-slate-600">Chi nhánh</p>
											<p className="font-semibold text-slate-900">
												{selectedContract.booking.station.name}
											</p>
										</div>
									</div>
								</div>
							)}

							<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-slate-900 mb-2">
										Tên khách hàng *
									</label>
									<Input
										value={uploadFormData.renterName}
										onChange={(e) =>
											setUploadFormData({
												...uploadFormData,
												renterName: e.target.value,
											})
										}
										placeholder="Nhập tên khách hàng"
										className="bg-white border-slate-300"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-slate-900 mb-2">
										Tên người chứng kiến *
									</label>
									<Input
										value={uploadFormData.witnessName}
										onChange={(e) =>
											setUploadFormData({
												...uploadFormData,
												witnessName: e.target.value,
											})
										}
										placeholder="Nhập tên người chứng kiến"
										className="bg-white border-slate-300"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-slate-900 mb-2">
										Ghi chú
									</label>
									<textarea
										value={uploadFormData.notes}
										onChange={(e) =>
											setUploadFormData({
												...uploadFormData,
												notes: e.target.value,
											})
										}
										placeholder="Nhập ghi chú (tối đa 500 ký tự)"
										maxLength={500}
										className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
										rows={3}
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-slate-900 mb-2">
										Tải lên file hợp đồng *
									</label>
									<div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
										<input
											type="file"
											accept=".pdf,.jpg,.jpeg,.png"
											onChange={(e) =>
												setUploadFormData({
													...uploadFormData,
													file: e.target.files?.[0] || null,
												})
											}
											className="hidden"
											id="file-input"
										/>
										<label
											htmlFor="file-input"
											className="cursor-pointer"
										>
											<div className="flex flex-col items-center gap-2">
												<Upload className="w-8 h-8 text-slate-400" />
												<p className="text-sm font-medium text-slate-900">
													{uploadFormData.file
														? uploadFormData.file.name
														: "Chọn file hoặc kéo thả"}
												</p>
												<p className="text-xs text-slate-500">
													PDF, JPG, PNG (Tối đa 10MB)
												</p>
											</div>
										</label>
									</div>
								</div>
							</div>

							<div className="flex gap-3 mt-6">
								<Button
									onClick={() => setShowUploadModal(false)}
									variant="outline"
									className="flex-1 border-slate-300"
								>
									Hủy
								</Button>
								<Button
									onClick={handleUploadSubmit}
									disabled={
										!uploadFormData.file ||
										!uploadFormData.renterName ||
										!uploadFormData.witnessName
									}
									className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
								>
									<Upload className="w-4 h-4 mr-2" />
									Tải lên
								</Button>
							</div>
						</div>
					</Card>
				</div>
			)}

			{/* Detail Modal */}
			{selectedContract && !showUploadModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
					<Card className="w-full max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
						<div className="p-6">
							<div className="flex items-center justify-between mb-6">
								<h2 className="text-2xl font-bold text-slate-900">
									Chi tiết Hợp đồng
								</h2>
								<button
									onClick={() => setSelectedContract(null)}
									className="text-slate-400 hover:text-slate-600"
								>
									<X className="w-6 h-6" />
								</button>
							</div>

							<div className="space-y-6">
								{/* Contract Info */}
								<div>
									<h3 className="text-lg font-semibold text-slate-900 mb-4">
										Thông tin Hợp đồng
									</h3>
									<div className="grid grid-cols-2 gap-4">
										<div className="p-3 bg-slate-50 rounded">
											<p className="text-sm text-slate-600">Số hợp đồng</p>
											<p className="font-mono font-semibold text-slate-900">
												{selectedContract.contractNumber}
											</p>
										</div>
										<div className="p-3 bg-slate-50 rounded">
											<p className="text-sm text-slate-600">Trạng thái</p>
											<div className="flex items-center gap-2 mt-1">
												{getStatusIcon(selectedContract.status)}
												<span className="font-semibold text-slate-900">
													{getStatusLabel(selectedContract.status)}
												</span>
											</div>
										</div>
										<div className="p-3 bg-slate-50 rounded">
											<p className="text-sm text-slate-600">Tên khách hàng</p>
											<p className="font-semibold text-slate-900">
												{selectedContract.renterName}
											</p>
										</div>
										<div className="p-3 bg-slate-50 rounded">
											<p className="text-sm text-slate-600">Người chứng kiến</p>
											<p className="font-semibold text-slate-900">
												{selectedContract.witnessName}
											</p>
										</div>
									</div>
								</div>

								{/* Booking Info */}
								<div>
									<h3 className="text-lg font-semibold text-slate-900 mb-4">
										Thông tin Đặt xe
									</h3>
									<div className="grid grid-cols-2 gap-4">
										<div className="p-3 bg-slate-50 rounded">
											<p className="text-sm text-slate-600">Khách hàng</p>
											<p className="font-semibold text-slate-900">
												{selectedContract.booking.user.name}
											</p>
											<p className="text-xs text-slate-500">
												{selectedContract.booking.user.email}
											</p>
										</div>
										<div className="p-3 bg-slate-50 rounded">
											<p className="text-sm text-slate-600">Điện thoại</p>
											<p className="font-semibold text-slate-900">
												{selectedContract.booking.user.phone}
											</p>
										</div>
										<div className="p-3 bg-slate-50 rounded">
											<p className="text-sm text-slate-600">Xe</p>
											<p className="font-semibold text-slate-900">
												{selectedContract.booking.vehicle.licensePlate}
											</p>
											<p className="text-xs text-slate-500">
												{selectedContract.booking.vehicle.model}
											</p>
										</div>
										<div className="p-3 bg-slate-50 rounded">
											<p className="text-sm text-slate-600">Chi nhánh</p>
											<p className="font-semibold text-slate-900">
												{selectedContract.booking.station.name}
											</p>
											<p className="text-xs text-slate-500">
												{selectedContract.booking.station.address}
											</p>
										</div>
									</div>
								</div>

								{/* Notes */}
								{selectedContract.notes && (
									<div>
										<h3 className="text-lg font-semibold text-slate-900 mb-2">
											Ghi chú
										</h3>
										<p className="p-3 bg-slate-50 rounded text-slate-700">
											{selectedContract.notes}
										</p>
									</div>
								)}

								{/* File Info */}
								{selectedContract.status === "COMPLETED" &&
									selectedContract.signedFileUrl && (
										<div>
											<h3 className="text-lg font-semibold text-slate-900 mb-4">
												Thông tin File
											</h3>
											<div className="p-4 bg-slate-50 rounded border border-slate-200">
												<div className="flex items-start gap-3">
													<FileText className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
													<div className="flex-1">
														<p className="font-semibold text-slate-900">
															Hợp đồng ký kết
														</p>
														<p className="text-sm text-slate-600">
															Kích thước:{" "}
															{formatFileSize(selectedContract.signedFileSize)}
														</p>
														<p className="text-sm text-slate-600">
															Loại: {selectedContract.signedMimeType}
														</p>
														{selectedContract.signedAt && (
															<p className="text-sm text-slate-600 flex items-center gap-1 mt-1">
																<Calendar className="w-4 h-4" />
																Ký kết:{" "}
																{formatDate(selectedContract.signedAt)}
															</p>
														)}
														{selectedContract.uploadedBy && (
															<p className="text-sm text-slate-600">
																Người tải:{" "}
																{selectedContract.uploadedBy.name}
															</p>
														)}
													</div>
													<Button
														size="sm"
														className="bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0"
														onClick={() =>
															window.open(
																selectedContract.signedFileUrl,
																"_blank"
															)
														}
													>
														<Download className="w-4 h-4" />
													</Button>
												</div>
											</div>
										</div>
									)}
							</div>

							<div className="flex gap-3 mt-6">
								<Button
									onClick={() => setSelectedContract(null)}
									variant="outline"
									className="flex-1 border-slate-300"
								>
									Đóng
								</Button>
								{selectedContract.status === "CREATED" && (
									<Button
										onClick={() => handleUploadClick(selectedContract)}
										className="flex-1 bg-green-600 hover:bg-green-700 text-white"
									>
										<Upload className="w-4 h-4 mr-2" />
										Tải lên Hợp đồng
									</Button>
								)}
							</div>
						</div>
					</Card>
				</div>
			)}
		</div>
	)
}
