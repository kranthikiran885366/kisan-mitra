import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Consultation from '@/server/models/Consultation';

export async function POST(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    const body = await request.json();
    const { senderId, message, attachments = [] } = body;

    if (!senderId || !message) {
      return NextResponse.json(
        { success: false, error: 'Sender ID and message are required' },
        { status: 400 }
      );
    }

    const consultation = await Consultation.findById(id);
    if (!consultation) {
      return NextResponse.json(
        { success: false, error: 'Consultation not found' },
        { status: 404 }
      );
    }

    await consultation.addMessage(senderId, message, attachments);
    await consultation.populate('messages.sender', 'name profilePicture');

    return NextResponse.json({
      success: true,
      data: consultation.messages[consultation.messages.length - 1]
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

    const consultation = await Consultation.findById(id)
      .populate('messages.sender', 'name profilePicture')
      .select('messages');

    if (!consultation) {
      return NextResponse.json(
        { success: false, error: 'Consultation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: consultation.messages
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}