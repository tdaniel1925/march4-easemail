# CodeBakers Dependency Map
# GENERATED — never edit by hand. Run `pnpm dep:map` to regenerate.
# Last generated: 2026-05-05 | git: ccea632
# Debug: pnpm dep:map --debug

---

## Entity → Store → Component Map

| Entity | Stores | Components | Hooks | Active State Field | Last-Item Behavior |
|--------|--------|------------|-------|-------------------|-------------------|
| Account | useAccountsClient, useComposeClient, useContactsClient, useScheduledEmailsClient, useAccountStore | AccountsClient, AccountSwitcher, AppShell, AttachmentsClient, CalendarClient | — | activeAccount | — (set manually) |
| AccountItem | useAppShell | — | — | — | — (set manually) |
| AccountStore | useAccountStore | AccountsClient, AccountSwitcher, AppShell, AttachmentsClient, CalendarClient | — | — | — (set manually) |
| ActivePanel | useComposeClient | — | — | — | — (set manually) |
| ActiveThread | useTeamsClient | — | — | — | — (set manually) |
| AdminEmailRule | useAdminClient | — | — | — | — (set manually) |
| AdminSignature | useAdminClient | — | — | — | — (set manually) |
| AdminUser | useAdminClient | — | — | — | — (set manually) |
| AppShellProps | useAppShell | — | — | — | — (set manually) |
| AppView | useDataCacheStore | AccountSwitcher, AppShell, AttachmentsClient, ComposeClient, ContactsClient | useKeyboardShortcuts | — | — (set manually) |
| Article | useHelpClient | — | — | — | — (set manually) |
| Attachment | useEmailReadClient | — | — | — | — (set manually) |
| AttachmentItem | useAttachmentsClient | — | — | — | — (set manually) |
| CalendarClientProps | useCalendarClient | — | — | — | — (set manually) |
| CalendarEvent | useAppShell, useDashboardClient | — | — | — | — (set manually) |
| CalendarStore | useCalendarStore | CalendarClient, EventDetailModal | — | — | — (set manually) |
| CalEvent | useAppShell, useCalendarClient | — | — | — | — (set manually) |
| Color | useAccountsClient, useAccountSwitcher, useAdminClient, useAttachmentsClient, useCalendarClient, useEventDetailModal, useEventFormModal, useComposeClient, useContactsClient, useDashboardClient, useEmailRulesClient, useFolderClient, useHelpClient, useAiReplyModal, useEmailReadClient, useInboxClient, useKeyboardShortcutsModal, useRemindersPanel, useRemindMeDropdown, useScheduledEmailsClient, useSettingsClient, useReadingPane, useSidebar, useSignaturesClient, useSnoozedClient, useSnoozePicker, useTeamsClient, useTemplatesClient | — | — | activeColor | — (set manually) |
| ColumnConfig | useAttachmentsClient | — | — | — | — (set manually) |
| ColumnKey | useAttachmentsClient | — | — | — | — (set manually) |
| ComponentFile | useGenerateDepMap | — | — | — | — (set manually) |
| ComposeAccount | useAppShell | — | — | — | — (set manually) |
| ComposeMode | useComposeClient, useReadingPane | — | — | — | — (set manually) |
| Condition | useEmailRulesClient | — | — | — | — (set manually) |
| ConnectedAccount | useStoreInitializer, useAccountStore | AccountsClient, AccountSwitcher, AppShell, AttachmentsClient, CalendarClient | — | — | — (set manually) |
| Contact | useContactsClient | — | — | selectedContact | — (set manually) |
| ContactEmail | useContactsClient | — | — | — | — (set manually) |
| ContactFormData | useContactsClient | — | — | — | — (set manually) |
| ContactRowProps | useContactsClient | — | — | — | — (set manually) |
| ContactSuggestion | useComposeClient | — | — | — | — (set manually) |
| DashboardData | useAppShell | — | — | — | — (set manually) |
| DataCacheStore | useDataCacheStore | AccountSwitcher, AppShell, AttachmentsClient, ComposeClient, ContactsClient | useKeyboardShortcuts | — | — (set manually) |
| DirectionTab | useAttachmentsClient | — | — | — | — (set manually) |
| Email | useAppShell, useDataCacheStore | AccountSwitcher, AppShell, AttachmentsClient, ComposeClient, ContactsClient | useKeyboardShortcuts | activeEmailId | — (set manually) |
| EmailAccount | useAppShell, useDataCacheStore | AccountSwitcher, AppShell, AttachmentsClient, ComposeClient, ContactsClient | useKeyboardShortcuts | activeEmailAccountId | — (set manually) |
| EmailDensity | useSettingsClient | — | — | — | — (set manually) |
| EmailDetail | useEmailReadClient | — | — | — | — (set manually) |
| EmailMessage | useAppShell, useFolderClient, useInboxClient | — | — | — | — (set manually) |
| EmailTemplate | useTemplatesClient | — | — | — | — (set manually) |
| EntityMap | useGenerateDepMap | — | — | — | — (set manually) |
| ErrorBoundaryProps | useErrorBoundary | — | — | — | — (set manually) |
| ErrorBoundaryState | useErrorBoundary | — | — | — | — (set manually) |
| FaqItem | useHelpClient | — | — | — | — (set manually) |
| FileAttachment | useComposeClient | — | — | — | — (set manually) |
| FileType | useAttachmentsClient | — | — | — | — (set manually) |
| FilterTab | useAttachmentsClient, useInboxClient | — | — | — | — (set manually) |
| Folder | useAppShell, useFolderClient, useSidebar, useDataCacheStore | AccountSwitcher, AppShell, AttachmentsClient, ComposeClient, ContactsClient | useKeyboardShortcuts | activeFolderId | — (set manually) |
| FontSize | useSettingsClient | — | — | — | — (set manually) |
| Hour | useCalendarClient | — | — | — | — (set manually) |
| ImapAccount | useStoreInitializer | — | — | — | — (set manually) |
| ISpeechRecognitionResult | useComposeClient | — | — | — | — (set manually) |
| ISpeechRecognitionResultList | useComposeClient | — | — | — | — (set manually) |
| JmapAccount | useStoreInitializer | — | — | — | — (set manually) |
| Length | useComposeClient | — | — | — | — (set manually) |
| MailFolder | useAccountStore | AccountsClient, AccountSwitcher, AppShell, AttachmentsClient, CalendarClient | — | — | — (set manually) |
| Mins | useCalendarClient | — | — | — | — (set manually) |
| Month | useCalendarClient | — | — | — | — (set manually) |
| MsAccount | useStoreInitializer | — | — | — | — (set manually) |
| NextLink | useAttachmentsClient | — | — | — | — (set manually) |
| NotificationSettings | useSettingsClient | — | — | — | — (set manually) |
| PositionedEvent | useCalendarClient | — | — | — | — (set manually) |
| PresenceAvailability | useContactsClient, useTeamsClient | — | — | — | — (set manually) |
| Profile | useSettingsClient | — | — | — | — (set manually) |
| Props | useAdminClient, useEventFormModal, useContactsClient | — | — | — | — (set manually) |
| Recipient | useEmailReadClient | — | — | — | — (set manually) |
| Recurrence | useEventFormModal | — | — | — | — (set manually) |
| Reminder | useRemindersPanel | — | — | — | — (set manually) |
| RemindersPanelProps | useRemindersPanel | — | — | — | — (set manually) |
| RemindMeDropdownProps | useRemindMeDropdown | — | — | — | — (set manually) |
| Response | useEventDetailModal | — | — | — | — (set manually) |
| Rule | useEmailRulesClient | — | — | activeRule | — (set manually) |
| RuleAction | useEmailRulesClient | — | — | — | — (set manually) |
| RuleFormState | useEmailRulesClient | — | — | — | — (set manually) |
| ScheduledDraft | useScheduledEmailsClient | — | — | — | — (set manually) |
| SectionProps | useSidebar | — | — | — | — (set manually) |
| SensitivityLabel | useSettingsClient | — | — | — | — (set manually) |
| SettingsSection | useSettingsClient | — | — | — | — (set manually) |
| SidebarProps | useSidebar | — | — | — | — (set manually) |
| SideEffect | useInboxClient | — | — | — | — (set manually) |
| Signature | useSignaturesClient | — | — | — | — (set manually) |
| SnoozedEmailRecord | useSnoozedClient | — | — | — | — (set manually) |
| SnoozePickerProps | useSnoozePicker | — | — | — | — (set manually) |
| SortDirection | useAttachmentsClient | — | — | — | — (set manually) |
| SortField | useAttachmentsClient | — | — | — | — (set manually) |
| StoreFile | useGenerateDepMap | — | — | — | — (set manually) |
| StylePreset | useComposeClient | — | — | — | — (set manually) |
| SyncStat | useAdminClient | — | — | — | — (set manually) |
| Tab | useAdminClient | — | — | activeTab | — (set manually) |
| TabId | useHelpClient | — | — | — | — (set manually) |
| Target | useAccountsClient, useAccountSwitcher, useAdminClient, useAttachmentsClient, useCalendarClient, useComposeClient, useContactsClient, useAiReplyModal, useEmailReadClient, useInboxClient, useRemindMeDropdown, useReadingPane, useSidebar, useTeamsClient, useTemplatesClient | — | — | — | — (set manually) |
| TeamsChannel | useTeamsClient | — | — | — | — (set manually) |
| TeamsChat | useTeamsClient | — | — | — | — (set manually) |
| TeamsClientProps | useTeamsClient | — | — | — | — (set manually) |
| TeamsMessage | useTeamsClient | — | — | — | — (set manually) |
| TeamsTeam | useTeamsClient | — | — | — | — (set manually) |
| Time | useCalendarClient | — | — | — | — (set manually) |
| TodoItem | useDashboardClient | — | — | — | — (set manually) |
| Tone | useComposeClient | — | — | — | — (set manually) |
| UndoSendDelay | useSettingsClient | — | — | — | — (set manually) |
| WeekStart | useCalendarStore | CalendarClient, EventDetailModal | — | — | — (set manually) |

