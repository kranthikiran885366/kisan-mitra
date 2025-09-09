import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Consultation from '@/server/models/Consultation';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;

    const consultation = await Consultation.findById(id)
      .populate('farmer', 'name mobile location farmDetails')
      .populate('expert', 'name specialization rating qualification experience')
      .populate('messages.sender', 'name role profilePicture');

    if (!consultation) {
      return NextResponse.json(
        { success: false, error: 'Consultation not found' },
        { status: 404 }
      );
    }

    // Increment view count
    consultation.analytics.viewCount += 1;
    await consultation.save();

    return NextResponse.json({
      success: true,
      data: {
        ...consultation.toObject(),
        analytics: consultation.getAnalytics(),
        summary: consultation.getSummary(),
        activeRecommendations: consultation.getActiveRecommendations()
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    const body = await request.json();
    const { action, data } = body;

    const consultation = await Consultation.findById(id);
    if (!consultation) {
      return NextResponse.json(
        { success: false, error: 'Consultation not found' },
        { status: 404 }
      );
    }

    let result;
    switch (action) {
      case 'add_diagnosis':
        result = await consultation.addDiagnosis(data);
        break;
      case 'add_market_insights':
        result = await consultation.addMarketInsights(data);
        break;
      case 'schedule_call':
        result = await consultation.scheduleCall(data.dateTime, data.duration, data.platform);
        break;
      case 'resolve':
        result = await consultation.resolve(data.summary, data.outcome, data.followUpRequired, data.followUpDate);
        break;
      case 'rate':
        result = await consultation.addRating(data.score, data.feedback, data.aspects);
        break;
      case 'mark_recommendation_implemented':
        result = await consultation.markRecommendationImplemented(data.recommendationId, data.effectiveness);
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    await result.populate([
      { path: 'farmer', select: 'name mobile location farmDetails' },
      { path: 'expert', select: 'name specialization rating qualification experience' },
      { path: 'messages.sender', select: 'name role profilePicture' }
    ]);

    return NextResponse.json({
      success: true,
      data: {
        ...result.toObject(),
        analytics: result.getAnalytics(),
        summary: result.getSummary()
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}