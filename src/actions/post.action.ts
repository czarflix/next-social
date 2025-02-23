"use server";
import { prisma } from "@/lib/prisma";
import { getDbUserId } from "./user.action";
import { revalidatePath } from "next/cache";

async function create_post(content: string, image: string) {
  try {
    const db_id = await getDbUserId();
    if (!db_id) return;
    const post = await prisma.post.create({
      data: {
        content,
        image,
        authorId: db_id,
      },
    });
    revalidatePath("/");
    return { success: true, post };
  } catch (error) {
    console.error("Failed to create post:", error);
    return { success: false, error: "Failed to create post" };
  }
}

async function getPosts() {
  try {
    const posts = await prisma.post.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        post_author: {
          select: {
            id: true,
            username: true,
            image: true,
            name: true,
          },
        },
        comments: {
          include: {
            comment_author: {
              select: {
                id: true,
                username: true,
                image: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });
    return posts;
  } catch (error) {
    console.log(error);
    throw new Error("Error in fetching posts");
  }
}

async function toggleLike(postId: string, dbUserId: string | null) {
  if (!dbUserId) return;

  try {
    // Checking if the like already exists
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: dbUserId,
          postId,
        },
      },
    });
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) throw new Error("Post not found");

    if (existingLike)
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });
    // If no existing like, we create a like and send a notification
    else {
      await prisma.$transaction([
        prisma.like.create({
          data: {
            userId: dbUserId,
            postId: postId,
          },
        }),
        ...(post.authorId != dbUserId
          ? [
              prisma.notification.create({
                data: {
                  type: "LIKE",
                  creatorId: dbUserId,
                  userId: post.authorId,
                },
              }),
            ]
          : []),
      ]);
      revalidatePath("/");
      return { success: "true" };
    }
  } catch (error) {
    console.error("Failed to toggle like:", error);
    return { success: false, error: "Failed to toggle like" };
  }
}

async function createComment(
  postId: string,
  content: string,
  dbUserId: string | null
) {
  if (!dbUserId || !content) return;

  try {
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        authorId: true,
      },
    });

    if (!post) throw new Error("Post not found");

    const [comment] = await prisma.$transaction(async function (pr) {
      const newComment = await pr.comment.create({
        data: { userId: dbUserId, content: content, postId: postId },
      });

      // Creating notification if the user doesnt own the post
      if (post.authorId !== dbUserId) {
        await pr.notification.create({
          data: {
            userId: post.authorId,
            creatorId: dbUserId,
            type: "COMMENT",
            commentId: newComment.id,
            postId: postId,
          },
        });
      }
      return [newComment];
    });
    revalidatePath("/");
    return { success: true, comment };
  } catch (error) {
    console.error("Failed to create comment:", error);
    return { success: false, error: "Failed to create comment" };
  }
}

async function deletePost(postId: string, dbUserId: string | null) {
  if (!dbUserId) return;
  try {
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        authorId: true,
      },
    });
    if (!post) throw new Error("Post Not found");
    if (post.authorId !== dbUserId)
      throw new Error("Unauthorized - no delete permission");

    await prisma.post.delete({
      where: {
        id: postId,
      },
    });

    revalidatePath("/");
    return { success: "true" };
  } catch (error) {
    console.error("Failed to delete post:", error);
    return { success: false, error: "Failed to delete post" };
  }
}

export { create_post, getPosts, toggleLike, createComment, deletePost };
