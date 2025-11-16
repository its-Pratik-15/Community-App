import userService from '../services/user.service.js';

class ProfileController {
  async getMe(req, res) {
    try {
      const user = await userService.getUserProfile(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ error: 'Failed to load user profile' });
    }
  }

  async getProfile(req, res) {
    try {
      const user = await userService.getUserProfile(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({ error: 'Failed to load profile' });
    }
  }

  async updateProfile(req, res) {
    try {
      const { name, photo } = req.body;
      
      // Validate name
      if (name !== undefined) {
        if (typeof name !== 'string' || name.trim() === '') {
          return res.status(400).json({ error: 'Name must not be empty' });
        }
      }

      // Only include fields that are being updated
      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (photo !== undefined) updateData.photo = photo;

      // If no valid fields to update
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }

      const user = await userService.updateUserProfile(req.user.id, updateData);
      res.json(user);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }
}

export default new ProfileController();
