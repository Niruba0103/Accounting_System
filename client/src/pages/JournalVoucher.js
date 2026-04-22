import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';

const JournalVoucher = () => {
  const [formData, setFormData] = useState({
    voucher_date: '',
    reference_no: '',
    narration: '',
    entries: [
      { ledger_id: '', debit: 0, credit: 0, line_description: '' },
      { ledger_id: '', debit: 0, credit: 0, line_description: '' }
    ]
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleEntryChange = (index, field, value) => {
    const updatedEntries = [...formData.entries];
    updatedEntries[index][field] = value;

    setFormData({
      ...formData,
      entries: updatedEntries
    });
  };

  const addEntryRow = () => {
    setFormData({
      ...formData,
      entries: [
        ...formData.entries,
        { ledger_id: '', debit: 0, credit: 0, line_description: '' }
      ]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axiosInstance.post('/vouchers/journal', {
        ...formData,
        entries: formData.entries.map((entry) => ({
          ledger_id: Number(entry.ledger_id),
          debit: Number(entry.debit),
          credit: Number(entry.credit),
          line_description: entry.line_description
        }))
      });

      alert('Journal voucher created successfully');

      setFormData({
        voucher_date: '',
        reference_no: '',
        narration: '',
        entries: [
          { ledger_id: '', debit: 0, credit: 0, line_description: '' },
          { ledger_id: '', debit: 0, credit: 0, line_description: '' }
        ]
      });
    } catch (error) {
      console.error('Journal voucher error:', error);
      alert(error.response?.data?.message || 'Error creating journal voucher');
    }
  };

  return (
    <div>
      <h2>Journal Voucher</h2>

      <form onSubmit={handleSubmit}>
        <div className="row g-3 mb-3">
          <div className="col-md-4">
            <label>Voucher Date</label>
            <input
              type="date"
              name="voucher_date"
              className="form-control"
              value={formData.voucher_date}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-4">
            <label>Reference No</label>
            <input
              type="text"
              name="reference_no"
              className="form-control"
              value={formData.reference_no}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-4">
            <label>Narration</label>
            <input
              type="text"
              name="narration"
              className="form-control"
              value={formData.narration}
              onChange={handleChange}
            />
          </div>
        </div>

        <h5>Entries</h5>

        {formData.entries.map((entry, index) => (
          <div className="row g-3 mb-2" key={index}>
            <div className="col-md-3">
              <input
                type="number"
                className="form-control"
                placeholder="Ledger ID"
                value={entry.ledger_id}
                onChange={(e) => handleEntryChange(index, 'ledger_id', e.target.value)}
              />
            </div>

            <div className="col-md-2">
              <input
                type="number"
                className="form-control"
                placeholder="Debit"
                value={entry.debit}
                onChange={(e) => handleEntryChange(index, 'debit', e.target.value)}
              />
            </div>

            <div className="col-md-2">
              <input
                type="number"
                className="form-control"
                placeholder="Credit"
                value={entry.credit}
                onChange={(e) => handleEntryChange(index, 'credit', e.target.value)}
              />
            </div>

            <div className="col-md-5">
              <input
                type="text"
                className="form-control"
                placeholder="Line Description"
                value={entry.line_description}
                onChange={(e) => handleEntryChange(index, 'line_description', e.target.value)}
              />
            </div>
          </div>
        ))}

        <button type="button" className="btn btn-secondary me-2" onClick={addEntryRow}>
          Add Row
        </button>

        <button type="submit" className="btn btn-primary">
          Save Journal Voucher
        </button>
      </form>
    </div>
  );
};

export default JournalVoucher;