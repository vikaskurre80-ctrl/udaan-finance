import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/Button';
import { Alert } from '@/components/Alert';
import { useFinanceStore } from '@/store/finance';
import { useRouter } from 'next/router';

export default function EditVideoPage() {
  const router = useRouter();
  const { id } = router.query;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const videos = useFinanceStore((state) => state.videos);
  const updateVideo = useFinanceStore((state) => state.updateVideo);

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    status: 'PENDING',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id && videos.length > 0) {
      const video = videos.find(v => v.id === id);
      if (video) {
        setFormData({
          title: video.title,
          date: new Date(video.date).toISOString().split('T')[0],
          status: video.status.toUpperCase() as any,
        });
      }
    }
  }, [id, videos]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title) {
      setError('Video title is required');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/videos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to update video');

      const video = await response.json();
      updateVideo(String(id), video);

      setShowSuccess(true);
      setIsLoading(false);

      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err: any) {
      console.error('Error updating video:', err);
      setError(err.message || 'Failed to update video. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <Layout
      sidebar={<Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
      header={<Header title="Edit Video" showMenu onMenuClick={() => setSidebarOpen(!sidebarOpen)} />}
    >
      <div className="p-4 md:p-8 max-w-3xl mx-auto">
        {showSuccess && (
          <Alert type="success" title="Video Updated!" message="Video updated successfully. Redirecting..." />
        )}
        {error && (
          <Alert type="error" title="Error" message={error} onClose={() => setError(null)} />
        )}

        <div className="card p-6 md:p-8 mt-6">
          <h2 className="text-2xl font-bold text-apple-text mb-2">Edit Video</h2>
          <p className="text-apple-text-secondary mb-6">Update video details.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-apple-text mb-2">Video Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Kurta Promo Reel"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-apple-text mb-2">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="input-field w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-apple-text mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="input-field w-full"
                >
                  <option value="PENDING">Pending</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="flex-1">
                Save Changes
              </Button>
              <Button type="button" variant="secondary" size="lg" onClick={() => router.push('/dashboard')} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}