const pool = require('../config/db');
const { createVoucherWithEntries } = require('../services/voucherService');

/*
  GET ALL VOUCHERS
*/
const getAllVouchers = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        v.*,
        fy.year_name,
        u.name AS created_by_name
      FROM vouchers v
      JOIN financial_years fy ON v.financial_year_id = fy.id
      LEFT JOIN users u ON v.created_by = u.id
      ORDER BY v.voucher_date ASC, v.voucher_no ASC
    `);

    res.json(rows);
  } catch (error) {
    console.error('Get vouchers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/*
  GET SINGLE VOUCHER WITH LINES
*/
const getVoucherById = async (req, res) => {
  try {
    const { id } = req.params;

    const [voucherRows] = await pool.query(`
      SELECT 
        v.*,
        fy.year_name,
        u.name AS created_by_name
      FROM vouchers v
      JOIN financial_years fy ON v.financial_year_id = fy.id
      LEFT JOIN users u ON v.created_by = u.id
      WHERE v.id = ?
    `, [id]);

    if (voucherRows.length === 0) {
      return res.status(404).json({ message: 'Voucher not found' });
    }

    const [entryRows] = await pool.query(`
      SELECT 
        ve.*,
        l.ledger_code,
        l.ledger_name
      FROM voucher_entries ve
      JOIN ledgers l ON ve.ledger_id = l.id
      WHERE ve.voucher_id = ?
      ORDER BY ve.id ASC
    `, [id]);

    res.json({
      voucher: voucherRows[0],
      entries: entryRows
    });
  } catch (error) {
    console.error('Get voucher by id error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/*
  CREATE JOURNAL VOUCHER
*/
const createJournalVoucher = async (req, res) => {
  try {
    const { voucher_date, reference_no, narration, entries } = req.body;

    const result = await createVoucherWithEntries({
      voucher_type: 'JOURNAL',
      voucher_date,
      reference_no,
      narration,
      entries,
      created_by: req.user.id
    });

    res.status(201).json({
      message: 'Journal voucher created successfully',
      data: result
    });
  } catch (error) {
    console.error('Create journal voucher error:', error);
    res.status(400).json({ message: error.message || 'Server error' });
  }
};

/*
  CREATE PAYMENT VOUCHER
*/
const createPaymentVoucher = async (req, res) => {
  try {
    const { voucher_date, reference_no, narration, entries } = req.body;

    const result = await createVoucherWithEntries({
      voucher_type: 'PAYMENT',
      voucher_date,
      reference_no,
      narration,
      entries,
      created_by: req.user.id
    });

    res.status(201).json({
      message: 'Payment voucher created successfully',
      data: result
    });
  } catch (error) {
    console.error('Create payment voucher error:', error);
    res.status(400).json({ message: error.message || 'Server error' });
  }
};

/*
  CREATE RECEIPT VOUCHER
*/
const createReceiptVoucher = async (req, res) => {
  try {
    const { voucher_date, reference_no, narration, entries } = req.body;

    const result = await createVoucherWithEntries({
      voucher_type: 'RECEIPT',
      voucher_date,
      reference_no,
      narration,
      entries,
      created_by: req.user.id
    });

    res.status(201).json({
      message: 'Receipt voucher created successfully',
      data: result
    });
  } catch (error) {
    console.error('Create receipt voucher error:', error);
    res.status(400).json({ message: error.message || 'Server error' });
  }
};

module.exports = {
  getAllVouchers,
  getVoucherById,
  createJournalVoucher,
  createPaymentVoucher,
  createReceiptVoucher
};