import { useState, useRef, useEffect } from 'react';
import { FaRobot, FaTimes, FaPaperPlane, FaTrash } from 'react-icons/fa';
import { generateAIResponse } from '../utils/openai';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Salam! Mən sizin AI asistanınızam. Sizə necə kömək edə bilərəm?',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    // Add user message
    const userMessage = { role: 'user', content: inputMessage };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      // Get AI response using HuggingFace
      const response = await generateAIResponse([...messages, userMessage]);
      setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('AI cavabı alınarkən xəta:', error);
      setError('Cavab alına bilmədi. Zəhmət olmasa yenidən cəhd edin.');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Üzr istəyirəm, xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Salam! Mən sizin AI asistanınızam. Sizə necə kömək edə bilərəm?',
      },
    ]);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-full shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          aria-label="Open chat"
        >
          <FaRobot className="text-2xl" />
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div
            ref={chatContainerRef}
            className="bg-white rounded-lg shadow-2xl w-[800px] h-[800px] flex flex-col"
          >
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-5 rounded-t-lg flex justify-between items-center">
              <div className="flex items-center gap-3">
                <FaRobot className="text-3xl" />
                <h3 className="font-semibold text-xl">AI Asistan</h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={clearChat}
                  className="hover:text-gray-200 transition-colors p-2 rounded-full hover:bg-blue-800"
                  aria-label="Clear chat"
                  title="Clear chat"
                >
                  <FaTrash className="text-xl" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="hover:text-gray-200 transition-colors p-2 rounded-full hover:bg-blue-800"
                  aria-label="Close chat"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-gray-50">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl p-5 shadow-sm ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                        : 'bg-white text-gray-800 border border-gray-200'
                    }`}
                  >
                    <p className="text-lg leading-relaxed whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white text-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200">
                    <div className="flex space-x-3">
                      <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce" />
                      <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce delay-100" />
                      <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
              {error && (
                <div className="text-red-500 text-base text-center mt-3 bg-red-50 p-4 rounded-lg">
                  {error}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="p-6 border-t bg-white">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Mesajınızı yazın..."
                  className="flex-1 p-5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className={`bg-gradient-to-r from-blue-600 to-blue-700 text-white p-5 rounded-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={isLoading}
                  aria-label="Send message"
                >
                  <FaPaperPlane className="text-xl" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
