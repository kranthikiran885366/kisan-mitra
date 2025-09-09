import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Consultation from '@/server/models/Consultation';

export async function POST(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    const body = await request.json();

    const consultation = await Consultation.findById(id);
    if (!consultation) {
      return NextResponse.json(
        { success: false, error: 'Consultation not found' },
        { status: 404 }
      );
    }

    const recommendation = {
      category: body.category,
      title: body.title,
      description: body.description,
      priority: body.priority || 'medium',
      actionRequired: body.actionRequired || false,
      timeline: body.timeline || {},
      cost: body.cost || {},
      products: body.products || [],
      expectedOutcome: body.expectedOutcome,
      followUpDate: body.followUpDate
    };

    await consultation.addRecommendation(recommendation);
    await consultation.populate([
      { path: 'farmer', select: 'name mobile' },
      { path: 'expert', select: 'name specialization' }
    ]);

    return NextResponse.json({
      success: true,
      data: consultation.recommendations[consultation.recommendations.length - 1]
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    const consultation = await Consultation.findById(id).select('recommendations');
    if (!consultation) {
      return NextResponse.json(
        { success: false, error: 'Consultation not found' },
        { status: 404 }
      );
    }

    const recommendations = activeOnly 
      ? consultation.getActiveRecommendations()
      : consultation.recommendations;

    return NextResponse.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}