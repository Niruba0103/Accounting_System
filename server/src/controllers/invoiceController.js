const pool = require('../config/db');
const { createInvoiceWithVoucher } = require('../services/invoiceService');
const { createPaymentOrReceipt } = require('../services/paymentService');

/*
  GET ALL INVOICES
*/
const getAllInvoices = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        i.*,
        CASE
          WHEN i.party_type = 'CUSTOMER' THEN c.name
          WHEN i.party_type = 'SUPPLIER' THEN s.name
          ELSE NULL
        END AS party_name
      FROM invoices i
      LEFT JOIN customers c
        ON i.party_type = 'CUSTOMER' AND i.party_id = c.id
      LEFT JOIN suppliers s
        ON i.party_type = 'SUPPLIER' AND i.party_id = s.id
      WHERE i.company_id = ?
      ORDER BY i.invoice_date ASC, i.id ASC
    `, [req.companyId]);

    res.json(rows);
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/*
  GET SINGLE INVOICE WITH ITEMS
*/
const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const [invoiceRows] = await pool.query(
      `SELECT
         i.*,
         CASE
           WHEN i.party_type = 'CUSTOMER' THEN c.name
           WHEN i.party_type = 'SUPPLIER' THEN s.name
           ELSE NULL
         END AS party_name
       FROM invoices i
       LEFT JOIN customers c
         ON i.party_type = 'CUSTOMER' AND i.party_id = c.id
       LEFT JOIN suppliers s
         ON i.party_type = 'SUPPLIER' AND i.party_id = s.id
       WHERE i.id = ? AND i.company_id = ?`,
      [id, req.companyId]
    );

    if (invoiceRows.length === 0) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const [itemRows] = await pool.query(
      'SELECT * FROM invoice_items WHERE invoice_id = ?',
      [id]
    );

    res.json({
      invoice: invoiceRows[0],
      items: itemRows
    });
  } catch (error) {
    console.error('Get invoice by id error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/*
  CREATE SALES INVOICE
*/
const createSalesInvoice = async (req, res) => {
  try {
    const result = await createInvoiceWithVoucher({
      invoice_type: 'SALES',
      ...req.body,
      company_id: req.companyId,
      created_by: req.user.id
    });

    res.status(201).json({
      message: 'Sales invoice created successfully',
      data: result
    });
  } catch (error) {
    console.error('Create sales invoice error:', error);
    res.status(400).json({ message: error.message || 'Server error' });
  }
};

/*
  CREATE PURCHASE INVOICE
*/
const createPurchaseInvoice = async (req, res) => {
  try {
    const result = await createInvoiceWithVoucher({
      invoice_type: 'PURCHASE',
      ...req.body,
      company_id: req.companyId,
      created_by: req.user.id
    });

    res.status(201).json({
      message: 'Purchase invoice created successfully',
      data: result
    });
  } catch (error) {
    console.error('Create purchase invoice error:', error);
    res.status(400).json({ message: error.message || 'Server error' });
  }
};

/*
  UPDATE INVOICE
  Note:
  This updates invoice master + items only.
  Safer rule: allow update only when paid_amount = 0
*/
const updateInvoice = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;
    const {
      invoice_date,
      due_date,
      tax_amount,
      discount_amount,
      remarks,
      items
    } = req.body;

    await connection.beginTransaction();

    const [invoiceRows] = await connection.query(
      'SELECT * FROM invoices WHERE id = ? AND company_id = ?',
      [id, req.companyId]
    );

    if (invoiceRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const invoice = invoiceRows[0];

    if (Number(invoice.paid_amount) > 0) {
      await connection.rollback();
      return res.status(400).json({
        message: 'Cannot edit invoice after payment/receipt has been made'
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'At least one item is required' });
    }

    const subtotal = items.reduce(
      (sum, item) => sum + Number(item.qty || 0) * Number(item.unit_price || 0),
      0
    );

    const total_amount =
      subtotal + Number(tax_amount || 0) - Number(discount_amount || 0);

    await connection.query(
      `UPDATE invoices
       SET invoice_date = ?,
           due_date = ?,
           subtotal = ?,
           tax_amount = ?,
           discount_amount = ?,
           total_amount = ?,
           balance_amount = ?,
           remarks = ?
       WHERE id = ? AND company_id = ?`,
      [
        invoice_date,
        due_date,
        subtotal,
        Number(tax_amount || 0),
        Number(discount_amount || 0),
        total_amount,
        total_amount,
        remarks || null,
        id,
        req.companyId
      ]
    );

    await connection.query(
      'DELETE FROM invoice_items WHERE invoice_id = ?',
      [id]
    );

    for (const item of items) {
      const qty = Number(item.qty || 0);
      const unit_price = Number(item.unit_price || 0);
      const amount = qty * unit_price;

      await connection.query(
        `INSERT INTO invoice_items
         (invoice_id, item_name, qty, unit_price, amount)
         VALUES (?, ?, ?, ?, ?)`,
        [id, item.item_name, qty, unit_price, amount]
      );
    }

    await connection.commit();

    res.json({ message: 'Invoice updated successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Update invoice error:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    connection.release();
  }
};

/*
  DELETE INVOICE
  Safer rule: allow delete only when paid_amount = 0
*/
const deleteInvoice = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;

    await connection.beginTransaction();

    const [invoiceRows] = await connection.query(
      'SELECT * FROM invoices WHERE id = ? AND company_id = ?',
      [id, req.companyId]
    );

    if (invoiceRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const invoice = invoiceRows[0];

    if (Number(invoice.paid_amount) > 0) {
      await connection.rollback();
      return res.status(400).json({
        message: 'Cannot delete invoice after payment/receipt has been made'
      });
    }

    await connection.query('DELETE FROM invoice_items WHERE invoice_id = ?', [id]);
    await connection.query('DELETE FROM invoices WHERE id = ? AND company_id = ?', [id, req.companyId]);

    await connection.commit();

    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Delete invoice error:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    connection.release();
  }
};

/*
  CREATE RECEIPT AGAINST SALES INVOICE
*/
const createReceiptAgainstInvoice = async (req, res) => {
  try {
    const result = await createPaymentOrReceipt({
      payment_type: 'RECEIPT',
      ...req.body,
      company_id: req.companyId,
      created_by: req.user.id
    });

    res.status(201).json({
      message: 'Receipt recorded successfully',
      data: result
    });
  } catch (error) {
    console.error('Create receipt error:', error);
    res.status(400).json({ message: error.message || 'Server error' });
  }
};

/*
  CREATE PAYMENT AGAINST PURCHASE INVOICE
*/
const createPaymentAgainstInvoice = async (req, res) => {
  try {
    const result = await createPaymentOrReceipt({
      payment_type: 'PAYMENT',
      ...req.body,
      company_id: req.companyId,
      created_by: req.user.id
    });

    res.status(201).json({
      message: 'Payment recorded successfully',
      data: result
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(400).json({ message: error.message || 'Server error' });
  }
};

module.exports = {
  getAllInvoices,
  getInvoiceById,
  createSalesInvoice,
  createPurchaseInvoice,
  updateInvoice,
  deleteInvoice,
  createReceiptAgainstInvoice,
  createPaymentAgainstInvoice
};