---

## Store Inventory

### useAccountsClient
File: `components\accounts\AccountsClient.tsx`
Entities: Account, Color, Target

### useAccountStore
File: `lib\stores\account-store.ts`
Entities: ConnectedAccount, AccountStore, MailFolder, Account

### useAccountStore.test
File: `tests\unit\stores\account-store.test.ts`
Entities: —

### useAccountSwitcher
File: `components\AccountSwitcher.tsx`
Entities: Color, Target

### useAdminClient
File: `components\admin\AdminClient.tsx`
Entities: AdminUser, SyncStat, AdminEmailRule, AdminSignature, Props, Tab, Target, Color

### useAiReplyModal
File: `components\inbox\AiReplyModal.tsx`
Entities: Target, Color

### useAppShell
File: `components\AppShell.tsx`
Entities: CalendarEvent, ComposeAccount, AccountItem, DashboardData, AppShellProps, EmailMessage, CalEvent, Folder, Email, EmailAccount

### useAttachmentsClient
File: `components\attachments\AttachmentsClient.tsx`
Entities: FileType, FilterTab, DirectionTab, SortField, SortDirection, ColumnKey, ColumnConfig, AttachmentItem, Color, NextLink, Target

### useCalendarClient
File: `components\calendar\CalendarClient.tsx`
Entities: PositionedEvent, CalendarClientProps, CalEvent, Target, Time, Month, Hour, Mins, Color

