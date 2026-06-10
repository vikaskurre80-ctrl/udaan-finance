import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    const { title, date, status, clientId } = req.body;

    try {
      const video = await prisma.video.update({
        where: { id: String(id) },
        data: {
          title,
          date: new Date(date),
          status,
          clientId,
        },
      });

      return res.status(200).json(video);
    } catch (error) {
      console.error('Error updating video:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    const { action } = req.body;

    try {
      const video = await prisma.video.findUnique({
        where: { id: String(id) },
        include: {
          assignments: { include: { teamMember: true } },
        },
      });

      if (!video) {
        return res.status(404).json({ message: 'Video not found' });
      }

      if (action === 'approve') {
        await prisma.video.update({
          where: { id: video.id },
          data: { status: 'COMPLETED' },
        });

        await prisma.videoAssignment.updateMany({
          where: { videoId: video.id },
          data: { status: 'Approved', approvedAt: new Date() },
        });

        if (video.clientId) {
          await prisma.client.update({
            where: { id: video.clientId },
            data: { completedReels: { increment: 1 } },
          });
        }

        return res.status(200).json({ success: true, message: 'Video approved' });
      }

      if (action === 'reject') {
        await prisma.video.update({
          where: { id: video.id },
          data: { status: 'REJECTED' },
        });

        await prisma.videoAssignment.updateMany({
          where: { videoId: video.id },
          data: { status: 'Rejected' },
        });

        return res.status(200).json({ success: true, message: 'Video rejected' });
      }

      return res.status(400).json({ message: 'Invalid action. Use "approve" or "reject".' });
    } catch (error) {
      console.error('Error processing video approval:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const video = await prisma.video.findUnique({
        where: { id: String(id) },
        include: { assignments: true },
      });

      if (!video) {
        return res.status(404).json({ message: 'Video not found' });
      }

      if (video.status === 'COMPLETED' && video.clientId) {
        await prisma.client.update({
          where: { id: video.clientId },
          data: { completedReels: { decrement: 1 } },
        });
      }

      await prisma.videoAssignment.deleteMany({
        where: { videoId: video.id },
      });

      await prisma.video.delete({
        where: { id: video.id },
      });

      return res.status(200).json({ success: true, message: 'Video deleted' });
    } catch (error) {
      console.error('Error deleting video:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
