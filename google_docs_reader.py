#!/usr/bin/env python3
"""
Google Docs API Reader
This script connects to the Google Docs API to read and extract content from a Google Document.
"""

import os.path
import json
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# If modifying these scopes, delete the file token.json.
SCOPES = ["https://www.googleapis.com/auth/documents.readonly"]

# The ID extracted from the Google Docs URL
DOCUMENT_ID = "1eAKrg7HjZGCvakBylkNu-dbgSX8ykd7F2oQ5PvoM0Hs"

def authenticate_google_docs():
    """Authenticate and return credentials for Google Docs API."""
    creds = None
    # The file token.json stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first time.
    if os.path.exists("token.json"):
        creds = Credentials.from_authorized_user_file("token.json", SCOPES)
    
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                "credentials.json", SCOPES
            )
            creds = flow.run_local_server(port=0)
        # Save the credentials for the next run
        with open("token.json", "w") as token:
            token.write(creds.to_json())
    
    return creds

def extract_text_from_element(element):
    """Extract text content from a document element."""
    text_content = ""
    
    if 'paragraph' in element:
        paragraph = element['paragraph']
        for elem in paragraph.get('elements', []):
            if 'textRun' in elem:
                text_content += elem['textRun'].get('content', '')
    elif 'table' in element:
        table = element['table']
        for row in table.get('tableRows', []):
            for cell in row.get('tableCells', []):
                for cell_element in cell.get('content', []):
                    text_content += extract_text_from_element(cell_element)
    elif 'tableOfContents' in element:
        toc = element['tableOfContents']
        for content_element in toc.get('content', []):
            text_content += extract_text_from_element(content_element)
    
    return text_content

def read_google_doc(document_id):
    """Read and extract content from a Google Doc."""
    try:
        # Authenticate
        creds = authenticate_google_docs()
        
        # Build the service
        service = build("docs", "v1", credentials=creds)
        
        # Retrieve the document
        document = service.documents().get(documentId=document_id).execute()
        
        # Extract basic document information
        title = document.get('title', 'Untitled Document')
        doc_id = document.get('documentId', '')
        
        print(f"Document Title: {title}")
        print(f"Document ID: {doc_id}")
        print("-" * 50)
        
        # Extract document content
        body = document.get('body', {})
        content = body.get('content', [])
        
        full_text = ""
        for element in content:
            full_text += extract_text_from_element(element)
        
        print("Document Content:")
        print(full_text)
        
        # Save content to a file
        with open(f"document_content_{document_id}.txt", "w", encoding="utf-8") as f:
            f.write(f"Title: {title}\n")
            f.write(f"Document ID: {doc_id}\n")
            f.write("-" * 50 + "\n\n")
            f.write(full_text)
        
        print(f"\nContent saved to: document_content_{document_id}.txt")
        
        # Also save raw JSON for debugging
        with open(f"document_raw_{document_id}.json", "w", encoding="utf-8") as f:
            json.dump(document, f, indent=2, ensure_ascii=False)
        
        print(f"Raw document data saved to: document_raw_{document_id}.json")
        
        return {
            'title': title,
            'content': full_text,
            'document_id': doc_id,
            'raw_document': document
        }
        
    except HttpError as error:
        print(f"An error occurred: {error}")
        return None
    except FileNotFoundError:
        print("credentials.json file not found. Please follow these steps:")
        print("1. Go to Google Cloud Console")
        print("2. Enable Google Docs API")
        print("3. Create OAuth 2.0 credentials")
        print("4. Download the JSON file and save it as 'credentials.json'")
        return None

def analyze_document_structure(document_data):
    """Analyze and print the structure of the document."""
    if not document_data:
        return
    
    raw_doc = document_data['raw_document']
    body = raw_doc.get('body', {})
    content = body.get('content', [])
    
    print(f"\nDocument Structure Analysis:")
    print(f"Total elements: {len(content)}")
    
    element_types = {}
    for element in content:
        for key in element.keys():
            if key != 'startIndex' and key != 'endIndex':
                element_types[key] = element_types.get(key, 0) + 1
    
    print("Element types found:")
    for elem_type, count in element_types.items():
        print(f"  {elem_type}: {count}")

def main():
    """Main function to read the Google Docs document."""
    print("Google Docs API Reader")
    print("=" * 50)
    
    # Read the document
    document_data = read_google_doc(DOCUMENT_ID)
    
    if document_data:
        print(f"\nSuccessfully read document: {document_data['title']}")
        print(f"Content length: {len(document_data['content'])} characters")
        
        # Analyze document structure
        analyze_document_structure(document_data)
    else:
        print("Failed to read the document. Please check your credentials and permissions.")

if __name__ == "__main__":
    main()