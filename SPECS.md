# YT Audiobook Download Helper - Requirements Specification

## Overview
This document defines the functional requirements for the YT Audiobook Download Helper application. Each requirement is assigned a unique identifier (REQ####) for tracking and processing.

---

## Functional Requirements

### REQ0004: Input Field Editing
- Allow users to edit input field values by:
  - Typing to modify the field value
  - Automatically saving the value when focus leaves the field

### REQ0011: YouTube Thumbnail Display
- Automatically extract and display a thumbnail image when a valid YouTube URL is entered
- Display a small thumbnail (medium quality) in each book entry row
- Show "No preview" message when no URL is provided or URL is invalid
- Display thumbnails without requiring API calls

### REQ0012: Thumbnail Lightbox
- Open a full-size image preview when clicking on a thumbnail
- Display the lightbox as an overlay with dark background
- Allow closing the lightbox by clicking outside the image, pressing Escape key, or clicking a close button
- Prevent page scrolling when lightbox is open

### REQ0013: Filename Template Input
- Provide an editable input field for the filename template within the Settings fieldset.
- Include a Reset button next to the input field that resets the template to the default value
- Default template: `$author - [$series - $series_num] - $title [$narrator].%(ext)s`
- Support custom variables: `$author`, `$title`, `$narrator`, `$series`, `$series_num`, `$year`
- Support yt-dlp placeholders: `%(ext)s`, `%(title)s`, and other standard yt-dlp placeholders
- Display helper text explaining available variables and placeholders

### REQ0038: Settings Fieldset
- Provide a "Settings" fieldset to group application-wide configuration options.
- The "Settings" fieldset should contain the Filename Template Input and the Cookies from Browser dropdown.
- Display the fieldset with a legend titled "Settings".

### REQ0039: Cookies from Browser Dropdown
- Provide a dropdown within the Settings fieldset to select a browser for attaching cookies.
- Supported browser options (values): `none` (default), `brave`, `chrome`, `chromium`, `edge`, `firefox`, `opera`, `safari`, `vivaldi`, `whale`.
- Display "None" for the `none` option and capitalize other browser names in the UI.
- Include a short description explaining that this feature helps bypass 403 errors and access non-public accessible videos.

### REQ0014: Filename Template Processing
- Replace template variables with actual book data when generating filenames
- Replace longer variable names first (e.g., `$series_num` before `$series`) to avoid partial matches
- Remove empty optional fields enclosed in brackets `[]` from the final filename
- Clean up multiple spaces and separators in generated filenames
- Preserve yt-dlp placeholders as-is in the generated script

### REQ0015: Shell Script Generation
- Generate a shell script (.sh file) containing:
  - One yt-dlp command per book entry
  - Proper command formatting with line continuations
  - Individual filename per command based on the template and book data
  - All required yt-dlp flags for audio extraction, metadata embedding, and formatting

### REQ0016: Script Download
- Provide a button to generate and download the shell script
- Validate that at least one book has required fields (URL, title, author, narrator) before generating
- Display an error message if validation fails
- Automatically trigger browser download when script is generated
- Name the downloaded file `download-audiobooks.sh`

### REQ0017: yt-dlp Command Format
- Each generated command shall include:
  - Audio extraction flag (`--extract-audio`)
  - Audio format specification (`--audio-format m4a`)
  - Chapter embedding (`--embed-chapters`)
  - Metadata embedding (`--embed-metadata`)
  - Thumbnail embedding (`--embed-thumbnail`)
  - Genre replacement to "Audiobook"
  - Book metadata mapping (title, author, series, narrator, series number)
  - Output filename using the template
  - YouTube URL

### REQ0018: State Persistence
- Automatically save application state to browser storage
- Persist the following data: book entries, filename template
- Restore saved state when the page is refreshed or reopened
- Handle storage initialization errors gracefully without breaking the application

### REQ0022: Input Validation
- Accept only valid YouTube URLs in the URL field
- Validate that required fields (title, author, narrator) are not empty before script generation
- Provide visual feedback for invalid inputs
- Allow users to correct invalid data before proceeding

### REQ0023: Error Handling
- Handle storage errors gracefully without breaking functionality
- Display user-friendly error messages when operations fail
- Continue operating in degraded mode if storage is unavailable
- Log errors to console for debugging purposes

### REQ0024: Data Format Support
- Support numeric input for Series Number and Year fields
- Auto-parse numeric values correctly
- Handle empty or undefined values for optional fields
- Default Series Number to 1 if not specified or invalid

### REQ0025: User Interface Clarity
- Use high contrast colors for text and backgrounds
- Provide clear visual distinction for editable input fields
- Show edit mode with a visual indicator (e.g., border highlight)

### REQ0026: Book Entry Actions
- Provide a "Remove" button in each book entry row
- Allow removing individual book entries via the Remove button
- Not persist UI interaction state (editing mode) across page refreshes

### REQ0027: Large Dataset Support
- Handle datasets larger than 10MB without performance degradation
- Store data efficiently to accommodate many books
- Support smooth interaction even with large numbers of book entries
- Complete save operations asynchronously without blocking the UI

### REQ0028: Single Page Application Behavior
- Operate as a single-page application
- Not navigate away from the main page
- Generate and download files without server-side processing
- Perform all operations client-side

### REQ0029: Data Integrity
- Maintain data consistency during book entry updates
- Ensure no data loss during state persistence operations
- Validate data structure before saving to storage

### REQ0030: Accessibility
- Support keyboard-only navigation for all functionality
- Provide appropriate ARIA labels for interactive elements
- Use semantic HTML elements where applicable
- Ensure sufficient color contrast for readability

### REQ0031: CSV Import and Export
- Provide Export CSV and Import CSV buttons positioned to the left of the "Clean" button, below the book entries.
- Provide an Export CSV button that generates a CSV file containing all book data
- Disable the Export CSV button when there are no books to export
- Include column headers as the first row in exported CSV files
- Export CSV columns in the following order: YouTube URL, Book Title, Author, Narrator, Series Name, Series #, Year
- Properly escape commas, quotes, and newlines in CSV cell values
- Provide an Import CSV button that opens a file selection dialog
- Display a dialog with a checkbox option to indicate whether the CSV file contains a header row
- Default the header row checkbox to enabled/checked
- Parse imported CSV files and map rows to book data structure
- Replace existing book data with imported data when importing
- Handle CSV parsing errors gracefully and display user-friendly error messages
- Support quoted fields with escaped quotes in CSV parsing
- Skip incomplete rows during CSV import if they have fewer columns than expected

### REQ0032: Page Description and Prerequisites
- Display a descriptive title "YT Audiobook Download Helper" at the top of the page
- Provide a description explaining what the application does and its purpose
- List prerequisites (yt-dlp and ffmpeg) with instructions that they must be installed and available in system PATH
- Display the description and prerequisites in a clearly formatted section above the book entries

### REQ0033: Add Book Button and Clean Button Grouping
- Provide an "Add New Book" button and a "Clean" button grouped together with the CSV Import/Export buttons below the book entries, aligned to the right.
- Match the button style to the Material UI theme.
- Display the buttons in a flex container.

### REQ0034: Image Host Configuration
- Configure `next.config.ts` to allow images from `img.youtube.com` via `remotePatterns`.
- Ensure proper loading and display of YouTube thumbnails.

### REQ0035: Book Entry Table View
- Display book entries in a scrollable table format within the `BookList` component.
- Each row in the table will represent a book entry.
- The table will have columns for Thumbnail, YouTube URL, Title, Author, Narrator, Series, Series #, Year, and Actions.
- Use `EditableCell` for editable text fields and `ThumbnailCell` for thumbnail display within the table.
- Allow inline editing of book details directly within the table cells.
- Provide an action column with a button to remove individual book entries.

### REQ0036: Text Input Transformations
- Provide an edit dropdown for all user-editable text inputs (e.g., in book entries and filename template) with the following text manipulation actions:
  - **Sentence case**: Capitalizes the first letter of the first word in a sentence and converts the rest to lowercase.
  - **Name Case**: Capitalizes the first letter of each word.
  - **UPPERCASE**: Converts all characters to uppercase.
  - **lowercase**: Converts all characters to lowercase.

### REQ0037: YouTube Metadata Auto-Fetch
- Automatically fetch video metadata (title and author/channel name) from YouTube when a valid YouTube URL is entered
- Fetch metadata using YouTube's oEmbed API endpoint without requiring API keys
- Display a loading indicator while fetching metadata
- Auto-populate the Title field with the video title only if the field is currently empty
- Auto-populate the Author field with the channel/author name only if the field is currently empty
- Not overwrite existing user-entered values in Title and Author fields
- Debounce metadata fetching to wait 500ms after the user stops typing before making the API request
- Handle fetch errors gracefully without disrupting the user experience

### REQ0040: Internationalization (i18n) Support
- Support multiple languages via URL-based routing (e.g., `/en` for English, `/ukr` for Ukrainian)
- Automatically detect user's preferred language from browser settings on first visit
- Redirect users from root URL (`/`) to appropriate language URL (`/en` or `/ukr`) based on detection
- Store translation keys in flat JSON structure using strict snake_case naming (e.g., `app_title`, `book_card_youtube_url`)
- All translation keys must be defined in a JSON schema file (`translations.schema.json`) for validation
- Provide TypeScript-typed translation function `t()` with autocomplete support based on English translation structure
- Language switcher in header must update URL and persist selection in localStorage
- All user-facing strings in JSX must use translation keys via `t()` function - no hardcoded strings allowed
- Translation files must be located in `src/i18n/locales/` directory (e.g., `en.json`, `ukr.json`)
- Translation system must support placeholder replacement for dynamic content (e.g., `{variable}` syntax)
- Language state must be synchronized between URL, localStorage, and application state

### REQ0041: Color Theme Switcher
- Provide a theme switcher button in the application header that allows users to toggle between light and dark color themes
- Display a sun icon (Brightness7) when in light mode and a moon icon (Brightness4) when in dark mode (icon represents the current mode)
- The button background and icon color must always be white (#FFFFFF), regardless of the current theme mode
- Toggle theme mode when the button is clicked
- Persist theme preference in browser localStorage under the key `app-theme`
- Automatically detect and apply system color scheme preference on first visit if no stored preference exists
- Use `prefers-color-scheme` media query to detect system preference (defaults to light mode if detection is unavailable)
- Apply theme colors consistently across all application components (background, text, primary colors, etc.)
- Provide tooltips on the theme switcher button that display translated text indicating the action (switch to dark mode / switch to light mode)
- Include appropriate ARIA labels on the theme switcher button for accessibility
- Use translation keys (`theme_switch_to_dark`, `theme_switch_to_light`) for all tooltip and ARIA label text to support internationalization
- Update theme immediately upon toggle without requiring page refresh
- Maintain theme state across page refreshes by restoring from localStorage

### REQ0042: YouTube URL Normalization
- Normalize pasted or entered YouTube URLs to the canonical form: `https://www.youtube.com/watch?v={{id}}`
- Strip timecodes, playlists, and irrelevant query parameters (e.g., `t=`, `list=`, `si=`, `feature=`)
- Support and normalize the following URL types: standard watch, shortened `youtu.be`, mobile (`m.youtube.com`), embed (`/embed/`), shorts (`/shorts/`) and URLs containing additional fragments
- Normalize on input blur and before fetching metadata so downstream logic always receives a canonical URL
- If normalization fails, keep the original input but do not attempt metadata fetch
