import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import CommunityPost from '@/server/models/Community';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const state = searchParams.get('state');
    const district = searchParams.get('district');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;

    let query = { isActive: true };
    if (category && category !== 'all') query.category = category;
    if (state) query['location.state'] = state;
    if (district) query['location.district'] = district;

    const posts = await CommunityPost.find(query)
      .populate('author', 'name profilePicture location')
      .populate('comments.author', 'name profilePicture')
      .sort({ isPinned: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await CommunityPost.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
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
    const { content, category, tags, images, location, userId } = body;

    if (!content || !userId) {
      return NextResponse.json(
        { success: false, error: 'Content and user ID are required' },
        { status: 400 }
      );
    }

    const post = new CommunityPost({
      author: userId,
      content,
      category: category || 'general',
      tags: tags || [],
      images: images || [],
      location: location || {}
    });

    await post.save();
    await post.populate('author', 'name profilePicture location');

    return NextResponse.json({
      success: true,
      data: post
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}