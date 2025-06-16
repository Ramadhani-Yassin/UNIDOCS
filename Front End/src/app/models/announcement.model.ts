export interface Announcement {
  id: number;
  title: string;
  content: string;
  status: string;
  createdDate: string;
  author?: string; // <-- add this
  attachments?: AnnouncementAttachment[];
}
export interface AnnouncementAttachment {
  id: number;
  fileName: string;
  fileUrl: string;
}