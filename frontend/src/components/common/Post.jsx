import { FaRegComment } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { FaRegHeart } from "react-icons/fa";
import { FaRegBookmark } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import LoadingSpinner from "./LoadingSpinner";
import { formatPostDate } from "../../utils/date/functions";

const Post = ({ post, feedType, username, userId, page }) => {
  const [comment, setComment] = useState("");
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const queryClient = useQueryClient();

  const postOwner = post.user;
  const isLiked = post.likes.includes(authUser._id);
  const isReposted = post.reposts.some(
    (repost) => repost.repostuserid === authUser._id
  );

  const admin = async (userid) => {
    try {
      const res = await fetch(`/api/auth/config/${userid}`, {
        method: "GET",
      });
      const data = await res.json();

      return data.isAdmin;
    } catch (error) {
      console.log(error.message);
      throw new Error(error.message);
    }
  };

  const [isMyPost, setIsMyPost] = useState(false);

  useEffect(() => {
    const checkOwnership = async () => {
      const isAdmin = await admin(authUser._id);
      setIsMyPost(authUser._id === post.user._id || isAdmin);
    };

    checkOwnership();
  }, [authUser._id, post.user._id]);

  const postId = post._id;
  let isSaved = authUser.savedposts.includes(postId);

  const formattedDate = formatPostDate(post.createdAt);

  const { mutate: deletePost, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`/api/posts/${post._id} `, {
          method: "DELETE",
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error);
        }
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: () => {
      toast.success("Post Deleted Successfully");
      //invalidate the query to refetch the data ;
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
  const { mutate: savePost, isPending: isSaving } = useMutation({
    mutationFn: async () => {
      try {
        console.log(post._id);
        const res = await fetch(`/api/posts/save/${post._id}`, {
          method: "POST",
        });
      } catch (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: (updatedLikes) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const { mutate: likePost, isPending: isLiking } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`/api/posts/like/${post._id}`, {
          method: "POST",
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong!");
        }
        return data;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: (updatedLikes) => {
      // but this is not a good user experience as refresh everytime user likes post is not good
      // queryClient.invalidateQueries({ queryKey: ["posts"] });
      // instead , update the cache directly for the post
      queryClient.setQueryData(["posts"], (oldData) => {
        console.log(oldData);
        return oldData?.map((p) => {
          if (p._id === post._id) {
            return { ...p, likes: updatedLikes };
          }
          console.log(p);
          return p;
        });
      });
      // queryClient.setQueryData(["posts"], (oldData) => {
      //   if (!oldData) return oldData; // Prevent errors if data is undefined

      //   return {
      //     ...oldData,
      //     pages: oldData.pages.map((page) =>
      //       page.map((p) =>
      //         p._id === post._id ? { ...p, likes: updatedLikes } : p
      //       )
      //     ),
      //   };
      // });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: commentPost, isPending: isCommenting } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`/api/posts/comment/${post._id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: comment }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong!");
        }
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: () => {
      toast.success("Comment Added");
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: repost, isPending: isReposting } = useMutation({
    mutationFn: async (post) => {
      try {
        console.log(post);
        const res = await fetch(`/api/posts/repost/${post._id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        console.log(data, "repost");
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      if (isReposted) {
        toast.success("Repost Deleted Successfully");
      } else {
        toast.success("Reposted Successfully");
      }

      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const handleDeletePost = () => {
    deletePost();
  };

  const handlePostComment = (e) => {
    e.preventDefault();
    if (isCommenting) return;
    commentPost();
  };

  const handleLikePost = () => {
    if (isLiking) return;
    likePost();
  };

  return (
    <>
      <div className="flex gap-2 items-start p-4 border-b border-gray-700">
        <div className="avatar">
          <Link
            to={`/profile/${postOwner.username}`}
            className="w-8 rounded-full overflow-hidden"
          >
            <img src={postOwner.profileImg || "/avatar-placeholder.png"} />
          </Link>
        </div>
        <div className="flex flex-col flex-1">
          <div className="flex gap-2 items-center">
            <Link to={`/profile/${postOwner.username}`} className="font-bold">
              {postOwner.fullName}
            </Link>
            <span className="text-gray-700 flex gap-1 text-sm">
              <Link to={`/profile/${postOwner.username}`}>
                @{postOwner.username}
              </Link>
              <span>·</span>
              <span className="inline-flex items-center">
                {post.repostedFrom && (
                  <>
                    <BiRepost className="w-6 h-6 mr-1 text-slate-500" />@
                    {post.repostedFromUsername}
                  </>
                )}
              </span>
              <span>·</span>
              <span>{formattedDate}</span>
            </span>
            {isMyPost && (
              <span className="flex justify-end flex-1">
                {!isDeleting && (
                  <FaTrash
                    className="cursor-pointer hover:text-red-500"
                    onClick={handleDeletePost}
                  />
                )}
                {isDeleting && <LoadingSpinner size="sm" />}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-3 overflow-hidden">
            <span>{post.text}</span>
            {post.img && (
              <img
                src={post.img}
                className="h-80 object-contain rounded-lg border border-gray-700"
                alt=""
              />
            )}
          </div>
          <div className="flex justify-between mt-3">
            <div className="flex gap-4 items-center w-2/3 justify-between">
              <div
                className="flex gap-1 items-center cursor-pointer group"
                onClick={() =>
                  document
                    .getElementById("comments_modal" + post._id)
                    .showModal()
                }
              >
                <FaRegComment className="w-4 h-4  text-slate-500 group-hover:text-sky-400" />
                <span className="text-sm text-slate-500 group-hover:text-sky-400">
                  {post.comments.length}
                </span>
              </div>
              {/* We're using Modal Component from DaisyUI */}
              <dialog
                id={`comments_modal${post._id}`}
                className="modal border-none outline-none"
              >
                <div className="modal-box rounded border border-gray-600">
                  <h3 className="font-bold text-lg mb-4">COMMENTS</h3>
                  <div className="flex flex-col gap-3 max-h-60 overflow-auto">
                    {post.comments.length === 0 && (
                      <p className="text-sm text-slate-500">
                        No comments yet 🤔 Be the first one 😉
                      </p>
                    )}
                    {post.comments.map((comment) => (
                      <div key={comment._id} className="flex gap-2 items-start">
                        <div className="avatar">
                          <div className="w-8 rounded-full">
                            <img
                              src={
                                comment.user.profileImg ||
                                "/avatar-placeholder.png"
                              }
                            />
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1">
                            <span className="font-bold">
                              {comment.user.fullName}
                            </span>
                            <span className="text-gray-700 text-sm">
                              @{comment.user.username}
                            </span>
                          </div>
                          <div className="text-sm">{comment.text}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <form
                    className="flex gap-2 items-center mt-4 border-t border-gray-600 pt-2"
                    onSubmit={handlePostComment}
                  >
                    <textarea
                      className="textarea w-full p-1 rounded text-md resize-none border focus:outline-none  border-gray-800"
                      placeholder="Add a comment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                    <button className="btn btn-primary rounded-full btn-sm text-white px-4">
                      {isCommenting ? <LoadingSpinner size="md" /> : "Post"}
                    </button>
                  </form>
                </div>
                <form method="dialog" className="modal-backdrop">
                  <button className="outline-none">close</button>
                </form>
              </dialog>
              <div>
                <div
                  className="flex gap-1 items-center group cursor-pointer"
                  onClick={() => {
                    repost(post);
                  }}
                >
                  {isReposting && <LoadingSpinner size="sm" />}
                  {!isReposted && !isReposting && (
                    <BiRepost className="w-6 h-6  text-slate-500 group-hover:text-green-500" />
                  )}
                  {isReposted && !isReposting && (
                    <BiRepost className="w-6 h-6  text-green-500" />
                  )}
                  <span className="text-sm text-slate-500 group-hover:text-green-500">
                    {post.reposts.length}
                  </span>
                </div>
              </div>
              <div
                className="flex gap-1 items-center group cursor-pointer"
                onClick={handleLikePost}
              >
                {isLiking && <LoadingSpinner size="sm" />}
                {!isLiked && !isLiking && (
                  <FaRegHeart className="w-4 h-4 cursor-pointer text-slate-500 group-hover:text-pink-500" />
                )}
                {isLiked && !isLiking && (
                  <FaRegHeart className="w-4 h-4 cursor-pointer text-pink-500 " />
                )}

                <span
                  className={`text-sm  group-hover:text-pink-500 ${
                    isLiked ? "text-pink-500" : "text-slate-500"
                  }`}
                >
                  {post.likes.length}
                </span>
              </div>
            </div>
            <div
              className="flex w-1/3 justify-end gap-2 items-center"
              onClick={savePost}
            >
              {isSaving && <LoadingSpinner size="sm" />}
              {!isSaved && !isSaving && (
                <FaRegBookmark className="w-4 h-4 text-sky-500 cursor-pointer filter grayscale" />
              )}
              {isSaved && !isSaving && (
                <FaRegBookmark className="w-4 h-4 text-sky-500 cursor-pointer" />
              )}
              <span
                className={`text-sm  group-hover:text-pink-500 ${
                  isSaved ? "text-pink-500" : "text-slate-500"
                }`}
              ></span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default Post;
