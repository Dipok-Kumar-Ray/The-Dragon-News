# Google Docs API Setup Guide

This guide will help you set up and use the Google Docs API to read content from the document: `https://docs.google.com/document/d/1eAKrg7HjZGCvakBylkNu-dbgSX8ykd7F2oQ5PvoM0Hs/edit?tab=t.0`

## Prerequisites

- Python 3.7 or higher
- A Google account with access to Google Cloud Console
- Access to the Google Docs document (view permissions at minimum)

## Step 1: Set up Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note down your project ID

## Step 2: Enable Google Docs API

1. In the Google Cloud Console, navigate to **APIs & Services** > **Library**
2. Search for "Google Docs API"
3. Click on it and press **Enable**

## Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Choose **External** user type (unless you're using Google Workspace)
3. Fill in the required fields:
   - App name: `Google Docs Reader`
   - User support email: Your email
   - Developer contact information: Your email
4. Click **Save and Continue**
5. Skip adding scopes for now (click **Save and Continue**)
6. Add test users if needed, then **Save and Continue**

## Step 4: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Choose **Desktop app** as the application type
4. Name it something like "Google Docs Reader"
5. Click **Create**
6. Download the JSON file and save it as `credentials.json` in your project directory

## Step 5: Install Python Dependencies

```bash
pip install -r requirements.txt
```

Or install individually:
```bash
pip install google-api-python-client google-auth-httplib2 google-auth-oauthlib
```

## Step 6: Run the Script

1. Make sure `credentials.json` is in the same directory as the script
2. Run the script:
   ```bash
   python google_docs_reader.py
   ```

3. On first run, it will:
   - Open a browser window for authentication
   - Ask you to sign in to Google
   - Request permission to access your Google Docs
   - Create a `token.json` file for future use

## What the Script Does

- **Authenticates** with Google Docs API using OAuth 2.0
- **Extracts the document ID** from the provided URL
- **Reads the document content** including:
  - Document title
  - Text content from paragraphs
  - Content from tables
  - Table of contents
- **Saves output** to text and JSON files:
  - `document_content_[ID].txt` - Human-readable content
  - `document_raw_[ID].json` - Full API response for debugging
- **Analyzes document structure** and provides statistics

## Document Access Requirements

The script needs **read access** to the Google Docs document. Make sure:

1. The document is shared with your Google account
2. You have at least "Viewer" permissions
3. The document is not restricted by organization policies

## Troubleshooting

### Error: 403 Forbidden
- Check if you have access to the document
- Verify the document ID is correct
- Ensure the Google Docs API is enabled

### Error: credentials.json not found
- Download OAuth credentials from Google Cloud Console
- Save the file as `credentials.json` in the script directory

### Error: The file token.json has been tampered with
- Delete `token.json` and run the script again
- This will trigger a new authentication flow

### Browser doesn't open for authentication
- Copy the URL from the terminal and open it manually
- Complete the authorization process
- The script will continue automatically

## Document ID Extraction

The document ID is extracted from the URL:
```
https://docs.google.com/document/d/[DOCUMENT_ID]/edit?tab=t.0
```

For the provided URL, the ID is: `1eAKrg7HjZGCvakBylkNu-dbgSX8ykd7F2oQ5PvoM0Hs`

## Security Notes

- Keep your `credentials.json` file secure and never commit it to version control
- The `token.json` file contains access tokens - also keep it secure
- Add both files to your `.gitignore`

## Next Steps

Once you have the document content, you can:
- Process the text with natural language processing
- Extract specific information
- Convert to other formats
- Analyze document structure
- Create automated reports