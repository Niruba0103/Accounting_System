const pool = require('../config/db');

const auditService = {
  // Log any action (CREATE, UPDATE, DELETE)
  logAction: async (entityType, entityId, action, userId, oldData = null, newData = null, companyId = null) => {
    try {
      await pool.query(
        `INSERT INTO audit_log (entity_type, entity_id, action, user_id, old_data, new_data, company_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [entityType, entityId, action, userId, JSON.stringify(oldData), JSON.stringify(newData), companyId]
      );
    } catch (error) {
      console.error('Error logging action:', error.message);
    }
  },

  // Archive deleted record before deletion
  archiveDeletedRecord: async (entityType, entityId, entityName, deletedData, deletedBy = null, companyId = null) => {
    try {
      const restorationToken = `restore_${entityType}_${entityId}_${Date.now()}`;
      
      await pool.query(
        `INSERT INTO deleted_records (entity_type, entity_id, entity_name, deleted_data, deleted_by, company_id, restoration_token)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [entityType, entityId, entityName, JSON.stringify(deletedData), deletedBy, companyId, restorationToken]
      );

      return restorationToken;
    } catch (error) {
      console.error('Error archiving deleted record:', error.message);
      return null;
    }
  },

  // Get deletion history for an entity
  getDeletedRecords: async (entityType, companyId = null) => {
    try {
      const query = companyId
        ? `SELECT * FROM deleted_records 
           WHERE entity_type = ? AND company_id = ? 
           ORDER BY deleted_at DESC`
        : `SELECT * FROM deleted_records 
           WHERE entity_type = ? 
           ORDER BY deleted_at DESC`;
      
      const params = companyId ? [entityType, companyId] : [entityType];
      const [records] = await pool.query(query, params);
      
      return records.map(record => ({
        ...record,
        deleted_data: JSON.parse(record.deleted_data)
      }));
    } catch (error) {
      console.error('Error fetching deleted records:', error.message);
      return [];
    }
  },

  // Restore a deleted record
  restoreDeletedRecord: async (restorationToken, targetTable, fields) => {
    try {
      const [deletedRecord] = await pool.query(
        `SELECT * FROM deleted_records WHERE restoration_token = ? AND can_restore = TRUE`,
        [restorationToken]
      );

      if (deletedRecord.length === 0) {
        throw new Error('Record not found or cannot be restored');
      }

      const record = deletedRecord[0];
      const data = JSON.parse(record.deleted_data);

      // Build INSERT query dynamically
      const columns = Object.keys(data).join(', ');
      const placeholders = Object.keys(data).map(() => '?').join(', ');
      const values = Object.values(data);

      await pool.query(
        `INSERT INTO ${targetTable} (${columns}) VALUES (${placeholders})`,
        values
      );

      // Mark as restored
      await pool.query(
        `UPDATE deleted_records SET can_restore = FALSE WHERE restoration_token = ?`,
        [restorationToken]
      );

      // Log the restoration
      await auditService.logAction(
        record.entity_type,
        record.entity_id,
        'RESTORED',
        null,
        null,
        data,
        record.company_id
      );

      return { success: true, message: 'Record restored successfully' };
    } catch (error) {
      console.error('Error restoring record:', error.message);
      return { success: false, message: error.message };
    }
  },

  // Get audit history for an entity
  getAuditHistory: async (entityType, entityId, companyId = null) => {
    try {
      const query = companyId
        ? `SELECT * FROM audit_log 
           WHERE entity_type = ? AND entity_id = ? AND company_id = ?
           ORDER BY created_at DESC`
        : `SELECT * FROM audit_log 
           WHERE entity_type = ? AND entity_id = ?
           ORDER BY created_at DESC`;
      
      const params = companyId ? [entityType, entityId, companyId] : [entityType, entityId];
      const [history] = await pool.query(query, params);

      return history.map(log => ({
        ...log,
        old_data: log.old_data ? JSON.parse(log.old_data) : null,
        new_data: log.new_data ? JSON.parse(log.new_data) : null
      }));
    } catch (error) {
      console.error('Error fetching audit history:', error.message);
      return [];
    }
  },

  // Record backup creation
  recordBackup: async (backupName, createdBy, description = null, backupSizeMb = null, companyId = null) => {
    try {
      await pool.query(
        `INSERT INTO backup_metadata (backup_name, created_by, description, backup_size_mb, company_id)
         VALUES (?, ?, ?, ?, ?)`,
        [backupName, createdBy, description, backupSizeMb, companyId]
      );
    } catch (error) {
      console.error('Error recording backup:', error.message);
    }
  }
};

module.exports = auditService;
