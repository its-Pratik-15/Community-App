import maintenanceService from '../services/maintenance.service.js';

class MaintenanceController {
  async getAllMaintenance(req, res) {
    try {
      const maintenance = await maintenanceService.getAllMaintenance();
      res.json(maintenance);
    } catch (error) {
      console.error('Error fetching maintenance records:', error);
      res.status(500).json({ error: 'Failed to fetch maintenance records' });
    }
  }

  async createMaintenance(req, res) {
    try {
      const maintenance = await maintenanceService.createMaintenance({
        userId: req.body.userId,
        amount: req.body.amount,
        status: req.body.status
      });
      res.status(201).json(maintenance);
    } catch (error) {
      console.error('Error creating maintenance record:', error);
      res.status(400).json({ error: 'Failed to create maintenance record' });
    }
  }
}

export default new MaintenanceController();
