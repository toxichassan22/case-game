import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InboxPanel } from './InboxPanel';
import { useGameStore } from '../stores/gameStore';

// Mock dependencies
vi.mock('../stores/gameStore', () => ({
  useGameStore: vi.fn()
}));

vi.mock('lucide-react', () => ({
  ShieldAlert: () => <div data-testid="shield-icon" />,
  Monitor: () => <div data-testid="monitor-icon" />
}));

describe('InboxPanel Component', () => {
  const mockSendAction = vi.fn();
  const mockSetInboxMessages = vi.fn();
  const mockSetInboxOptions = vi.fn();
  const mockAddInboxSentOptionId = vi.fn();
  const mockAddNotification = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    (useGameStore as any).getState = vi.fn(() => ({
      addNotification: mockAddNotification,
    }));
    
    // Default mock implementation
    (useGameStore as any).mockImplementation((selector: any) => {
      const state = {
        caseDefinition: {
          case_id: 'test-case-01',
          title: 'Test Case',
          inbox_brief: { message: 'This is a test briefing.' },
          evidence_list: [
            { evidence_id: 'EVID-01', title: 'Test Evidence' }
          ]
        },
        engineSnapshot: {
          currentTick: 100,
          eventTrace: [],
          verifiedFacts: [],
          evidenceStates: {},
          globalState: {
            trustLevels: {
              police_trust: 100,
            },
          },
        },
        revealedPhsHint: null,
        inboxMessages: {},
        inboxOptions: {},
        inboxSentOptionIds: {},
        setInboxMessages: mockSetInboxMessages,
        setInboxOptions: mockSetInboxOptions,
        addInboxSentOptionId: mockAddInboxSentOptionId,
        sendAction: mockSendAction
      };
      return selector(state);
    });
  });

  it('renders loading state when caseDefinition is null', () => {
    (useGameStore as any).mockImplementation((selector: any) => selector({ caseDefinition: null }));
    
    render(<InboxPanel />);
    expect(screen.getByText(/جاري تحميل صندوق الوارد/i)).toBeInTheDocument();
  });

  it('renders base email from case definition', () => {
    render(<InboxPanel />);
    expect(screen.getByText(/Test Case/)).toBeInTheDocument();
    expect(screen.getByText(/This is a test briefing./)).toBeInTheDocument();
  });

  it('allows user to click a dialogue option', async () => {
    render(<InboxPanel />);
    
    const optionBtn = await screen.findByText('طلب توجيهات أولية حول القضية');
    fireEvent.click(optionBtn);
    
    expect(mockSetInboxMessages).toHaveBeenCalledWith(
      'test-case-01',
      expect.arrayContaining([
        expect.objectContaining({
          sender: 'player',
          text: 'طلب توجيهات أولية حول القضية',
        }),
      ]),
    );
    
    // Check typing indicator
    expect(screen.getByText(/مكتب الرئيس يطبع الآن/)).toBeInTheDocument();
    
    // Wait for response
    await waitFor(() => {
      expect(screen.queryByText(/مكتب الرئيس يطبع الآن/)).not.toBeInTheDocument();
    }, { timeout: 2000 });
    
    // Check if next options appear
    expect(screen.getByText('حسناً، سأبدأ العمل.')).toBeInTheDocument();
  });
});
