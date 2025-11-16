import staffService from '../services/staff.service.js';

class StaffController {
  async getAllStaff(req, res) {
    try {
      const staff = await staffService.getAllStaff();
      res.json(staff);
    } catch (error) {
      console.error('Error fetching staff:', error);
      res.status(500).json({ error: 'Failed to fetch staff' });
    }
  }

  async createStaff(req, res) {
    try {
      const staff = await staffService.createStaff(req.body);
      res.status(201).json(staff);
    } catch (error) {
      console.error('Error creating staff:', error);
      res.status(400).json({ error: 'Failed to create staff' });
    }
  }

  async updateStaffDuty(req, res) {
    try {
      const staff = await staffService.updateStaffDuty(
        req.params.id,
        req.body.isOnDuty
      );
      res.json(staff);
    } catch (error) {
      console.error('Error updating staff duty:', error);
      res.status(400).json({ error: 'Failed to update staff duty' });
    }
  }
}

export default new StaffController();
