import { useState, useEffect, useRef } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  MessageCircle,
  X,
  Send,
  Building2,
  Loader2,
  Check,
  CheckCheck,
  Eye,
} from 'lucide-react';
import * as api from '../utils/api';
import { toast } from 'sonner@2.0.3';

interface MunicipalCommunicationChatProps {
  stateId: string;
  stateName: string;
  municipalId: string;
  municipalName: string;
  onViewComplaint?: (complaintId: number) => void;
}

export function MunicipalCommunicationChat({
  stateId,
  stateName,
  municipalId,
  municipalName,
  onViewComplaint,
}: MunicipalCommunicationChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<api.StateMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadMessages();
      // Mark messages as read when opening
      api.markMessagesAsRead(stateId, municipalId, 'municipal');
    }
  }, [isOpen]);

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load unread count
    loadUnreadCount();
    // Poll for new messages every 10 seconds
    const interval = setInterval(() => {
      loadUnreadCount();
      if (isOpen) {
        loadMessages();
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [stateId, municipalId, isOpen]);

  const loadUnreadCount = async () => {
    try {
      const count = await api.getUnreadCount(stateId, municipalId, 'municipal');
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const loadMessages = async () => {
    setLoading(true);
    try {
      const data = await api.getMessages(stateId, municipalId);
      setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const message = await api.sendMessage(
        stateId,
        municipalId,
        'municipal',
        municipalName,
        newMessage.trim()
      );
      setMessages([...messages, message]);
      setNewMessage('');
      toast.success('Message sent successfully');
      // Focus back on input
      messageInputRef.current?.focus();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-50"
      >
        <MessageCircle className="w-7 h-7 text-white" />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-xs text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>
          </div>
        )}
      </button>
    );
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 hover:scale-105 transition-transform"
        >
          <MessageCircle className="w-5 h-5 text-white" />
          <span className="text-white">State Communication</span>
          {unreadCount > 0 && (
            <Badge className="bg-red-500 text-white border-0">{unreadCount}</Badge>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] z-50 flex flex-col">
      <Card className="flex-1 flex flex-col shadow-2xl border-2 border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-white" />
            <div>
              <h3 className="text-white">{stateName} State Government</h3>
              {unreadCount > 0 && (
                <p className="text-xs text-white text-opacity-90">{unreadCount} unread messages</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(true)}
              className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded transition"
            >
              <span className="text-xl">−</span>
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col bg-gray-50">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loading && messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : messages.length > 0 ? (
              <>
                {messages.map((message) => {
                  const isFromMunicipal = message.senderType === 'municipal';
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isFromMunicipal ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                          isFromMunicipal
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                            : 'bg-white border border-gray-200'
                        }`}
                      >
                        {!isFromMunicipal && (
                          <p className="text-xs text-gray-500 mb-1">{message.senderName}</p>
                        )}
                        <p
                          className={`text-sm whitespace-pre-wrap ${
                            isFromMunicipal ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {message.messageText}
                        </p>
                        {message.complaintId && (
                          <button
                            onClick={() => {
                              if (onViewComplaint) {
                                onViewComplaint(message.complaintId!);
                                setIsOpen(false);
                              } else {
                                toast.info('Complaint Reference', {
                                  description: `This message refers to Complaint #${message.complaintId}. Check the Departments tab to view and resolve it.`,
                                });
                              }
                            }}
                            className={`mt-2 flex items-center gap-1 text-xs px-2 py-1 rounded ${
                              isFromMunicipal
                                ? 'bg-white bg-opacity-20 hover:bg-opacity-30 text-white'
                                : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                            }`}
                          >
                            <Eye className="w-3 h-3" />
                            View Complaint #{message.complaintId}
                          </button>
                        )}
                        <div
                          className={`flex items-center gap-1 mt-1 text-xs ${
                            isFromMunicipal ? 'text-white text-opacity-80' : 'text-gray-500'
                          }`}
                        >
                          <span>{formatTime(message.sentAt)}</span>
                          {isFromMunicipal && (
                            <>
                              {message.isRead ? (
                                <CheckCheck className="w-3 h-3" />
                              ) : (
                                <Check className="w-3 h-3" />
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageCircle className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">No messages yet</p>
                <p className="text-xs text-gray-500">
                  Start a conversation with {stateName} State Government
                </p>
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-200 p-4 bg-white">
            <div className="flex items-end gap-2">
              <textarea
                ref={messageInputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent max-h-32"
                rows={2}
                disabled={sending}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sending}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg"
              >
                {sending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
