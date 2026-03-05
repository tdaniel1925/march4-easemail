# CodeBakers Dependency Map
# GENERATED — never edit by hand. Run `pnpm dep:map` to regenerate.
# Last generated: 2026-03-05 | git: 20dc860
# Debug: pnpm dep:map --debug

---

## Entity → Store → Component Map

| Entity | Stores | Components | Hooks | Active State Field | Last-Item Behavior |
|--------|--------|------------|-------|-------------------|-------------------|
| Account | useAccountsClient | — | — | activeAccount | — (set manually) |
| AccountStore | useAccountStore | AccountSwitcher, DashboardClient, FolderClient, InboxClient, Sidebar | — | — | — (set manually) |
| ActivePanel | useComposeClient | — | — | — | — (set manually) |
| Article | useHelpClient | — | — | — | — (set manually) |
| Attachment | useEmailReadClient | — | — | — | — (set manually) |
| AttachmentItem | useAttachmentsClient | — | — | — | — (set manually) |
| CalendarClientProps | useCalendarClient | — | — | — | — (set manually) |
| CalendarEvent | useDashboardClient | — | — | — | — (set manually) |
| CalEvent | useCalendarClient | — | — | — | — (set manually) |
| Color | useAccountsClient, useAccountSwitcher, useAttachmentsClient, useComposeClient, useContactsClient, useDashboardClient, useFolderClient, useHelpClient, useAiReplyModal, useEmailReadClient, useInboxClient, useSettingsClient, useReadingPane, useSidebar | — | — | — | — (set manually) |
| ComponentFile | useGenerateDepMap | — | — | — | — (set manually) |
| ComposeMode | useEmailReadClient, useReadingPane | — | — | — | — (set manually) |
| ConnectedAccount | useStoreInitializer, useAccountStore | AccountSwitcher, DashboardClient, FolderClient, InboxClient, Sidebar | — | — | — (set manually) |
| Contact | useContactsClient | — | — | selectedContact | — (set manually) |
| ContactRowProps | useContactsClient | — | — | — | — (set manually) |
| EmailDensity | useSettingsClient | — | — | — | — (set manually) |
| EmailDetail | useEmailReadClient | — | — | — | — (set manually) |
| EmailMessage | useDashboardClient, useFolderClient, useInboxClient | — | — | — | — (set manually) |
| EntityMap | useGenerateDepMap | — | — | — | — (set manually) |
| EventCardProps | useCalendarClient | — | — | — | — (set manually) |
| FileType | useAttachmentsClient | — | — | — | — (set manually) |
| FilterTab | useAttachmentsClient, useInboxClient | — | — | — | — (set manually) |
| FontSize | useSettingsClient | — | — | — | — (set manually) |
| Hour | useCalendarClient | — | — | — | — (set manually) |
| ISpeechRecognitionResult | useComposeClient | — | — | — | — (set manually) |
| ISpeechRecognitionResultList | useComposeClient | — | — | — | — (set manually) |
| Length | useComposeClient | — | — | — | — (set manually) |
| MailFolder | useAccountStore | AccountSwitcher, DashboardClient, FolderClient, InboxClient, Sidebar | — | — | — (set manually) |
| Minutes | useCalendarClient | — | — | — | — (set manually) |
| NotificationSettings | useSettingsClient | — | — | — | — (set manually) |
| Profile | useSettingsClient | — | — | — | — (set manually) |
| Props | useContactsClient | — | — | — | — (set manually) |
| Recipient | useEmailReadClient | — | — | — | — (set manually) |
| SettingsSection | useSettingsClient | — | — | — | — (set manually) |
| SidebarProps | useSidebar | — | — | — | — (set manually) |
| StoreFile | useGenerateDepMap | — | — | — | — (set manually) |
| StylePreset | useComposeClient | — | — | — | — (set manually) |
| TabId | useHelpClient | — | — | — | — (set manually) |
| Target | useAccountsClient, useAccountSwitcher, useAttachmentsClient, useComposeClient, useContactsClient, useDashboardClient, useAiReplyModal, useInboxClient, useReadingPane, useSidebar | — | — | — | — (set manually) |
| Time | useCalendarClient | — | — | — | — (set manually) |
| TodoItem | useDashboardClient | — | — | — | — (set manually) |
| Tone | useComposeClient | — | — | — | — (set manually) |
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
Entities: CalEvent, CalendarClientProps, EventCardProps, Time, Hour, Minutes

### useComposeClient
File: `components\compose\ComposeClient.tsx`
Entities: Window, ISpeechRecognitionResultList, ISpeechRecognitionResult, Tone, Length, ActivePanel, StylePreset, Color, Target

### useContactsClient
File: `components\contacts\ContactsClient.tsx`
Entities: Props, ContactRowProps, Contact, Target, Color

### useDashboardClient
File: `components\dashboard\DashboardClient.tsx`
Entities: CalendarEvent, TodoItem, EmailMessage, Color, Target

### useEmailReadClient
File: `components\inbox\EmailReadClient.tsx`
Entities: Recipient, Attachment, EmailDetail, ComposeMode, Color

### useFolderClient
File: `components\folder\FolderClient.tsx`
Entities: EmailMessage, Color

### useGenerateDepMap
File: `scripts\generate-dep-map.ts`
Entities: StoreFile, ComponentFile, EntityMap

### useHelpClient
File: `components\help\HelpClient.tsx`
Entities: TabId, Article, Color

### useInboxClient
File: `components\inbox\InboxClient.tsx`
Entities: FilterTab, EmailMessage, Color, Target

### useReadingPane
File: `components\shared\ReadingPane.tsx`
Entities: ComposeMode, Color, Target

### useSettingsClient
File: `components\settings\SettingsClient.tsx`
Entities: SettingsSection, Profile, NotificationSettings, FontSize, EmailDensity, Color

### useSidebar
File: `components\Sidebar.tsx`
Entities: SidebarProps, Color, Target

### useStoreInitializer
File: `components\StoreInitializer.tsx`
Entities: ConnectedAccount

---

## Component → Store Usage

| Component | File | Stores Used |
|-----------|------|-------------|
| AccountSwitcher | `components\AccountSwitcher.tsx` | useAccountStore |
| DashboardClient | `components\dashboard\DashboardClient.tsx` | useAccountStore |
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