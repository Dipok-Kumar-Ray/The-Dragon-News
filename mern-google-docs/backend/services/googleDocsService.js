const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');

class GoogleDocsService {
  constructor() {
    this.oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  /**
   * OAuth URL তৈরি করে
   */
  getAuthUrl() {
    const scopes = [
      'https://www.googleapis.com/auth/documents.readonly',
      'https://www.googleapis.com/auth/drive.metadata.readonly'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
  }

  /**
   * Authorization code থেকে tokens পায়
   */
  async getTokens(code) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      return tokens;
    } catch (error) {
      throw new Error(`টোকেন পেতে ত্রুটি: ${error.message}`);
    }
  }

  /**
   * URL থেকে Google Docs ID বের করে
   */
  extractDocumentId(url) {
    const regex = /\/document\/d\/([a-zA-Z0-9-_]+)/;
    const match = url.match(regex);
    
    if (!match) {
      throw new Error('অবৈধ Google Docs URL। সঠিক URL প্রদান করুন।');
    }
    
    return match[1];
  }

  /**
   * Google Docs ডকুমেন্ট পড়ে
   */
  async readDocument(documentId, tokens) {
    try {
      // Tokens সেট করা
      this.oauth2Client.setCredentials(tokens);
      
      // Google Docs API client তৈরি
      const docs = google.docs({ version: 'v1', auth: this.oauth2Client });
      
      // ডকুমেন্ট পড়া
      const response = await docs.documents.get({
        documentId: documentId
      });

      const document = response.data;
      
      // ডকুমেন্ট কন্টেন্ট প্রসেসিং
      const content = this.extractContent(document);
      
      return {
        title: document.title || 'শিরোনামহীন ডকুমেন্ট',
        documentId: document.documentId,
        content: content,
        metadata: {
          createdTime: document.createdTime,
          modifiedTime: document.modifiedTime,
          revisionId: document.revisionId
        },
        structure: this.analyzeStructure(document)
      };

    } catch (error) {
      console.error('ডকুমেন্ট পড়তে ত্রুটি:', error);
      
      if (error.code === 403) {
        throw new Error('ডকুমেন্ট অ্যাক্সেসের অনুমতি নেই। নিশ্চিত করুন যে আপনার ডকুমেন্টে অ্যাক্সেস আছে।');
      } else if (error.code === 404) {
        throw new Error('ডকুমেন্ট খুঁজে পাওয়া যায়নি। Document ID পরীক্ষা করুন।');
      } else {
        throw new Error(`ডকুমেন্ট পড়তে ত্রুটি: ${error.message}`);
      }
    }
  }

  /**
   * ডকুমেন্ট থেকে টেক্সট কন্টেন্ট বের করে
   */
  extractContent(document) {
    const content = document.body?.content || [];
    let text = '';
    
    const extractFromElement = (element) => {
      if (element.paragraph) {
        // প্যারাগ্রাফ প্রসেসিং
        const elements = element.paragraph.elements || [];
        elements.forEach(elem => {
          if (elem.textRun) {
            text += elem.textRun.content || '';
          }
        });
      } else if (element.table) {
        // টেবিল প্রসেসিং
        const tableRows = element.table.tableRows || [];
        tableRows.forEach(row => {
          const cells = row.tableCells || [];
          cells.forEach(cell => {
            const cellContent = cell.content || [];
            cellContent.forEach(cellElement => {
              extractFromElement(cellElement);
            });
            text += '\t'; // টেবিল কলাম সেপারেটর
          });
          text += '\n'; // টেবিল রো সেপারেটর
        });
      } else if (element.tableOfContents) {
        // সূচিপত্র প্রসেসিং
        const tocContent = element.tableOfContents.content || [];
        tocContent.forEach(tocElement => {
          extractFromElement(tocElement);
        });
      }
    };

    content.forEach(element => {
      extractFromElement(element);
    });

    return text.trim();
  }

  /**
   * ডকুমেন্ট স্ট্রাকচার বিশ্লেষণ করে
   */
  analyzeStructure(document) {
    const content = document.body?.content || [];
    const structure = {
      totalElements: content.length,
      paragraphs: 0,
      tables: 0,
      tableOfContents: 0,
      images: 0,
      pageBreaks: 0
    };

    content.forEach(element => {
      if (element.paragraph) structure.paragraphs++;
      if (element.table) structure.tables++;
      if (element.tableOfContents) structure.tableOfContents++;
      if (element.pageBreak) structure.pageBreaks++;
    });

    return structure;
  }

  /**
   * ডকুমেন্ট শেয়ারিং তথ্য পায়
   */
  async getDocumentPermissions(documentId, tokens) {
    try {
      this.oauth2Client.setCredentials(tokens);
      const drive = google.drive({ version: 'v3', auth: this.oauth2Client });
      
      const response = await drive.permissions.list({
        fileId: documentId,
        fields: 'permissions(id,role,type,emailAddress)'
      });

      return response.data.permissions || [];
    } catch (error) {
      console.error('অনুমতি তথ্য পেতে ত্রুটি:', error);
      return [];
    }
  }

  /**
   * টোকেন রিফ্রেশ করে
   */
  async refreshTokens(refreshToken) {
    try {
      this.oauth2Client.setCredentials({
        refresh_token: refreshToken
      });

      const { credentials } = await this.oauth2Client.refreshAccessToken();
      return credentials;
    } catch (error) {
      throw new Error(`টোকেন রিফ্রেশ করতে ত্রুটি: ${error.message}`);
    }
  }
}

module.exports = new GoogleDocsService();