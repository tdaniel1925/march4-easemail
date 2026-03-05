# CodeBakers Dependency Map
# GENERATED — never edit by hand. Run `pnpm dep:map` to regenerate.
# Last generated: 2026-03-05 | git: 0cfded7
# Debug: pnpm dep:map --debug

---

## Entity → Store → Component Map

| Entity | Stores | Components | Hooks | Active State Field | Last-Item Behavior |
|--------|--------|------------|-------|-------------------|-------------------|
| Account | useAccountsClient, useComposeClient | — | — | activeAccount | — (set manually) |
| AccountStore | useAccountStore | AccountsClient, AccountSwitcher, EventFormModal, DashboardClient, FolderClient | — | — | — (set manually) |
| ActivePanel | useComposeClient | — | — | — | — (set manually) |
| Article | useHelpClient | — | — | — | — (set manually) |
| Attachment | useEmailReadClient | — | — | — | — (set manually) |
| AttachmentItem | useAttachmentsClient | — | — | — | — (set manually) |
| CalendarClientProps | useCalendarClient | — | — | — | — (set manually) |
| CalendarEvent | useDashboardClient | — | — | — | — (set manually) |
| CalendarStore | useCalendarStore | CalendarClient, EventDetailModal, EventFormModal | — | — | — (set manually) |
| CalEvent | useCalendarClient | — | — | — | — (set manually) |
| Color | useAccountsClient, useAccountSwitcher, useAttachmentsClient, useCalendarClient, useEventDetailModal, useEventFormModal, useComposeClient, useContactsClient, useDashboardClient, useEmailRulesClient, useFolderClient, useHelpClient, useAiReplyModal, useEmailReadClient, useInboxClient, useSettingsClient, useReadingPane, useSidebar, useSignaturesClient | — | — | — | — (set manually) |
| ComponentFile | useGenerateDepMap | — | — | — | — (set manually) |
| ComposeMode | useComposeClient, useReadingPane | — | — | — | — (set manually) |
| Condition | useEmailRulesClient | — | — | — | — (set manually) |
| ConnectedAccount | useStoreInitializer, useAccountStore | AccountsClient, AccountSwitcher, EventFormModal, DashboardClient, FolderClient | — | — | — (set manually) |
| Contact | useContactsClient | — | — | selectedContact | — (set manually) |
| ContactFormData | useContactsClient | — | — | — | — (set manually) |
| ContactRowProps | useContactsClient | — | — | — | — (set manually) |
| ContactSuggestion | useComposeClient | — | — | — | — (set manually) |
| EmailDensity | useSettingsClient | — | — | — | — (set manually) |
| EmailDetail | useEmailReadClient | — | — | — | — (set manually) |
| EmailMessage | useDashboardClient, useFolderClient, useInboxClient | — | — | — | — (set manually) |
| EntityMap | useGenerateDepMap | — | — | — | — (set manually) |
| FaqItem | useHelpClient | — | — | — | — (set manually) |
| FileAttachment | useComposeClient | — | — | — | — (set manually) |
| FileType | useAttachmentsClient | — | — | — | — (set manually) |
| FilterTab | useAttachmentsClient, useInboxClient | — | — | — | — (set manually) |
| FontSize | useSettingsClient | — | — | — | — (set manually) |
| Hour | useCalendarClient | — | — | — | — (set manually) |
| ISpeechRecognitionResult | useComposeClient | — | — | — | — (set manually) |
| ISpeechRecognitionResultList | useComposeClient | — | — | — | — (set manually) |
| Length | useComposeClient | — | — | — | — (set manually) |
| MailFolder | useAccountStore | AccountsClient, AccountSwitcher, EventFormModal, DashboardClient, FolderClient | — | — | — (set manually) |
| Mins | useCalendarClient | — | — | — | — (set manually) |
| Month | useCalendarClient | — | — | — | — (set manually) |
| NotificationSettings | useSettingsClient | — | — | — | — (set manually) |
| PositionedEvent | useCalendarClient | — | — | — | — (set manually) |
| Profile | useSettingsClient | — | — | — | — (set manually) |
| Props | useEventFormModal, useContactsClient | — | — | — | — (set manually) |
| Recipient | useEmailReadClient | — | — | — | — (set manually) |
| Response | useEventDetailModal | — | — | — | — (set manually) |
| Rule | useEmailRulesClient | — | — | activeRule | — (set manually) |
| RuleAction | useEmailRulesClient | — | — | — | — (set manually) |
| RuleFormState | useEmailRulesClient | — | — | — | — (set manually) |
| SectionProps | useSidebar | — | — | — | — (set manually) |
| SettingsSection | useSettingsClient | — | — | — | — (set manually) |
| SidebarProps | useSidebar | — | — | — | — (set manually) |
| SideEffect | useInboxClient | — | — | — | — (set manually) |
| Signature | useSignaturesClient | — | — | — | — (set manually) |
| SpeechRecognitionConstructor | useCalendarClient | — | — | — | — (set manually) |
| StoreFile | useGenerateDepMap | — | — | — | — (set manually) |
| StylePreset | useComposeClient | — | — | — | — (set manually) |
| TabId | useHelpClient | — | — | — | — (set manually) |
| Target | useAccountsClient, useAccountSwitcher, useAttachmentsClient, useComposeClient, useContactsClient, useDashboardClient, useAiReplyModal, useEmailReadClient, useInboxClient, useReadingPane, useSidebar | — | — | — | — (set manually) |
| Time | useCalendarClient | — | — | — | — (set manually) |
| TodoItem | useDashboardClient | — | — | — | — (set manually) |
| Tone | useComposeClient | — | — | — | — (set manually) |
| WeekStart | useEventFormModal, useCalendarStore | CalendarClient, EventDetailModal, EventFormModal | — | — | — (set manually) |
| Window | useComposeClient | — | — | — | — (set manually) |

