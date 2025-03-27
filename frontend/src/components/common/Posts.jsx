import Post from "./Post";
import InfiniteScroll from "react-infinite-scroll-component";
import PostSkeleton from "../skeletons/PostSkeleton";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

const Posts = ({ feedType, username, userId }) => {
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [post, setPost] = useState([]);

  const getPostEndpoint = () => {
    switch (feedType) {
      case "forYou":
        return `/api/posts/all?page=${page}`;
      case "following":
        return "/api/posts/following";
      case "posts":
        return `/api/posts/user/${username}`;
      case "likes":
        return `/api/posts/likes/${userId}`;
      case "saved":
        return `/api/posts/saved/${userId}`;
      default:
        return "/api/posts/all";
    }
  };

  const POST_ENDPOINT = getPostEndpoint();
  const queryClient = useQueryClient();

  const {
    data: posts = [],
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const res = await fetch(POST_ENDPOINT);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setHasMore(data.length > 0);
      setPost((prev) => [...prev, ...data]);
      return data;
    },
    keepPreviousData: true,
    onSuccess: async (data) => {
      await queryClient.setQueryData(["posts"], (oldData) => [
        ...oldData,
        ...data,
      ]);
    },
  });

  useEffect(() => {
    refetch();
  }, [feedType, username, page, refetch]);

  return (
    <div className="w-full max-w-xl mx-auto">
      {(isLoading || isRefetching) && (
        <div className="flex flex-col justify-center">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}
      {!isLoading && !isRefetching && post.length === 0 && (
        <p className="text-center my-4 text-gray-500">
          No posts in this tab. Switch 👻
        </p>
      )}
      {!isLoading && !isRefetching && posts.length > 0 && (
        <div>
          {posts.map((post) => (
            <Post key={post._id} post={post} />
          ))}
        </div>
      )}
      {!hasMore && (
        <p className="text-center text-xl font-semibold my-4">
          You reached the end 😶
        </p>
      )}

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-6">
        <button
          className={`px-5 py-2 rounded-full text-white font-semibold ${
            page > 1 ? "bg-blue-500" : "bg-blue-300 cursor-not-allowed"
          }`}
          disabled={page <= 1}
          onClick={() => setPage((prev) => prev - 1)}
        >
          Prev
        </button>

        <button
          className={`px-5 py-2 rounded-full text-white font-semibold ${
            hasMore ? "bg-blue-500" : "bg-gray-400 cursor-not-allowed"
          }`}
          disabled={!hasMore}
          onClick={() => setPage((prev) => prev + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};
export default Posts;
