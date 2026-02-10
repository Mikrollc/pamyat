import { uploadGravePhoto } from '../../api/photos';

// Mock supabase
const mockUpload = jest.fn();
const mockInsert = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    storage: {
      from: () => ({ upload: mockUpload }),
    },
    from: () => ({ insert: mockInsert }),
  },
}));

// Mock fetch for arrayBuffer conversion
global.fetch = jest.fn().mockResolvedValue({
  arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
}) as jest.Mock;

describe('uploadGravePhoto', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uploads photo and inserts record', async () => {
    mockUpload.mockResolvedValue({ error: null });
    mockInsert.mockResolvedValue({ error: null });

    const result = await uploadGravePhoto('grave-123', 'file:///photo.jpg', 'user-456');

    expect(mockUpload).toHaveBeenCalledTimes(1);
    expect(mockInsert).toHaveBeenCalledTimes(1);
    expect(result).toContain('grave-123/');
    expect(result).toContain('.jpg');
  });

  it('throws on upload error', async () => {
    mockUpload.mockResolvedValue({ error: new Error('Upload failed') });

    await expect(
      uploadGravePhoto('grave-123', 'file:///photo.jpg', 'user-456'),
    ).rejects.toThrow('Upload failed');

    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('throws on insert error', async () => {
    mockUpload.mockResolvedValue({ error: null });
    mockInsert.mockResolvedValue({ error: new Error('Insert failed') });

    await expect(
      uploadGravePhoto('grave-123', 'file:///photo.jpg', 'user-456'),
    ).rejects.toThrow('Insert failed');
  });
});
