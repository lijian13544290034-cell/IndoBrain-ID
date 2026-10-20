export type CoachConversationFailureCode =
  | 'AUTH_REQUIRED'
  | 'ACCESS_DENIED'
  | 'RATE_LIMITED'
  | 'SERVER_ERROR'
  | 'INVALID_RESPONSE'
  | 'ACTIVE_SESSION_INVALID'
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'REQUEST_ERROR';

export class CoachConversationRequestError extends Error {
  readonly code: CoachConversationFailureCode;
  readonly status: number | null;

  constructor(
    message: string,
    code: CoachConversationFailureCode,
    status: number | null = null,
  ) {
    super(message);
    this.name = 'CoachConversationRequestError';
    this.code = code;
    this.status = status;
  }
}

function isSuccessfulConversationPayload(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object') return false;
  const payload = value as Record<string, unknown>;
  return typeof payload.questionId === 'string' && payload.questionId.length > 0
    && typeof payload.answer === 'string' && payload.answer.trim().length > 0
    && typeof payload.timestamp === 'string' && payload.timestamp.length > 0
    && typeof payload.detectedLanguage === 'string'
    && typeof payload.intent === 'string'
    && Array.isArray(payload.intents)
    && Array.isArray(payload.skillIds)
    && Array.isArray(payload.capabilityIds)
    && Array.isArray(payload.speechSegments)
    && Boolean(payload.usage) && typeof payload.usage === 'object';
}

export async function parseCoachConversationResponse<T>(response: Response): Promise<T> {
  const raw = await response.text();
  let payload: unknown = null;
  try {
    payload = raw ? JSON.parse(raw) : null;
  } catch {
    throw new CoachConversationRequestError('Jawaban AI belum dapat dibaca. Silakan coba kirim lagi.', 'INVALID_RESPONSE', response.status);
  }

  if (!response.ok) {
    const serverMessage = payload && typeof payload === 'object' && typeof (payload as { error?: unknown }).error === 'string'
      ? (payload as { error: string }).error
      : '';
    if (response.status === 401) throw new CoachConversationRequestError('Silakan masuk ke akun IndoBrain, lalu kirim pertanyaanmu lagi.', 'AUTH_REQUIRED', 401);
    if (response.status === 403) throw new CoachConversationRequestError('Materi ini memerlukan akses yang sesuai. Pilih materi Hari 1–30 atau masuk dengan akun yang memiliki akses.', 'ACCESS_DENIED', 403);
    if (response.status === 429) throw new CoachConversationRequestError('Batas percakapan hari ini sudah tercapai. Silakan lanjutkan besok.', 'RATE_LIMITED', 429);
    if (response.status === 409) throw new CoachConversationRequestError('Sesi latihan aktif sudah berakhir atau tidak valid. Mulai ulang latihan untuk melanjutkan.', 'ACTIVE_SESSION_INVALID', 409);
    if (response.status >= 500) throw new CoachConversationRequestError('AI Coach sedang mengalami gangguan. Silakan coba lagi sebentar.', 'SERVER_ERROR', response.status);
    throw new CoachConversationRequestError(serverMessage || 'Pertanyaan belum dapat dikirim. Periksa isinya lalu coba lagi.', 'REQUEST_ERROR', response.status);
  }

  if (!isSuccessfulConversationPayload(payload)) {
    throw new CoachConversationRequestError('Jawaban AI belum lengkap. Silakan coba kirim lagi.', 'INVALID_RESPONSE', response.status);
  }
  return payload as T;
}

export function normalizeCoachConversationError(error: unknown) {
  if (error instanceof CoachConversationRequestError) return error;
  if (error instanceof DOMException && error.name === 'AbortError') {
    return new CoachConversationRequestError('Jawaban memerlukan waktu terlalu lama. Periksa koneksi lalu coba lagi.', 'TIMEOUT');
  }
  return new CoachConversationRequestError('Koneksi ke AI Coach terputus. Periksa internet lalu coba lagi.', 'NETWORK_ERROR');
}
