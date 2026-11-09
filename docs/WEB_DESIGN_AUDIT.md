# Залишки вебдизайну в мобільному застосунку

Аудит коду станом на 2026-11-09. Це перевірка маршрутів, компонентів та оболонок; не візуальна перевірка кожного екрана на пристрої. Наявність React Native компонентів або адаптації до вузької ширини сама по собі не означає відповідність мобільним макетам.

## Видалений екран

Видалено `src/app/(app)/space.tsx`. Пункт усіх ресурсів у `src/features/shell/fixtures.ts` і посилання в `DeveloperFixtures` тепер ведуть на наявну мобільну Бібліотеку `/mobile/26`. Пошук бере сторінки із `shellRepository`, тому також отримує новий маршрут. Пряме старе посилання `/space` більше не має окремого екрана і потрапляє в загальний стан Unavailable. Дочірній маршрут `/space/chat-history` збережений.

`OverviewScreen` не видалено: його ще використовує `/personalization`.

## Підтверджені вебмакети або вебоболонки

| Екран | Маршрути та мобільні псевдоніми | Ознака в коді |
| --- | --- | --- |
| Персоналізація | `/personalization` | `OverviewScreen` із плитками та `PageScaffold`, усередині `AppShell` |
| Загальні налаштування | `/settings/general`; `/settings`, `/settings/overview`, `/mobile/81`, `/mobile/82`, `/mobile/141` перенаправляють сюди | `SettingsScreen` → `PageScaffold`, `AppShell` |
| Вигляд | `/settings/appearance`, `/mobile/83` | Такий самий `SettingsScreen` із вебструктурою |
| Блокноти / обране | `/notebooks`, `/notebooks/[notebookId]`; `/mobile/31`, `/mobile/32` перенаправляють на список | Старий `FavoritesScreen` із панелями та модальними формами, `AppShell` |
| Історія чатів | `/space/chat-history`, `/mobile/27` | `ChatHistoryScreen` → `PageScaffold` і `Surface`; вебоболонки тут немає, але макет залишився старим |
| Архів чатів | `/settings/archive` | Той самий `ChatHistoryScreen` з `mode="archive"`, додатково `AppShell` |
| Вибір робочого простору | `/mobile/62` | `WorkspaceScreen` → `PageScaffold`, старий `BackButton`; API інтеграція є, але мобільний макет №62 ще не відтворений |
| Глобальний пошук | `/ui/search` | `SearchScreen` → `PageScaffold`; окремий `SafeAreaView` не змінює старого макета |

## Інші старі адаптивні інтерфейси

Ці маршрути не використовують `AppShell`, але залишили власний старий інтерфейс. Їх варто окремо звірити з потрібними мобільними макетами перед переробкою:

- `/login`, `/register`: `AuthScreen`, центрована форма в `Surface` з `maxWidth: 384`, типографіка Lora/Geist.
- `/ui/session-viewer`: `SessionViewerScreen`, власна верхня панель, смуга вкладок, перемикач сесій і панелі переглядача.
- `/ui/file-preview`: `FilePreviewScreen`, власна панель керування, смуга вибору файлів і прев'ю.

Вкладені діалоги `SaveToNotebookModal`, форми `FavoritesScreen` і `WorkspaceSheet` також залишаються старими спільними компонентами; це не окремі маршрути.

## Незавершені маршрути у вебоболонці

Наведені нижче адреси потрапляють у `src/app/(app)/[...destination].tsx` всередині `AppShell`. Це заглушки Retry / Unavailable, а не завершені екрани з реалізованим вебдизайном:

- `/calendar`, `/kanban`, `/co-writer`.
- `/space/journal`, `/space/questions`, `/knowledge-bases`, `/whisper`.
- `/agents`, `/space/personas`, `/space/skills`, `/space/mcp`, `/space/cli-apps`, `/memory`.
- `/partners` і відомі пошуку приклади `/partners/partner-a`, `/partners/groups/group-a`; інші вкладені адреси можуть показати Unavailable.
- `/session-handoff`, `/admin/users`.
- `/settings/workspace`, `/settings/connections`, `/settings/llm`, `/settings/status`.

Однойменні розділи `/mobile/[screen]` можуть мати окремі мобільні презентації. Наприклад, `/mobile/108` показує мобільну презентацію архіву, тоді як `/settings/archive` досі відкриває старий екран. Їх не слід вважати тією самою реалізацією.

## Технічні екрани

`/explore` (`ComponentPreview`) та `/avatar-preview` (`AvatarGallery`) також загорнуті в `AppShell`. Це сторінки розробника, а не продуктові мобільні екрани.

## Уже використовують мобільну структуру

Профіль `/profile`, `/profile/password`, `/profile/avatar` та їхні маршрути 63/64/138; актуальні `/chat` і `/learning` та їхні дочірні маршрути; Бібліотека `/mobile/26` та інші презентації `MobileScreen`, окрім перелічених вище перенаправлень. Відповідність мобільній структурі не засвідчує повноту API інтеграції.