### useCalendarStore
File: `lib\stores\calendar-store.ts`
Entities: CalendarStore, WeekStart

### useComposeClient
File: `components\compose\ComposeClient.tsx`
Entities: ISpeechRecognitionResultList, ISpeechRecognitionResult, Tone, Length, ActivePanel, ComposeMode, FileAttachment, ContactSuggestion, Account, StylePreset, Target, Color

### useContactsClient
File: `components\contacts\ContactsClient.tsx`
Entities: ContactEmail, PresenceAvailability, Props, ContactFormData, ContactRowProps, Contact, Account, Target, Color

### useDashboardClient
File: `components\dashboard\DashboardClient.tsx`
Entities: CalendarEvent, TodoItem, Color

### useDataCacheStore
File: `lib\stores\data-cache.ts`
Entities: AppView, DataCacheStore, Folder, Email, EmailAccount

### useEmailReadClient
File: `components\inbox\EmailReadClient.tsx`
Entities: Recipient, Attachment, EmailDetail, Color, Target

### useEmailRulesClient
File: `components\email-rules\EmailRulesClient.tsx`
Entities: RuleFormState, Condition, RuleAction, Rule, Color

### useErrorBoundary
File: `components\ErrorBoundary.tsx`
Entities: ErrorBoundaryProps, ErrorBoundaryState

### useEventDetailModal
File: `components\calendar\EventDetailModal.tsx`
Entities: Response, Color

### useEventFormModal
File: `components\calendar\EventFormModal.tsx`
Entities: Recurrence, Props, Color

### useFolderClient
File: `components\folder\FolderClient.tsx`
Entities: EmailMessage, Color, Folder

### useGenerateDepMap
File: `scripts\generate-dep-map.ts`
Entities: StoreFile, ComponentFile, EntityMap

