import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Consultation from '@/server/models/Consultation';
import User from '@/server/models/User';
import mongoose from 'mongoose';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const farmerId = searchParams.get('farmerId');
    const expertId = searchParams.get('expertId');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const priority = searchParams.get('priority');
    const cropName = searchParams.get('cropName');
    const state = searchParams.get('state');
    const district = searchParams.get('district');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const includeAnalytics = searchParams.get('analytics') === 'true';

    let query = {};
    if (farmerId) query.farmer = farmerId;
    if (expertId) query.expert = expertId;
    if (status) query.status = status;
    if (type) query.type = type;
    if (priority) query.priority = priority;
    if (cropName) query['cropDetails.cropName'] = new RegExp(cropName, 'i');
    if (state) query['location.state'] = state;
    if (district) query['location.district'] = district;

    const consultations = await Consultation.find(query)
      .populate('farmer', 'name mobile location farmDetails')
      .populate('expert', 'name specialization rating qualification experience')
      .populate('messages.sender', 'name role')
      .sort({ priority: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Consultation.countDocuments(query);

    // Add analytics if requested
    const enrichedConsultations = includeAnalytics 
      ? consultations.map(consultation => ({
          ...consultation.toObject(),
          analytics: consultation.getAnalytics(),
          summary: consultation.getSummary(),
          activeRecommendations: consultation.getActiveRecommendations()
        }))
      : consultations;

    // Get aggregated data
    const statusAgg = await Consultation.aggregate([
      { $match: farmerId ? { farmer: new mongoose.Types.ObjectId(farmerId) } : {} },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const typeAgg = await Consultation.aggregate([
      { $match: farmerId ? { farmer: new mongoose.Types.ObjectId(farmerId) } : {} },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    return NextResponse.json({
      success: true,
      data: enrichedConsultations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      aggregates: {
        byStatus: statusAgg,
        byType: typeAgg
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const {
      farmerId,
      type,
      subject,
      description,
      cropDetails,
      location,
      attachments,
      priority,
      tags,
      scheduledCall
    } = body;

    if (!farmerId || !type || !subject || !description) {
      return NextResponse.json(
        { success: false, error: 'Required fields missing' },
        { status: 400 }
      );
    }

    // Validate farmer exists
    const farmer = await User.findById(farmerId);
    if (!farmer) {
      return NextResponse.json(
        { success: false, error: 'Farmer not found' },
        { status: 404 }
      );
    }

    const consultation = new Consultation({
      farmer: farmerId,
      type,
      subject,
      description,
      cropDetails: {
        ...cropDetails,
        currentIssues: cropDetails?.currentIssues || []
      },
      location: {
        ...location,
        coordinates: location?.coordinates || {
          lat: farmer.coordinates?.latitude,
          lng: farmer.coordinates?.longitude
        }
      },
      attachments: attachments || [],
      priority: priority || 'medium',
      tags: tags || [],
      isUrgent: priority === 'urgent',
      scheduledCall: scheduledCall || null,
      analytics: {
        viewCount: 0
      }
    });

    await consultation.save();
    
    // Auto-assign expert based on type and location
    await consultation.autoAssignExpert();
    
    await consultation.populate([
      { path: 'farmer', select: 'name mobile location farmDetails' },
      { path: 'expert', select: 'name specialization rating qualification experience' }
    ]);

    return NextResponse.json({
      success: true,
      data: {
        ...consultation.toObject(),
        summary: consultation.getSummary()
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}