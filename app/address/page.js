"use client";

import React, { useEffect, useState } from "react";
import apiFetch from "@/app/services/apiFetchService";
import "./AddressesPage.css";

const AddressesPage = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null); // null = add, object = edit
  const [formData, setFormData] = useState({
    full_name: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postal_code: "",
    phone: "",
  });

  // Fetch addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      const res = await apiFetch("/address");
      if (res.isSuccess) setAddresses(res.data);
      setLoading(false);
    };
    fetchAddresses();
  }, []);

  // Handle form field changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Open modal for adding or editing
  const openModal = (address = null) => {
    setEditingAddress(address);
    if (address) setFormData(address);
    else
      setFormData({
        full_name: "",
        address: "",
        city: "",
        state: "",
        country: "",
        postal_code: "",
        phone: "",
      });
    setModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setModalOpen(false);
    setEditingAddress(null);
  };

  // Submit add or update
  const handleSubmit = async (e) => {
    e.preventDefault();
    let res;
    if (editingAddress) {
      res = await apiFetch(`/address/${editingAddress.id}`, {
        method: "PUT",
        body: JSON.stringify(formData),
      });
    } else {
      res = await apiFetch("/address", {
        method: "POST",
        body: JSON.stringify(formData),
      });
    }

    if (res.isSuccess) {
      const updatedList = editingAddress
        ? addresses.map((a) => (a.id === editingAddress.id ? res.data : a))
        : [...addresses, res.data];
      setAddresses(updatedList);
      closeModal();
    } else {
      alert("Failed to save address.");
    }
  };

  // Delete address
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    const res = await apiFetch(`/address/${id}`, { method: "DELETE" });
    if (res && res.isSuccess) {
        setAddresses(addresses.filter((a) => a.id !== id));
    }
    else {
        alert("Failed to delete address.");
    }
  };

  return (
    <div className="addresses-page container">
      <h1>Your Addresses</h1>
      <button className="btn" onClick={() => openModal()}>
        + Add Address
      </button>

      {loading ? (
        <p>Loading...</p>
      ) : addresses.length === 0 ? (
        <p>No addresses found.</p>
      ) : (
        <div className="addresses-list">
          {addresses.map((addr) => (
            <div key={addr.id} className="address-card">
                <strong>#{addr.id}</strong>
              <p><strong>{addr.full_name}</strong></p>
              <p>{addr.address}</p>
              <p>
                {addr.city}, {addr.state}, {addr.country} {addr.postal_code}
              </p>
              <p>Phone: {addr.phone}</p>
              <div className="address-actions">
                <button onClick={() => openModal(addr)}>Edit</button>
                <button className="delete-btn" onClick={() => handleDelete(addr.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>{editingAddress ? "Edit Address" : "Add Address"}</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="full_name"
                placeholder="Full Name"
                value={formData.full_name}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="city"
                placeholder="City"
                value={formData.city}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="state"
                placeholder="State"
                value={formData.state}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="country"
                placeholder="Country"
                value={formData.country}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="postal_code"
                placeholder="Postal Code"
                value={formData.postal_code}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="phone"
                placeholder="Phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
              <div className="modal-actions">
                <button type="submit" className="btn">
                  Save
                </button>
                <button type="button" className="btn cancel" onClick={closeModal}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressesPage;
