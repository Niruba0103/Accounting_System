const pool = require('../config/db');

/*
  Stock on hand as of a date
*/
const getStockOnHandData = async (toDate) => {
  const [rows] = await pool.query(
    `SELECT
       si.id,
       si.item_code,
       si.item_name,
       si.unit,
       si.opening_qty,
       si.opening_rate,
       COALESCE(SUM(CASE
         WHEN sm.movement_date <= ? AND sm.movement_type = 'IN' THEN sm.qty
         WHEN sm.movement_date <= ? AND sm.movement_type = 'OUT' THEN -sm.qty
         WHEN sm.movement_date <= ? AND sm.movement_type = 'ADJUSTMENT' THEN sm.qty
         ELSE 0
       END), 0) AS movement_qty
     FROM stock_items si
     LEFT JOIN stock_movements sm ON si.id = sm.item_id
     GROUP BY si.id, si.item_code, si.item_name, si.unit, si.opening_qty, si.opening_rate
     ORDER BY si.item_code ASC`,
    [toDate, toDate, toDate]
  );

  return rows.map((row) => {
    const qtyOnHand = Number(row.opening_qty || 0) + Number(row.movement_qty || 0);
    const rate = Number(row.opening_rate || 0);
    const value = qtyOnHand * rate;

    return {
      item_id: row.id,
      item_code: row.item_code,
      item_name: row.item_name,
      unit: row.unit,
      qty_on_hand: qtyOnHand,
      rate,
      value
    };
  });
};

module.exports = {
  getStockOnHandData
};