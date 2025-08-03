import { ThumbsUp, ThumbsDown, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Comment = ({
  comment,
  onReply,
  onVote,
  upvotedComments,
  downvotedComments,
  repliesCount,
  toggleState,
  onToggle,
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
            <span className="ml-2 text-blue-400">
              • {repliesCount} repl{repliesCount === 1 ? 'y' : 'ies'}
            </span>
          )}
        </span>
        <div className="flex gap-3 items-center">
          <div className="flex gap-2 items-center">
            <button
              onClick={() => onVote(comment.id, 'up')}
              className={`hover:text-green-500 ${isUpvoted ? 'text-green-400' : 'text-gray-400'}`}
              aria-label="Upvote"
            >
              <ThumbsUp size={16} fill={isUpvoted ? 'currentColor' : 'none'} stroke="currentColor" />
            </button>
            <span className="text-gray-400 font-semibold">{voteScore}</span>
            <button
              onClick={() => onVote(comment.id, 'down')}
              className={`hover:text-red-500 ${isDownvoted ? 'text-red-400' : 'text-gray-400'}`}
              aria-label="Downvote"
            >
              <ThumbsDown size={16} fill={isDownvoted ? 'currentColor' : 'none'} stroke="currentColor" />
            </button>
          </div>
          <button
            onClick={() => onReply(comment.id)}
            className="hover:text-white flex items-center gap-1 text-gray-400"
            aria-label="Reply"
          >
            <MessageCircle size={14} />
            <span>Reply</span>
            {repliesCount > 0 && (
              <span className="ml-1 text-blue-400">({repliesCount})</span>
            )}
          </button>
          {repliesCount > 0 && (
            <button
              onClick={() => onToggle(comment.id)}
              className="text-blue-400 hover:text-white ml-2"
              aria-label="Toggle replies"
            >
              {toggleState === 'expanded' ? 'Hide Replies' : 'View Replies'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const CommentSection = ({
  comments,
  onReply,
  onVote,
  upvotedComments,
  downvotedComments,
  repliesCountMap,
  toggleStates,
  onToggle,
}) => {
  return (
    <div>
      {comments.map(comment => (
        <Comment
          key={comment.id}
          comment={comment}
          onReply={onReply}
          onVote={onVote}
          upvotedComments={upvotedComments}
          downvotedComments={downvotedComments}
          repliesCount={repliesCountMap[comment.id] || 0}
          toggleState={toggleStates[comment.id] || 'collapsed'}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
};

export default CommentSection;
