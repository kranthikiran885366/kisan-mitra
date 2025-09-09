import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { ForumCategory, ForumTopic } from '@/server/models/Forum';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');

    if (type === 'categories') {
      const categories = await ForumCategory.find({ isActive: true })
        .sort({ name: 1 });
      return NextResponse.json({
        success: true,
        data: categories
      });
    }

    if (search) {
      const topics = await ForumTopic.searchTopics(search, categoryId);
      return NextResponse.json({
        success: true,
        data: topics
      });
    }

    const topics = await ForumTopic.getRecentTopics(categoryId);
    return NextResponse.json({
      success: true,
      data: topics
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
    const { title, content, categoryId, tags, userId, attachments } = body;

    if (!title || !content || !categoryId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Title, content, category and user ID are required' },
        { status: 400 }
      );
    }

    const topic = new ForumTopic({
      title,
      content,
      author: userId,
      category: categoryId,
      tags: tags || [],
      attachments: attachments || []
    });

    await topic.save();
    await topic.populate('author', 'name profilePicture');
    await topic.populate('category', 'name color');

    return NextResponse.json({
      success: true,
      data: topic
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}