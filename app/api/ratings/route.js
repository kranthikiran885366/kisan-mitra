import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Rating from '@/server/models/Rating';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');
    const itemType = searchParams.get('itemType');
    const userId = searchParams.get('userId');

    let query = {};
    if (itemId) query.itemId = itemId;
    if (itemType) query.itemType = itemType;
    if (userId) query.user = userId;

    const ratings = await Rating.find(query)
      .populate('user', 'name profilePicture')
      .sort({ createdAt: -1 });

    // Calculate average rating
    const avgRating = ratings.length > 0 
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length 
      : 0;

    return NextResponse.json({
      success: true,
      data: ratings,
      summary: {
        average: Math.round(avgRating * 10) / 10,
        count: ratings.length,
        distribution: {
          5: ratings.filter(r => r.rating === 5).length,
          4: ratings.filter(r => r.rating === 4).length,
          3: ratings.filter(r => r.rating === 3).length,
          2: ratings.filter(r => r.rating === 2).length,
          1: ratings.filter(r => r.rating === 1).length
        }
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
    const { itemId, itemType, rating, review, userId } = body;

    if (!itemId || !itemType || !rating || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already rated this item
    const existingRating = await Rating.findOne({
      itemId,
      itemType,
      user: userId
    });

    if (existingRating) {
      // Update existing rating
      existingRating.rating = rating;
      existingRating.review = review;
      await existingRating.save();
      
      return NextResponse.json({
        success: true,
        data: existingRating,
        message: 'Rating updated successfully'
      });
    } else {
      // Create new rating
      const newRating = new Rating({
        itemId,
        itemType,
        user: userId,
        rating,
        review
      });

      await newRating.save();
      await newRating.populate('user', 'name profilePicture');

      return NextResponse.json({
        success: true,
        data: newRating,
        message: 'Rating submitted successfully'
      });
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}