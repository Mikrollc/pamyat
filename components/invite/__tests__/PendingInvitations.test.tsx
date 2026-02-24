import { render, screen, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { PendingInvitations } from '../PendingInvitations';

const mockMutate = jest.fn();

jest.mock('@/hooks', () => ({
  useSession: jest.fn(() => ({ user: { id: 'user-1' } })),
  useProfile: jest.fn(() => ({ data: { phone: '+15551234567' } })),
  useReceivedInvitations: jest.fn(() => ({ data: [] })),
  useAcceptInvitation: jest.fn(() => ({ mutate: mockMutate })),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const hooks = require('@/hooks');

function setInvitations(invitations: Array<{ id: string; token: string; grave?: { person_name: string } }>) {
  (hooks.useReceivedInvitations as jest.Mock).mockReturnValue({
    data: invitations,
  });
}

const INVITATIONS = [
  { id: 'inv-1', token: 'tok-1', grave: { person_name: 'Иван Петров' } },
  { id: 'inv-2', token: 'tok-2', grave: { person_name: 'Мария Иванова' } },
];

describe('PendingInvitations', () => {
  beforeEach(() => {
    mockMutate.mockClear();
    (hooks.useReceivedInvitations as jest.Mock).mockReturnValue({ data: [] });
  });

  it('renders nothing when there are no invitations', () => {
    const { toJSON } = render(<PendingInvitations />);
    expect(toJSON()).toBeNull();
  });

  it('renders invitation cards with person names', () => {
    setInvitations(INVITATIONS);
    render(<PendingInvitations />);

    expect(screen.getByText('Иван Петров')).toBeTruthy();
    expect(screen.getByText('Мария Иванова')).toBeTruthy();
    expect(screen.getByTestId('invitation-inv-1')).toBeTruthy();
    expect(screen.getByTestId('invitation-inv-2')).toBeTruthy();
  });

  it('renders section title', () => {
    setInvitations(INVITATIONS);
    render(<PendingInvitations />);

    expect(screen.getByText('invite.pendingInvites')).toBeTruthy();
  });

  it('calls mutate with token when accept is pressed', () => {
    setInvitations(INVITATIONS);
    render(<PendingInvitations />);

    fireEvent.press(screen.getByTestId('invitation-accept-inv-1'));
    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockMutate).toHaveBeenCalledWith('tok-1', expect.any(Object));
  });

  it('removes invitation from list when dismissed', () => {
    setInvitations(INVITATIONS);
    render(<PendingInvitations />);

    fireEvent.press(screen.getByTestId('invitation-dismiss-inv-1'));
    expect(screen.queryByTestId('invitation-inv-1')).toBeNull();
    expect(screen.getByTestId('invitation-inv-2')).toBeTruthy();
  });

  it('removes invitation on successful accept', () => {
    mockMutate.mockImplementation((_token: string, opts: { onSuccess: () => void }) => {
      opts.onSuccess();
    });
    setInvitations(INVITATIONS);
    render(<PendingInvitations />);

    fireEvent.press(screen.getByTestId('invitation-accept-inv-1'));
    expect(screen.queryByTestId('invitation-inv-1')).toBeNull();
  });

  it('shows alert on accept error', () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    mockMutate.mockImplementation((_token: string, opts: { onError: () => void }) => {
      opts.onError();
    });
    setInvitations(INVITATIONS);
    render(<PendingInvitations />);

    fireEvent.press(screen.getByTestId('invitation-accept-inv-1'));
    expect(alertSpy).toHaveBeenCalledWith('', 'invite.acceptError');
    alertSpy.mockRestore();
  });

  it('renders nothing when all invitations are dismissed', () => {
    setInvitations([INVITATIONS[0]!]);
    const { toJSON } = render(<PendingInvitations />);

    fireEvent.press(screen.getByTestId('invitation-dismiss-inv-1'));
    expect(toJSON()).toBeNull();
  });
});
