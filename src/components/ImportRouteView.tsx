import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ImportPreviewDialog } from './ImportPreviewDialog';
import { getImportPreview, importRoutineStructure } from '../services/sharingService';

interface PreviewState {
  title: string;
  description?: string;
  categoryCount: number;
  habitCount: number;
}

export function ImportRouteView() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const encoded = params.get('d');
    if (!encoded) {
      setErrorMessage('Import link is missing payload data.');
      return;
    }

    try {
      const result = getImportPreview(encoded);
      setPreview({
        title: result.title,
        description: result.description,
        categoryCount: result.categoryCount,
        habitCount: result.habitCount,
      });
      setErrorMessage('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to parse this import link.';
      setErrorMessage(message);
      setPreview(null);
    }
  }, [params]);

  const encodedPayload = params.get('d') ?? '';

  return (
    <section className="space-y-4">
      <header className="rounded-3xl bg-white/80 p-6 shadow-soft">
        <h1 className="text-2xl font-semibold tracking-tight">Import routine</h1>
        <p className="mt-2 text-sm text-ink/70">Review structure-only details before saving this routine locally.</p>
      </header>

      {errorMessage ? (
        <div className="rounded-3xl bg-white/80 p-6 shadow-soft">
          <p className="text-sm text-red-600">{errorMessage}</p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mt-4 rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper"
          >
            Return home
          </button>
        </div>
      ) : null}

      <ImportPreviewDialog
        isOpen={Boolean(preview)}
        title={preview?.title ?? ''}
        description={preview?.description}
        categoryCount={preview?.categoryCount ?? 0}
        habitCount={preview?.habitCount ?? 0}
        onCancel={() => navigate('/routines')}
        onConfirm={async () => {
          const routineId = await importRoutineStructure(encodedPayload);
          navigate(`/routines/${routineId}`);
        }}
      />
    </section>
  );
}
