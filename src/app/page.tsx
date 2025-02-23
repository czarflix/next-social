import { getPosts } from "@/actions/post.action";
import { getDbUserId } from "@/actions/user.action";
import CreatePost from "@/components/CreatePost";
import Whotofollow from "@/components/WhoToFollow";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import Postcard from "@/components/Postcard";

async function Home() {
  const { userId: clerkId } = await auth();
  const posts = await getPosts();
  const dbUserid = await getDbUserId();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 ">
      <div className="lg:col-span-6">
        {clerkId ? <CreatePost /> : null}

        <div className="space-y-6">
          {posts.map((post) => (
            <Postcard key={post.id} post={post} dbUserid={dbUserid} />
          ))}
        </div>
      </div>

      <div className="hidden lg:block lg:col-span-4  ">
        <Whotofollow />
      </div>
    </div>
  );
}

export default Home;