### useHelpClient
File: `components\help\HelpClient.tsx`
Entities: TabId, Article, FaqItem, Color

### useInboxClient
File: `components\inbox\InboxClient.tsx`
Entities: FilterTab, EmailMessage, SideEffect, Color, Target

### useKeyboardShortcutsModal
File: `components\KeyboardShortcutsModal.tsx`
Entities: Color

### useReadingPane
File: `components\shared\ReadingPane.tsx`
Entities: ComposeMode, Color, Target

### useRemindersPanel
File: `components\reminders\RemindersPanel.tsx`
Entities: Reminder, RemindersPanelProps, Color

### useRemindMeDropdown
File: `components\reminders\RemindMeDropdown.tsx`
Entities: RemindMeDropdownProps, Target, Color

### useScheduledEmailsClient
File: `components\scheduled\ScheduledEmailsClient.tsx`
Entities: ScheduledDraft, Account, Color

### useSeedOrgContacts
File: `scripts\seed-org-contacts.ts`
Entities: —

### useSettingsClient
File: `components\settings\SettingsClient.tsx`
Entities: SettingsSection, Profile, NotificationSettings, FontSize, EmailDensity, UndoSendDelay, SensitivityLabel, Color

### useSidebar
File: `components\Sidebar.tsx`
Entities: SidebarProps, SectionProps, Color, Folder, Target

### useSignaturesClient
File: `components\signatures\SignaturesClient.tsx`
Entities: Signature, Color

### useSnoozedClient
File: `components\SnoozedClient.tsx`
Entities: SnoozedEmailRecord, Color

### useSnoozePicker
File: `components\SnoozePicker.tsx`
Entities: SnoozePickerProps, Color

### useStoreInitializer
File: `components\StoreInitializer.tsx`
Entities: MsAccount, ImapAccount, JmapAccount, ConnectedAccount

### useTeamsClient
File: `components\teams\TeamsClient.tsx`
Entities: TeamsChat, TeamsMessage, TeamsTeam, TeamsChannel, PresenceAvailability, ActiveThread, TeamsClientProps, Color, Target

### useTemplatesClient
File: `components\templates\TemplatesClient.tsx`
Entities: EmailTemplate, Target, Color

---

## Component → Store Usage

| Component | File | Stores Used |
|-----------|------|-------------|
| AccountsClient | `components\accounts\AccountsClient.tsx` | useAccountStore |
| AccountSwitcher | `components\AccountSwitcher.tsx` | useAccountStore, useDataCacheStore |
| AppShell | `components\AppShell.tsx` | useAccountStore, useDataCacheStore |
| AttachmentsClient | `components\attachments\AttachmentsClient.tsx` | useDataCacheStore, useAccountStore |
| CalendarClient | `components\calendar\CalendarClient.tsx` | useCalendarStore, useAccountStore |
| ComposeClient | `components\compose\ComposeClient.tsx` | useDataCacheStore |
| ContactsClient | `components\contacts\ContactsClient.tsx` | useDataCacheStore, useAccountStore |
| DashboardClient | `components\dashboard\DashboardClient.tsx` | useAccountStore, useDataCacheStore |
| EmailReadClient | `components\inbox\EmailReadClient.tsx` | useDataCacheStore |
| EventDetailModal | `components\calendar\EventDetailModal.tsx` | useCalendarStore |
| EventFormModal | `components\calendar\EventFormModal.tsx` | useAccountStore |
| FolderClient | `components\folder\FolderClient.tsx` | useAccountStore, useDataCacheStore |
| InboxClient | `components\inbox\InboxClient.tsx` | useAccountStore, useDataCacheStore |
| ReadingPane | `components\shared\ReadingPane.tsx` | useDataCacheStore |
| ScheduledEmailsClient | `components\scheduled\ScheduledEmailsClient.tsx` | useAccountStore |
| Sidebar | `components\Sidebar.tsx` | useAccountStore, useDataCacheStore |
| StoreInitializer | `components\StoreInitializer.tsx` | useAccountStore |
| useKeyboardShortcuts | `hooks\useKeyboardShortcuts.ts` | useDataCacheStore |

---

## How to Use This Map

**Before any mutation:** Find entity → update ALL stores → handle active state → handle last-item behavior
**After new store/component added:** `pnpm dep:map` immediately
**Map feels stale:** `pnpm dep:map` — reads actual code, cannot lie
**Unexpected results:** `pnpm dep:map --debug` to see exactly what was scanned

---
*Generated by scripts/generate-dep-map.ts | CodeBakers V4*