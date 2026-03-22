import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { getAdminHeroCards, createHeroCard, updateHeroCard, deleteHeroCard } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { PuffLoader } from "react-spinners";
import "./AdminHeroCards.css";

const initialFormState = {
  title: "",
  city: "",
  price: "",
  propertyType: "apartment",
  position: { left: "10%", bottom: "10%" },
  animation: { duration: 10, delay: 0 },
  order: 0,
  active: true,
};

const AdminHeroCards = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialFormState);

  // FETCH
  const { data: cards = [], isLoading, isError } = useQuery(
    "adminHeroCards",
    () => getAdminHeroCards(token),
    { enabled: !!token, refetchOnWindowFocus: false }
  );

  // MUTATIONS
  const createMutation = useMutation(
    (data) => createHeroCard(data, token),
    {
      onSuccess: () => {
        toast.success("Hero card created!");
        queryClient.invalidateQueries("adminHeroCards");
        closeModal();
      },
      onError: () => toast.error("Failed to create card.")
    }
  );

  const updateMutation = useMutation(
    ({ id, data }) => updateHeroCard(id, data, token),
    {
      onSuccess: () => {
        toast.success("Hero card updated!");
        queryClient.invalidateQueries("adminHeroCards");
        closeModal();
      },
      onError: () => toast.error("Failed to update card.")
    }
  );

  const deleteMutation = useMutation(
    (id) => deleteHeroCard(id, token),
    {
      onSuccess: () => {
        toast.success("Hero card deleted!");
        queryClient.invalidateQueries("adminHeroCards");
      },
      onError: () => toast.error("Failed to delete card.")
    }
  );

  // HANDLERS
  const handleOpenNew = () => {
    setFormData(initialFormState);
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (card) => {
    setFormData({
      title: card.title,
      city: card.city,
      price: card.price,
      propertyType: card.propertyType,
      position: { left: card.position?.left || "10%", bottom: card.position?.bottom || "10%" },
      animation: { duration: card.animation?.duration || 10, delay: card.animation?.delay || 0 },
      order: card.order || 0,
      active: card.active !== false,
    });
    setEditingId(card._id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this hero card?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <div className="wrapper flexCenter"><PuffLoader color="var(--gold)" /></div>;
  if (isError) return <div className="wrapper flexCenter"><span className="secondaryText">Failed to load.</span></div>;

  return (
    <div className="wrapper ah-page">
      <div className="innerWidth paddings ah-container">
        
        <header className="ah-header">
          <div>
            <h1 className="haven-heading ah-title">Hero Bubbles</h1>
            <p className="secondaryText">Manage floating property cards on the home page</p>
          </div>
          <button className="ah-add-btn" onClick={handleOpenNew}>+ Add Card</button>
        </header>

        <div className="ah-table-wrap">
          <table className="ah-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>City</th>
                <th>Price</th>
                <th>Type</th>
                <th>Position</th>
                <th>Order</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cards.length === 0 ? (
                <tr>
                  <td colSpan="8" className="ah-empty">No hero cards found.</td>
                </tr>
              ) : (
                cards.map((c) => (
                  <tr key={c._id} className="ah-row">
                    <td>{c.title}</td>
                    <td className="ah-td-dim">{c.city}</td>
                    <td className="ah-td-gold">{c.price}</td>
                    <td className="ah-td-dim" style={{textTransform:'capitalize'}}>{c.propertyType}</td>
                    <td className="ah-td-dim">L:{c.position?.left} B:{c.position?.bottom}</td>
                    <td className="ah-td-dim">{c.order}</td>
                    <td>
                      <span className={`ah-status ${c.active ? 'ah-status--active' : 'ah-status--inactive'}`}>
                        {c.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="ah-actions">
                        <button className="ah-action-btn ah-action-edit" onClick={() => handleOpenEdit(c)}>Edit</button>
                        <button className="ah-action-btn ah-action-delete" onClick={() => handleDelete(c._id)}>Del</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* MODAL */}
        {isModalOpen && (
          <div className="ah-modal-overlay">
            <div className="ah-modal">
              <h2 className="ah-modal-title">{editingId ? 'Edit Hero Card' : 'New Hero Card'}</h2>
              <form onSubmit={handleSubmit} className="ah-form">
                
                <div className="ah-form-group">
                  <label>Internal Title</label>
                  <input required value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} placeholder="e.g. Luxury Villa" />
                </div>

                <div className="ah-form-row">
                  <div className="ah-form-group">
                    <label>City</label>
                    <input required value={formData.city} onChange={e=>setFormData({...formData, city: e.target.value})} placeholder="Mumbai" />
                  </div>
                  <div className="ah-form-group">
                    <label>Price Display</label>
                    <input required value={formData.price} onChange={e=>setFormData({...formData, price: e.target.value})} placeholder="₹12.5Cr" />
                  </div>
                </div>

                <div className="ah-form-group">
                  <label>Property Type / Description</label>
                  <input required value={formData.propertyType} onChange={e=>setFormData({...formData, propertyType: e.target.value})} placeholder="e.g. Sea-View Penthouse" />
                </div>

                <div className="ah-form-row">
                  <div className="ah-form-group">
                    <label>Left Position (e.g. 10%, 2rem)</label>
                    <input required value={formData.position.left} onChange={e=>setFormData({...formData, position:{...formData.position, left: e.target.value}})} />
                  </div>
                  <div className="ah-form-group">
                    <label>Bottom Position (e.g. 20%, 5rem)</label>
                    <input required value={formData.position.bottom} onChange={e=>setFormData({...formData, position:{...formData.position, bottom: e.target.value}})} />
                  </div>
                </div>

                <div className="ah-form-row">
                  <div className="ah-form-group">
                    <label>Anim Duration (s)</label>
                    <input type="number" required value={formData.animation.duration} onChange={e=>setFormData({...formData, animation:{...formData.animation, duration: Number(e.target.value)}})} />
                  </div>
                  <div className="ah-form-group">
                    <label>Order</label>
                    <input type="number" required value={formData.order} onChange={e=>setFormData({...formData, order: Number(e.target.value)})} />
                  </div>
                </div>

                <div className="ah-form-group ah-checkbox">
                  <input type="checkbox" id="activeToggle" checked={formData.active} onChange={e=>setFormData({...formData, active: e.target.checked})} />
                  <label htmlFor="activeToggle">Active and visible on home page</label>
                </div>

                <div className="ah-modal-actions">
                  <button type="button" className="ah-btn-cancel" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="ah-btn-save" disabled={createMutation.isLoading || updateMutation.isLoading}>
                    {editingId ? "Update" : "Create"}
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminHeroCards;
