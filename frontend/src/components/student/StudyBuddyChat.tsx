import { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function StudyBuddyChat({ courseId }: { courseId: string }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'agent', text: string}[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);
    
    try {
      const aiServiceUrl = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000';
      const res = await axios.post(`${aiServiceUrl}/chat`, {
        course_id: courseId!,
        query: userMsg
      });
      
      setMessages(prev => [...prev, { role: 'agent', text: res.data.response }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'agent', text: 'Sorry, I encountered an error connecting to the AI service.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto h-[600px] flex flex-col shadow-lg">
      <CardHeader className="bg-gradient-to-r from-purple-100 to-indigo-100 border-b">
        <CardTitle className="flex items-center space-x-2 text-indigo-800">
          <span>🧠</span>
          <span>AI Study Buddy (Gemini 2.5 Flash)</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-4 overflow-hidden">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-2">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-10">
              Ask me anything about the course materials! I have read all the PDFs.
            </div>
          )}
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg p-3 ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-br-none' 
                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-800 rounded-lg p-3 rounded-bl-none animate-pulse">
                Thinking...
              </div>
            </div>
          )}
        </div>
        
        <div className="flex space-x-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask a question about this course..."
            className="flex-1 border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Button onClick={sendMessage} disabled={loading || !input.trim()}>
            Send
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
