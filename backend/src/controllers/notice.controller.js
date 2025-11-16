import noticeService from '../services/notice.service.js';

class NoticeController {
  async getAllNotices(req, res) {
    try {
      const notices = await noticeService.getAllNotices();
      res.json(notices);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createNotice(req, res) {
    try {
      const notice = await noticeService.createNotice({
        title: req.body.title,
        content: req.body.content,
        userId: req.user.id
      });
      res.status(201).json(notice);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteNotice(req, res) {
    try {
      await noticeService.deleteNotice(
        req.params.id,
        req.user.id,
        req.user.role
      );
      res.json({ success: true, message: 'Notice deleted successfully' });
    } catch (error) {
      if (error.message === 'Notice not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'Not authorized to delete this notice') {
        return res.status(403).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to delete notice' });
    }
  }
}

export default new NoticeController();
