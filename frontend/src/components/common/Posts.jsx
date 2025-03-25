import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

// const Posts = ({ feedType, username, userId }) => {
//   const getPostEndpoint = () => {
//     switch (feedType) {
//       case "forYou":
//         return "/api/posts/all";
//       case "following":
//         return "/api/posts/following";
//       case "posts":
//         return `/api/posts/user/${username}`;
//       case "likes":
//         return `/api/posts/likes/${userId}`;
//       case "saved":
//         return `/api/posts/saved/${userId}`;
//       default:
//         return "/api/posts/all";
//     }
//   };

//   const POST_ENDPOINT = getPostEndpoint();
//   const {
//     data: posts,
//     isLoading,
//     refetch,
//     isRefetching,
//     error,
//   } = useQuery({
//     queryKey: ["posts"],
//     queryFn: async () => {
//       try {
//         const res = await fetch(POST_ENDPOINT);
//         const data = await res.json();

//         if (!res.ok) {
//           throw new Error(data.error || "Something  went wrong");
//         }
//         return data;
//       } catch (error) {
//         throw new Error(error);
//       }
//     },
//   });
//   useEffect(() => {
//     refetch();
//   }, [feedType, refetch, username]);
//   return (
//     <>
//       {(isLoading || isRefetching) && (
//         <div className="flex flex-col justify-center">
//           <PostSkeleton />
//           <PostSkeleton />
//           <PostSkeleton />
//         </div>
//       )}
//       {!isLoading && !isRefetching && posts?.length === 0 && (
//         <p className="text-center my-4">No posts in this tab. Switch 👻</p>
//       )}
//       {!isLoading && !isRefetching && posts && (
//         <div>
//           {posts.map((post) => (
//             <Post key={post._id} post={post} />
//           ))}
//         </div>
//       )}
//     </>
//   );
// };

// const Posts = ({ feedType, username, userId }) => {
//   const [hasMore, setHasMore] = useState(true);
//   const [posts, setPosts] = useState([]);
//   const [page, setPage] = useState(1);
//   const queryClient = useQueryClient();

//   const getPostEndpoint = () => {
//     switch (feedType) {
//       case "forYou":
//         return `/api/posts/all?page=${page}`;
//       case "following":
//         return "/api/posts/following";
//       case "posts":
//         return `/api/posts/user/${username}`;
//       case "likes":
//         return `/api/posts/likes/${userId}`;
//       case "saved":
//         return `/api/posts/saved/${userId}`;
//       default:
//         return "/api/posts/all";
//     }
//   };

//   const fetchPosts = async () => {
//     const endpoint = getPostEndpoint();
//     const res = await fetch(endpoint);
//     if (!res.ok) throw new Error("Failed to fetch posts");

//     const data = await res.json();
//     setHasMore(data.length > 0);
//     setPosts((prev) => [...prev, ...data]);

//     return data;
//   };

//   const { isLoading, refetch, isRefetching } = useQuery({
//     queryKey: ["posts", feedType, username, userId, page],
//     queryFn: fetchPosts,
//     enabled: feedType === "forYou" || page === 1,
//   });

//   const handleInfiniteScroll = useCallback(() => {
//     if (
//       hasMore &&
//       window.innerHeight + window.scrollY + 1 >= document.body.scrollHeight
//     ) {
//       setPage((prev) => prev + 1);
//     }
//   }, [hasMore, queryClient]);

//   useEffect(() => {
//     if (hasMore && feedType === "forYou") {
//       window.addEventListener("scroll", handleInfiniteScroll);
//       return () => window.removeEventListener("scroll", handleInfiniteScroll);
//     }
//   }, [hasMore, handleInfiniteScroll, feedType]);

//   return (
//     <>
//       {(isLoading || isRefetching) && (
//         <div className="flex flex-col justify-center">
//           <PostSkeleton />
//           <PostSkeleton />
//           <PostSkeleton />
//         </div>
//       )}
//       {!isLoading && !isRefetching && posts.length === 0 && (
//         <p className="text-center my-4">No posts. Switch tabs 👻</p>
//       )}
//       {!isLoading && !isRefetching && posts.length > 0 && (
//         <div>
//           {[...new Set(posts)].map((post) => (
//             <Post
//               key={post._id || `${post._id}-${Math.random()}`}
//               post={post}
//             />
//           ))}
//           {!hasMore && (
//             <p className="text-center my-4 py-8 text-2xl">
//               WOW! You reached the end 😶
//             </p>
//           )}
//         </div>
//       )}
//     </>
//   );
// };

// const Posts = ({ feedType, username, userId }) => {
//   const [hasMore, setHasMore] = useState(true);
//   const [posts, setPosts] = useState([]);
//   const [page, setPage] = useState(1);
//   const queryClient = useQueryClient();

