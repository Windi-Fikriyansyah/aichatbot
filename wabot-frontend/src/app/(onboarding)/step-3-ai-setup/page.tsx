'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Button from '@/components/ui/button/Button';
import TextArea from '@/components/form/input/TextArea';
import { Label } from '@/components/ui/label';
import { ArrowRight, Loader2, Bot } from 'lucide-react';

export default function Step3AiSetup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    provider: 'openai',
    model: 'gpt-4o-mini',
    temperature: 0.7
  });

  const tenantId = typeof window !== 'undefined' ? localStorage.getItem('tenantId') : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;

    setLoading(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/onboarding/ai-config`, formData, {
        headers: { 'x-tenant-id': tenantId }
      });
      router.push('/step-4-catalog');
    } catch (error) {
      console.error(error);
      alert('Gagal menyimpan pengaturan AI');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <Bot className="w-8 h-8 text-brand-500" />
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white/90">Pengaturan AI</h2>
        </div>
        <p className="text-gray-500 dark:text-gray-400">Atur otak AI yang akan membalas pesan pelanggan Anda.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="provider">Penyedia AI</Label>
          <div className="relative">
            <select 
              id="provider" 
              className="w-full appearance-none rounded-lg border border-gray-200 bg-transparent px-4 py-3 text-sm text-gray-800 outline-none transition-colors focus:border-brand-500 dark:border-gray-800 dark:text-white/90"
              value={formData.provider}
              onChange={(e) => {
                const provider = e.target.value;
                const model = provider === 'openai' ? 'gpt-4o-mini' : 'anthropic/claude-3.5-sonnet';
                setFormData({...formData, provider, model});
              }}
            >
              <option value="openai" className="dark:bg-gray-900">OpenAI</option>
              <option value="openrouter" className="dark:bg-gray-900">OpenRouter</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="model">Model AI</Label>
          <div className="relative">
            <select 
              id="model" 
              className="w-full appearance-none rounded-lg border border-gray-200 bg-transparent px-4 py-3 text-sm text-gray-800 outline-none transition-colors focus:border-brand-500 dark:border-gray-800 dark:text-white/90"
              value={formData.model}
              onChange={(e) => setFormData({...formData, model: e.target.value})}
            >
              {formData.provider === 'openai' ? (
                <>
                  <option value="gpt-4o-mini" className="dark:bg-gray-900">GPT-4o Mini (Cepat & Hemat)</option>
                  <option value="gpt-4o" className="dark:bg-gray-900">GPT-4o (Pintar)</option>
                </>
              ) : (
                <>
                  <option value="anthropic/claude-3.5-sonnet" className="dark:bg-gray-900">Claude 3.5 Sonnet (Disarankan)</option>
                  <option value="deepseek/deepseek-chat" className="dark:bg-gray-900">DeepSeek V3</option>
                  <option value="meta-llama/llama-3-70b-instruct" className="dark:bg-gray-900">Llama 3 70B</option>
                  <option value="nvidia/nemotron-3-super-120b-a12b:free" className="dark:bg-gray-900">Nvidia Nemotron 120B (Free)</option>
                </>
              )}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="temperature">Kreativitas (Temperature): {formData.temperature}</Label>
          <input 
            id="temperature" 
            type="range"
            min="0" max="1" step="0.1"
            className="w-full accent-brand-500"
            value={formData.temperature}
            onChange={(e) => setFormData({...formData, temperature: parseFloat(e.target.value)})}
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>Kaku & Akurat (0)</span>
            <span>Sangat Kreatif (1)</span>
          </div>
        </div>



        <div className="pt-4 flex justify-between mt-4">
          <Button 
            type="button"
            variant="outline" 
            onClick={() => router.push('/step-2-wa-connect')}
            className="text-gray-600 dark:text-gray-300"
          >
            Kembali
          </Button>
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2 inline" /> : null}
            Katalog <ArrowRight className="w-4 h-4 ml-2 inline" />
          </Button>
        </div>
      </form>
    </div>
  );
}
