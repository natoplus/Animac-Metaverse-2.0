import { useEffect, useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Comment = ({
  comment,
  onReply,
  onVote,
  upvotedComments,
  downvotedComments,
  repliesCount,
  toggleReplies,
  isExpanded,
}) => {
  const isUpvoted = upvotedComments.includes(comment.id);
  const isDownvoted = downvotedComments.includes(comment.id);
  const voteScore = comment.score ?? ((comment.likes || 0) - (comment.dislikes || 0));

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="bg-gray-900 p-4 rounded-lg mb-3 text-gray-200 text-sm"
    >
      <p className="mb-2">{comment.content || '[Deleted]'}</p>
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>
          by {comment.author || 'Anonymous'} • {new Date(comment.created_at).toLocaleString()}
          {repliesCount > 0 && (
            <span className="ml-2 text-blue-400">• {repliesCount} repl{repliesCount === 1 ? 'y' : 'ies'}</span>
          )}
        </span>
        <div className="flex gap-3 items-center">
          <div className="flex gap-2 items-center">
            <button
              onClick={() => onVote(comment.id, 'up')}
              className={`hover:text-green-500 ${isUpvoted ? 'text-green-400' : 'text-gray-400'}`}
              aria-label="Upvote"
            >
              <ThumbsUp
                size={16}
                fill={isUpvoted ? 'currentColor' : 'none'}
                stroke="currentColor"
              />
            </button>
            <span className="text-gray-400 font-semibold">{voteScore}</span>
            <button
              onClick={() => onVote(comment.id, 'down')}
              className={`hover:text-red-500 ${isDownvoted ? 'text-red-400' : 'text-gray-400'}`}
              aria-label="Downvote"
            >
              <ThumbsDown
                size={16}
                fill={isDownvoted ? 'currentColor' : 'none'}
                stroke="currentColor"
              />
            </button>
          </div>
          <button
            onClick={() => onReply(comment.id)}
            className="hover:text-white flex items-center gap-1 text-gray-400"
            aria-label="Reply"
          >
            <MessageCircle size={14} />
            <span>Reply</span>
          </button>
          {repliesCount > 0 && (
            <button
              onClick={() => toggleReplies(comment.id)}
              className="text-blue-400 hover:text-white ml-2"
              aria-label="Toggle replies"
            >
              {isExpanded ? 'Hide Replies' : 'View Replies'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const CommentSection = ({
  comments = [],
  onReply,
  onVote,
  upvotedComments = [],
  downvotedComments = [],
  repliesMap = {},
  loadMoreComments,
  hasMore,
}) => {
  const [visibleComments, setVisibleComments] = useState(5);
  const [expandedReplies, setExpandedReplies] = useState({});

  const handleToggleReplies = (commentId) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const handleLoadMore = () => {
    setVisibleComments((prev) => prev + 5);
    if (loadMoreComments) loadMoreComments();
  };

  const parentComments = comments.filter((c) => !c.parent_id);

  return (
    <div className="mt-6 space-y-3">
      <AnimatePresence>
        {parentComments.slice(0, visibleComments).map((comment) => (
          <div key={comment.id}>
            <Comment
              comment={comment}
              onReply={onReply}
              onVote={onVote}
              upvotedComments={upvotedComments}
              downvotedComments={downvotedComments}
              repliesCount={(repliesMap[comment.id] || []).length}
              toggleReplies={handleToggleReplies}
              isExpanded={expandedReplies[comment.id]}
            />
            <AnimatePresence>
              {expandedReplies[comment.id] &&
                (repliesMap[comment.id] || []).map((reply) => (
                  <motion.div
                    key={reply.id}
                    className="ml-6 border-l border-gray-700 pl-4"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Comment
                      comment={reply}
                      onReply={onReply}
                      onVote={onVote}
                      upvotedComments={upvotedComments}
                      downvotedComments={downvotedComments}
                      repliesCount={(repliesMap[reply.id] || []).length}
                      toggleReplies={handleToggleReplies}
                      isExpanded={expandedReplies[reply.id]}
                    />
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
        ))}
      </AnimatePresence>

      {hasMore && (
        <div className="text-center mt-4">
          <button
            onClick={handleLoadMore}
            className="text-blue-400 hover:text-white px-4 py-2 rounded border border-blue-500 hover:bg-blue-500 transition"
          >
            Load More Comments
          </button>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
