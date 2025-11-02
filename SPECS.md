# YouTube Audiobook Script Generator - Requirements Specification

## Overview
This document defines the functional requirements for the YouTube Audiobook Script Generator application. Each requirement is assigned a unique identifier (REQ####) for tracking and processing.

---

## REQ0001: Book Information Input
The application shall allow users to input book information in a card format with the following fields:
- YouTube URL (required)
- Book Title (required)
- Book Author (required)
- Narrator (required)
- Book Series Name (optional)
- Book Series Number (optional, defaults to 1)
- Year (optional)

---

## REQ0003: Book Entry Management
The application shall allow users to:
- Add new book entries
- Remove existing book entries
- Have at least one book entry available at all times

---

## REQ0004: Input Field Editing
The application shall allow users to edit input field values by:
- Typing to modify the field value
- Automatically saving the value when focus leaves the field

---

## REQ0011: YouTube Thumbnail Display
The application shall:
- Automatically extract and display a thumbnail image when a valid YouTube URL is entered
- Display a small thumbnail (medium quality) in each book card
- Show "No preview" message when no URL is provided or URL is invalid
- Display thumbnails without requiring API calls

---

## REQ0012: Thumbnail Lightbox
The application shall:
- Open a full-size image preview when clicking on a thumbnail
- Display the lightbox as an overlay with dark background
- Allow closing the lightbox by clicking outside the image, pressing Escape key, or clicking a close button
- Prevent page scrolling when lightbox is open

---

## REQ0013: Filename Template Input
The application shall:
- Provide an editable input field for the filename template below the book entries
- Wrap the filename template input in a fieldset with a legend
- Include a Reset button next to the input field that resets the template to the default value
- Default template: `$author - [$series - $series_num] - $title [$narrator].%(ext)s`
- Support custom variables: `$author`, `$title`, `$narrator`, `$series`, `$series_num`, `$year`
- Support yt-dlp placeholders: `%(ext)s`, `%(title)s`, and other standard yt-dlp placeholders
- Display helper text explaining available variables and placeholders

---

## REQ0014: Filename Template Processing
The application shall:
- Replace template variables with actual book data when generating filenames
- Replace longer variable names first (e.g., `$series_num` before `$series`) to avoid partial matches
- Remove empty optional fields enclosed in brackets `[]` from the final filename
- Clean up multiple spaces and separators in generated filenames
- Preserve yt-dlp placeholders as-is in the generated script

---

## REQ0015: Shell Script Generation
The application shall generate a shell script (.sh file) containing:
- One yt-dlp command per book entry
- Proper command formatting with line continuations
- Individual filename per command based on the template and book data
- All required yt-dlp flags for audio extraction, metadata embedding, and formatting

---

## REQ0016: Script Download
The application shall:
- Provide a button to generate and download the shell script
- Validate that at least one book has required fields (URL, title, author, narrator) before generating
- Display an error message if validation fails
- Automatically trigger browser download when script is generated
- Name the downloaded file `download-audiobooks.sh`

---

## REQ0017: yt-dlp Command Format
Each generated command shall include:
- Audio extraction flag (`--extract-audio`)
- Audio format specification (`--audio-format m4a`)
- Chapter embedding (`--embed-chapters`)
- Metadata embedding (`--embed-metadata`)
- Thumbnail embedding (`--embed-thumbnail`)
- Genre replacement to "Audiobook"
- Book metadata mapping (title, author, series, narrator, series number)
- Output filename using the template
- YouTube URL

---

## REQ0018: State Persistence
The application shall:
- Automatically save application state to browser storage
- Persist the following data: book entries, filename template
- Restore saved state when the page is refreshed or reopened
- Handle storage initialization errors gracefully without breaking the application

---

## REQ0022: Input Validation
The application shall:
- Accept only valid YouTube URLs in the URL field
- Validate that required fields (title, author, narrator) are not empty before script generation
- Provide visual feedback for invalid inputs
- Allow users to correct invalid data before proceeding

---

## REQ0023: Error Handling
The application shall:
- Handle storage errors gracefully without breaking functionality
- Display user-friendly error messages when operations fail
- Continue operating in degraded mode if storage is unavailable
- Log errors to console for debugging purposes

---

## REQ0024: Data Format Support
The application shall:
- Support numeric input for Series Number and Year fields
- Auto-parse numeric values correctly
- Handle empty or undefined values for optional fields
- Default Series Number to 1 if not specified or invalid

---

## REQ0025: User Interface Clarity
The application shall:
- Use high contrast colors for text and backgrounds
- Provide clear visual distinction for editable input fields
- Show edit mode with a visual indicator (e.g., border highlight)

---

## REQ0026: Book Card Actions
The application shall:
- Provide a "Remove" button in each book card
- Allow removing individual book entries via the Remove button
- Not persist UI interaction state (editing mode) across page refreshes

---

## REQ0027: Large Dataset Support
The application shall:
- Handle datasets larger than 10MB without performance degradation
- Store data efficiently to accommodate many books
- Support smooth interaction even with large numbers of book entries
- Complete save operations asynchronously without blocking the UI

---

## REQ0028: Single Page Application Behavior
The application shall:
- Operate as a single-page application
- Not navigate away from the main page
- Generate and download files without server-side processing
- Perform all operations client-side

---

## REQ0029: Data Integrity
The application shall:
- Maintain data consistency during book entry updates
- Ensure no data loss during state persistence operations
- Validate data structure before saving to storage

---

## REQ0030: Accessibility
The application shall:
- Support keyboard-only navigation for all functionality
- Provide appropriate ARIA labels for interactive elements
- Use semantic HTML elements where applicable
- Ensure sufficient color contrast for readability

---

## REQ0031: CSV Import and Export
The application shall:
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

---

## REQ0032: Page Description and Prerequisites
The application shall:
- Display a descriptive title "YouTube Audiobook Script Generator" at the top of the page
- Provide a description explaining what the application does and its purpose
- List prerequisites (yt-dlp and ffmpeg) with instructions that they must be installed and available in system PATH
- Display the description and prerequisites in a clearly formatted section above the book entries

---

## REQ0033: Add Book Button and Clean Button Grouping
The application shall:
- Provide an "Add New Book" button and a "Clean" button grouped together with the CSV Import/Export buttons below the book entries, aligned to the right.
- Match the button style to the Material UI theme.
- Display the buttons in a flex container.

