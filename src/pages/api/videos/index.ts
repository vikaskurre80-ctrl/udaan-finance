import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { clientId, title, date, assignments, notes } = req.body;
  const TOTAL_REVENUE = 500;

  try {
    // 1. Create the Video (Status defaults to PENDING)
    const video = await prisma.video.create({
      data: {
        clientId,
        title,
        date: new Date(date),
        totalRevenue: TOTAL_REVENUE,
        shooterPayment: 100,
        editorPayment: 150,
        smmPayment: 50,
        adsPayment: 50,
        clientManagerPayment: 50,
        companyFund: 100,
      },
    });

    // 2. Prepare Assignment Records
    const assignmentData = [];
    
    if (assignments?.shooterId) {
      assignmentData.push({ videoId: video.id, teamMemberId: assignments.shooterId, amount: 100, notes: notes || "Shooter Role" });
    }
    if (assignments?.editorId) {
      assignmentData.push({ videoId: video.id, teamMemberId: assignments.editorId, amount: 150, notes: notes || "Editor Role" });
    }
    if (assignments?.smmId) {
      assignmentData.push({ videoId: video.id, teamMemberId: assignments.smmId, amount: 50, notes: notes || "SMM Role" });
    }
    if (assignments?.adsId) {
      assignmentData.push({ videoId: video.id, teamMemberId: assignments.adsId, amount: 50, notes: notes || "Ads Role" });
    }
    if (assignments?.clientManagerId) {
      assignmentData.push({ videoId: video.id, teamMemberId: assignments.clientManagerId, amount: 50, notes: notes || "Client Manager Role" });
    }

    // 3. Insert Assignments
    if (assignmentData.length > 0) {
      await prisma.videoAssignment.createMany({
        data: assignmentData,
      });
    }

    // 3. Do NOT increment completedReels yet - only after approval
    //    The video starts as PENDING and should only count as completed after admin approval

    return res.status(201).json(video);
  } catch (error) {
    console.error('Error creating video and assignments:', error);
    return res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : String(error) });
  }
}
