import React, { useState } from 'react';
import { CloseOutlined, CheckCircleOutlined, ReportGmailerrorred } from '@mui/icons-material';
import { editStock } from '@/app/lib/data';

interface EditStockProps {
    isOpen: boolean;
    onClose: () => void;
    productName: string;
    productId: string;
    initialValues: {
        terra_stock: number;
        terra_can_sell: number;
        thonhuom_stock: number;
        thonhuom_can_sell: number;
    };
    onSuccess?: () => void;
}

export default function EditStock({
    isOpen,
    onClose,
    productName,
    productId,
    initialValues,
    onSuccess,
    }: EditStockProps) {
    const [values, setValues] = useState(initialValues);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleChange = (field: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value) || 0;
        setValues(prev => ({
        ...prev,
        [field]: value
        }));
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('access_token') || '';
            await editStock(token, productId, values);            
            setMessage('Cập nhật kho thành công!');
            setMessageType('success');        
        if (onSuccess) {
            onSuccess();
        }        
        setTimeout(() => {
            onClose();
            // window.location.reload();
        }, 1000);
        } catch (error: any) {
            setMessage(error.message);
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            {message && (
                <div
                    className={`toast-message ${
                        messageType === "success"
                        ? "success"
                        : messageType === "error"
                        ? "error"
                        : ""
                    }`}
                >
                    {messageType === "success" ? (
                        <CheckCircleOutlined style={{ color: "#1A73E8", fontSize: 20 }} />
                    ) : (
                        <ReportGmailerrorred style={{ color: "#D93025", fontSize: 20 }} />
                    )}
                <span>{message}</span>
                    <CloseOutlined
                        className="close-btn"
                        style={{ fontSize: 16, cursor: "pointer", color: "#5F6368" }}
                        onClick={() => setMessage("")}
                    />
                </div>
            )}

            <div className="relative bg-white rounded-2xl shadow-xl p-6 w-[500px]">
                <button
                    className="absolute right-4 top-4 text-gray-600"
                    onClick={onClose}
                >
                    <CloseOutlined />
                </button>

                <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-1">{productName}</h2>
                    <p className="text-gray-600">ID: {productId}</p>
                </div>

                <div className="space-y-4">
                    <table className="w-full border-collapse">
                        <thead>
                        <tr className="text-left">
                            <th className="pb-2">Tên SP</th>
                            <th className="pb-2">Tồn kho</th>
                            <th className="pb-2">Có thể bán</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td className="py-2">Terra</td>
                            <td className="py-2">
                                <input
                                    type="number"
                                    className="w-20 p-1 border rounded"
                                    value={values.terra_stock}
                                    onChange={handleChange('terra_stock')}
                                />
                            </td>
                            <td className="py-2">
                            <input
                                type="number"
                                className="w-20 p-1 border rounded"
                                value={values.terra_can_sell}
                                onChange={handleChange('terra_can_sell')}
                            />
                            </td>
                        </tr>
                        <tr>
                            <td className="py-2">Thợ nhuộm</td>
                            <td className="py-2">
                                <input
                                    type="number"
                                    className="w-20 p-1 border rounded"
                                    value={values.thonhuom_stock}
                                    onChange={handleChange('thonhuom_stock')}
                                />
                            </td>
                            <td className="py-2">
                                <input
                                    type="number"
                                    className="w-20 p-1 border rounded"
                                    value={values.thonhuom_can_sell}
                                    onChange={handleChange('thonhuom_can_sell')}
                                />
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end gap-4 mt-6">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className={`px-4 py-2 bg-blue-500 text-white rounded-lg ${
                        loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
                        }`}
                    >
                        {loading ? 'Đang lưu...' : 'Lưu'}
                    </button>
                </div>
            </div>
        </div>
    );
}