//   const getPostEndpoint = () => {
//     switch (feedType) {
//       case "forYou":
//         return `/api/posts/all?page=${page}`;
//       case "following":
//         return `/api/posts/following`;
//       case "posts":
//         return `/api/posts/user/${username}`;
//       case "likes":
//         return `/api/posts/likes/${userId}`;
//       case "saved":
//         return `/api/posts/saved/${userId}`;
//       default:
//         return "/api/posts/all";
//     }
//   };

//   const fetchPosts = async () => {
//     const endpoint = getPostEndpoint();
//     const res = await fetch(endpoint);
//     if (!res.ok) throw new Error("Failed to fetch posts");

//     const data = await res.json();
//     if (feedType === "forYou") {
//       setHasMore(data.length > 0);
//       setPosts((prev) => [...prev, ...data]);
//     } else {
//       setPosts(data);
//       setHasMore(false);
//     }

//     return data;
//   };

//   const { isLoading, isRefetching, refetch } = useQuery({
//     queryKey: ["posts", feedType, username, userId, page],
//     queryFn: fetchPosts,
//     enabled: feedType === "forYou" || page === 1,
//   });
//   useEffect(() => {
//     refetch();
//   }, [feedType, refetch, username]);
//   const handleInfiniteScroll = useCallback(() => {
//     if (
//       feedType === "forYou" &&
//       hasMore &&
//       window.innerHeight + window.scrollY + 1 >= document.body.scrollHeight
//     ) {
//       setPage((prev) => prev + 1);
//     }
//   }, [hasMore, feedType]);

//   useEffect(() => {
//     if (feedType === "forYou" && hasMore) {
//       window.addEventListener("scroll", handleInfiniteScroll);
//       return () => window.removeEventListener("scroll", handleInfiniteScroll);
//     }
//   }, [hasMore, handleInfiniteScroll, feedType]);

//   return (
//     <>
//       {(isLoading || isRefetching) && (
//         <div className="flex flex-col justify-center">
//           <PostSkeleton />
//           <PostSkeleton />
//           <PostSkeleton />
//         </div>
//       )}
//       {!isLoading && !isRefetching && posts.length === 0 && (
//         <p className="text-center my-4">No posts. Switch tabs 👻</p>
//       )}
//       {!isLoading && !isRefetching && posts.length > 0 && (
//         <div>
//           {[...new Set(posts)].map((post) => (
//             <Post
//               key={post._id || `${post._id}-${Math.random()}`}
//               post={post}
//             />
//           ))}
//           {feedType === "forYou" && !hasMore && (
//             <p className="text-center my-4 py-8 text-2xl">
//               WOW! You reached the end 😶
//             </p>
//           )}
//         </div>
//       )}
//     </>
//   );
// };

const Posts = ({ feedType, username, userId }) => {
  const [hasMore, setHasMore] = useState(true);
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);

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
  const {
    data: fetchedPosts,
    isLoading,
    refetch,
    isRefetching,
    error,
  } = useQuery({
    queryKey: ["posts", feedType, username, userId, page],
    queryFn: async () => {
      try {
        const res = await fetch(POST_ENDPOINT);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        if (feedType === "forYou") {
          setHasMore(data.length > 0);
          setPosts((prev) =>
            page === 1 ? data : Array.from(new Set([...prev, ...data]))
          );
        } else {
          setPosts(data);
        }
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    enabled: feedType === "forYou" || page === 1,
  });

  const handleInfiniteScroll = useCallback(() => {
    if (
      feedType === "forYou" &&
      hasMore &&
      window.innerHeight + window.scrollY + 1 >= document.body.scrollHeight
    ) {
      setPage((prev) => prev + 1);
    }
  }, [hasMore, feedType]);

  useEffect(() => {
    if (feedType === "forYou") {
      window.addEventListener("scroll", handleInfiniteScroll);
      return () => window.removeEventListener("scroll", handleInfiniteScroll);
    }
  }, [handleInfiniteScroll, feedType]);

  useEffect(() => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
    refetch();
  }, [feedType, username, userId, refetch]);

  return (
    <>
      {(isLoading || isRefetching) && (
        <div className="flex flex-col justify-center">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}
      {!isLoading && !isRefetching && posts?.length === 0 && (
        <p className="text-center my-4">No posts in this tab. Switch 👻</p>
      )}
      {!isLoading && !isRefetching && posts && (
        <div>
          {posts.map((post) => (
            <Post key={post._id} post={post} />
          ))}
          {feedType === "forYou" && !hasMore && (
            <p className="text-center my-4 py-8 text-2xl">
              WOW! You reached the end 😶
            </p>
          )}
        </div>
      )}
    </>
  );
};

export default Posts;
