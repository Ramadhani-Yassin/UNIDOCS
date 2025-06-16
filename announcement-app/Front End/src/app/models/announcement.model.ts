export interface Announcement {
  id: string;
  title: string;
  content: string;
  status: 'new' | 'important' | 'update';
  createdDate: Date;
  attachments?: {
    name: string;
    url: string;
  }[];
}