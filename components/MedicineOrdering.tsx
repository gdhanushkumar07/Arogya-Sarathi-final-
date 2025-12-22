import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  Phone,
  Clock,
  Star,
  Check,
  X,
  Package,
  MapPin,
  Truck,
  Plus,
} from "lucide-react";
import type { DemoPharmacy, PatientProfile } from "../types";
import { demoPharmacies } from "../data/demoPharmacies";

interface MedicineOrder {
  id: string;
  pharmacyId: string;
  patientId: string;
  medicines: string[];
  orderDate: number;
  status: "PENDING" | "CONFIRMED" | "REJECTED";
  deliveryTime: string;
  totalAmount: number;
  notes?: string;
}

interface MedicineOrderingProps {
  patientProfile: PatientProfile;
  onBack: () => void;
}

const MedicineOrdering: React.FC<MedicineOrderingProps> = ({
  patientProfile,
  onBack,
}) => {
  const [availablePharmacies] = useState<DemoPharmacy[]>(demoPharmacies);
  const [selectedPharmacy, setSelectedPharmacy] = useState<DemoPharmacy | null>(
    null
  );
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderMedicines, setOrderMedicines] = useState<string[]>([""]);
  const [orderNotes, setOrderNotes] = useState("");
  const [currentOrders, setCurrentOrders] = useState<MedicineOrder[]>([]);

  useEffect(() => {
    loadOrders();
  }, [patientProfile.patientId]);

  const loadOrders = () => {
    const storageKey = `hv_orders_${patientProfile.patientId}`;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      setCurrentOrders(JSON.parse(stored));
    }
  };

  const saveOrders = (orders: MedicineOrder[]) => {
    const storageKey = `hv_orders_${patientProfile.patientId}`;
    localStorage.setItem(storageKey, JSON.stringify(orders));
    setCurrentOrders(orders);
  };

  const handlePlaceOrder = () => {
    if (
      !selectedPharmacy ||
      orderMedicines.filter((m) => m.trim()).length === 0
    ) {
      alert("Please select a pharmacy and add at least one medicine");
      return;
    }

    const newOrder: MedicineOrder = {
      id: `ORDER-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      pharmacyId: selectedPharmacy.id,
      patientId: patientProfile.patientId,
      medicines: orderMedicines.filter((m) => m.trim()),
      orderDate: Date.now(),
      status: "PENDING",
      deliveryTime: selectedPharmacy.deliveryTime,
      totalAmount: Math.floor(Math.random() * 500) + 100, // Demo amount
      notes: orderNotes,
    };

    const updatedOrders = [...currentOrders, newOrder];
    saveOrders(updatedOrders);

    // Reset form
    setShowOrderForm(false);
    setSelectedPharmacy(null);
    setOrderMedicines([""]);
    setOrderNotes("");
  };

  const addMedicineField = () => {
    setOrderMedicines([...orderMedicines, ""]);
  };

  const removeMedicineField = (index: number) => {
    setOrderMedicines(orderMedicines.filter((_, i) => i !== index));
  };

  const updateMedicine = (index: number, value: string) => {
    const updated = [...orderMedicines];
    updated[index] = value;
    setOrderMedicines(updated);
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "text-yellow-600 bg-yellow-50";
      case "CONFIRMED":
        return "text-green-600 bg-green-50";
      case "REJECTED":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const formatDate = (timestamp: number) => {
    return (
      new Date(timestamp).toLocaleDateString() +
      " " +
      new Date(timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  const getPharmacyName = (pharmacyId: string) => {
    const pharmacy = availablePharmacies.find((p) => p.id === pharmacyId);
    return pharmacy?.name || "Unknown Pharmacy";
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-green-600 text-white p-4 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-green-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-lg flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Medicine Ordering
            </h1>
            <p className="text-green-100 text-sm">
              Order medicines from nearby pharmacies
            </p>
          </div>
          <button
            onClick={() => setShowOrderForm(true)}
            className="bg-white text-green-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-50"
          >
            New Order
          </button>
        </div>
      </div>

      {/* Patient Info */}
      <div className="p-4">
        <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {patientProfile.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-green-900">
                {patientProfile.name}
              </h3>
              <p className="text-sm text-green-700">
                {patientProfile.district}, {patientProfile.state}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Form Modal */}
      {showOrderForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-lg mb-4">Place Medicine Order</h3>

            {!selectedPharmacy ? (
              // Pharmacy Selection
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Select Pharmacy</h4>
                {availablePharmacies.map((pharmacy) => (
                  <div
                    key={pharmacy.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedPharmacy(pharmacy)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-bold text-gray-900">
                          {pharmacy.name}
                        </h5>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {pharmacy.address}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Truck className="w-3 h-3" />
                            {pharmacy.deliveryTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current text-yellow-500" />
                            {pharmacy.rating}
                          </span>
                        </div>
                      </div>
                      <Phone className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Order Details Form
              <div className="space-y-4">
                <div className="bg-green-50 p-3 rounded-lg">
                  <h5 className="font-medium text-green-900">
                    {selectedPharmacy.name}
                  </h5>
                  <p className="text-sm text-green-700 flex items-center gap-1">
                    <Truck className="w-3 h-3" />
                    Delivery: {selectedPharmacy.deliveryTime}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medicines *
                  </label>
                  {orderMedicines.map((medicine, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Medicine name and dosage"
                        value={medicine}
                        onChange={(e) => updateMedicine(index, e.target.value)}
                      />
                      {orderMedicines.length > 1 && (
                        <button
                          onClick={() => removeMedicineField(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addMedicineField}
                    className="text-green-600 text-sm font-medium flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add Medicine
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Special Instructions
                  </label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={3}
                    placeholder="Any special instructions for the pharmacy..."
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                  />
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Note:</strong> This is a demo ordering system. In a
                    real application, this would connect to actual pharmacy
                    services.
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              {!selectedPharmacy ? (
                <button
                  onClick={() => setShowOrderForm(false)}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setSelectedPharmacy(null)}
                    className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    className="flex-1 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                  >
                    Place Order
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Orders List */}
      <div className="p-4 space-y-4">
        <h2 className="font-bold text-lg text-gray-900">Order History</h2>

        {currentOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No orders yet
            </h3>
            <p className="text-gray-500 mb-4">
              Place your first medicine order to get started
            </p>
            <button
              onClick={() => setShowOrderForm(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700"
            >
              Place Order
            </button>
          </div>
        ) : (
          currentOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-lg text-gray-900">
                      {getPharmacyName(order.pharmacyId)}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {formatDate(order.orderDate)}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {order.deliveryTime}
                    </span>
                    <span>₹{order.totalAmount}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg mb-4">
                <h4 className="font-medium text-gray-900 text-sm mb-2">
                  Medicines
                </h4>
                <ul className="space-y-1">
                  {order.medicines.map((medicine, index) => (
                    <li
                      key={index}
                      className="text-sm text-gray-700 flex items-center gap-2"
                    >
                      <Check className="w-3 h-3 text-green-600" />
                      {medicine}
                    </li>
                  ))}
                </ul>
              </div>

              {order.notes && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Instructions:</strong> {order.notes}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MedicineOrdering;
