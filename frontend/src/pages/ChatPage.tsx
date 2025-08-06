/**
 * AI聊天页面
 * 
 * 心理过程：
 * 1. 实时聊天体验，类似现代IM工具
 * 2. 会话管理和历史记录
 * 3. 智能建议和快捷回复
 * 4. 文件上传和多媒体支持
 * 5. 响应式设计，支持移动端
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  PaperAirplaneIcon, 
  PlusIcon,
  ChatBubbleLeftRightIcon,
  UserCircleIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';
import { aiService } from '../services';

interface ChatMessage {
  id: string;
  message: string;
  sender_type: 'user' | 'ai';
  timestamp: string;
  suggestions?: string[];
}

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 滚动到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 初始化聊天会话
  useEffect(() => {
    const initChat = async () => {
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        message: "您好！我是您的AI购物助手，有什么可以帮您的吗？",
        sender_type: 'ai',
        timestamp: new Date().toISOString(),
        suggestions: ['推荐商品', '查询订单', '购物建议', '价格比较']
      };
      setMessages([welcomeMessage]);
    };
    
    initChat();
  }, []);

  // 发送消息
  const sendMessage = async (message: string) => {
    if (!message.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      message: message.trim(),
      sender_type: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await aiService.chat(message, sessionId);
      
      if (response.success) {
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          message: response.data.response,
          sender_type: 'ai',
          timestamp: new Date().toISOString(),
          suggestions: response.data.suggestions
        };
        
        setMessages(prev => [...prev, aiMessage]);
        
        if (response.data.sessionId) {
          setSessionId(response.data.sessionId);
        }
      } else {
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          message: '抱歉，我暂时无法回复您的消息，请稍后再试。',
          sender_type: 'ai',
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('发送消息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 处理表单提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  // 处理建议点击
  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  // 消息气泡组件
  const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isUser = message.sender_type === 'user';
    
    return (
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`flex max-w-xs lg:max-w-md ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2`}>
          <div className={`flex-shrink-0 ${isUser ? 'ml-2' : 'mr-2'}`}>
            {isUser ? (
              <UserCircleIcon className="h-8 w-8 text-gray-400" />
            ) : (
              <div className="bg-aws-orange rounded-full p-1">
                <CpuChipIcon className="h-6 w-6 text-white" />
              </div>
            )}
          </div>
          
          <div>
            <div className={`px-4 py-2 rounded-2xl ${
              isUser 
                ? 'bg-aws-orange text-white rounded-br-sm' 
                : 'bg-gray-100 text-gray-900 rounded-bl-sm'
            }`}>
              <p className="text-sm">{message.message}</p>
            </div>
            
            {/* 时间戳 */}
            <p className="text-xs text-gray-500 mt-1 px-2">
              {new Date(message.timestamp).toLocaleTimeString()}
            </p>
            
            {/* AI建议 */}
            {message.suggestions && message.suggestions.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {message.suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs rounded-full transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto h-screen flex flex-col">
        {/* 聊天头部 */}
        <div className="bg-white shadow-sm border-b px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className="bg-aws-orange rounded-full p-2">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">AI购物助手</h1>
              <p className="text-sm text-gray-500">在线 · 随时为您服务</p>
            </div>
          </div>
        </div>

        {/* 聊天消息区域 */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.map(message => (
            <MessageBubble key={message.id} message={message} />
          ))}
          
          {loading && (
            <div className="flex justify-start mb-4">
              <div className="flex items-center space-x-2">
                <div className="bg-aws-orange rounded-full p-1">
                  <CpuChipIcon className="h-6 w-6 text-white" />
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* 输入区域 */}
        <div className="bg-white border-t px-4 py-4">
          <form onSubmit={handleSubmit} className="flex items-end space-x-3">
            <button
              type="button"
              className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              <PlusIcon className="h-6 w-6" />
            </button>
            
            <div className="flex-1">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(inputMessage);
                  }
                }}
                placeholder="输入您的问题..."
                className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-aws-orange focus:border-transparent resize-none max-h-32"
                rows={1}
                disabled={loading}
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="flex-shrink-0 bg-aws-orange hover:bg-red-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-2 rounded-full transition-colors"
            >
              <PaperAirplaneIcon className="h-6 w-6" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;