---

## Store Inventory

### useAccountsClient
File: `components\accounts\AccountsClient.tsx`
Entities: Account, Color, Target

### useAccountStore
File: `lib\stores\account-store.ts`
Entities: ConnectedAccount, AccountStore, MailFolder

### useAccountSwitcher
File: `components\AccountSwitcher.tsx`
Entities: Color, Target

### useAiReplyModal
File: `components\inbox\AiReplyModal.tsx`
Entities: Target, Color

### useAttachmentsClient
File: `components\attachments\AttachmentsClient.tsx`
Entities: FileType, FilterTab, AttachmentItem, Color, Target

### useCalendarClient
File: `components\calendar\CalendarClient.tsx`
Entities: SpeechRecognitionConstructor, PositionedEvent, CalendarClientProps, CalEvent, Time, Month, Hour, Mins, Color

### useCalendarStore
File: `lib\stores\calendar-store.ts`
Entities: CalendarStore, WeekStart

### useComposeClient
File: `components\compose\ComposeClient.tsx`
Entities: Window, ISpeechRecognitionResultList, ISpeechRecognitionResult, Tone, Length, ActivePanel, ComposeMode, FileAttachment, ContactSuggestion, Account, StylePreset, Target, Color

### useContactsClient
File: `components\contacts\ContactsClient.tsx`
Entities: Props, ContactFormData, ContactRowProps, Contact, Target, Color

### useDashboardClient
File: `components\dashboard\DashboardClient.tsx`
Entities: CalendarEvent, TodoItem, EmailMessage, Color, Target

### useEmailReadClient
File: `components\inbox\EmailReadClient.tsx`
Entities: Recipient, Attachment, EmailDetail, Color, Target

### useEmailRulesClient
File: `components\email-rules\EmailRulesClient.tsx`
Entities: RuleFormState, Condition, RuleAction, Rule, Color

### useEventDetailModal
File: `components\calendar\EventDetailModal.tsx`
Entities: Response, Color

### useEventFormModal
File: `components\calendar\EventFormModal.tsx`
Entities: Props, WeekStart, Color

### useFolderClient
File: `components\folder\FolderClient.tsx`
Entities: EmailMessage, Color

### useGenerateDepMap
File: `scripts\generate-dep-map.ts`
Entities: StoreFile, ComponentFile, EntityMap

### useHelpClient
File: `components\help\HelpClient.tsx`
Entities: TabId, Article, FaqItem, Color

### useInboxClient
File: `components\inbox\InboxClient.tsx`
Entities: FilterTab, EmailMessage, SideEffect, Color, Target

### useReadingPane
File: `components\shared\ReadingPane.tsx`
Entities: ComposeMode, Color, Target

### useSettingsClient
File: `components\settings\SettingsClient.tsx`
Entities: SettingsSection, Profile, NotificationSettings, FontSize, EmailDensity, Color

### useSidebar
File: `components\Sidebar.tsx`
Entities: SidebarProps, SectionProps, Color, Target

### useSignaturesClient
File: `components\signatures\SignaturesClient.tsx`
Entities: Signature, Color

### useStoreInitializer
File: `components\StoreInitializer.tsx`
Entities: ConnectedAccount

---

## Component → Store Usage

| Component | File | Stores Used |
|-----------|------|-------------|
| AccountsClient | `components\accounts\AccountsClient.tsx` | useAccountStore |
| AccountSwitcher | `components\AccountSwitcher.tsx` | useAccountStore |
| CalendarClient | `components\calendar\CalendarClient.tsx` | useCalendarStore |
| DashboardClient | `components\dashboard\DashboardClient.tsx` | useAccountStore |
| EventDetailModal | `components\calendar\EventDetailModal.tsx` | useCalendarStore |
| EventFormModal | `components\calendar\EventFormModal.tsx` | useAccountStore, useCalendarStore |
| FolderClient | `components\folder\FolderClient.tsx` | useAccountStore |
| InboxClient | `components\inbox\InboxClient.tsx` | useAccountStore |
| Sidebar | `components\Sidebar.tsx` | useAccountStore |
| StoreInitializer | `components\StoreInitializer.tsx` | useAccountStore |

---

## How to Use This Map

**Before any mutation:** Find entity → update ALL stores → handle active state → handle last-item behavior
**After new store/component added:** `pnpm dep:map` immediately
**Map feels stale:** `pnpm dep:map` — reads actual code, cannot lie
**Unexpected results:** `pnpm dep:map --debug` to see exactly what was scanned

---
*Generated by scripts/generate-dep-map.ts | CodeBakers V4*