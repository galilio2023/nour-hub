"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, MessageCircle, Send, Quote } from "lucide-react";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

interface Like {
    id: string;
    userId: string;
    creationId: string;
}

interface Comment {
    id: string;
    content: string;
    createdAt: string;
    user: {
        name: string;
    };
}

interface ParentCreation {
    title: string;
    user: {
        name: string;
    };
}

export function CreationSocial({ creationId, initialLikes = [], parent }: { creationId: string, initialLikes?: Like[], parent?: ParentCreation }) {
  const { data: session } = authClient.useSession();
  const queryClient = useQueryClient();
  const [commentContent, setCommentContent] = useState("");

  const { data: comments, isLoading: commentsLoading } = useQuery<Comment[]>({
    queryKey: ["comments", creationId],
    queryFn: async () => {
      const res = await fetch(`/api/comments?creationId=${creationId}`);
      return res.json();
    },
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/likes", {
        method: "POST",
        body: JSON.stringify({ creationId }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creations"] });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch("/api/comments", {
        method: "POST",
        body: JSON.stringify({ creationId, content }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", creationId] });
      setCommentContent("");
    },
  });

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;
    commentMutation.mutate(commentContent);
  };

  return (
    <div className="space-y-6">
      {parent && (
          <div className="bg-[#F1F5F9] p-4 rounded-2xl border-l-4 border-[#A78BFA] animate-in slide-in-from-left duration-500">
              <div className="flex items-center gap-2 mb-2">
                  <Quote className="w-4 h-4 text-[#A78BFA]" />
                  <span className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">Remixed From</span>
              </div>
              <p className="text-xs font-bold text-[#475569] mb-1 italic">&quot;{parent.title}&quot;</p>
              <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center text-[#A78BFA] font-bold text-[8px] shadow-sm">
                      {parent.user?.name?.[0] || 'K'}
                  </div>
                  <span className="text-[10px] font-bold text-[#64748b]">By {parent.user?.name || "Creative Kid"}</span>
              </div>
          </div>
      )}

      <div className="flex items-center gap-6">
        <button 
          onClick={() => likeMutation.mutate()}
          className="flex items-center gap-2 group"
        >
          <div className="p-2 group-hover:bg-red-50 rounded-full transition-colors">
            <Heart className={`w-6 h-6 transition-colors ${likeMutation.isPending ? 'animate-pulse' : ''} ${initialLikes.some(l => l.userId === session?.user?.id) ? 'fill-red-500 text-red-500' : 'text-[#64748b]'}`} />
          </div>
          <span className="font-bold text-[#475569]">{initialLikes.length}</span>
        </button>
        <div className="flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-[#64748b]" />
          <span className="font-bold text-[#475569]">{comments?.length || 0}</span>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-[#475569] uppercase tracking-wider text-xs">Comments</h3>
        
        <form onSubmit={handleComment} className="relative">
            <input 
                type="text" 
                placeholder="Say something nice..."
                className="w-full pl-4 pr-12 py-3 bg-gray-50 border-2 border-transparent focus:border-[#4ECDC4] rounded-xl outline-none transition-colors"
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                disabled={commentMutation.isPending}
            />
            <button 
                type="submit"
                disabled={commentMutation.isPending || !commentContent.trim()}
                className="absolute right-2 top-2 p-1.5 bg-[#4ECDC4] text-white rounded-lg hover:scale-110 active:scale-95 transition-transform disabled:opacity-50"
            >
                <Send className="w-5 h-5" />
            </button>
        </form>

        <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {commentsLoading ? (
                <div className="text-center text-sm text-[#64748b]">Loading comments...</div>
            ) : comments?.length === 0 ? (
                <div className="text-center py-6 text-sm text-[#64748b] bg-gray-50 rounded-xl">No comments yet. Be the first!</div>
            ) : (
                comments?.map((comment) => (
                    <div key={comment.id} className="flex gap-3 p-3 bg-white rounded-xl shadow-sm border border-gray-50">
                        <div className="w-8 h-8 rounded-full bg-[#A78BFA] flex-shrink-0 flex items-center justify-center text-white font-bold text-xs">
                            {comment.user?.name?.[0] || 'K'}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="font-bold text-xs text-[#475569]">{comment.user?.name}</span>
                                <span className="text-[10px] text-[#94a3b8]">{new Date(comment.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm text-[#64748b] leading-relaxed">{comment.content}</p>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
}
