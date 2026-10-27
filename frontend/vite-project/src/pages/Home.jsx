import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../axiosCalls/axios";
import { useAuth } from "../context/AuthContext";
import { useDispatch, useSelector } from "react-redux";
import { addPost, removePost, fetchFeedPosts, updatePostLike } from "../redux/postsSlice";
import { addReel, fetchReels, updateReelLike } from "../redux/reelsSlice";
import { addStory, fetchStories } from "../redux/storiesSlice";
import { addFollowing, removeFollowing } from "../redux/authSlice";

function Avatar({ initials, tone = "from-slate-700 to-slate-900", size = "h-11 w-11" }) {
  return (
    <div className={`flex ${size} shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${tone} text-xs font-bold text-white ring-2 ring-white`}>
      {initials}
    </div>
  );
}

const getLikeId = (like) => like?._id || like;

function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  // Read common server state from Redux instead of keeping separate page copies.
  const dispatch = useDispatch();
  const posts = useSelector((state) => state.posts.items);
  const postsLoading = useSelector((state) => state.posts.loading);
  const postsError = useSelector((state) => state.posts.error);
  const reels = useSelector((state) => state.reels.items);
  const reelsLoading = useSelector((state) => state.reels.loading);
  const reelsError = useSelector((state) => state.reels.error);
  const stories = useSelector((state) => state.stories.items);
  const storyLoading = useSelector((state) => state.stories.loading);
  const storyStoreError = useSelector((state) => state.stories.error);
  const feedLoading = postsLoading || reelsLoading;
  const feedError = postsError || reelsError;
  const [storyError, setStoryError] = useState("");
  const [storyFile, setStoryFile] = useState(null);
  const [storyCaption, setStoryCaption] = useState("");
  const [storyCreating, setStoryCreating] = useState(false);
  const [activeStory, setActiveStory] = useState(null);

  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [followLoading, setFollowLoading] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: "n1",
      title: "Welcome to SST Social! 👋",
      message: "Connect with classmates, share posts, and post your stories.",
      time: "Just now",
      read: false,
      type: "welcome"
    },
    {
      id: "n2",
      title: "Real-Time Presence Connected ⚡",
      message: "Socket.IO connection active. You're online and receiving live updates.",
      time: "5m ago",
      read: false,
      type: "socket"
    }
  ]);

  const [activeTab, setActiveTab] = useState("home"); // 'home' | 'explore'
  const [shareToast, setShareToast] = useState("");
  const [isLatestFirst, setIsLatestFirst] = useState(true);
  const [refreshingFeed, setRefreshingFeed] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState({});

  useEffect(() => {
    const handleWindowClick = () => setOpenMenuId(null);
    window.addEventListener("click", handleWindowClick);
    return () => window.removeEventListener("click", handleWindowClick);
  }, []);

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    setDeleteLoading((prev) => ({ ...prev, [postId]: true }));
    try {
      await axiosInstance.delete(`/post/${postId}`);
      dispatch(removePost(postId));
      setShareToast("Post deleted successfully");
      setTimeout(() => setShareToast(""), 3000);
      setOpenMenuId(null);
    } catch (err) {
      console.error("Failed to delete post:", err);
      alert(err.response?.data?.message || "Failed to delete post");
    } finally {
      setDeleteLoading((prev) => ({ ...prev, [postId]: false }));
    }
  };


  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const { data } = await axiosInstance.get(`/users/search?q=${encodeURIComponent(searchQuery)}`);
        setSearchResults(data.users || []);
        setSearchOpen(true);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setSearchLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleShare = async (item, type = "post") => {
    const shareUrl = `${window.location.origin}/home#${type}-${item._id}`;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setShareToast("Link copied to clipboard! Ready to share.");
      } else {
        setShareToast(`Share URL: ${shareUrl}`);
      }
    } catch (err) {
      setShareToast("Link copied to clipboard!");
    }
    setTimeout(() => setShareToast(""), 3500);
  };

  const handleSortToggle = async () => {
    setIsLatestFirst(prev => !prev);
    setRefreshingFeed(true);
    try {
      await Promise.all([
        dispatch(fetchFeedPosts()),
        dispatch(fetchReels()),
        dispatch(fetchStories())
      ]);
      setShareToast(!isLatestFirst ? "Feed refreshed: Latest posts first ↓" : "Showing oldest posts first ↑");
      setTimeout(() => setShareToast(""), 3000);
    } finally {
      setRefreshingFeed(false);
    }
  };


  useEffect(() => {
    const fetchSuggested = async () => {
      try {
        const { data } = await axiosInstance.get("/users/suggested");
        if (data?.users) {
          setSuggestedUsers(data.users);
        }
      } catch (err) {
        console.log("Failed to load suggested users:", err);
      }
    };
    fetchSuggested();
  }, [user]);

  const handleFollowToggle = async (targetUser) => {
    const targetId = targetUser._id;
    if (!targetId || followLoading[targetId]) return;

    const isFollowing = (user?.followings || []).some(
      (id) => (id?._id || id)?.toString() === targetId.toString()
    ) || (targetUser.followers || []).some(
      (id) => (id?._id || id)?.toString() === user?._id?.toString()
    );

    setFollowLoading((prev) => ({ ...prev, [targetId]: true }));
    try {
      if (isFollowing) {
        await axiosInstance.delete(`/users/${targetId}/follow`);
        dispatch(removeFollowing(targetId));
        setSuggestedUsers((prev) =>
          prev.map((u) =>
            u._id === targetId
              ? { ...u, followers: (u.followers || []).filter((id) => (id?._id || id)?.toString() !== user?._id?.toString()) }
              : u
          )
        );
      } else {
        await axiosInstance.post(`/users/${targetId}/follow`);
        dispatch(addFollowing(targetId));
        setSuggestedUsers((prev) =>
          prev.map((u) =>
            u._id === targetId
              ? { ...u, followers: [...(u.followers || []), user?._id] }
              : u
          )
        );
      }
    } catch (err) {
      console.error("Follow toggle failed:", err);
    } finally {
      setFollowLoading((prev) => ({ ...prev, [targetId]: false }));
    }
  };

  // CREATE FLOW STATE:
  // One simple composer supports both posts and reels.
  // contentType decides which backend endpoint and file field we use.
  const [contentType, setContentType] = useState("post");
  const [caption, setCaption] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");

  // LIKE + COMMENT STATE:
  // Comments are fetched only when a user opens them for a post/reel.
  const [openComments, setOpenComments] = useState({});
  const [commentsByItem, setCommentsByItem] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [commentLoading, setCommentLoading] = useState({});
  const [likeLoading, setLikeLoading] = useState({});
  const [interactionError, setInteractionError] = useState({});

  const getItemKey = (type, id) => `${type}-${id}`;

  const isLikedByCurrentUser = (item) => {
    if (!user?._id) return false;

    return (item.likes || []).some(
      (like) => getLikeId(like)?.toString() === user._id.toString()
    );
  };


  // On navigation and hard refresh, hydrate the same shared Redux resources.
  useEffect(() => {
    dispatch(fetchFeedPosts());
    dispatch(fetchReels());
    dispatch(fetchStories());
  }, [dispatch]);

  const handleCreateStory = async (event) => {
    event.preventDefault();

    if (!storyFile) {
      setStoryError("Please select an image for your story.");
      return;
    }

    try {
      setStoryCreating(true);
      setStoryError("");

      const formData = new FormData();
      formData.append("caption", storyCaption.trim());
      formData.append("image", storyFile);

      const response = await axiosInstance.post("/story/createStory", formData);
      dispatch(addStory(response.data.story));
      setStoryFile(null);
      setStoryCaption("");
      event.target.reset();
    } catch (error) {
      console.error("Story creation failed:", error);
      setStoryError(error.response?.data?.message || "Unable to create story.");
    } finally {
      setStoryCreating(false);
    }
  };

  const getStoryLabel = (story) => {
    if (story.author?._id === user?._id) return "Your Story";
    return story.author?.username || "Story";
  };

  // CREATE POST / REEL:
  // We send FormData because both backend create routes accept an uploaded file.
  const handleCreateContent = async (event) => {
    event.preventDefault();

    if (contentType === "post" && !caption.trim() && !selectedFile) {
      setCreateError("Add a caption or select an image.");
      return;
    }

    if (contentType === "reel" && !selectedFile) {
      setCreateError("Please select a video.");
      return;
    }

    try {
      setCreateLoading(true);
      setCreateError("");

      const formData = new FormData();
      formData.append("caption", caption.trim());
      if (selectedFile) {
        formData.append(
          contentType === "post" ? "image" : "video",
          selectedFile
        );
      }

      if (contentType === "post") {
        const response = await axiosInstance.post("/post/create", formData);
        dispatch(addPost(response.data.post));
      } else {
        const response = await axiosInstance.post("/reel/createReel", formData);
        dispatch(addReel(response.data.reel));
      }

      setCaption("");
      setSelectedFile(null);
      event.target.reset();
    } catch (error) {
      console.error("Content creation failed:", error);
      setCreateError(
        error.response?.data?.message || "Unable to create content."
      );
    } finally {
      setCreateLoading(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isPost = contentType === "post";
    const hasValidType = isPost
      ? file.type.startsWith("image/")
      : file.type.startsWith("video/");
    const maxSize = isPost ? 5 * 1024 * 1024 : 50 * 1024 * 1024;

    if (!hasValidType) {
      setCreateError(isPost ? "Please select a valid image." : "Please select a valid video.");
      event.target.value = "";
      return;
    }

    if (file.size > maxSize) {
      setCreateError(isPost ? "Image must be 5MB or smaller." : "Video must be 50MB or smaller.");
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
    setCreateError("");
  };

  const handleContentTypeChange = (type) => {
    setContentType(type);
    setSelectedFile(null);
    setCreateError("");
  };

  const handleLike = async (type, id) => {
    const key = getItemKey(type, id);
    try {
      setLikeLoading((prev) => ({ ...prev, [key]: true }));
      setInteractionError((prev) => ({ ...prev, [key]: "" }));

      // Group C uses POST /post/likes/:id and POST /reel/likes/:id.
      const response = await axiosInstance.post(`/${type}/likes/${id}`);
      const liked = response.data.liked;
      if (type === "post") {
        dispatch(updatePostLike({ postId: id, userId: user?._id, liked }));
      } else {
        dispatch(updateReelLike({ reelId: id, userId: user?._id, liked }));
      }
    } catch (error) {
      console.error("Like update failed:", error);
      setInteractionError((prev) => ({
        ...prev,
        [key]: error.response?.data?.message || "Unable to update like.",
      }));
    } finally {
      setLikeLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleToggleComments = async (type, id) => {
    const key = getItemKey(type, id);
    const willOpen = !openComments[key];

    setOpenComments((prev) => ({ ...prev, [key]: willOpen }));

    if (!willOpen || commentsByItem[key] !== undefined) {
      return;
    }

    try {
      setCommentLoading((prev) => ({ ...prev, [key]: true }));
      setInteractionError((prev) => ({ ...prev, [key]: "" }));

      const response = await axiosInstance.get(`/comment/${type}/${id}`);

      setCommentsByItem((prev) => ({
        ...prev,
        [key]: response.data.comments || [],
      }));
    } catch (error) {
      console.error("Comments fetch failed:", error);
      setInteractionError((prev) => ({
        ...prev,
        [key]: error.response?.data?.message || "Unable to load comments.",
      }));
    } finally {
      setCommentLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleAddComment = async (event, type, id) => {
    event.preventDefault();

    const key = getItemKey(type, id); // reel or post
    const text = commentInputs[key]?.trim();

    if (!text) return;

    try {
      setCommentLoading((prev) => ({ ...prev, [key]: true }));
      setInteractionError((prev) => ({ ...prev, [key]: "" }));

      const response = await axiosInstance.post(`/comment/${type}/${id}`, {
        text,
      });

      setCommentsByItem((prev) => ({
        ...prev,
        [key]: [...(prev[key] || []), response.data.comment],
      }));

      setCommentInputs((prev) => ({
        ...prev,
        [key]: "",
      }));
    } catch (error) {
      console.error("Comment create failed:", error);
      setInteractionError((prev) => ({
        ...prev,
        [key]: error.response?.data?.message || "Unable to add comment.",
      }));
    } finally {
      setCommentLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleDeleteComment = async (commentId, type, id) => {
    const key = getItemKey(type, id);

    try {
      setInteractionError((prev) => ({ ...prev, [key]: "" }));
      await axiosInstance.delete(`/comment/${commentId}`);

      setCommentsByItem((prev) => ({
        ...prev,
        [key]: (prev[key] || []).filter((comment) => comment._id !== commentId),
      }));
    } catch (error) {
      console.error("Comment delete failed:", error);
      setInteractionError((prev) => ({
        ...prev,
        [key]: error.response?.data?.message || "Unable to delete comment.",
      }));
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const getInitials = (name) =>
    name?.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "U";

  const renderInteractions = (item, type) => {
    const key = getItemKey(type, item._id);
    const liked = isLikedByCurrentUser(item);
    const comments = commentsByItem[key];

    return (
      <>
        <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
          <span>{item.likes?.length || 0} likes</span>
          <span>
            {comments !== undefined
              ? `${comments.length} ${comments.length === 1 ? "comment" : "comments"}`
              : "Comments"}
          </span>
        </div>

        <div className="mt-4 flex border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={() => handleLike(type, item._id)}
            disabled={likeLoading[key]}
            className={`flex-1 rounded-xl py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
              liked
                ? "text-rose-600 hover:bg-rose-50"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            {liked ? "♥ Liked" : "♡ Like"}
          </button>

          <button
            type="button"
            onClick={() => handleToggleComments(type, item._id)}
            className="flex-1 rounded-xl py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            ◌ {openComments[key] ? "Hide Comments" : "Comment"}
          </button>

          <button
            type="button"
            onClick={() => handleShare(item, type)}
            className="flex-1 rounded-xl py-2 text-sm font-semibold text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-600 active:scale-95"
          >
            ↗ Share
          </button>
        </div>

        {interactionError[key] && (
          <p className="mt-2 text-xs text-red-500">{interactionError[key]}</p>
        )}

        {openComments[key] && (
          <div className="mt-4 border-t border-slate-100 pt-4">
            {commentLoading[key] && comments === undefined ? (
              <p className="text-xs text-slate-400">Loading comments...</p>
            ) : (
              <div className="space-y-3">
                {(comments || []).map((comment) => (
                  <div key={comment._id} className="flex items-start gap-3">
                    <img
                      src={
                        comment.user?.profileImage ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          comment.user?.name || "User"
                        )}&background=6366f1&color=fff`
                      }
                      alt={comment.user?.name || "User"}
                      className="h-8 w-8 shrink-0 rounded-full object-cover"
                    />

                    <div className="min-w-0 flex-1 rounded-2xl bg-slate-50 px-3 py-2">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-xs font-bold text-slate-700">
                          {comment.user?.name || "Unknown User"}
                        </p>
                        {comment.user?._id === user?._id && (
                          <button
                            type="button"
                            onClick={() => handleDeleteComment(comment._id, type, item._id)}
                            className="text-[11px] font-semibold text-slate-400 transition hover:text-red-500"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                      <p className="mt-0.5 break-words text-sm text-slate-600">
                        {comment.text}
                      </p>
                    </div>
                  </div>
                ))}

                {comments?.length === 0 && (
                  <p className="text-xs text-slate-400">
                    No comments yet. Start the conversation.
                  </p>
                )}
              </div>
            )}

            <form
              onSubmit={(event) => handleAddComment(event, type, item._id)}
              className="mt-4 flex items-center gap-2"
            >
              <input
                type="text"
                value={commentInputs[key] || ""}
                onChange={(event) =>
                  setCommentInputs((prev) => ({
                    ...prev,
                    [key]: event.target.value,
                  }))
                }
                maxLength={500}
                placeholder="Write a comment..."
                className="min-w-0 flex-1 rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:bg-slate-100"
              />
              <button
                type="submit"
                disabled={commentLoading[key] || !commentInputs[key]?.trim()}
                className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Post
              </button>
            </form>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <button onClick={() => navigate("/home")} className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-sm font-black text-white shadow-sm">
              S
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-base font-black tracking-tight">SST Social</p>
              <p className="text-[11px] text-slate-500">Your circle, your feed.</p>
            </div>
          </button>

          <div className="relative hidden w-72 md:block">
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 transition">
              <span className="text-base text-slate-400">⌕</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search people or posts..."
                className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(""); setSearchOpen(false); }}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>

            {searchOpen && (
              <div className="absolute top-12 left-0 right-0 z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                {searchLoading ? (
                  <p className="p-4 text-center text-xs text-slate-400">Searching...</p>
                ) : searchResults.length === 0 ? (
                  <p className="p-4 text-center text-xs text-slate-400">No users found</p>
                ) : (
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                    {searchResults.map((su) => (
                      <div
                        key={su._id}
                        onClick={() => {
                          navigate(`/profile/${su.username}`);
                          setSearchOpen(false);
                          setSearchQuery("");
                        }}
                        className="flex cursor-pointer items-center gap-3 p-3 transition hover:bg-slate-50"
                      >
                        <Avatar initials={getInitials(su.name)} tone="from-indigo-500 to-purple-600" size="h-8 w-8" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-slate-900">{su.name}</p>
                          <p className="truncate text-[11px] text-slate-400">@{su.username}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setNotificationsOpen(true)}
              className="relative rounded-full p-2.5 text-slate-500 transition hover:bg-slate-100"
              aria-label="Notifications"
            >
              ♡
              {notifications.some(n => !n.read) && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
              )}
            </button>
            <button
              onClick={() => navigate(`/profile/${user?.username}`)}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 transition hover:border-slate-300 hover:shadow-sm"
            >
              <Avatar initials={getInitials(user?.name)} tone="from-indigo-500 to-violet-500" size="h-8 w-8" />
              <span className="hidden text-sm font-semibold sm:block">{user?.name || "You"}</span>
            </button>
            <button onClick={handleLogout} className="hidden rounded-full px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 sm:block">Logout</button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)_280px]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm space-y-1">
              <button
                onClick={() => setActiveTab('home')}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${activeTab === 'home' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <span className="text-lg">⌂</span>
                <span className="text-sm">Home Feed</span>
              </button>
              <button onClick={() => navigate(`/profile/${user?.username}`)} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-slate-600 transition hover:bg-slate-50">
                <span className="text-lg">◉</span>
                <span className="text-sm font-semibold">My Profile</span>
              </button>
              <button
                onClick={() => setNotificationsOpen(true)}
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-slate-600 transition hover:bg-slate-50"
              >
                <span className="text-lg">♡</span>
                <span className="text-sm font-semibold">Notifications</span>
                {notifications.some(n => !n.read) && (
                  <span className="ml-auto rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('explore')}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${activeTab === 'explore' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <span className="text-lg">⌁</span>
                <span className="text-sm">Explore</span>
              </button>
            </div>
          </div>
        </aside>

        <section className="min-w-0">
          <div className="mb-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between px-5 py-4">
              <div>
                <h1 className="text-xl font-black tracking-tight">{activeTab === 'explore' ? 'Explore & Discover' : 'Your Feed'}</h1>
                <p className="mt-1 text-xs text-slate-500">{activeTab === 'explore' ? 'Discover trending reels, posts, and creators across SST Social.' : 'See what your circle is up to.'}</p>
              </div>
              <button
                onClick={handleSortToggle}
                disabled={refreshingFeed}
                className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 hover:text-indigo-600 active:scale-95"
              >
                {refreshingFeed ? "Refreshing..." : isLatestFirst ? "Latest ↓" : "Oldest ↑"}
              </button>
            </div>
            <div className="border-t border-slate-100 px-5 py-4">
              <form onSubmit={handleCreateStory} className="mb-4 flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={storyCaption}
                  onChange={(event) => setStoryCaption(event.target.value)}
                  maxLength={200}
                  placeholder="Story caption"
                  className="min-w-0 flex-1 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-700 outline-none focus:bg-slate-100"
                />
                <label className="cursor-pointer rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                  {storyFile ? storyFile.name : "Choose Story Image"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      if (!file.type.startsWith("image/")) {
                        setStoryError("Please select a valid image.");
                        event.target.value = "";
                        return;
                      }
                      setStoryFile(file);
                      setStoryError("");
                    }}
                  />
                </label>
                <button
                  type="submit"
                  disabled={storyCreating}
                  className="rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {storyCreating ? "Sharing..." : "Add Story"}
                </button>
              </form>

              {(storyError || storyStoreError) && <p className="mb-3 text-xs text-red-500">{storyError || storyStoreError}</p>}

              {storyLoading ? (
                <p className="text-xs text-slate-400">Loading stories...</p>
              ) : (
                <div className="flex gap-4 overflow-x-auto scrollbar-hide">
                  {stories.map((story) => (
                    <button
                      key={story._id}
                      type="button"
                      onClick={() => setActiveStory(story)}
                      className="group flex w-[76px] shrink-0 flex-col items-center gap-2"
                    >
                      <div className="rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 p-[3px] transition group-hover:scale-105">
                        <div className="rounded-full bg-white p-[2px]">
                          <img
                            src={story.author?.profileImage || story.image}
                            alt={story.author?.username || "Story"}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        </div>
                      </div>
                      <span className="w-full truncate text-center text-[11px] font-semibold text-slate-600">
                        {getStoryLabel(story)}
                      </span>
                    </button>
                  ))}

                  {stories.length === 0 && (
                    <p className="text-xs text-slate-400">No active stories yet.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* CREATE POST / REEL COMPOSER */}
          <form
            onSubmit={handleCreateContent}
            className="mb-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <Avatar initials={getInitials(user?.name)} tone="from-indigo-500 to-violet-500" />

              <textarea
                value={caption}
                onChange={(event) => setCaption(event.target.value)}
                maxLength={500}
                rows={2}
                placeholder={`What's on your mind, ${user?.name?.split(" ")[0] || "there"}?`}
                className="flex-1 resize-none rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:bg-slate-100"
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => handleContentTypeChange("post")}
                className={contentType === "post" ? "rounded-xl bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700" : "rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50"}
              >
                ▧ Post
              </button>

              <button
                type="button"
                onClick={() => handleContentTypeChange("reel")}
                className={contentType === "reel" ? "rounded-xl bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700" : "rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50"}
              >
                ▶ Reel
              </button>

              <label className="cursor-pointer rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-50">
                {contentType === "post" ? "Choose Image" : "Choose Video"}
                <input
                  type="file"
                  accept={contentType === "post" ? "image/*" : "video/*"}
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              <button
                type="submit"
                disabled={createLoading}
                className="ml-auto rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {createLoading ? "Creating..." : contentType === "post" ? "Create Post" : "Create Reel"}
              </button>
            </div>

            {selectedFile && (
              <p className="mt-2 text-xs text-slate-500">Selected: {selectedFile.name}</p>
            )}

            {createError && (
              <p className="mt-2 text-xs text-red-500">{createError}</p>
            )}
          </form>

          <div className="space-y-5">
            {feedLoading && (
              <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
                Loading your feed...
              </div>
            )}

            {!feedLoading && feedError && (
              <div className="rounded-3xl border border-red-100 bg-red-50 p-5 text-sm text-red-600 shadow-sm">
                {feedError}
              </div>
            )}

            {!feedLoading && !feedError && posts.length === 0 && reels.length === 0 && (
              <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <p className="font-bold text-slate-700">Your feed is empty</p>
                <p className="mt-1 text-sm text-slate-500">
                  Create a post or reel to get started.
                </p>
              </div>
            )}

            {/* POSTS: render real API data returned by GET /post. */}
            {posts.map((post) => (
              <article
                key={post._id}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        post.author?.profileImage ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          post.author?.name || "User"
                        )}&background=6366f1&color=fff`
                      }
                      alt={post.author?.name || "User"}
                      className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-white"
                    />
                    <div>
                      <p className="text-sm font-bold">
                        {post.author?.name || "Unknown User"}
                      </p>
                      <p className="text-xs text-slate-400">
                        @{post.author?.username || "user"} ·{" "}
                        {new Date(post.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === post._id ? null : post._id);
                      }}
                      className="rounded-full px-2.5 py-1 text-lg leading-none text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                      aria-label="Post options"
                    >
                      •••
                    </button>

                    {openMenuId === post._id && (
                      <div
                        className="absolute right-0 top-8 z-30 w-44 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl py-1 text-xs font-semibold"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            handleShare(post, "post");
                            setOpenMenuId(null);
                          }}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50"
                        >
                          <span>↗</span>
                          <span>Copy Link</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            navigate(`/profile/${post.author?.username}`);
                            setOpenMenuId(null);
                          }}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50"
                        >
                          <span>👤</span>
                          <span>View Profile</span>
                        </button>

                        {(post.author?._id?.toString() === user?._id?.toString() ||
                          post.author?.username === user?.username) && (
                          <button
                            type="button"
                            onClick={() => handleDeletePost(post._id)}
                            disabled={deleteLoading[post._id]}
                            className="flex w-full items-center gap-2 border-t border-slate-100 px-4 py-2.5 text-left text-rose-600 hover:bg-rose-50"
                          >
                            <span>🗑</span>
                            <span>{deleteLoading[post._id] ? "Deleting..." : "Delete Post"}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {post.image && (
                  <img
                    src={post.image}
                    alt={post.caption || "Post"}
                    className="max-h-[620px] w-full object-cover"
                  />
                )}

                <div className="px-5 pb-5 pt-4">
                  <p className="text-sm leading-6 text-slate-700">
                    {post.caption}
                  </p>

                  {renderInteractions(post, "post")}
                </div>
              </article>
            ))}

            {/* REELS: render real API data returned by GET /reel. */}
            {reels.map((reel) => (
              <article
                key={reel._id}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        reel.author?.profileImage ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          reel.author?.name || "User"
                        )}&background=6366f1&color=fff`
                      }
                      alt={reel.author?.name || "User"}
                      className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-white"
                    />
                    <div>
                      <p className="text-sm font-bold">
                        {reel.author?.name || "Unknown User"}
                      </p>
                      <p className="text-xs text-slate-400">
                        @{reel.author?.username || "user"} ·{" "}
                        {new Date(reel.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === reel._id ? null : reel._id);
                      }}
                      className="rounded-full px-2.5 py-1 text-lg leading-none text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                      aria-label="Reel options"
                    >
                      •••
                    </button>

                    {openMenuId === reel._id && (
                      <div
                        className="absolute right-0 top-8 z-30 w-44 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl py-1 text-xs font-semibold"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            handleShare(reel, "reel");
                            setOpenMenuId(null);
                          }}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50"
                        >
                          <span>↗</span>
                          <span>Copy Link</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            navigate(`/profile/${reel.author?.username}`);
                            setOpenMenuId(null);
                          }}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50"
                        >
                          <span>👤</span>
                          <span>View Profile</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {reel.video && (
                  <video
                    src={reel.video}
                    controls
                    className="max-h-[620px] w-full bg-black object-contain"
                  />
                )}

                <div className="px-5 pb-5 pt-4">
                  <p className="text-sm leading-6 text-slate-700">
                    {reel.caption}
                  </p>

                  {renderInteractions(reel, "reel")}
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-slate-900">People to follow</h2>
              </div>
              <div className="mt-4 space-y-4">
                {suggestedUsers.length === 0 ? (
                  <p className="text-xs text-slate-400">No new suggestions</p>
                ) : (
                  suggestedUsers.map((item) => {
                    const isFollowing = (user?.followings || []).some(
                      (id) => (id?._id || id)?.toString() === item._id?.toString()
                    ) || (item.followers || []).some(
                      (id) => (id?._id || id)?.toString() === user?._id?.toString()
                    );
                    const initials = (item.name || item.username || "U")
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2);

                    return (
                      <div key={item._id} className="flex items-center gap-3">
                        <div
                          className="cursor-pointer"
                          onClick={() => navigate(`/profile/${item.username}`)}
                        >
                          {item.profileImage ? (
                            <img
                              src={item.profileImage}
                              alt={item.name}
                              className="h-10 w-10 rounded-full object-cover ring-2 ring-white"
                            />
                          ) : (
                            <Avatar initials={initials} tone="from-indigo-500 to-purple-600" size="h-10 w-10" />
                          )}
                        </div>
                        <div
                          className="min-w-0 flex-1 cursor-pointer"
                          onClick={() => navigate(`/profile/${item.username}`)}
                        >
                          <p className="truncate text-sm font-bold text-slate-900 hover:text-indigo-600 transition">
                            {item.name}
                          </p>
                          <p className="truncate text-xs text-slate-400">@{item.username}</p>
                        </div>
                        <button
                          onClick={() => handleFollowToggle(item)}
                          disabled={followLoading[item._id]}
                          className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                            isFollowing
                              ? "border border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200"
                              : "border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white"
                          }`}
                        >
                          {followLoading[item._id] ? "..." : isFollowing ? "Following" : "Follow"}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </aside>
      </main>


      {/* Share Toast */}
      {shareToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-xs font-semibold text-white shadow-xl">
          <span>✓</span>
          <span>{shareToast}</span>
        </div>
      )}

      {/* Notifications Drawer Modal */}
      {notificationsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setNotificationsOpen(false)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">🔔</span>
                <h3 className="font-bold text-slate-900">Notifications</h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  Mark all read
                </button>
                <button
                  onClick={() => setNotificationsOpen(false)}
                  className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="max-h-96 divide-y divide-slate-100 overflow-y-auto p-2">
              {notifications.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-start gap-3 rounded-2xl p-3 transition ${item.read ? 'bg-white' : 'bg-indigo-50/50'}`}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-sm font-bold text-indigo-600">
                    {item.type === 'welcome' ? '🎉' : '⚡'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900">{item.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{item.message}</p>
                    <p className="mt-1 text-[10px] text-slate-400">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeStory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setActiveStory(null)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-3xl bg-black shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between bg-black px-4 py-3 text-white">
              <div className="flex items-center gap-3">
                <img
                  src={activeStory.author?.profileImage || activeStory.image}
                  alt={activeStory.author?.username || "Story"}
                  className="h-9 w-9 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-bold">{getStoryLabel(activeStory)}</p>
                  <p className="text-[11px] text-white/60">
                    {new Date(activeStory.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveStory(null)}
                className="rounded-full px-3 py-1 text-xl text-white/80 hover:bg-white/10"
              >
                ×
              </button>
            </div>

            <img
              src={activeStory.image}
              alt={activeStory.caption || "Story"}
              className="max-h-[75vh] w-full bg-black object-contain"
            />

            {activeStory.caption && (
              <p className="bg-black px-4 py-4 text-sm text-white">{activeStory.caption}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
